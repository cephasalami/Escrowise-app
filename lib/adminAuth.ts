import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Extracts `x-admin-id` header and verifies the user has role = 'admin'.
 * Returns the admin's UUID if valid, otherwise returns a NextResponse error.
 */
export async function requireAdmin(): Promise<{ adminId: string } | NextResponse> {
  const adminId = headers().get("x-admin-id");
  if (!adminId) {
    return NextResponse.json({ error: "Missing admin id header" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("role")
    .eq("id", adminId)
    .single();

  if (error || !data || data.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return { adminId };
}
