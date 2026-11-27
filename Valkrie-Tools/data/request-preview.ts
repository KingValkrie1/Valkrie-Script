import type { BoardRequest } from '@/components/requests/RequestBoard';
import type { PublicComment } from '@/components/requests/RequestDetail';

export const previewRequests: BoardRequest[] = [
  {
    id: '00000000-0000-4000-8000-000000000001', request_number: 103, author_uuid: '10000000-0000-4000-8000-000000000001',
    author_user_id: 'VALK-000103', author_username: 'raka_desain', author_name: 'Raka', author_role: 'member', author_membership_tier: 'ordinary', author_city: null,
    name: 'Generator QR dengan logo', category: 'utility', description: 'Tool untuk membuat QR code dengan pilihan warna, logo di tengah, dan unduhan PNG beresolusi tinggi.',
    reference_url: null, tags: ['fitur-baru', 'desain'], status: 'pending', admin_reply: null, rejection_reason: null, pinned: false,
    created_at: '2026-11-25T08:30:00.000Z', updated_at: '2026-11-25T08:30:00.000Z', vote_count: 23, comment_count: 2,
  },
  {
    id: '00000000-0000-4000-8000-000000000002', request_number: 102, author_uuid: '10000000-0000-4000-8000-000000000002',
    author_user_id: 'VALK-000102', author_username: 'naya_dev', author_name: 'Naya Putri', author_role: 'member', author_membership_tier: 'vip', author_city: 'Bandung',
    name: 'Pemeriksa aksesibilitas website', category: 'developer_tools', description: 'Pemeriksa sederhana untuk menemukan kontras teks rendah, gambar tanpa alt, dan label form yang belum lengkap.',
    reference_url: 'https://www.w3.org/WAI/test-evaluate/', tags: ['developer-tools', 'aksesibilitas'], status: 'processing',
    admin_reply: 'Sedang ditinjau. Kami sedang menyusun pemeriksaan awal yang berjalan langsung di browser.', rejection_reason: null, pinned: false,
    created_at: '2026-11-23T10:15:00.000Z', updated_at: '2026-11-26T05:00:00.000Z', vote_count: 18, comment_count: 1,
  },
  {
    id: '00000000-0000-4000-8000-000000000003', request_number: 101, author_uuid: '10000000-0000-4000-8000-000000000003',
    author_user_id: 'VALK-000101', author_username: 'dimas_productive', author_name: 'Dimas', author_role: 'member', author_membership_tier: 'ordinary', author_city: null,
    name: 'Konverter gambar ke WebP', category: 'web_tools', description: 'Konversi beberapa gambar sekaligus ke WebP dengan pilihan kualitas dan perkiraan ukuran file sebelum diunduh.',
    reference_url: null, tags: ['utility', 'gambar'], status: 'completed', admin_reply: 'Selesai. Konverter gambar sudah tersedia di katalog tools.',
    rejection_reason: null, pinned: false, created_at: '2026-11-18T13:45:00.000Z', updated_at: '2026-11-24T09:20:00.000Z', vote_count: 31, comment_count: 3,
  },
];

export const previewComments: PublicComment[] = [
  { id: 'demo-comment-1', user_id: '10000000-0000-4000-8000-000000000004', body: 'Akan membantu kalau hasilnya bisa diunduh dalam ukuran berbeda.', created_at: '2026-11-25T11:10:00.000Z', author_name: 'Mira', author_user_id: 'VALK-000104', author_username: 'mira_ui', author_role: 'member', author_membership_tier: 'ordinary' },
  { id: 'demo-comment-2', user_id: '10000000-0000-4000-8000-000000000005', body: 'Setuju, pilihan warna dan bentuk QR juga bakal berguna.', created_at: '2026-11-26T03:20:00.000Z', author_name: 'Bima', author_user_id: 'VALK-000105', author_username: 'bima_tools', author_role: 'member', author_membership_tier: 'vip' },
  { id: 'demo-comment-3', user_id: '10000000-0000-4000-8000-000000000006', body: 'Versi browser yang tidak perlu membuat akun akan pas untuk kebutuhan cepat.', created_at: '2026-11-24T07:45:00.000Z', author_name: 'Reno', author_user_id: 'VALK-000106', author_username: 'reno_web', author_role: 'member', author_membership_tier: 'ordinary' },
  { id: 'demo-comment-4', user_id: '10000000-0000-4000-8000-000000000007', body: 'Kalau sudah tersedia, tambahkan petunjuk singkat untuk kompresi gambar.', created_at: '2026-11-24T14:10:00.000Z', author_name: 'Sari', author_user_id: 'VALK-000107', author_username: 'sari_product', author_role: 'member', author_membership_tier: 'ordinary' },
];

export const previewCommentsByRequest: Record<string, PublicComment[]> = {
  [previewRequests[0].id]: previewComments.slice(0, 2),
  [previewRequests[1].id]: [previewComments[2]],
  [previewRequests[2].id]: [previewComments[3]],
};
