import { NextRequest, NextResponse } from 'next/server';
import { streamIngestProcurement, fetchRecentIngestItems } from '@/lib/db/ingest';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const kitchenId = searchParams.get('kitchen_id') || 'kitchen_a';
    const outletId = searchParams.get('outlet_id') || 'outlet_aa';

    const items = await fetchRecentIngestItems(kitchenId, outletId, 10);
    return NextResponse.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error: any) {
    console.error('Recent ingest GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.kitchen_id || !body.outlet_id || !Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, error: 'Missing kitchen_id, outlet_id or items array' },
        { status: 400 }
      );
    }

    const result = await streamIngestProcurement(body);
    return NextResponse.json({
      success: true,
      entry_id: result.entryId,
      inserted_rows: result.insertedRows,
      total_bill_amount: result.totalAmount
    });
  } catch (error: any) {
    console.error('Ingest POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record invoice' },
      { status: 500 }
    );
  }
}
