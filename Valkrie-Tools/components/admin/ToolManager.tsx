'use client';

import { useState } from 'react';
import styles from './ToolManager.module.css';

export type AdminTool = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  website_url: string | null;
  icon_url: string | null;
  is_premium: boolean;
  is_published: boolean;
};

const emptyTool = { slug: '', name: '', category: 'utility', description: '', websiteUrl: '', iconUrl: '', isPremium: false, isPublished: false };

export function ToolManager({ initialTools }: { initialTools: AdminTool[] }) {
  const [tools, setTools] = useState(initialTools);
  const [form, setForm] = useState(emptyTool);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  function edit(tool: AdminTool) {
    setEditingId(tool.id);
    setForm({ slug: tool.slug, name: tool.name, category: tool.category, description: tool.description, websiteUrl: tool.website_url || '', iconUrl: tool.icon_url || '', isPremium: tool.is_premium, isPublished: tool.is_published });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const response = await fetch('/api/admin/tools', { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, id: editingId }) });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || 'Perubahan belum tersimpan.');
      setBusy(false);
      return;
    }
    window.location.reload();
  }

  async function remove(tool: AdminTool) {
    if (!window.confirm(`Hapus “${tool.name}” dari katalog?`)) return;
    setBusy(true);
    const response = await fetch('/api/admin/tools', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: tool.id }) });
    const result = await response.json();
    if (!response.ok) setMessage(result.error || 'Tool belum bisa dihapus.');
    else setTools((current) => current.filter((item) => item.id !== tool.id));
    setBusy(false);
  }

  return <div className={styles.layout}>
    <form className={styles.form} onSubmit={submit}>
      <h2>{editingId ? 'Edit tool' : 'Tambah tool'}</h2>
      <label>Nama<input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label>Slug URL<input required pattern="[a-z0-9-]{2,80}" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase() })} placeholder="contoh-tool" /></label>
      <label>Kategori<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{[['utility', 'Utilitas'], ['web_tools', 'Web tools'], ['design_tools', 'Desain'], ['developer_tools', 'Developer'], ['productivity', 'Produktivitas'], ['other', 'Lainnya']].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <label>Deskripsi<textarea maxLength={2000} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <label>URL situs resmi<input required type="url" placeholder="https://" value={form.websiteUrl} onChange={(event) => setForm({ ...form, websiteUrl: event.target.value })} /></label>
      <label>URL ikon (opsional)<input type="url" placeholder="https://" value={form.iconUrl} onChange={(event) => setForm({ ...form, iconUrl: event.target.value })} /></label>
      <div className={styles.checks}><label><input type="checkbox" checked={form.isPremium} onChange={(event) => setForm({ ...form, isPremium: event.target.checked })} /> Akses VIP</label><label><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} /> Terbitkan</label></div>
      {message && <p role="alert" className={styles.message}>{message}</p>}
      <div className={styles.actions}><button disabled={busy}>{busy ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Tambah ke katalog'}</button>{editingId && <button type="button" className={styles.secondary} onClick={() => { setEditingId(null); setForm(emptyTool); }}>Batal edit</button>}</div>
    </form>
    <section className={styles.list}><h2>Tools database <span>{tools.length}</span></h2>{tools.length ? tools.map((tool) => <article key={tool.id}><div><b>{tool.name}</b><small>/{tool.slug} · {tool.category} · {tool.is_published ? 'Terbit' : 'Draft'}{tool.is_premium ? ' · VIP' : ''}</small></div><div className={styles.rowActions}><button onClick={() => edit(tool)}>Edit</button><button className={styles.delete} disabled={busy} onClick={() => remove(tool)}>Hapus</button></div></article>) : <p className={styles.empty}>Belum ada tool di database.</p>}</section>
  </div>;
}
