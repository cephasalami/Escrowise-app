import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/middleware/auth';

const DEFAULT_TEMPLATES = [
  {
    name: 'Dispute Created',
    description: 'Sent when a new dispute is created',
    event_type: 'dispute_created',
    subject: 'New Dispute: {{dispute.id}}',
    body: 'A new dispute has been created for transaction {{transaction.id}} by {{user.name}}.\n\nReason: {{dispute.reason}}',
    variables: {
      dispute: ['id', 'reason', 'status'],
      transaction: ['id', 'amount'],
      user: ['name', 'email']
    }
  },
  {
    name: 'Dispute Updated',
    description: 'Sent when a dispute status changes',
    event_type: 'dispute_updated',
    subject: 'Dispute Update: {{dispute.id}}',
    body: 'The status of dispute {{dispute.id}} has been updated to {{dispute.status}}.\n\nResolution: {{dispute.resolution}}',
    variables: {
      dispute: ['id', 'status', 'resolution'],
      admin: ['name']
    }
  },
  {
    name: 'Dispute Comment',
    description: 'Sent when a new comment is added to a dispute',
    event_type: 'dispute_comment',
    subject: 'New Comment on Dispute: {{dispute.id}}',
    body: '{{comment.author}} has added a new comment to dispute {{dispute.id}}:\n\n{{comment.content}}',
    variables: {
      dispute: ['id'],
      comment: ['author', 'content', 'created_at']
    }
  }
];

export async function POST() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { data: { user } } = await supabaseAdmin.auth.getUser();

  // Check if templates already exist
  const { data: existing, error: checkError } = await supabaseAdmin
    .from('notification_templates')
    .select('*')
    .limit(1);

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: 'Templates already seeded' }, 
      { status: 400 }
    );
  }

  // Insert templates
  const { data, error } = await supabaseAdmin
    .from('notification_templates')
    .insert(DEFAULT_TEMPLATES.map(t => ({
      ...t,
      created_by: user.id,
      updated_by: user.id
    })))
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
