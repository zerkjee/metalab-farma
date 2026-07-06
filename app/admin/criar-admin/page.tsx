'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldCheck, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

const senhaReqs = [
  { key: 'len',     label: 'Mínimo 8 caracteres',          test: (p: string) => p.length >= 8 },
  { key: 'upper',   label: '1 letra maiúscula (A–Z)',       test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower',   label: '1 letra minúscula (a–z)',       test: (p: string) => /[a-z]/.test(p) },
  { key: 'num',     label: '1 número (0–9)',                test: (p: string) => /[0-9]/.test(p) },
  { key: 'special', label: '1 caractere especial (!@#...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

interface AdminUser {
  id: string;
  nome: string;
  email: string;
  papel: 'ADMIN' | 'SUPER_ADMIN';
  ativo: boolean;
  criadoEm: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CriarAdminPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', papel: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN' });
  const [showSenha, setShowSenha] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadAdmins() {
    setLoadingList(true);
    const res = await fetch('/api/admin/usuarios');
    if (res.ok) setAdmins(await res.json());
    setLoadingList(false);
  }

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    fetch('/api/admin/usuarios')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (!cancelled && d) setAdmins(d); })
      .finally(() => { if (!cancelled) setLoadingList(false); });
    return () => { cancelled = true; };
  }, [isSuperAdmin]);

  const senhaValida = senhaReqs.every((r) => r.test(form.senha));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!senhaValida) { setError('A senha não atende todos os requisitos.'); return; }
    setSaving(true);
    setError('');
    setSuccess('');

    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.erro ?? 'Erro ao criar administrador.');
      return;
    }

    setSuccess(`Admin "${data.nome}" criado com sucesso.`);
    setForm({ nome: '', email: '', senha: '', papel: 'ADMIN' });
    loadAdmins();
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Desativar o admin "${nome}"? O acesso será revogado.`)) return;
    setDeletingId(id);
    await fetch(`/api/admin/usuarios?id=${id}`, { method: 'DELETE' });
    setDeletingId(null);
    loadAdmins();
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <ShieldCheck className="w-14 h-14 text-danger mb-4" strokeWidth={1.5} />
        <h2 className="text-xl font-display text-navy mb-2">Acesso restrito</h2>
        <p className="text-ink-secondary text-sm max-w-sm">
          Apenas Super Admins podem gerenciar outros administradores.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display text-navy">Gerenciar administradores</h1>
        <p className="text-ink-secondary text-sm mt-1">
          Crie e gerencie contas de acesso ao painel administrativo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Form */}
        <div className="bg-surface-card border border-line shadow-sm rounded-2xl p-6">
          <h2 className="text-navy font-display text-lg mb-5 flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-700" strokeWidth={2} />
            Novo administrador
          </h2>

          {error && (
            <div className="mb-4 rounded-xl border border-danger/30 bg-danger-subtle px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-xl border border-success/30 bg-success-subtle px-4 py-3 text-sm text-success">
              {success}
            </div>
          )}

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1.5">Nome completo</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm((v) => ({ ...v, nome: e.target.value }))}
                required
                minLength={2}
                placeholder="Nome do administrador"
                className="w-full rounded-xl border border-line-default bg-surface-card px-4 py-2.5 text-sm text-ink placeholder-ink-muted outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
                required
                placeholder="admin@metalab.com.br"
                className="w-full rounded-xl border border-line-default bg-surface-card px-4 py-2.5 text-sm text-ink placeholder-ink-muted outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={form.senha}
                  onChange={(e) => setForm((v) => ({ ...v, senha: e.target.value }))}
                  required
                  placeholder="Senha segura"
                  className="w-full rounded-xl border border-line-default bg-surface-card px-4 py-2.5 pr-11 text-sm text-ink placeholder-ink-muted outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-navy transition-colors"
                >
                  {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.senha.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1">
                  {senhaReqs.map((r) => {
                    const ok = r.test(form.senha);
                    return (
                      <li key={r.key} className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${ok ? 'text-success' : 'text-ink-muted'}`}>
                        <span className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${ok ? 'bg-success-subtle text-success' : 'bg-surface-sunken text-ink-muted'}`}>
                          {ok ? '✓' : '×'}
                        </span>
                        {r.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-1.5">Papel</label>
              <select
                value={form.papel}
                onChange={(e) => setForm((v) => ({ ...v, papel: e.target.value as 'ADMIN' | 'SUPER_ADMIN' }))}
                className="w-full rounded-xl border border-line-default bg-surface-card px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-all"
              >
                <option value="ADMIN">Admin — acesso ao painel</option>
                <option value="SUPER_ADMIN">Super Admin — controle total</option>
              </select>
              {form.papel === 'SUPER_ADMIN' && (
                <p className="mt-2 text-[11px] text-warning">
                  Super Admins podem criar e remover outros administradores.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || !senhaValida}
              className="w-full rounded-full bg-brand py-2.5 text-sm font-bold text-on-brand transition-all hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando...
                </>
              ) : 'Criar administrador'}
            </button>
          </form>
        </div>

        {/* List */}
        <div>
          <h2 className="text-navy font-display text-lg mb-4">Administradores</h2>

          {loadingList ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-surface-sunken animate-pulse" />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <p className="text-ink-muted text-sm">Nenhum administrador encontrado.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface-card shadow-sm px-4 py-3"
                >
                  <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-xs font-display text-on-brand flex-shrink-0">
                    {admin.nome.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-navy text-sm font-bold truncate">{admin.nome}</p>
                    <p className="text-ink-muted text-xs truncate">{admin.email}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        admin.papel === 'SUPER_ADMIN'
                          ? 'bg-gold-50 text-gold-600'
                          : 'bg-brand-50 text-brand-700'
                      }`}
                    >
                      {admin.papel === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                    </span>
                    <p className="text-ink-muted text-[10px] mt-0.5">{formatDate(admin.criadoEm)}</p>
                  </div>

                  {admin.id !== session?.user?.id && (
                    <button
                      onClick={() => handleDelete(admin.id, admin.nome)}
                      disabled={deletingId === admin.id}
                      className="ml-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-danger-subtle hover:text-danger transition-all disabled:opacity-40"
                      title="Desativar admin"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
