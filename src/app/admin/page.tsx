import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/supabase/require-auth";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for the admin dashboard.");
  const adminClient = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() || "";
  const status = params.status || "all";
  const [{ count: users }, { count: portfolios }, { count: published }, { count: drafts }] = await Promise.all([
    adminClient.from("profiles").select("id", { count: "exact", head: true }),
    adminClient.from("portfolios").select("id", { count: "exact", head: true }),
    adminClient.from("portfolios").select("id", { count: "exact", head: true }).not("published", "is", null),
    adminClient.from("portfolios").select("id", { count: "exact", head: true }).is("published", null),
  ]);
  const { data: people } = await adminClient.from("profiles").select("id, display_name, created_at").order("created_at", { ascending: false }).limit(100);
  const { data: rows } = await adminClient.from("portfolios").select("name, slug, owner_id, published_at, created_at, updated_at").order("updated_at", { ascending: false }).limit(100);
  const owners = new Map((people ?? []).map((person) => [person.id, person]));
  const filtered = (rows ?? []).filter((row) => {
    const owner = owners.get(row.owner_id);
    const matchesQuery = !query || [row.name, row.slug, owner?.display_name].some((value) => value?.toLowerCase().includes(query));
    return matchesQuery && (status === "all" || (status === "published" ? Boolean(row.published_at) : !row.published_at));
  });
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return <main className="admin-shell"><Link className="wordmark" href="/">forme<span>.</span></Link><h1>Admin overview</h1>
    <div className="admin-metrics"><b>{users ?? 0}<small>Users</small></b><b>{portfolios ?? 0}<small>Portfolios</small></b><b>{published ?? 0}<small>Published</small></b><b>{drafts ?? 0}<small>Drafts</small></b></div>
    <form className="admin-filters"><input name="q" defaultValue={params.q} placeholder="Search users, names, or addresses" /><select name="status" defaultValue={status}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select><button className="button button-primary">Filter</button></form>
    <section className="admin-table"><h2>Portfolios</h2><div className="admin-row admin-header"><strong>Portfolio</strong><span>Owner</span><span>Status</span><span>Public URL</span><span>Updated</span></div>{filtered.map((row) => <div className="admin-row" key={row.slug}><strong>{row.name}<small>{row.slug}</small></strong><span>{owners.get(row.owner_id)?.display_name || "Unnamed owner"}</span><span>{row.published_at ? "Published" : "Draft"}</span><span>{row.published_at && site ? `${site}/${row.slug}` : "Not public"}</span><span>{row.updated_at}<small>Created {row.created_at}</small></span></div>)}</section>
    <section className="admin-table"><h2>Users</h2>{(people ?? []).map((person) => <div className="admin-row" key={person.id}><strong>{person.display_name || "Unnamed user"}</strong><span>{person.id}</span><span>{rows?.some((row) => row.owner_id === person.id) ? "Has portfolio" : "No portfolio"}</span><span>{person.created_at}</span></div>)}</section>
  </main>;
}
