import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/auth';
import { logAdminChange } from '@/lib/auditLogger';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { data: { user } } = await supabaseAdmin.auth.getUser();
  const { name, description } = await req.json();

  // Get current role data for audit log
  const { data: currentRole } = await supabaseAdmin
    .from('admin_roles')
    .select('*')
    .eq('id', params.id)
    .single();

  const { data, error } = await supabaseAdmin
    .from('admin_roles')
    .update({
      name,
      description,
      updated_by: user.id
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the change
  await logAdminChange(
    'update',
    params.id,
    currentRole,
    data
  );

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  // Get current role data for audit log
  const { data: currentRole } = await supabaseAdmin
    .from('admin_roles')
    .select('*')
    .eq('id', params.id)
    .single();

  const { error } = await supabaseAdmin
    .from('admin_roles')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the deletion
  await logAdminChange(
    'delete',
    params.id,
    currentRole,
    null
  );

  return NextResponse.json({ success: true }, { status: 200 });
}
