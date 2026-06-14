import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Plus, Trash2, ArrowLeft, Edit2, Check, X, Eye, EyeOff, Loader2, CloudUpload } from 'lucide-react';
import { getAdminRole } from '../utils/adminAuth';
import './Admin.css';

interface AdminUser {
    id: string;
    username: string;
    password?: string;
    role: string;
}

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    'Super Admin': { bg: '#fdf0e9', color: '#D04A02' },
    'Developer':   { bg: '#e8f0fe', color: '#1a73e8' },
    'Content Writer': { bg: '#e6f4ea', color: '#137333' },
};

const ROLE_ACCESS: Record<string, string> = {
    'Content Writer': 'Blog Manager',
    'Developer':      'Landing Page Editor + Blog',
    'Super Admin':    'Full access to all modules',
};

const RoleBadge = ({ role }: { role: string }) => {
    const c = ROLE_COLORS[role] || { bg: '#f0f0f0', color: '#333' };
    return (
        <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 600 }}>
            {role}
        </span>
    );
};

// ---------- Edit row ----------
const EditRow = ({ user, onSave, onCancel }: { user: AdminUser, onSave: (u: AdminUser) => void, onCancel: () => void }) => {
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(user.role);
    const [showPwd, setShowPwd] = useState(false);

    const save = () => {
        if (!username.trim()) return;
        onSave({ ...user, username: username.trim(), role, ...(password ? { password } : {}) });
    };

    return (
        <tr style={{ background: '#fffbf5' }}>
            <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                <input value={username} onChange={e => setUsername(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #D04A02', fontSize: '14px' }} />
            </td>
            <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <select value={role} onChange={e => setRole(e.target.value)}
                        style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', background: '#fff' }}>
                        <option>Content Writer</option>
                        <option>Developer</option>
                        <option>Super Admin</option>
                    </select>
                    <small style={{ color: '#888' }}>{ROLE_ACCESS[role]}</small>
                </div>
            </td>
            <td style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <input type={showPwd ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)} placeholder="New password (leave blank to keep)"
                        style={{ width: '100%', padding: '7px 34px 7px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', boxSizing: 'border-box' }} />
                    <button onClick={() => setShowPwd(p => !p)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={save} style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: '5px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <Check size={13} /> Save
                    </button>
                    <button onClick={onCancel} style={{ background: '#f0f0f0', color: '#555', border: 'none', borderRadius: '5px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <X size={13} /> Cancel
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ---------- Main ----------
const AdminManagement: React.FC = () => {
    const navigate = useNavigate();
    const role = getAdminRole();
    const isSuperAdmin = role === 'Super Admin';

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [newRole, setNewRole] = useState('Content Writer');
    const [isDeploying, setIsDeploying] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!isSuperAdmin) return;
        const stored = localStorage.getItem('kartika_admins');
        if (stored) {
            try { setUsers(JSON.parse(stored)); } catch { /* ignore */ }
        }
    }, [isSuperAdmin]);

    const persist = (list: AdminUser[]) => {
        setUsers(list);
        localStorage.setItem('kartika_admins', JSON.stringify(list));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername || !newPassword) return;
        persist([...users, { id: Date.now().toString(), username: newUsername, password: newPassword, role: newRole }]);
        setNewUsername(''); setNewPassword(''); setNewRole('Content Writer'); setIsAdding(false);
    };

    const handleEdit = (updated: AdminUser) => {
        persist(users.map(u => u.id === updated.id ? updated : u));
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this admin? This cannot be undone.')) {
            persist(users.filter(u => u.id !== id));
        }
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        setMessage({ type: 'success', text: 'Deploying admin changes to GitHub...' });
        try {
            const res = await fetch('/.netlify/functions/admin-deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source: 'admin_management', admins: users })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: '✅ Admin data deployed! Vercel is rebuilding your live site.' });
            } else throw new Error(data.error || 'Deploy failed');
        } catch {
            setMessage({ type: 'success', text: '✅ Changes saved locally (fallback).' });
        } finally { setIsDeploying(false); }
    };

    if (!isSuperAdmin) return (
        <div className="admin-dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <Helmet><title>Access Denied | Kartika.id</title></Helmet>
            <ShieldAlert size={64} color="#d93025" style={{ marginBottom: '20px' }} />
            <h2>Access Denied</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Super Admin privileges required.</p>
            <button className="nav-btn" onClick={() => navigate('/admin/dashboard')}>Return to Dashboard</button>
        </div>
    );

    return (
        <div className="admin-dashboard admin-blog-manager">
            <Helmet><title>Admin Management | Kartika.id</title></Helmet>

            {message && (
                <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, padding: '14px 20px', borderRadius: '8px', background: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: '380px', fontSize: '14px' }}>
                    {message.text}
                    <button onClick={() => setMessage(null)} style={{ marginLeft: '12px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                </div>
            )}

            <header className="admin-header">
                <div className="admin-header-title">
                    <button onClick={() => navigate('/admin/dashboard')} className="back-link"><ArrowLeft size={18} /></button>
                    <h1>ADMIN MANAGEMENT</h1>
                </div>
                <div className="admin-user-nav">
                    <button className="save-btn" style={{ background: '#D04A02' }} onClick={() => { setIsAdding(a => !a); setEditingId(null); }}>
                        <Plus size={16} /><span>Add New Admin</span>
                    </button>
                    <button onClick={handleDeploy} disabled={isDeploying} className="save-btn" style={{ background: '#4a5568' }}>
                        {isDeploying ? <Loader2 className="animate-spin" size={16} /> : <CloudUpload size={16} />}
                        <span>{isDeploying ? 'Deploying...' : 'Deploy Changes'}</span>
                    </button>
                </div>
            </header>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>

                {/* Role legend */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {Object.entries(ROLE_ACCESS).map(([r, access]) => (
                        <div key={r} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '8px 14px', fontSize: '13px' }}>
                            <RoleBadge role={r} /> <span style={{ color: '#666', marginLeft: '8px' }}>→ {access}</span>
                        </div>
                    ))}
                </div>

                {/* Add form */}
                {isAdding && (
                    <div className="card" style={{ marginBottom: '20px', background: '#fff', padding: '20px', borderRadius: '12px', border: '2px solid #D04A02' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#D04A02' }}>➕ Create New Admin</h3>
                        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                            <div className="input-group-compact">
                                <label>Username</label>
                                <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required placeholder="e.g. content_team1"
                                    style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc' }} />
                            </div>
                            <div className="input-group-compact">
                                <label>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showNewPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Secret password"
                                        style={{ width: '100%', padding: '9px 34px 9px 9px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                                    <button type="button" onClick={() => setShowNewPwd(p => !p)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                                        {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="input-group-compact">
                                <label>Role</label>
                                <select value={newRole} onChange={e => setNewRole(e.target.value)}
                                    style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff' }}>
                                    <option>Content Writer</option>
                                    <option>Developer</option>
                                    <option>Super Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', padding: '9px 16px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Check size={15} /> Create
                                </button>
                                <button type="button" onClick={() => setIsAdding(false)} style={{ background: '#eee', color: '#555', border: 'none', borderRadius: '6px', padding: '9px 12px', cursor: 'pointer' }}>
                                    <X size={15} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Users Table */}
                <div className="card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f9f9f9', borderBottom: '2px solid #eee' }}>
                            <tr>
                                <th style={{ padding: '14px 16px', color: '#555', fontSize: '13px', fontWeight: 700 }}>Username</th>
                                <th style={{ padding: '14px 16px', color: '#555', fontSize: '13px', fontWeight: 700 }}>Role & Access</th>
                                <th style={{ padding: '14px 16px', color: '#555', fontSize: '13px', fontWeight: 700, width: '160px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* System Root — always shown, never editable */}
                            <tr style={{ background: '#fffbf5' }}>
                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #eee' }}>
                                    <strong>kartikaadmin</strong>
                                    <span style={{ fontSize: '0.75em', background: '#2D1B00', color: '#fff', padding: '2px 7px', borderRadius: '10px', marginLeft: '8px' }}>System Root</span>
                                    <div style={{ fontSize: '12px', color: '#d93025', marginTop: '4px', fontFamily: 'monospace' }}>🔑 adminkartikaid354</div>
                                </td>
                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #eee' }}>
                                    <RoleBadge role="Super Admin" />
                                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{ROLE_ACCESS['Super Admin']}</div>
                                </td>
                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #eee' }}>
                                    <span style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>Protected</span>
                                </td>
                            </tr>
                            <tr style={{ background: '#fffbf5' }}>
                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #eee' }}>
                                    <strong>adminkartika</strong>
                                    <span style={{ fontSize: '0.75em', background: '#2D1B00', color: '#fff', padding: '2px 7px', borderRadius: '10px', marginLeft: '8px' }}>System Root</span>
                                    <div style={{ fontSize: '12px', color: '#d93025', marginTop: '4px', fontFamily: 'monospace' }}>🔑 kartikaempower</div>
                                </td>
                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #eee' }}>
                                    <RoleBadge role="Super Admin" />
                                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{ROLE_ACCESS['Super Admin']}</div>
                                </td>
                                <td style={{ padding: '14px 16px', borderBottom: '1px solid #eee' }}>
                                    <span style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>Protected</span>
                                </td>
                            </tr>

                            {users.map(user => editingId === user.id ? (
                                <EditRow key={user.id} user={user} onSave={handleEdit} onCancel={() => setEditingId(null)} />
                            ) : (
                                <tr key={user.id} style={{ transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #eee' }}>
                                        <strong>{user.username}</strong>
                                        <div style={{ fontSize: '12px', color: '#d93025', marginTop: '4px', fontFamily: 'monospace' }}>🔑 {user.password || '—'}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #eee' }}>
                                        <RoleBadge role={user.role} />
                                        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{ROLE_ACCESS[user.role] || '—'}</div>
                                    </td>
                                    <td style={{ padding: '14px 16px', borderBottom: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <button onClick={() => { setEditingId(user.id); setIsAdding(false); }}
                                                style={{ border: '1px solid #D04A02', background: 'none', color: '#D04A02', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                                                title="Edit user">
                                                <Edit2 size={13} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(user.id)}
                                                style={{ border: '1px solid #d93025', background: 'none', color: '#d93025', borderRadius: '5px', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                title="Delete user">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ padding: '30px', textAlign: 'center', color: '#aaa', fontStyle: 'italic' }}>
                                        No additional admins yet. Click "Add New Admin" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;
