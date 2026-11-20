import { NextResponse } from 'next/server';
import { fetchActiveKitchens } from '@/lib/db/kitchens';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { kitchens, rawOutlets } = await fetchActiveKitchens();

    return NextResponse.json({
      success: true,
      total_outlets: rawOutlets.length,
      kitchens,
      raw_outlets: rawOutlets
    });
  } catch (error: any) {
    console.error('Error fetching kitchens:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch kitchens' },
      { status: 500 }
    );
  }
}
