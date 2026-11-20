import { NextResponse } from 'next/server';
import { getGcpAccessToken, queryBigQuery, PROJECT_ID, DATASET_ID, VERTEX_LOCATION, VERTEX_MODEL } from '@/lib/gcp';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const health: Record<string, any> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    project_id: PROJECT_ID,
    dataset_id: DATASET_ID,
    vertex_config: {
      location: VERTEX_LOCATION,
      model: VERTEX_MODEL
    },
    services: {}
  };

  // 1. IAM Auth Token Test
  try {
    const t0 = Date.now();
    const token = await getGcpAccessToken();
    health.services.iam_auth = {
      status: token ? 'connected' : 'unauthenticated',
      latency_ms: Date.now() - t0
    };
  } catch (err: any) {
    health.services.iam_auth = { status: 'error', error: err.message };
  }

  // 2. BigQuery Test
  try {
    const t0 = Date.now();
    await queryBigQuery('SELECT 1 AS ready');
    health.services.bigquery = { status: 'connected', latency_ms: Date.now() - t0 };
  } catch (err: any) {
    health.services.bigquery = { status: 'degraded', warning: err.message };
  }

  return NextResponse.json(health);
}
