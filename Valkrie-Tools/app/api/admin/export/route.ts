import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const fields = ['request_id', 'user_id', 'user_name', 'status', 'tool_name', 'category', 'description', 'tags', 'votes', 'admin_reply', 'rejection_reason', 'created_at', 'updated_at', 'completed_at'] as const;
type ExportField = typeof fields[number];
const labels: Record<ExportField, string> = {
  request_id: 'ID Request', user_id: 'User ID', user_name: 'Nama Pembuat', status: 'Status', tool_name: 'Nama Tool',
  category: 'Kategori', description: 'Deskripsi', tags: 'Tag', votes: 'Jumlah Vote', admin_reply: 'Balasan Admin',
  rejection_reason: 'Alasan Penolakan', created_at: 'Tanggal Dibuat', updated_at: 'Terakhir Diupdate', completed_at: 'Tanggal Selesai',
};
const categoryLabel: Record<string, string> = { utility: 'Utility', web_tools: 'Web Tools', design_tools: 'Design Tools', developer_tools: 'Developer Tools', productivity: 'Productivity', other: 'Lainnya' };
const statusLabel: Record<string, string> = { pending: 'Menunggu', processing: 'Diproses', completed: 'Selesai', rejected: 'Ditolak', duplicate: 'Duplikat' };

function csvCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Masuk sebagai admin.' }, { status: 401 });
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 403 });

    const status = request.nextUrl.searchParams.get('status') || 'all';
    const month = request.nextUrl.searchParams.get('month') || '';
    const requested = request.nextUrl.searchParams.get('columns')?.split(',') || [...fields];
    const columns = fields.filter((field) => requested.includes(field));
    if (!columns.length) return NextResponse.json({ error: 'Pilih setidaknya satu kolom.' }, { status: 400 });
    if (status !== 'all' && !Object.prototype.hasOwnProperty.call(statusLabel, status)) return NextResponse.json({ error: 'Filter status tidak valid.' }, { status: 400 });
    if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return NextResponse.json({ error: 'Filter bulan tidak valid.' }, { status: 400 });

    const allRows: Array<Record<string, any>> = [];
    for (let offset = 0; offset < 50000; offset += 1000) {
      let query = supabase.from('tool_requests').select('id,request_number,user_id,name,category,description,tags,status,admin_reply,rejection_reason,created_at,updated_at,completed_at').order('created_at', { ascending: false }).range(offset, offset + 999);
      if (status !== 'all') query = query.eq('status', status);
      if (month) {
        const start = new Date(`${month}-01T00:00:00.000Z`);
        if (Number.isNaN(start.getTime())) return NextResponse.json({ error: 'Bulan tidak valid.' }, { status: 400 });
        const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
        query = query.gte('created_at', start.toISOString()).lt('created_at', end.toISOString());
      }
      const { data, error } = await query;
      if (error) return NextResponse.json({ error: 'Data export belum bisa dibaca.' }, { status: 503 });
      allRows.push(...(data || []));
      if ((data || []).length < 1000) break;
    }

    const uniqueIds = (values: string[]) => values.filter((value, index) => values.indexOf(value) === index);
    const profileMap = new Map<string, { user_id: string; display_name: string }>();
    for (let i = 0; i < allRows.length; i += 500) {
      const chunk = allRows.slice(i, i + 500);
      const ids = uniqueIds(chunk.map((row) => row.user_id));
      if (!ids.length) continue;
      const { data } = await supabase.from('public_profiles').select('id,user_id,display_name').in('id', ids);
      (data || []).forEach((item) => profileMap.set(item.id, { user_id: item.user_id, display_name: item.display_name }));
    }
    const voteCounts = new Map<string, number>();
    for (let i = 0; i < allRows.length; i += 500) {
      const ids = allRows.slice(i, i + 500).map((row) => row.id);
      if (!ids.length) continue;
      const { data } = await supabase.from('request_votes').select('request_id').in('request_id', ids);
      (data || []).forEach((vote) => voteCounts.set(vote.request_id, (voteCounts.get(vote.request_id) || 0) + 1));
    }

    const values = allRows.map((row) => {
      const author = profileMap.get(row.user_id);
      const record: Record<ExportField, unknown> = {
        request_id: `REQ-${row.request_number}`, user_id: author?.user_id || '', user_name: author?.display_name || '',
        status: statusLabel[row.status] || row.status, tool_name: row.name, category: categoryLabel[row.category] || row.category,
        description: row.description, tags: (row.tags || []).join(', '), votes: voteCounts.get(row.id) || 0,
        admin_reply: row.admin_reply, rejection_reason: row.rejection_reason, created_at: row.created_at,
        updated_at: row.updated_at, completed_at: row.completed_at,
      };
      return columns.map((field) => csvCell(record[field])).join(',');
    });
    const csv = `\uFEFF${columns.map((field) => csvCell(labels[field])).join(',')}\r\n${values.join('\r\n')}`;
    const fileName = `valkrie-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    const { error: logError } = await supabase.from('admin_activity').insert({ admin_id: user.id, action: 'requests.export', target_type: 'requests', details: { status, month: month || null, columns, row_count: allRows.length, file_name: fileName } });
    if (logError) return NextResponse.json({ error: 'Export gagal dicatat di riwayat admin.' }, { status: 503 });
    return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${fileName}"`, 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Export belum bisa diproses.' }, { status: 503 });
  }
}
