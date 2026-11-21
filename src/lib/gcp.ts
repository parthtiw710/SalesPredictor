import { getLocalizedItemName, getLocalizedUnit } from './i18n';

export const PROJECT_ID = 'bustling-wharf-485615-s9';
export const DATASET_ID = 'sales_predictor';
export const GCS_AUDIO_BUCKET = 'salespredicter-audio-bulletins';
export const VERTEX_LOCATION = 'us-central1';
export const VERTEX_MODEL = 'gemini-3.5-flash';
export const VERTEX_FALLBACK_MODEL = 'gemini-3.5-flash-lite';

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Retrieves a valid GCP OAuth2 Access Token.
 * 1. Checks in-memory cache.
 * 2. Checks GCP Compute Metadata Server (Cloud Run production IAM).
 * 3. Falls back to local gcloud CLI or environment variable.
 */
export async function getGcpAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.token;
  }

  // 1. Try Environment Variable override
  if (process.env.GCP_ACCESS_TOKEN) {
    return process.env.GCP_ACCESS_TOKEN;
  }

  // 2. Try GCP Compute Metadata Server (Pure IAM for Cloud Run / App Engine)
  try {
    const metaRes = await fetch(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
      {
        headers: { 'Metadata-Flavor': 'Google' },
        signal: AbortSignal.timeout(3500)
      }
    );
    if (metaRes.ok) {
      const data = await metaRes.json();
      cachedToken = {
        token: data.access_token,
        expiresAt: now + (data.expires_in - 120) * 1000
      };
      return cachedToken.token;
    }
  } catch {
    // Metadata server not reachable in local workstation environment
  }

  // 3. Fallback for local workstation dev (cross-platform Windows & Unix)
  try {
    if (typeof window === 'undefined') {
      // Dynamic require to prevent bundling node child_process in client-side bundles
      const { execSync } = require('child_process');
      const cmd =
        process.platform === 'win32'
          ? 'gcloud auth print-access-token'
          : 'export PATH="$HOME/.local/bin:$PATH" && gcloud auth print-access-token';

      const token = execSync(cmd, {
        encoding: 'utf-8',
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
        timeout: 5000
      }).trim();

      if (token && !token.includes(' ') && token.length > 20) {
        cachedToken = {
          token,
          expiresAt: now + 50 * 60 * 1000 // Cache for 50 minutes
        };
        return token;
      }
    }
  } catch {
    // Local gcloud not installed or not logged in
  }

  // Return empty string or fallback to let caller handle graceful mock if unauthenticated
  return cachedToken?.token || '';
}

/**
 * Executes a BigQuery SQL query using the official BigQuery REST API (pure fetch).
 */
export async function queryBigQuery<T = any>(sql: string): Promise<T[]> {
  const token = await getGcpAccessToken();
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${PROJECT_ID}/queries`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: sql,
      useLegacySql: false,
      timeoutMs: 90000,
      location: 'US'
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`BigQuery query error (${res.status}): ${err}`);
  }

  const data = await res.json();
  if (!data.schema || !data.rows) {
    return [];
  }

  const fields: string[] = data.schema.fields.map((f: any) => f.name);
  return data.rows.map((row: any) => {
    const obj: any = {};
    row.f.forEach((cell: any, idx: number) => {
      obj[fields[idx]] = cell.v;
    });
    return obj as T;
  });
}

/**
 * Streams multiple rows into BigQuery using tabledata.insertAll REST endpoint.
 */
export async function streamInsertBigQuery(
  tableId: string,
  rows: Array<Record<string, any>>
): Promise<void> {
  const token = await getGcpAccessToken();
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${PROJECT_ID}/datasets/${DATASET_ID}/tables/${tableId}/insertAll`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      kind: 'bigquery#tableDataInsertAllRequest',
      rows: rows.map((r) => ({ json: r }))
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`BigQuery insertAll error (${res.status}): ${err}`);
  }

  const data = await res.json();
  if (data.insertErrors && data.insertErrors.length > 0) {
    throw new Error(`BigQuery row errors: ${JSON.stringify(data.insertErrors)}`);
  }
}

/**
 * Fetches real-time weather & rain probability for kitchen coordinates (default: Jaipur).
 */
export async function getCityWeather(
  latitude: number = 26.9124,
  longitude: number = 75.7873
): Promise<{
  tempC: number;
  precipitationMm: number;
  rainProbabilityUpcoming: number;
  rainAlert: string | null;
}> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,rain&hourly=precipitation_probability&timezone=auto&forecast_days=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Weather API failed');

    const data = await res.json();
    const tempC = data.current?.temperature_2m ?? 30;
    const precipitationMm = data.current?.precipitation ?? 0;

    const currentHour = new Date().getHours();
    const hourlyProbs: number[] = data.hourly?.precipitation_probability ?? [];
    const upcomingProbs = hourlyProbs.slice(currentHour, currentHour + 4);
    const maxProb = upcomingProbs.length > 0 ? Math.max(...upcomingProbs) : 0;

    let rainAlert: string | null = null;
    if (precipitationMm > 0.5) {
      rainAlert = 'Heavy rain in progress (+30% delivery order surge expected).';
    } else if (maxProb >= 60) {
      rainAlert = `Rain expected within 3 hours (${maxProb}% probability). Online delivery surge predicted.`;
    }

    return {
      tempC,
      precipitationMm,
      rainProbabilityUpcoming: maxProb,
      rainAlert
    };
  } catch {
    return {
      tempC: 30,
      precipitationMm: 0,
      rainProbabilityUpcoming: 0,
      rainAlert: null
    };
  }
}

export const getJaipurWeather = () => getCityWeather(26.9124, 75.7873);

/**
 * Synthesizes a crisp, 15-20 second spoken Hindi operational script via Gemini 3.5 Flash.
 * ZERO corporate fluff, strictly operational walkie-talkie style.
 */
export async function generateChefScript(
  outlet: { kitchen_name: string; outlet_name: string; chef_name: string },
  forecastItems: Array<{
    item_name: string;
    predicted_qty: string | number;
    unit: string;
    lower_bound_qty?: string | number;
    upper_bound_qty?: string | number;
  }>,
  dynamicReason: string | null,
  mealSlot: string
): Promise<string> {
  const token = await getGcpAccessToken();
  const itemsSummary = forecastItems
    .map(
      (i) =>
        `${getLocalizedItemName(i.item_name, 'hi')}: ${i.predicted_qty} ${getLocalizedUnit(i.unit, 'hi')}`
    )
    .join(', ');

  const slotHindi =
    mealSlot === 'breakfast' ? 'नाश्ता' : mealSlot === 'lunch' ? 'लंच' : 'डिनर';

  const prompt = `
You are a kitchen dispatch voice synthesizer.
Output strictly formatted Hindi text for the ${slotHindi} shift.

DATA:
- Shift: ${slotHindi}
- Items: ${itemsSummary}
- Dynamic Reason: ${dynamicReason ? dynamicReason : 'NONE'}

STRICT RULES:
1. ZERO SALUTATIONS. ZERO GREETINGS. NO 'Namaste', NO 'Hello', NO Chef Name, NO 'Shuru karte hain', NO 'Thank you', NO corporate filler.
2. Start directly with the shift name followed by a colon: '${slotHindi}: '
3. List the items and quantities cleanly in Hindi.
4. If Dynamic Reason is 'NONE', DO NOT mention weather, normal conditions, or any reasons at all. STOP immediately after the item quantities.
5. If Dynamic Reason is provided, append ONLY that single reason sentence at the end.
6. Keep under 20 words. Return ONLY the spoken Hindi text without quotes or markdown.
`;

  // Try Gemini 3.5 Flash first, then fallback to Gemini 3.5 Flash-Lite
  const models = [VERTEX_MODEL, VERTEX_FALLBACK_MODEL];
  for (const model of models) {
    try {
      const url = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/${model}:generateContent`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.2
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch {
      // Continue to next model
    }
  }

  // Resilient fallback operational script if AI quota delay occurs
  const topItems = forecastItems
    .slice(0, 3)
    .map(
      (i) =>
        `${i.predicted_qty} ${getLocalizedUnit(i.unit, 'hi')} ${getLocalizedItemName(i.item_name, 'hi')}`
    )
    .join(', ');
  const reasonText = dynamicReason ? ` ${dynamicReason}` : '';
  return `${slotHindi}: ${topItems}।${reasonText}`;
}

/**
 * Calls Google Cloud Text-to-Speech REST API to synthesize natural speech.
 */
export async function synthesizeSpeech(
  text: string,
  voiceName: string = 'hi-IN-Neural2-A',
  languageCode: string = 'hi-IN',
  speakingRate: number = 1.05
): Promise<Buffer> {
  const token = await getGcpAccessToken();
  const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Goog-User-Project': PROJECT_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode,
        name: voiceName
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate,
        pitch: 0.0,
        volumeGainDb: 1.0
      }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloud TTS error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return Buffer.from(data.audioContent, 'base64');
}

/**
 * Uploads synthesized audio directly to Google Cloud Storage private bucket.
 */
export async function uploadAudioToGcs(
  audioBuffer: Buffer,
  destinationPath: string
): Promise<string> {
  const token = await getGcpAccessToken();
  const encodedPath = encodeURIComponent(destinationPath);
  const url = `https://storage.googleapis.com/upload/storage/v1/b/${GCS_AUDIO_BUCKET}/o?uploadType=media&name=${encodedPath}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'audio/mpeg'
    },
    body: new Uint8Array(audioBuffer)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GCS Upload error (${res.status}): ${err}`);
  }

  return `/api/audio?path=${encodedPath}`;
}

/**
 * Fetches an audio file from GCS private bucket using server OAuth token.
 */
export async function fetchAudioFromGcs(filePath: string): Promise<Buffer> {
  const token = await getGcpAccessToken();
  const encodedPath = encodeURIComponent(filePath);
  const url = `https://storage.googleapis.com/storage/v1/b/${GCS_AUDIO_BUCKET}/o/${encodedPath}?alt=media`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GCS Read error (${res.status}): ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Multimodal OCR using Gemini 3.5 Flash for rough handwritten receipts & slips.
 * Extracts structured JSON matching the verified procurement table.
 */
export async function parseReceiptImageWithGemini(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<{
  vendor_name: string;
  bill_date: string;
  items: Array<{
    item_name: string;
    quantity: number;
    unit: string;
    rate: number;
    row_total: number;
  }>;
  total_amount: number;
}> {
  const token = await getGcpAccessToken();
  const prompt = `
You are an expert OCR parser for Indian restaurant mandi receipts, vegetable vendor slips, and handwritten KOT parchment bills.
Analyze this invoice image and extract structured JSON strictly according to this schema:
{
  "vendor_name": "string (e.g. Sharma Mandi, Dairy Supply, or General Vendor)",
  "bill_date": "YYYY-MM-DD",
  "items": [
    {
      "item_name": "string (normalized English or Hinglish name)",
      "quantity": number,
      "unit": "string (kg, litre, packet, portion)",
      "rate": number,
      "row_total": number
    }
  ],
  "total_amount": number
}

Rules:
1. Even if handwriting is rough or faded, infer the best reading.
2. Return ONLY valid raw JSON without markdown code fences or conversational text.
`;

  const models = [VERTEX_MODEL, VERTEX_FALLBACK_MODEL];
  for (const model of models) {
    try {
      const url = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/${model}:generateContent`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      }
    } catch {
      // Continue to next model
    }
  }

  throw new Error('Gemini OCR could not extract receipt items from image');
}
