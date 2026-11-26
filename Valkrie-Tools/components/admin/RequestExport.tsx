'use client';

import { useState } from 'react';

const columns = [
  ['request_id', 'ID Request'], ['user_id', 'User ID'], ['user_name', 'Nama Pembuat'], ['status', 'Status'],
  ['tool_name', 'Nama Tool'], ['category', 'Kategori'], ['description', 'Deskripsi'], ['tags', 'Tag'],
  ['votes', 'Jumlah Vote'], ['admin_reply', 'Balasan Admin'], ['rejection_reason', 'Alasan Penolakan'],
  ['created_at', 'Tanggal Dibuat'], ['updated_at', 'Terakhir Diupdate'], ['completed_at', 'Tanggal Selesai'],
] as const;
type Column = typeof columns[number][0];
type HistoryRow = { id: string; details: Record<string, unknown>; created_at: string; admin_name: string };

export function RequestExport({ history }: { history: HistoryRow[] }) {
  const [status, setStatus] = useState('all');
  const [month, setMonth] = useState('');
  const [selected, setSelected] = useState<Column[]>(columns.map(([key]) => key));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  function toggle(key: Column) { setSelected((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]); }
  async function download() {
    if (!selected.length) { setError('Pilih setidaknya satu kolom.'); return; }
    setBusy(true); setError('');
    try {
      const params = new URLSearchParams({ status, columns: selected.join(',') });
      if (month) params.set('month', month);
      const response = await fetch(`/api/admin/export?${params}`);
      if (!response.ok) { const result = await response.json(); throw new Error(result.error || 'Export belum berhasil.'); }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url;
      anchor.download = response.headers.get('Content-Disposition')?.match(/filename="?([^";]+)"?/)?.[1] || 'valkrie-requests.csv';
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
      window.location.reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Export belum berhasil.'); }
    finally { setBusy(false); }
  }
  return <>
    <section className="export-card"><span className="request-kicker">PENGATURAN EXPORT</span><h2>Atur file CSV</h2><div className="export-filters"><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Semua status</option><option value="pending">Menunggu</option><option value="processing">Diproses</option><option value="completed">Selesai</option><option value="rejected">Ditolak</option><option value="duplicate">Duplikat</option></select></label><label>Bulan dibuat<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label></div>
      <div className="export-column-heading"><b>Kolom yang disertakan</b><div><button type="button" onClick={() => setSelected(columns.map(([key]) => key))}>Pilih semua</button><button type="button" onClick={() => setSelected([])}>Kosongkan</button></div></div>
      <div className="export-columns">{columns.map(([key, label]) => <label key={key}><input type="checkbox" checked={selected.includes(key)} onChange={() => toggle(key)} />{label}</label>)}</div>
      {error && <p className="auth-error" role="alert">{error}</p>}<button className="export-download" type="button" onClick={download} disabled={busy}>{busy ? 'Menyiapkan CSV…' : 'Unduh CSV'}</button>
    </section>
    <section className="vip-history export-history"><div className="request-board-heading"><div><span className="request-kicker">AUDIT ADMIN</span><h2>Riwayat export</h2></div><span>{history.length} terbaru</span></div>{history.length ? history.map((item) => <article key={item.id}><div><b>{String(item.details.file_name || 'File CSV')}</b><small>{item.admin_name} · {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.created_at))}</small><p>{Number(item.details.row_count || 0).toLocaleString('id-ID')} request · {item.details.status === 'all' ? 'Semua status' : String(item.details.status)}{item.details.month ? ` · ${String(item.details.month)}` : ''}</p></div><span>{Array.isArray(item.details.columns) ? item.details.columns.length : 0} kolom</span></article>) : <div className="request-empty"><span>Belum ada export</span><p>File yang diunduh akan tercatat di sini.</p></div>}</section>
  </>;
}
