import { NextRequest, NextResponse } from 'next/server';
import { translateBatchTexts } from '@/lib/i18n';
import { getGcpAccessToken } from '@/lib/gcp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Deep Google Cloud Translation Route:
 * Translates any array of texts dynamically using native GCP IAM token (no API key required).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texts, targetLang } = body;

    if (!Array.isArray(texts) || !targetLang) {
      return NextResponse.json(
        { success: false, error: 'texts must be string array and targetLang is required' },
        { status: 400 }
      );
    }

    const token = await getGcpAccessToken();
    const translations = await translateBatchTexts(texts, targetLang, token);

    return NextResponse.json({
      success: true,
      targetLang,
      translations
    });
  } catch (error: any) {
    console.error('Translation route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to translate' },
      { status: 500 }
    );
  }
}
