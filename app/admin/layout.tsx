import AdminAuthShell from '@/components/admin/AdminAuthShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthShell>{children}</AdminAuthShell>;
}
