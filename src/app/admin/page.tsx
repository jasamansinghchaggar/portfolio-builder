import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { requireUser } from '@/lib/supabase/require-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  if (!profile?.is_admin) redirect('/dashboard');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey)
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for the admin dashboard.');
  const adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() || '';
  const status = params.status || 'all';
  const [{ count: users }, { count: portfolios }, { count: published }, { count: drafts }] =
    await Promise.all([
      adminClient.from('profiles').select('id', { count: 'exact', head: true }),
      adminClient.from('portfolios').select('id', { count: 'exact', head: true }),
      adminClient
        .from('portfolios')
        .select('id', { count: 'exact', head: true })
        .not('published', 'is', null),
      adminClient
        .from('portfolios')
        .select('id', { count: 'exact', head: true })
        .is('published', null),
    ]);
  const { data: people } = await adminClient
    .from('profiles')
    .select('id, display_name, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  const { data: rows } = await adminClient
    .from('portfolios')
    .select('name, slug, owner_id, published_at, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);
  const owners = new Map((people ?? []).map((person) => [person.id, person]));
  const filtered = (rows ?? []).filter((row) => {
    const owner = owners.get(row.owner_id);
    const matchesQuery =
      !query ||
      [row.name, row.slug, owner?.display_name].some((value) =>
        value?.toLowerCase().includes(query),
      );
    return (
      matchesQuery &&
      (status === 'all' || (status === 'published' ? Boolean(row.published_at) : !row.published_at))
    );
  });
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');

  const metrics = [
    { label: 'Users', value: users ?? 0, color: 'bg-primary/10 text-primary' },
    { label: 'Portfolios', value: portfolios ?? 0, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Published', value: published ?? 0, color: 'bg-emerald-500/10 text-emerald-600' },
    { label: 'Drafts', value: drafts ?? 0, color: 'bg-amber-500/10 text-amber-600' },
  ];

  return (
    <main className="admin-shell" id="admin-page">
      <div className="admin-header-row">
        <Link className="wordmark" href="/">
          forme<span>.</span>
        </Link>
        <Badge variant="secondary" className="hero-eyebrow">
          <i /> ADMIN DASHBOARD
        </Badge>
      </div>
      <h1>Admin overview</h1>

      {/* ─── Metric cards ─── */}
      <div className="admin-metrics" id="admin-metrics">
        {metrics.map((metric) => (
          <Card key={metric.label} className="admin-metric">
            <CardContent className="flex flex-col gap-1 p-5">
              <div className={`admin-metric-icon ${metric.color}`}>
                <strong className="text-2xl font-bold tabular-nums">{metric.value}</strong>
              </div>
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Filters ─── */}
      <Card className="admin-filter-card" id="admin-filters">
        <CardContent className="p-4">
          <form className="admin-filters">
            <Input
              name="q"
              defaultValue={params.q}
              placeholder="Search users, names, or addresses"
              id="admin-search"
            />
            <Select name="status" defaultValue={status}>
              <SelectTrigger className="min-w-[160px]" id="admin-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button type="submit" id="admin-filter-btn">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ─── Data tables ─── */}
      <Tabs defaultValue="portfolios" className="mt-6" id="admin-tabs">
        <TabsList>
          <TabsTrigger value="portfolios">Portfolios ({filtered.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({(people ?? []).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolios">
          <Card>
            <CardHeader>
              <CardTitle>Portfolios</CardTitle>
              <CardDescription>{filtered.length} portfolios found</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Portfolio</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Public URL</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((row) => (
                      <TableRow key={row.slug}>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <strong className="text-sm">{row.name}</strong>
                            <span className="text-xs text-muted-foreground font-mono">
                              {row.slug}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarFallback className="text-[9px]">
                                {(owners.get(row.owner_id)?.display_name || 'U')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {owners.get(row.owner_id)?.display_name || 'Unnamed owner'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.published_at ? 'default' : 'secondary'}>
                            {row.published_at ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {row.published_at && site ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{`${site}/${row.slug}`}</span>
                              </TooltipTrigger>
                              <TooltipContent>{`${site}/${row.slug}`}</TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not public</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs">{row.updated_at}</span>
                            <span className="text-[10px] text-muted-foreground">
                              Created {row.created_at}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>{(people ?? []).length} users found</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Portfolio</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(people ?? []).map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7">
                              <AvatarFallback className="text-[10px]">
                                {(person.display_name || 'U').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {person.display_name || 'Unnamed user'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px] block">
                                {person.id.slice(0, 8)}…
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="font-mono text-xs">
                              {person.id}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {rows?.some((row) => row.owner_id === person.id)
                              ? 'Has portfolio'
                              : 'No portfolio'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{person.created_at}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
