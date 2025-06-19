import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/middleware/auth';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // Get action counts
    const { data: actions } = await supabaseAdmin
      .from('audit_logs')
      .select('action_type, count(*)')
      .groupBy('action_type');

    // Get entity counts
    const { data: entities } = await supabaseAdmin
      .from('audit_logs')
      .select('entity_type, count(*)')
      .groupBy('entity_type');

    // Format stats
    const stats = {
      actions: {
        create: actions?.find(a => a.action_type === 'create')?.count || 0,
        update: actions?.find(a => a.action_type === 'update')?.count || 0,
        delete: actions?.find(a => a.action_type === 'delete')?.count || 0,
      },
      entities: {
        users: entities?.find(e => e.entity_type === 'user')?.count || 0,
        permissions: entities?.find(e => e.entity_type === 'permission')?.count || 0,
        reports: entities?.find(e => e.entity_type === 'report')?.count || 0,
      },
      total: {
        actions: actions?.reduce((sum, a) => sum + a.count, 0) || 0,
        entities: entities?.reduce((sum, e) => sum + e.count, 0) || 0,
      }
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
