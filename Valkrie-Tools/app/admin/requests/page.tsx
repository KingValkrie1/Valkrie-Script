import { redirect } from 'next/navigation';

/** Request moderation is currently rendered by the main admin dashboard. */
export default function AdminRequestsAlias() {
  redirect('/admin');
}
