import { queryBigQuery, PROJECT_ID, DATASET_ID } from '../gcp';

export interface OutletRecord {
  kitchen_id: string;
  kitchen_name: string;
  outlet_id: string;
  outlet_name: string;
  join_code: string;
  chef_name: string;
  city: string;
  active: boolean | string;
}

export interface KitchenGroup {
  kitchen_id: string;
  kitchen_name: string;
  city: string;
  outlets: Array<{
    outlet_id: string;
    outlet_name: string;
    join_code: string;
    chef_name: string;
  }>;
}

const DEFAULT_OUTLETS: OutletRecord[] = [
  {
    kitchen_id: 'kitchen_a',
    kitchen_name: 'Jaipur Central Cloud Kitchen',
    outlet_id: 'outlet_aa',
    outlet_name: 'Civil Lines Express',
    join_code: 'KITCH-AA',
    chef_name: 'Chef Rajesh Sharma',
    city: 'Jaipur',
    active: true
  },
  {
    kitchen_id: 'kitchen_a',
    kitchen_name: 'Jaipur Central Cloud Kitchen',
    outlet_id: 'outlet_ab',
    outlet_name: 'Malviya Nagar Hub',
    join_code: 'KITCH-AB',
    chef_name: 'Chef Anita Meena',
    city: 'Jaipur',
    active: true
  },
  {
    kitchen_id: 'kitchen_b',
    kitchen_name: 'Delhi NCR Cloud Network',
    outlet_id: 'outlet_ba',
    outlet_name: 'Connaught Place Central',
    join_code: 'KITCH-BA',
    chef_name: 'Chef Vikram Singh',
    city: 'Delhi',
    active: true
  },
  {
    kitchen_id: 'kitchen_c',
    kitchen_name: 'Bangalore South Kitchens',
    outlet_id: 'outlet_ca',
    outlet_name: 'Indiranagar Cloud Hub',
    join_code: 'KITCH-CA',
    chef_name: 'Chef Priya Nair',
    city: 'Bengaluru',
    active: true
  },
  {
    kitchen_id: 'kitchen_d',
    kitchen_name: 'Mumbai West Cloud Hub',
    outlet_id: 'outlet_da',
    outlet_name: 'Bandra West Kitchen',
    join_code: 'KITCH-DA',
    chef_name: 'Chef Farhan Khan',
    city: 'Mumbai',
    active: true
  }
];

/**
 * Fetches all active virtual kitchens and station outlets.
 * Guaranteed to return valid outlets even if BigQuery table is not yet seeded.
 */
export async function fetchActiveKitchens(): Promise<{
  kitchens: KitchenGroup[];
  rawOutlets: OutletRecord[];
}> {
  const sql = `
    SELECT 
      kitchen_id,
      kitchen_name,
      outlet_id,
      outlet_name,
      join_code,
      chef_name,
      city,
      active
    FROM \`${PROJECT_ID}.${DATASET_ID}.kitchens_and_outlets\`
    WHERE active = true
    ORDER BY kitchen_id, outlet_id;
  `;

  let rows: OutletRecord[] = [];
  try {
    rows = await queryBigQuery<OutletRecord>(sql);
  } catch (err) {
    console.warn('BigQuery kitchens fetch warning, using default network:', err);
  }

  if (!rows || rows.length === 0) {
    rows = DEFAULT_OUTLETS;
  }

  const map: Record<string, KitchenGroup> = {};
  for (const r of rows) {
    if (!map[r.kitchen_id]) {
      map[r.kitchen_id] = {
        kitchen_id: r.kitchen_id,
        kitchen_name: r.kitchen_name,
        city: r.city,
        outlets: []
      };
    }
    map[r.kitchen_id].outlets.push({
      outlet_id: r.outlet_id,
      outlet_name: r.outlet_name,
      join_code: r.join_code,
      chef_name: r.chef_name
    });
  }

  return {
    kitchens: Object.values(map),
    rawOutlets: rows
  };
}

/**
 * Fetches single outlet record by kitchen_id and outlet_id.
 */
export async function fetchOutletDetails(
  kitchenId: string,
  outletId: string
): Promise<OutletRecord | null> {
  const sql = `
    SELECT kitchen_id, kitchen_name, outlet_id, outlet_name, join_code, chef_name, city, active
    FROM \`${PROJECT_ID}.${DATASET_ID}.kitchens_and_outlets\`
    WHERE kitchen_id = '${kitchenId}' AND outlet_id = '${outletId}'
    LIMIT 1;
  `;

  try {
    const rows = await queryBigQuery<OutletRecord>(sql);
    if (rows.length > 0) return rows[0];
  } catch (err) {
    console.warn('Outlet lookup warning:', err);
  }

  return (
    DEFAULT_OUTLETS.find(
      (o) => o.kitchen_id === kitchenId && o.outlet_id === outletId
    ) || DEFAULT_OUTLETS[0]
  );
}
