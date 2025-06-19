import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { roleId: string, permissionId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { data: { user } } = await supabaseAdmin.auth.getUser();

  // Check if permission already exists
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('role_permissions')
    .select('*')
    .eq('role_id', params.roleId)
    .eq('permission_id', params.permissionId)
    .maybeSingle();

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Add permission
  const { error } = await supabaseAdmin
    .from('role_permissions')
    .insert({
      role_id: params.roleId,
      permission_id: params.permissionId
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get updated role with permissions
  const { data: role } = await supabaseAdmin
    .from('admin_roles')
    .select('*, permissions:role_permissions(permission:permission_types(*))')
    .eq('id', params.roleId)
    .single();

  return NextResponse.json(role, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: { roleId: string, permissionId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { error } = await supabaseAdmin
    .from('role_permissions')
    .delete()
    .eq('role_id', params.roleId)
    .eq('permission_id', params.permissionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get updated role with permissions
  const { data: role } = await supabaseAdmin
    .from('admin_roles')
    .select('*, permissions:role_permissions(permission:permission_types(*))')
    .eq('id', params.roleId)
    .single();

  return NextResponse.json(role, { status: 200 });
}
