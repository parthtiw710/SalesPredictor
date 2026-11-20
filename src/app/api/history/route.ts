import { NextRequest, NextResponse } from 'next/server';
import { fetchBulletinHistory } from '@/lib/db/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const kitchenId = searchParams.get('kitchen_id') || 'kitchen_a';
    const outletId = searchParams.get('outlet_id') || 'outlet_aa';

    const records = await fetchBulletinHistory(kitchenId, outletId, 20);

    const shifts = records.map((r, idx) => {
      let items: any[] = [];
      try {
        items = JSON.parse(r.items_json);
      } catch {
        items = [];
      }

      const summary =
        items.length > 0
          ? items
              .slice(0, 2)
              .map((it: any) => `${it.item_name} (${it.predicted_qty}${it.unit || ''})`)
              .join(', ')
          : r.bulletin_text.slice(0, 45) + '...';

      return {
        id: `shift_${idx + 1}`,
        shift_name: `${r.meal_slot.charAt(0).toUpperCase() + r.meal_slot.slice(1)} Shift`,
        meal_slot: r.meal_slot,
        lang_code: r.lang_code,
        date: r.forecast_date,
        time:
          r.meal_slot === 'breakfast'
            ? '08:00 AM'
            : r.meal_slot === 'lunch'
            ? '12:30 PM'
            : '07:30 PM',
        summary,
        details: r.bulletin_text,
        status: 'Completed',
        audio_url: r.audio_url,
        items
      };
    });

    return NextResponse.json({
      success: true,
      total: shifts.length,
      shifts
    });
  } catch (error: any) {
    console.error('History GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
