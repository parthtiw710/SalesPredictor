import { NextRequest, NextResponse } from 'next/server';
import {
  getGcpAccessToken,
  getJaipurWeather,
  generateChefScript,
  synthesizeSpeech,
  uploadAudioToGcs
} from '@/lib/gcp';
import { fetchOutletDetails } from '@/lib/db/kitchens';
import { fetchTimesFMForecast, ForecastItem } from '@/lib/db/forecast';
import { fetchCachedBulletin, saveBulletinCache } from '@/lib/db/cache';
import { translateBulletinText, translateBatchTexts, getLanguageConfig } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const kitchenId = searchParams.get('kitchen_id') || 'kitchen_a';
    const outletId = searchParams.get('outlet_id') || 'outlet_aa';
    const mealSlot = (searchParams.get('shift') || 'lunch').toLowerCase();
    const targetLang = (searchParams.get('lang') || 'hi').toLowerCase().trim();
    const forceRefresh = searchParams.get('refresh') === 'true';

    const langConfig = getLanguageConfig(targetLang);
    const todayDate = new Date().toISOString().split('T')[0];

    // 1. Check BigQuery cache in the requested language (Zero latency & Zero compute replay)
    if (!forceRefresh) {
      const cached = await fetchCachedBulletin(
        todayDate,
        kitchenId,
        outletId,
        mealSlot,
        langConfig.code
      );

      if (cached) {
        let items: ForecastItem[] = [];
        try {
          items = JSON.parse(cached.items_json);
        } catch {
          // ignore parse error
        }

        return NextResponse.json({
          success: true,
          cached: true,
          date: cached.forecast_date,
          kitchen_id: cached.kitchen_id,
          outlet_id: cached.outlet_id,
          shift: cached.meal_slot,
          language: {
            code: langConfig.code,
            name: langConfig.name,
            voice: cached.voice_name
          },
          bulletinText: cached.bulletin_text,
          audioUrl: cached.audio_url,
          dynamicReason: cached.dynamic_reason,
          items
        });
      }
    }

    // 2. Fetch Outlet Metadata (Guaranteed fallback, never 404s)
    const outlet = (await fetchOutletDetails(kitchenId, outletId)) || {
      kitchen_id: kitchenId,
      kitchen_name: 'Jaipur Central Cloud Kitchen',
      outlet_id: outletId,
      outlet_name: 'Civil Lines Express',
      join_code: 'KITCH-AA',
      chef_name: 'Chef Rajesh Sharma',
      city: 'Jaipur',
      active: true
    };

    // 3. Fetch TimesFM 3.0 Predictions from BigQuery
    const forecastItems = await fetchTimesFMForecast(kitchenId, outletId, mealSlot);

    // 4. Fetch Real-time Weather Context & Covariates
    const weather = await getJaipurWeather();
    let dynamicReason: string | null = null;
    if (weather.precipitationMm > 0.5) {
      dynamicReason = 'बारिश के कारण डिलीवरी ऑर्डर्स में 30% उछाल का अनुमान है।';
    } else if (weather.rainProbabilityUpcoming >= 50) {
      dynamicReason = `अगले कुछ घंटों में बारिश (${weather.rainProbabilityUpcoming}%) के चलते ऑनलाइन ऑर्डर्स बढ़ेंगे।`;
    }

    // 5. Synthesize Single-Language Canonical Forecast Script in Hindi via Gemini 3.5 Flash
    const hindiScript = await generateChefScript(
      outlet,
      forecastItems,
      dynamicReason,
      mealSlot
    );

    // 6. Deep Google Cloud Translation API Integration (Zero API Key, pure IAM token)
    const token = await getGcpAccessToken();
    const translatedText = await translateBulletinText(hindiScript, langConfig.code, token);
    const translatedReason = dynamicReason
      ? await translateBulletinText(dynamicReason, langConfig.code, token)
      : null;

    // Deep Translation of Forecast Item Names into Target Language
    let localizedItems = forecastItems;
    if (langConfig.code !== 'hi' && forecastItems.length > 0) {
      try {
        const itemNames = forecastItems.map((i) => i.item_name);
        const translatedNames = await translateBatchTexts(itemNames, langConfig.code, token);
        localizedItems = forecastItems.map((it, idx) => ({
          ...it,
          item_name: translatedNames[idx] || it.item_name
        }));
      } catch {
        // Fallback to original item names
      }
    }

    // 7. Synthesize Speech in Target Language via Cloud TTS (Neural2 or Chirp3-HD)
    let audioUrl = '';
    try {
      const audioBuffer = await synthesizeSpeech(
        translatedText,
        langConfig.ttsVoiceName,
        langConfig.ttsLangCode,
        langConfig.speakingRate
      );

      // 8. Upload to GCS Bucket with language code tag
      const gcsPath = `${kitchenId}/${outletId}/${todayDate}_${mealSlot}_${langConfig.code}.mp3`;
      try {
        audioUrl = await uploadAudioToGcs(audioBuffer, gcsPath);
      } catch (gcsErr) {
        console.warn('GCS direct upload failed, returning base64 inline audio stream:', gcsErr);
        audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;
      }

      // 9. Persist into BigQuery cache table for zero-cost instant replays
      await saveBulletinCache({
        forecast_date: todayDate,
        kitchen_id: kitchenId,
        outlet_id: outletId,
        meal_slot: mealSlot,
        lang_code: langConfig.code,
        voice_name: langConfig.ttsVoiceName,
        bulletin_text: translatedText,
        audio_url: audioUrl,
        dynamic_reason: translatedReason,
        items_json: JSON.stringify(localizedItems),
        created_at: new Date().toISOString()
      });
    } catch (ttsErr) {
      console.warn('Audio synthesis fallback:', ttsErr);
    }

    return NextResponse.json({
      success: true,
      cached: false,
      date: todayDate,
      kitchen_id: kitchenId,
      outlet_id: outletId,
      outlet_name: outlet.outlet_name,
      join_code: outlet.join_code,
      chef_name: outlet.chef_name,
      shift: mealSlot,
      language: {
        code: langConfig.code,
        name: langConfig.name,
        voice: langConfig.ttsVoiceName
      },
      bulletinText: translatedText,
      audioUrl,
      dynamicReason: translatedReason,
      items: localizedItems
    });
  } catch (error: any) {
    console.error('Error generating shift bulletin:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate shift targets' },
      { status: 500 }
    );
  }
}
