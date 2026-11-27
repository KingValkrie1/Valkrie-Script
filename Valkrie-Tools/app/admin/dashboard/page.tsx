import { redirect } from 'next/navigation';

/** Canonical dashboard lives at /admin; keep the documented route working. */
export default function AdminDashboardAlias() {
  redirect('/admin');
}
