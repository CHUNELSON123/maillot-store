import { AdminPortalShell } from '@/modules/admin/components/admin-portal-shell';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminPortalShell>{children}</AdminPortalShell>;
}
