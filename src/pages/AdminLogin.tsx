import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LogIn, User, Lock, Loader2, AlertCircle } from 'lucide-react'
import { setAdminSession, isAdminAuthenticated } from '../utils/adminAuth'
import './Admin.css'

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        // If already logged in, skip login page
        if (isAdminAuthenticated()) {
            navigate('/admin/dashboard')
        }
    }, [navigate])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        // Simulate a brief loading state for UX
        await new Promise((resolve) => setTimeout(resolve, 600))

        // Hardcoded credentials for Kartika super admin
        const VALID_USERNAME = 'kartikaadmin'
        const VALID_PASSWORD = 'adminkartikaid354'

        let role = ''
        let authenticated = false

        if (username === VALID_USERNAME && password === VALID_PASSWORD) {
            authenticated = true
            role = 'Super Admin'
        } else {
            // Check dynamically created admins
            try {
                const response = await fetch('/.netlify/functions/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                })
                const data = await response.json()
                if (data.success) {
                    authenticated = true
                    role = data.user?.role || 'Content Writer'
                }
            } catch (e) {
                console.error(e)
            }
        }

        if (authenticated) {
            setAdminSession('kartika-admin-token-' + Date.now(), role)
            navigate('/admin/dashboard')
        } else {
            setError('Username atau password salah. Silakan coba lagi.')
        }

        setIsLoading(false)
    }

    return (
        <div className="admin-login-page">
            <Helmet>
                <title>Admin Login | Kartika.id</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="admin-login-container">
                <div className="admin-login-card">
                    <div className="admin-login-header">
                        <div className="admin-logo">
                            <h1>KARTIKA</h1>
                            <p>ADMIN PANEL</p>
                        </div>
                        <h2>Welcome Back</h2>
                    </div>

                    <form className="admin-login-form" onSubmit={handleLogin}>
                        {error && (
                            <div className="admin-login-error">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="admin-input-group">
                            <label htmlFor="username">Username</label>
                            <div className="input-with-icon">
                                <User className="input-icon" size={18} />
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="kartikaadmin"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="admin-input-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-with-icon">
                                <Lock className="input-icon" size={18} />
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="admin-login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>Login to Dashboard</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="admin-login-footer">
                        <p>&copy; {new Date().getFullYear()} Kartika.id. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
