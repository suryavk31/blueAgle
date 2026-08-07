import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { FaEye, FaEyeSlash, FaShieldAlt, FaLock, FaEnvelope } from 'react-icons/fa';

const AdminLogin = () => {
    const { login, adminUser } = useAdminAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (adminUser) navigate('/admin', { replace: true });
    }, [adminUser, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            toast.error('Please enter email and password');
            return;
        }
        setLoading(true);
        try {
            const admin = await login(email.trim(), password.trim());
            toast.success(`Welcome back, ${admin.firstName}!`);
            navigate('/admin', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-[#1a1a4e] to-indigo-950">
            {/* Left — branding panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)]" />
                <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-56 h-56 bg-purple-500/5 rounded-full blur-3xl" />

                <div className="relative z-10 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30">
                        <FaShieldAlt className="text-white text-4xl" />
                    </div>
                    <h1 className="text-5xl font-black text-white mb-4">
                        Blue<span className="text-indigo-400">Agle</span>
                    </h1>
                    <p className="text-indigo-300 text-xl font-medium mb-6">Admin Control Panel</p>
                    <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
                        Secure, role-based access to manage your entire store operations.
                        Enterprise-grade RBAC with complete audit logging.
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-4">
                        {['Role Based', 'Audit Logs', 'Secure Auth'].map((feature) => (
                            <div key={feature} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                                <p className="text-indigo-300 text-xs font-bold tracking-wider">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — login form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-3xl font-black text-white">
                            Blue<span className="text-indigo-400">Agle</span>
                        </h1>
                        <p className="text-indigo-300 text-sm mt-1">Admin Control Panel</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white mb-1">Sign In</h2>
                            <p className="text-slate-400 text-sm">Enter your admin credentials to continue</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Admin Email
                                </label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                    <input
                                        id="admin-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="superadmin@blueeagle.com"
                                        required
                                        autoComplete="email"
                                        className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-500 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                    <input
                                        id="admin-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-500 pl-11 pr-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Link
                                    to="/admin/forgot-password"
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                id="admin-login-btn"
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black text-sm tracking-wide shadow-lg shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : 'Secure Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                                ← Return to Customer Store
                            </Link>
                        </div>
                    </div>

                    <p className="text-center text-slate-600 text-xs mt-6">
                        Access restricted to authorized personnel only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
