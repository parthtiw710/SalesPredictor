import { NextRequest, NextResponse } from 'next/server';
import { parseReceiptImageWithGemini } from '@/lib/gcp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    let imageBase64 = '';
    let mimeType = 'image/jpeg';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      imageBase64 = body.imageBase64 || '';
      mimeType = body.mimeType || 'image/jpeg';
      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        imageBase64 = parts[1];
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No image file uploaded' },
          { status: 400 }
        );
      }
      mimeType = file.type || 'image/jpeg';
      const arrayBuffer = await file.arrayBuffer();
      imageBase64 = Buffer.from(arrayBuffer).toString('base64');
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported Content-Type' },
        { status: 400 }
      );
    }

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Empty image data' },
        { status: 400 }
      );
    }

    // Call Gemini 3.5 Flash Multimodal OCR
    const parsedData = await parseReceiptImageWithGemini(imageBase64, mimeType);

    return NextResponse.json({
      success: true,
      data: parsedData
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to parse invoice' },
      { status: 500 }
    );
  }
}
