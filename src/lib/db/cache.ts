import { queryBigQuery, streamInsertBigQuery, PROJECT_ID, DATASET_ID } from '../gcp';

export interface BulletinCacheRecord {
  forecast_date: string;
  kitchen_id: string;
  outlet_id: string;
  meal_slot: string;
  lang_code: string;
  voice_name: string;
  bulletin_text: string;
  audio_url: string;
  dynamic_reason?: string | null;
  items_json: string;
  created_at: string;
}

/**
 * Checks BigQuery cache for an existing synthesized voice bulletin in the requested language.
 */
export async function fetchCachedBulletin(
  date: string,
  kitchenId: string,
  outletId: string,
  mealSlot: string,
  langCode: string = 'hi'
): Promise<BulletinCacheRecord | null> {
  const sql = `
    SELECT 
      CAST(forecast_date AS STRING) AS forecast_date,
      kitchen_id,
      outlet_id,
      meal_slot,
      lang_code,
      voice_name,
      bulletin_text,
      audio_url,
      dynamic_reason,
      items_json,
      CAST(created_at AS STRING) AS created_at
    FROM \`${PROJECT_ID}.${DATASET_ID}.daily_bulletin_cache\`
    WHERE forecast_date = DATE('${date}')
      AND kitchen_id = '${kitchenId}'
      AND outlet_id = '${outletId}'
      AND meal_slot = '${mealSlot}'
      AND lang_code = '${langCode}'
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  try {
    const rows = await queryBigQuery<BulletinCacheRecord>(sql);
    return rows.length > 0 ? rows[0] : null;
  } catch (e) {
    console.warn('Cache fetch warning:', e);
    return null;
  }
}

/**
 * Fetches all recent shift bulletins from BigQuery cache for history feed.
 */
export async function fetchBulletinHistory(
  kitchenId: string,
  outletId: string,
  limit: number = 10
): Promise<BulletinCacheRecord[]> {
  const sql = `
    SELECT 
      CAST(forecast_date AS STRING) AS forecast_date,
      kitchen_id,
      outlet_id,
      meal_slot,
      lang_code,
      voice_name,
      bulletin_text,
      audio_url,
      dynamic_reason,
      items_json,
      CAST(created_at AS STRING) AS created_at
    FROM \`${PROJECT_ID}.${DATASET_ID}.daily_bulletin_cache\`
    WHERE kitchen_id = '${kitchenId}'
      AND outlet_id = '${outletId}'
    ORDER BY forecast_date DESC, created_at DESC
    LIMIT ${limit};
  `;

  try {
    return await queryBigQuery<BulletinCacheRecord>(sql);
  } catch (e) {
    console.warn('History fetch warning:', e);
    return [];
  }
}

/**
 * Saves synthesized audio and translated script to BigQuery cache using tabledata.insertAll streaming.
 * Pure JSON, immune to SQL string injection or Devanagari character escaping issues.
 */
export async function saveBulletinCache(record: BulletinCacheRecord): Promise<boolean> {
  try {
    await streamInsertBigQuery('daily_bulletin_cache', [
      {
        forecast_date: record.forecast_date,
        kitchen_id: record.kitchen_id,
        outlet_id: record.outlet_id,
        meal_slot: record.meal_slot,
        lang_code: record.lang_code,
        voice_name: record.voice_name,
        bulletin_text: record.bulletin_text,
        audio_url: record.audio_url,
        dynamic_reason: record.dynamic_reason || null,
        items_json: record.items_json,
        created_at: record.created_at || new Date().toISOString()
      }
    ]);
    return true;
  } catch (e) {
    console.warn('BigQuery streaming cache insert warning:', e);
    return false;
  }
}
