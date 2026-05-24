import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function NotificationBell() {
    const { user, updateRole } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();


    const load = () => {
        api.get('/notifications')
            .then(r => {
                setNotifications(r.data.notifications);
                setUnread(r.data.unread);
            })
            .catch(() => { });
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 10000); // poll 10s
        return () => clearInterval(interval);
    }, []);

    // Fermer si clic dehors
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleOpen = async () => {
        setOpen(!open);
        if (!open && unread > 0) {
            await api.put('/notifications/read');
            setUnread(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    const ICONS = {
        booking_received: { icon: 'fa-box', color: '#2563eb' },
        booking_approved: { icon: 'fa-check-circle', color: '#16a34a' },
        booking_rejected: { icon: 'fa-times-circle', color: '#dc2626' },
        booking_cancelled: { icon: 'fa-ban', color: '#94a3b8' },
        tool_picked_up: { icon: 'fa-key', color: '#f59e0b' },
        tool_returned: { icon: 'fa-flag-checkered', color: '#059669' },
        leave_review: { icon: 'fa-star', color: '#f59e0b' },
        new_review: { icon: 'fa-star-half-alt', color: '#10b981' },
        new_message: { icon: 'fa-comment-dots', color: '#7c3aed' },
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Icône cloche */}
            <button onClick={handleOpen} style={styles.bell}>
                <i className="fas fa-bell" style={{ fontSize: '1.1rem', color: '#cbd5e1' }}></i>
                {unread > 0 && (
                    <span style={styles.badge}>{unread}</span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={styles.dropdown}>
                    <div style={styles.dropdownHeader}>
                        <strong>Notifications</strong>
                        {unread === 0 && <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tout lu</span>}
                    </div>

                    {notifications.length === 0 ? (
                        <p style={styles.empty}>Aucune notification</p>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                style={{
                                    ...styles.item,
                                    background: n.is_read ? 'transparent' : '#eff6ff',
                                }}
                                onClick={async () => {
                                    setOpen(false);

                                    // Rôles requis par type (uniquement pour les actions exclusives)
                                    const ownerTypes = ['booking_received', 'booking_cancelled', 'tool_picked_up', 'tool_returned'];
                                    const borrowerTypes = ['booking_approved', 'booking_rejected'];

                                    const needsOwner = ownerTypes.includes(n.type);
                                    const needsBorrower = borrowerTypes.includes(n.type);

                                    // Vérifier si changement de rôle nécessaire
                                    if (needsOwner && user?.role !== 'owner' && !user?.is_admin) {
                                        if (window.confirm('Cette notification nécessite le rôle Propriétaire. Voulez-vous changer votre rôle ?')) {
                                            await updateRole('owner');
                                        }
                                    } else if (needsBorrower && user?.role !== 'borrower' && !user?.is_admin) {
                                        if (window.confirm('Cette notification nécessite le rôle Emprunteur. Voulez-vous changer votre rôle ?')) {
                                            await updateRole('borrower');
                                        }
                                    }

                                    // Redirection
                                    // Déterminer le bloc selon le type
                                    const getBlock = (type) => {
                                        if (type === 'booking_received') return 'pending';
                                        if (type === 'booking_approved') return 'approved';
                                        if (type === 'booking_rejected') return 'rejected';
                                        if (type === 'booking_cancelled') return 'rejected';
                                        if (type === 'tool_picked_up') return 'approved';
                                        if (type === 'tool_returned') return 'completed';
                                        if (type === 'leave_review') return 'completed';
                                        if (type === 'new_review') return 'completed';
                                        return 'pending';
                                    };

                                    // Redirection
                                    if (n.type === 'new_message' && n.reference_id) {
                                        navigate(`/messages/${n.reference_id}`);
                                    } else if (n.type === 'new_review') {
                                        // Rediriger vers son propre profil public, onglet avis
                                        // On détermine si on regarde les avis "en tant que proprio" ou "emprunteur"
                                        const rType = user?.role === 'owner' ? 'as_owner' : 'as_borrower';
                                        navigate(`/profile/${user.id}`, { state: { tab: 'reviews', reviewType: rType } });
                                    } else {
                                        navigate('/bookings', { state: { block: getBlock(n.type) } });
                                    }
                                }}
                            >
                                <div style={{ 
                                    width: 40, height: 40, borderRadius: 10, 
                                    background: (ICONS[n.type]?.color || '#f1f5f9') + '15',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                                }}>
                                    <i className={`fas ${ICONS[n.type]?.icon || 'fa-bell'}`} style={{ color: ICONS[n.type]?.color || '#94a3b8', fontSize: '1rem' }}></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={styles.itemTitle}>{n.title}</p>
                                    <p style={styles.itemMsg}>{n.message}</p>
                                    <p style={styles.itemTime}>
                                        {new Date(n.created_at).toLocaleString('fr-FR', {
                                            day: '2-digit', month: '2-digit',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                {!n.is_read && <span style={styles.dot}></span>}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

const styles = {
    bell: {
        position: 'relative', background: 'none', border: 'none',
        cursor: 'pointer', padding: '0.3rem'
    },
    badge: {
        position: 'absolute', top: -4, right: -4,
        background: '#dc2626', color: '#fff', borderRadius: '50%',
        width: 18, height: 18, fontSize: '0.7rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    dropdown: {
        position: 'fixed', right: 8, top: '60px',
        background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        width: 'min(320px, calc(100vw - 16px))', maxHeight: 420, overflowY: 'auto', zIndex: 999,
        border: '1px solid #e2e8f0',
    },
    dropdownHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0',
    },
    empty: { textAlign: 'center', color: '#94a3b8', padding: '1.5rem', margin: 0 },
    item: {
        display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem',
        borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
        alignItems: 'flex-start', transition: 'background 0.15s',
    },
    itemTitle: { fontWeight: 700, fontSize: '0.88rem', margin: 0, color: '#1e293b' },
    itemMsg: { fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0', lineHeight: 1.4 },
    itemTime: { fontSize: '0.75rem', color: '#94a3b8', margin: '0.2rem 0 0' },
    dot: { width: 8, height: 8, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 4 },
};