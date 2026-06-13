import React from 'react'
import { Helmet } from 'react-helmet-async'
import { LogOut, LayoutDashboard, Database, Settings, BarChart3, Users, FileText, ShieldAlert } from 'lucide-react'
import { logoutAdmin, getAdminRole } from '../utils/adminAuth'
import { useNavigate } from 'react-router-dom'
import { KARTIKA_BLOG_POSTS } from '../data/kartika-blog'
import './Admin.css'

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate()
    const role = getAdminRole()
    const articleCount = KARTIKA_BLOG_POSTS.length

    return (
        <div className="admin-dashboard">
            <Helmet>
                <title>Admin Dashboard | Kartika.id</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <header className="admin-header">
                <div className="admin-header-title">
                    <h1>KARTIKA<span style={{ color: '#D04A02' }}>.ID</span></h1>
                </div>

                <div className="admin-user-nav">
                    <div className="admin-user-info">
                        <Users size={18} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>Logged In</span>
                            <span style={{ fontSize: '0.7em', color: '#D04A02', fontWeight: 'bold' }}>{role}</span>
                        </div>
                    </div>
                    <button onClick={logoutAdmin} className="logout-btn">
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <main className="admin-main">
                <div className="welcome-banner">
                    <h2>Welcome to your Dashboard</h2>
                    <p>Ini adalah portal administrasi Kartika.id. Kelola artikel blog, konten program, dan pantau aktivitas situs dari sini.</p>
                </div>

                <div className="dashboard-stats">
                    {(role === 'Super Admin' || role === 'Content Writer') && (
                        <div className="stat-card clickable" onClick={() => navigate('/admin/blog')}>
                            <div className="stat-icon">
                                <FileText size={28} />
                            </div>
                            <div className="stat-info">
                                <h3>Blog Manager</h3>
                                <div className="stat-value">{articleCount} Articles</div>
                            </div>
                        </div>
                    )}

                    {(role === 'Super Admin' || role === 'Developer') && (
                        <div className="stat-card clickable" onClick={() => navigate('/admin/landing-editor')}>
                            <div className="stat-icon" style={{ background: '#2D1B00' }}>
                                <LayoutDashboard size={28} />
                            </div>
                            <div className="stat-info">
                                <h3>Edit Landing Page</h3>
                                <div className="stat-value" style={{ fontSize: '1rem' }}>No-Code Editor</div>
                            </div>
                        </div>
                    )}

                    <div className="stat-card">
                        <div className="stat-icon">
                            <Database size={28} />
                        </div>
                        <div className="stat-info">
                            <h3>Database</h3>
                            <div className="stat-value">Connected</div>
                        </div>
                    </div>

                    {role === 'Super Admin' && (
                        <div className="stat-card clickable" onClick={() => navigate('/admin/users')}>
                            <div className="stat-icon" style={{ background: '#D04A02' }}>
                                <Users size={28} />
                            </div>
                            <div className="stat-info">
                                <h3>Admin Management</h3>
                                <div className="stat-value" style={{ fontSize: '1rem' }}>Manage Roles</div>
                            </div>
                        </div>
                    )}

                    <div className="stat-card">
                        <div className="stat-icon">
                            <Settings size={28} />
                        </div>
                        <div className="stat-info">
                            <h3>Settings</h3>
                            <div className="stat-value">v1.0.0</div>
                        </div>
                    </div>
                </div>
            </main>

            <footer style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                &copy; {new Date().getFullYear()} Kartika.id Admin Portal
            </footer>
        </div>
    )
}

export default AdminDashboard
