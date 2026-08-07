import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminApi from '../../services/adminApi';
import { FaEnvelope, FaArrowLeft, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';

const AdminForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminApi.post('/auth/forgot-password', { email: email.trim() });
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1a1a4e] to-indigo-950 p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                        <FaShieldAlt className="text-indigo-400 text-2xl" />
                    </div>
                    <h1 className="text-2xl font-black text-white">Forgot Password</h1>
                    <p className="text-slate-400 text-sm mt-1">BlueAgle Admin Portal</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {sent ? (
                        <div className="text-center py-4">
                            <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-4" />
                            <h2 className="text-white font-bold text-lg mb-2">Check your email</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                If an account exists for <strong className="text-white">{email}</strong>,
                                we've sent a password reset link. Check the server console if SMTP isn't configured.
                            </p>
                            <Link
                                to="/admin/login"
                                className="inline-flex items-center gap-2 mt-6 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                            >
                                <FaArrowLeft /> Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Enter your admin email address and we'll send you a link to reset your password.
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Admin Email
                                </label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-500 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            <Link
                                to="/admin/login"
                                className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                            >
                                <FaArrowLeft className="text-xs" /> Back to Login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminForgotPassword;
