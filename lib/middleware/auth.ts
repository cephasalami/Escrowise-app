import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../supabaseAdmin';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { notifyAdminLogin } from '../loginNotifications';

// Configure rate limiting (5 requests per 10 seconds)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 s'),
});

// Admin IP whitelist
const ADMIN_IP_WHITELIST = process.env.ADMIN_IP_WHITELIST?.split(',') || [];

export const requireAdmin = async (req: Request) => {
  // Check IP whitelist
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (ADMIN_IP_WHITELIST.length > 0 && !ADMIN_IP_WHITELIST.includes(ip)) {
    return NextResponse.json(
      { error: 'Access restricted' },
      { status: 403 }
    );
  }

  // Apply rate limiting
  const { success } = await ratelimit.limit(ip || 'anonymous');
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Existing auth checks
  const { data: { user } } = await supabaseAdmin.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if user has admin role
  const { data: adminRole } = await supabaseAdmin
    .from('admin_user_roles')
    .select('role_id')
    .eq('user_id', user.id)
    .single();

  if (!adminRole) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  await notifyAdminLogin(
    user.id,
    req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
    req.headers.get('user-agent') || ''
  );

  return user;
};
