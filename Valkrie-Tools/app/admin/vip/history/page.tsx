import { redirect } from 'next/navigation';

/** VIP history is shown in the existing VIP management screen. */
export default function AdminVipHistoryAlias() {
  redirect('/admin/vip');
}
