import { Dashboard } from '@/components/dashboard';
import { requireUser } from '@/lib/supabase/require-auth';

export default async function DashboardPage() {
  await requireUser();
  return <Dashboard />;
}
