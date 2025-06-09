"use client";
import type { Metadata } from "next"
import TransactionsHeader from "@/components/admin/TransactionsHeader"
import TransactionsTable from "@/components/admin/TransactionsTable"
import { supabase } from "@/src/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ADMIN_EMAILS = [
  "admin@example.com", // Replace with your real admin emails
  // Add more emails as needed
];

export const metadata: Metadata = {
  title: "Transaction Management - Admin Dashboard",
  description: "Manage all transactions on the escrow platform",
}

"use client";
export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace("/login");
      } else if (data.user.email && ADMIN_EMAILS.includes(data.user.email as string)) {
        setIsAdmin(true);
        setLoading(false);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-lg">Loading...</div>;
  }
  if (!isAdmin) {
    return <div className="flex justify-center items-center min-h-screen text-lg text-red-600">Access Denied: You do not have admin privileges.</div>;
  }
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tighter text-black">Transaction Management</h1>

      <TransactionsHeader />
      <TransactionsTable />
    </div>
  )
}

