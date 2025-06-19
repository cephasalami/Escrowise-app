import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/middleware/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { data: { user } } = await supabaseAdmin.auth.getUser();
  const templateData = await req.json();

  const { data, error } = await supabaseAdmin
    .from('notification_templates')
    .update({
      ...templateData,
      updated_by: user.id
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
