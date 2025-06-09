"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/supabaseClient";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
}

const ADMIN_EMAILS = [
  "admin@example.com", // Replace with your real admin emails
  // Add more emails as needed
];

const PAGE_SIZE = 10;

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace("/login");
      } else if (data.user.email && ADMIN_EMAILS.includes(data.user.email as string)) {
        setUserEmail(data.user.email as string);
        setLoading(false);
      } else {
        setUserEmail(null);
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-lg">Loading...</div>;
  }
  if (!userEmail) {
    return <div className="flex justify-center items-center min-h-screen text-lg text-red-600">Access Denied: You do not have admin privileges.</div>;
  }

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);
      let query = supabase.from("profiles").select("*");
      if (search) {
        query = query.ilike("email", `%${search}%`).or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }
      // Pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);
      const { data, error } = await query;
      if (error) {
        setError(error.message);
        setProfiles([]);
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, [search, page]);

  if (!userEmail) {
    return <div className="max-w-4xl mx-auto py-10">Checking admin access...</div>;
  }
  if (!ADMIN_EMAILS.includes(userEmail)) {
    return <div className="max-w-4xl mx-auto py-10 text-red-500 font-bold">Access denied. Admins only.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">All User Profiles</h1>
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded w-72"
        />
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && (
        <>
          <table className="min-w-full border rounded-lg overflow-hidden mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">ID</th>
                <th className="py-2 px-4 border">First Name</th>
                <th className="py-2 px-4 border">Last Name</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-t">
                  <td className="py-2 px-4 border font-mono text-xs">{profile.id}</td>
                  <td className="py-2 px-4 border">{profile.first_name}</td>
                  <td className="py-2 px-4 border">{profile.last_name}</td>
                  <td className="py-2 px-4 border">{profile.email}</td>
                  <td className="py-2 px-4 border">{profile.created_at ? new Date(profile.created_at).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page === 1}
            >Prev</button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded"
              disabled={profiles.length < PAGE_SIZE}
            >Next</button>
          </div>
        </>
      )}
    </div>
  );
}

