// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const FILTERS = [
  { key: 'all',      label: 'Tous',           color: '#6366f1', bg: '#eef2ff', icon: 'fa-users' },
  { key: 'admin',    label: 'Admins',          color: '#f59e0b', bg: '#fef9c3', icon: 'fa-crown' },
  { key: 'owner',    label: 'Propriétaires',   color: '#0ea5e9', bg: '#e0f2fe', icon: 'fa-tools' },
  { key: 'borrower', label: 'Emprunteurs',     color: '#10b981', bg: '#d1fae5', icon: 'fa-user' },
  { key: 'deleted',  label: 'Supprimés',       color: '#dc2626', bg: '#fee2e2', icon: 'fa-user-slash' },
];

const ROLE_STYLE = {
  admin:    { bg: '#fef9c3', color: '#92400e', label: 'Admin',        icon: 'fa-crown' },
  owner:    { bg: '#e0f2fe', color: '#0369a1', label: 'Propriétaire', icon: 'fa-tools' },
  borrower: { bg: '#d1fae5', color: '#065f46', label: 'Emprunteur',   icon: 'fa-user'  },
};

export default function AdminUsers() {
  const [users,    setUsers]    = useState([]);
  const [counts,   setCounts]   = useState({});
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [confirm,  setConfirm]  = useState(null);
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchUsers = (p = 1, currentFilter = filter, currentSearch = search) => {
    setLoading(true);
    api.get(`/admin/users`, {
      params: {
        page: p,
        filter: currentFilter,
        search: currentSearch
      }
    })
      .then(r => { 
        const { pagination, counts } = r.data;
        setUsers(pagination.data); 
        setLastPage(pagination.last_page); 
        setPage(pagination.current_page);
        setCounts(counts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1, filter, search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filter, search]);

  const handleDelete  = async (id) => {
    try { await api.delete(`/admin/users/${id}`); setConfirm(null); fetchUsers(page); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };
  const handleRestore = async (id) => {
    try { await api.post(`/admin/users/${id}/restore`); fetchUsers(page); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const getRoleKey = (u) => u.is_admin ? 'admin' : u.role === 'owner' ? 'owner' : 'borrower';

  return (
    <>
      <style>{`
  /* ── Tabs ── */
  .au-tabs-wrap { position: relative; margin-bottom: 1.25rem; }
  .au-tabs-wrap::after { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 48px; background: linear-gradient(to left, #f8fafc, transparent); pointer-events: none; z-index: 2; border-radius: 0 18px 18px 0; }
  .au-tabs { display: flex; gap: 0.5rem; background: #fff; padding: 0.4rem; border-radius: 18px; border: 1.5px solid #e2e8f0; overflow-x: auto; scrollbar-width: none; scroll-behavior: smooth; width: 100%; }
  .au-tabs::-webkit-scrollbar { display: none; }
  .au-tab { flex: 0 0 auto; padding: 0.7rem 1.1rem; border-radius: 14px; border: none; font-weight: 700; font-size: 0.83rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); color: #64748b; background: transparent; white-space: nowrap; }
  .au-tab:hover:not(.au-active) { background: #f1f5f9; color: #0f172a; }
  .au-tab.au-active { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .au-scroll-hint { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 26px; height: 26px; background: #6366f1; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; z-index: 3; box-shadow: 0 4px 10px rgba(99,102,241,0.3); animation: auHint 1.5s infinite; pointer-events: none; }
  @keyframes auHint { 0%,100% { transform: translateY(-50%) translateX(0); opacity: 0.2; } 50% { transform: translateY(-50%) translateX(-6px); opacity: 1; } }

  /* ── Table / Cards ── */
  .au-table { width: 100%; border-collapse: collapse; }
  .au-th { padding: 0.75rem 1rem; text-align: left; font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
  .au-td { padding: 0.85rem 1rem; vertical-align: middle; border-bottom: 1px solid #f8fafc; }
  .au-tr:hover { background: #fafafa; }
  .au-cards { display: none; flex-direction: column; gap: 0.75rem; padding: 0.75rem; }
  .au-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 16px; padding: 1rem 1.1rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: transform 0.15s; }
  .au-card:active { transform: scale(0.99); }
  .au-act { padding: 0.32rem 0.75rem; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem; transition: all 0.15s; border: 1px solid; }

  /* ── Desktop ── */
  @media (min-width: 769px) {
    .au-tabs-wrap::after { display: none !important; }
    .au-scroll-hint { display: none !important; }
    .au-cards { display: none !important; }
    .au-table-wrap { display: block !important; }
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .au-table-wrap { display: none !important; }
    .au-cards { display: flex !important; }
    .au-tab { padding: 0.45rem 0.6rem !important; font-size: 0.72rem !important; gap: 0.3rem !important; }
    .au-tab span:last-child { padding: 0.05rem 0.3rem !important; }
  }
`}</style>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Utilisateurs</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>{counts.all || 0} utilisateur(s) au total</p>
      </div>

      {/* Tabs */}
      <div className="au-tabs-wrap">
        <div className="au-tabs" onScroll={e => {
          const hint = e.currentTarget.parentElement.querySelector('.au-scroll-hint');
          if (hint) hint.style.opacity = e.currentTarget.scrollLeft > 20 ? '0' : '1';
        }}>
          {FILTERS.map(f => {
            const isActive = filter === f.key;
            return (
              <button key={f.key} className={`au-tab ${isActive ? 'au-active' : ''}`} onClick={() => setFilter(f.key)}
                style={{ background: isActive ? f.bg : 'transparent', color: isActive ? f.color : '#64748b' }}>
                <i className={`fas ${f.icon}`} style={{ fontSize: '0.82rem' }}></i>
                {f.label}
                <span style={{ background: isActive ? 'rgba(255,255,255,0.55)' : '#f1f5f9', color: isActive ? f.color : '#94a3b8', padding: '0.05rem 0.45rem', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>
                  {counts[f.key] || 0}
                </span>
              </button>
            );
          })}
        </div>
        <div className="au-scroll-hint"><i className="fas fa-chevron-right"></i></div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 340, marginBottom: '1rem' }}>
        <i className="fas fa-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.78rem' }}></i>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou email..."
          style={{ width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: '0.5rem', paddingBottom: '0.5rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      {/* Content card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.75rem', color: '#6366f1' }}></i>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <i className="fas fa-users" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block', opacity: 0.3 }}></i>
            <p style={{ fontSize: '0.88rem', margin: 0 }}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="au-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="au-table">
                <thead>
                  <tr>
                    {['Utilisateur', 'Email', 'Rôle', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="au-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const role = getRoleKey(u);
                    const rs   = ROLE_STYLE[role];
                    return (
                      <tr key={u.id} className="au-tr" style={{ opacity: u.deleted_at ? 0.6 : 1 }}>
                        <td className="au-td">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: rs.bg, color: rs.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.88rem', flexShrink: 0 }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{u.name}</span>
                          </div>
                        </td>
                        <td className="au-td"><span style={{ color: '#64748b', fontSize: '0.82rem' }}>{u.email}</span></td>
                        <td className="au-td">
                          <span style={{ background: rs.bg, color: rs.color, padding: '0.2rem 0.65rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <i className={`fas ${rs.icon}`}></i> {rs.label}
                          </span>
                        </td>
                        <td className="au-td">
                          {u.deleted_at
                            ? <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>Supprimé</span>
                            : <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.68rem', fontWeight: 800 }}>Actif</span>
                          }
                        </td>
                        <td className="au-td">
                          {u.deleted_at ? (
                            <button onClick={() => handleRestore(u.id)} className="au-act" style={{ borderColor: '#10b981', background: '#f0fdf4', color: '#10b981' }}>
                              <i className="fas fa-undo"></i> Restaurer
                            </button>
                          ) : !u.is_admin ? (
                            <button onClick={() => setConfirm(u)} className="au-act" style={{ borderColor: '#fca5a5', background: '#fff', color: '#dc2626' }}>
                              <i className="fas fa-trash"></i> Supprimer
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="au-cards">
              {users.map(u => {
                const role = getRoleKey(u);
                const rs   = ROLE_STYLE[role];
                return (
                  <div key={u.id} className="au-card" style={{ opacity: u.deleted_at ? 0.65 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: rs.bg, color: rs.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', margin: 0 }}>{u.name}</p>
                          <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.1rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{u.email}</p>
                        </div>
                      </div>
                      {u.deleted_at
                        ? <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.18rem 0.5rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', flexShrink: 0 }}>Supprimé</span>
                        : <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.18rem 0.5rem', borderRadius: 20, fontSize: '0.65rem', fontWeight: 800, flexShrink: 0 }}>Actif</span>
                      }
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid #f8fafc' }}>
                      <span style={{ background: rs.bg, color: rs.color, padding: '0.22rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <i className={`fas ${rs.icon}`}></i> {rs.label}
                      </span>
                      {u.deleted_at ? (
                        <button onClick={() => handleRestore(u.id)} className="au-act" style={{ borderColor: '#10b981', background: '#f0fdf4', color: '#10b981' }}>
                          <i className="fas fa-undo"></i> Restaurer
                        </button>
                      ) : !u.is_admin ? (
                        <button onClick={() => setConfirm(u)} className="au-act" style={{ borderColor: '#fca5a5', background: '#fef2f2', color: '#dc2626' }}>
                          <i className="fas fa-trash"></i> Supprimer
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button disabled={page === 1 || loading} onClick={() => fetchUsers(page - 1)}
            style={{ padding: '0.45rem 0.85rem', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.15s' }}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', padding: '0 0.25rem' }}>{page} / {lastPage}</span>
          <button disabled={page === lastPage || loading} onClick={() => fetchUsers(page + 1)}
            style={{ padding: '0.45rem 0.85rem', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.15s' }}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '1.5rem', width: '100%', maxWidth: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <i className="fas fa-user-times" style={{ color: '#dc2626', fontSize: '1.1rem' }}></i>
              </div>
              <h3 style={{ fontWeight: 800, color: '#0f172a', margin: '0 0 0.3rem', fontSize: '1rem' }}>Supprimer {confirm.name} ?</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>L'utilisateur sera déplacé dans la liste des supprimés.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setConfirm(null)} style={{ flex: 1, background: '#f8fafc', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.65rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Annuler</button>
              <button onClick={() => handleDelete(confirm.id)} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}