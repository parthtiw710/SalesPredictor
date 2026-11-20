import { queryBigQuery, PROJECT_ID, DATASET_ID } from '../gcp';

export interface ForecastItem {
  meal_slot: string;
  item_name: string;
  unit: string;
  predicted_qty: string | number;
  lower_bound_qty: string | number;
  upper_bound_qty: string | number;
}

/**
 * Executes zero-shot multivariate time-series forecasting using Google Research's
 * TimesFM 3.0 foundation model directly via BigQuery AI.FORECAST.
 * Incorporates past weather covariates and festive demand multipliers.
 */
export async function fetchTimesFMForecast(
  kitchenId: string,
  outletId: string,
  mealSlot: string
): Promise<ForecastItem[]> {
  const slot = (mealSlot || 'lunch').toLowerCase();

  const timesfmSql = `
    SELECT 
      meal_slot,
      item_name,
      unit,
      ROUND(CAST(quantity_sold.value AS FLOAT64), 0) AS predicted_qty,
      ROUND(CAST(quantity_sold.prediction_interval_lower_bound AS FLOAT64), 0) AS lower_bound_qty,
      ROUND(CAST(quantity_sold.prediction_interval_upper_bound AS FLOAT64), 0) AS upper_bound_qty
    FROM AI.FORECAST(
      (
        SELECT 
          CAST(sale_date AS TIMESTAMP) AS sale_timestamp,
          kitchen_id,
          outlet_id,
          meal_slot,
          item_name,
          unit,
          quantity_sold,
          ambient_temp_c,
          rain_mm,
          base_event_demand_multiplier
        FROM \`${PROJECT_ID}.${DATASET_ID}.sales_feature_store\`
        WHERE kitchen_id = '${kitchenId}'
          AND outlet_id = '${outletId}'
          AND meal_slot = '${slot}'
      ),
      timestamp_col => 'sale_timestamp',
      model => 'TimesFM 3.0',
      target_cols => ['quantity_sold'],
      past_covariate_cols => ['ambient_temp_c', 'rain_mm', 'base_event_demand_multiplier'],
      id_cols => ['kitchen_id', 'outlet_id', 'meal_slot', 'item_name', 'unit'],
      horizon => 1,
      confidence_level => 0.90
    );
  `;

  try {
    const items = await queryBigQuery<ForecastItem>(timesfmSql);
    if (items && items.length > 0) {
      return items;
    }
  } catch (err) {
    console.warn('TimesFM 3.0 query fallback to rolling feature view:', err);
  }

  // Fallback: Rolling aggregate strictly from BigQuery sales_feature_store
  const fallbackSql = `
    SELECT 
      meal_slot,
      item_name,
      unit,
      ROUND(AVG(CAST(quantity_sold AS FLOAT64) * base_event_demand_multiplier), 0) AS predicted_qty,
      ROUND(MIN(CAST(quantity_sold AS FLOAT64)), 0) AS lower_bound_qty,
      ROUND(MAX(CAST(quantity_sold AS FLOAT64) * 1.2), 0) AS upper_bound_qty
    FROM \`${PROJECT_ID}.${DATASET_ID}.sales_feature_store\`
    WHERE kitchen_id = '${kitchenId}'
      AND outlet_id = '${outletId}'
      AND meal_slot = '${slot}'
    GROUP BY meal_slot, item_name, unit
    LIMIT 8;
  `;
  const rollingItems = await queryBigQuery<ForecastItem>(fallbackSql);
  return rollingItems || [];
}

export const fetchArimaForecast = fetchTimesFMForecast;
