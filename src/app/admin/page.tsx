import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/supabase/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    <div className="admin-metrics">{[["Users", users], ["Portfolios", portfolios], ["Published", published], ["Drafts", drafts]].map(([label, value]) => <Card key={String(label)} className="admin-metric"><CardContent className="p-5"><strong>{value ?? 0}</strong><small>{label}</small></CardContent></Card>)}</div>
    <form className="admin-filters"><Input name="q" defaultValue={params.q} placeholder="Search users, names, or addresses" /><Select name="status" defaultValue={status}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select><Button type="submit">Filter</Button></form>
    <Card className="admin-table"><CardHeader><CardTitle>Portfolios</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Portfolio</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead>Public URL</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader><TableBody>{filtered.map((row) => <TableRow key={row.slug}><TableCell><strong>{row.name}</strong><small>{row.slug}</small></TableCell><TableCell>{owners.get(row.owner_id)?.display_name || "Unnamed owner"}</TableCell><TableCell><Badge variant={row.published_at ? "default" : "secondary"}>{row.published_at ? "Published" : "Draft"}</Badge></TableCell><TableCell>{row.published_at && site ? `${site}/${row.slug}` : "Not public"}</TableCell><TableCell>{row.updated_at}<small>Created {row.created_at}</small></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    <Card className="admin-table"><CardHeader><CardTitle>Users</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>ID</TableHead><TableHead>Portfolio</TableHead><TableHead>Created</TableHead></TableRow></TableHeader><TableBody>{(people ?? []).map((person) => <TableRow key={person.id}><TableCell>{person.display_name || "Unnamed user"}</TableCell><TableCell>{person.id}</TableCell><TableCell><Badge variant="secondary">{rows?.some((row) => row.owner_id === person.id) ? "Has portfolio" : "No portfolio"}</Badge></TableCell><TableCell>{person.created_at}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
  </main>;
}
