'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';

export type AdminRequestItem = {
  id: string; request_number: number; user_id: string; author_user_id: string; author_name: string;
  name: string; category: string; description: string; status: string; admin_reply: string | null;
  rejection_reason: string | null; pinned: boolean; hidden: boolean; created_at: string;
};
const statusLabel: Record<string, string> = { pending: 'Menunggu', processing: 'Diproses', completed: 'Selesai', rejected: 'Ditolak', duplicate: 'Duplikat' };

export function AdminRequests({ initialRequests }: { initialRequests: AdminRequestItem[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('processing');
  const [bulkBusy, setBulkBusy] = useState(false);
  const counts = useMemo(() => ({ all: requests.length, pending: requests.filter((r) => r.status === 'pending').length, processing: requests.filter((r) => r.status === 'processing').length, completed: requests.filter((r) => r.status === 'completed').length }), [requests]);
  const filtered = requests.filter((r) => (statusFilter === 'all' || r.status === statusFilter) && `${r.name} ${r.author_name} ${r.author_user_id}`.toLowerCase().includes(search.toLowerCase()));

  async function saveBulk() {
    if (!selectedIds.length) return;
    setBulkBusy(true); setNotice('');
    try {
      const response = await fetch('/api/admin/requests/bulk', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedIds, status: bulkStatus }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Aksi massal belum berhasil.');
      const updatedIds = result.ids as string[];
      setRequests((items) => items.map((item) => updatedIds.includes(item.id) ? { ...item, status: bulkStatus } : item));
      setSelectedIds([]); setNotice(result.message);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Aksi massal belum berhasil.'); }
    finally { setBulkBusy(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault(); setBusyId(id); setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const payload = { status: values.status, reply: values.reply, rejectionReason: values.rejectionReason, pinned: values.pinned === 'on', hidden: values.hidden === 'on' };
    try {
      const response = await fetch(`/api/admin/requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Perubahan belum disimpan.');
      setRequests((items) => items.map((item) => item.id === id ? { ...item, status: String(payload.status), admin_reply: payload.reply ? String(payload.reply) : null, rejection_reason: payload.status === 'rejected' ? String(payload.rejectionReason) : null, pinned: payload.pinned, hidden: payload.hidden } : item));
      setNotice(result.message);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Perubahan belum disimpan.'); }
    finally { setBusyId(''); }
  }

  return <>
    <div className="admin-stats"><article><b>{counts.all}</b><span>Total request</span></article><article><b>{counts.pending}</b><span>Menunggu</span></article><article><b>{counts.processing}</b><span>Diproses</span></article><article><b>{counts.completed}</b><span>Selesai</span></article></div>
    <div className="admin-filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari tool, nama, atau User ID" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Semua status</option>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    {filtered.length > 0 && <section className="admin-bulk"><label><input type="checkbox" checked={filtered.every((item) => selectedIds.includes(item.id))} onChange={(event) => setSelectedIds(event.target.checked ? Array.from(new Set(selectedIds.concat(filtered.map((item) => item.id)))) : selectedIds.filter((id) => !filtered.some((item) => item.id === id)))} /> Pilih semua yang terlihat</label><span>{selectedIds.length} dipilih</span><select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}><option value="pending">Menunggu</option><option value="processing">Diproses</option><option value="completed">Selesai</option><option value="duplicate">Duplikat</option></select><button type="button" disabled={!selectedIds.length || bulkBusy} onClick={saveBulk}>{bulkBusy ? 'Menyimpan…' : 'Ubah status'}</button></section>}
    {notice && <p className="request-notice" role="status">{notice}</p>}
    {filtered.length ? <div className="admin-request-list">{filtered.map((request) => <details className="admin-request" key={request.id}><summary><input className="admin-select-row" aria-label={`Pilih ${request.name}`} type="checkbox" checked={selectedIds.includes(request.id)} onClick={(event) => event.stopPropagation()} onChange={(event) => setSelectedIds((ids) => event.target.checked ? ids.concat(request.id) : ids.filter((id) => id !== request.id))} /><span className={`request-status status-${request.status}`}>{statusLabel[request.status] || request.status}</span><b>{request.name}</b><small>{request.author_name} · {request.author_user_id} · REQ-{request.request_number}</small></summary><div className="admin-request-body"><p>{request.description}</p><form onSubmit={(event) => save(event, request.id)}><label>Status<select name="status" defaultValue={request.status}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Balasan publik<textarea name="reply" defaultValue={request.admin_reply || ''} maxLength={5000} rows={3} /></label><label>Alasan penolakan<textarea name="rejectionReason" defaultValue={request.rejection_reason || ''} maxLength={1000} rows={2} placeholder="Wajib diisi saat status Ditolak" /></label><div className="admin-checks"><label><input type="checkbox" name="pinned" defaultChecked={request.pinned} /> Pin di atas</label><label><input type="checkbox" name="hidden" defaultChecked={request.hidden} /> Sembunyikan</label></div><button disabled={busyId === request.id}>{busyId === request.id ? 'Menyimpan…' : 'Simpan perubahan'}</button></form></div></details>)}</div> : <div className="request-empty"><span>Belum ada request</span><p>Request yang masuk akan muncul di sini.</p></div>}
    <Link className="admin-home-link" href="/">Kembali ke website</Link>
  </>;
}
