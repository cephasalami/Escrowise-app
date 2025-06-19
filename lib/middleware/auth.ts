import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';



export const requireAdmin = async () => {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data?.session) {
    return new NextResponse(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const { session } = data;

  // Check if user has admin role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (userError || !userData || userData.role !== 'admin') {
    return new NextResponse(
      JSON.stringify({ error: 'Not authorized' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return { user: session.user };
};
