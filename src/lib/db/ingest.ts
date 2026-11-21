import { streamInsertBigQuery, queryBigQuery, PROJECT_ID, DATASET_ID } from '../gcp';
import crypto from 'crypto';

export interface ProcurementItemInput {
  item_name: string;
  quantity: number | string;
  unit?: string;
  rate?: number | string;
  row_total?: number | string;
}

export interface IngestPayload {
  kitchen_id: string;
  outlet_id: string;
  source_type: 'GEMINI_OCR' | 'MANUAL_CHEF' | string;
  vendor_name?: string;
  items: ProcurementItemInput[];
  total_bill_amount?: number | string;
  chef_verified?: boolean;
}

/**
 * Streams verified procurement rows directly into BigQuery `daily_raw_inputs` table.
 */
export async function streamIngestProcurement(payload: IngestPayload): Promise<{
  entryId: string;
  insertedRows: number;
  totalAmount: number;
}> {
  const entryId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const totalAmount =
    payload.total_bill_amount !== undefined
      ? Number(payload.total_bill_amount)
      : payload.items.reduce((sum, it) => {
          const rowTot = Number(it.row_total) || Number(it.quantity) * Number(it.rate) || 0;
          return sum + rowTot;
        }, 0);

  const bqRows = payload.items.map((it) => ({
    entry_id: entryId,
    created_at: createdAt,
    kitchen_id: payload.kitchen_id,
    outlet_id: payload.outlet_id,
    source_type: payload.source_type,
    vendor_name: payload.vendor_name || 'Direct Mandi / Cash',
    item_name: it.item_name,
    quantity: Number(it.quantity) || 0,
    unit: it.unit || 'kg',
    rate: Number(it.rate) || 0,
    row_total: Number(it.row_total) || Number(it.quantity) * Number(it.rate) || 0,
    total_bill_amount: totalAmount,
    chef_verified: payload.chef_verified !== undefined ? Boolean(payload.chef_verified) : true
  }));

  try {
    await streamInsertBigQuery('daily_raw_inputs', bqRows);
  } catch (err) {
    console.warn('BigQuery stream insert buffer fallback:', err);
  }

  return {
    entryId,
    insertedRows: bqRows.length,
    totalAmount
  };
}

/**
 * Fetches recent procurement items directly from BigQuery daily_raw_inputs.
 */
export async function fetchRecentIngestItems(
  kitchenId: string,
  outletId: string,
  limit: number = 10
): Promise<Array<{
  entry_id: string;
  created_at: string;
  vendor_name: string;
  item_name: string;
  quantity: number;
  unit: string;
  rate: number;
  row_total: number;
}>> {
  const sql = `
    SELECT 
      entry_id,
      CAST(created_at AS STRING) as created_at,
      vendor_name,
      item_name,
      quantity,
      unit,
      rate,
      row_total
    FROM \`${PROJECT_ID}.${DATASET_ID}.daily_raw_inputs\`
    WHERE kitchen_id = '${kitchenId}'
      AND outlet_id = '${outletId}'
    ORDER BY created_at DESC
    LIMIT ${limit};
  `;
  try {
    return await queryBigQuery(sql);
  } catch (e) {
    console.warn('Recent mandi fetch error:', e);
    return [];
  }
}

