import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminApi from '../../services/adminApi';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaShieldAlt, FaEnvelope } from 'react-icons/fa';

const AcceptInvitation = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [invitation, setInvitation] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [loadingInvite, setLoadingInvite] = useState(true);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const fetchInvitation = async () => {
            try {
                const res = await adminApi.get(`/invitations/accept/${token}`);
                setInvitation(res.data);
            } catch (err) {
                setLoadError(err.response?.data?.message || 'Invalid invitation');
            } finally {
                setLoadingInvite(false);
            }
        };
        fetchInvitation();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) { toast.error('Passwords do not match'); return; }
        if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }

        setLoading(true);
        try {
            await adminApi.post(`/invitations/accept/${token}`, { firstName, lastName, password });
            setDone(true);
            setTimeout(() => navigate('/admin/login'), 3000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to accept invitation');
        } finally {
            setLoading(false);
        }
    };

    if (loadingInvite) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1a1a4e] to-indigo-950">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1a1a4e] to-indigo-950 p-6 text-center">
                <div>
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <FaShieldAlt className="text-red-400 text-2xl" />
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">Invitation Invalid</h2>
                    <p className="text-red-400 mb-6">{loadError}</p>
                    <Link to="/admin/login" className="text-indigo-400 hover:text-indigo-300 text-sm">
                        Back to Login →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1a1a4e] to-indigo-950 p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                        <FaShieldAlt className="text-indigo-400 text-2xl" />
                    </div>
                    <h1 className="text-2xl font-black text-white">Accept Invitation</h1>
                    <p className="text-slate-400 text-sm mt-1">BlueAgle Admin Portal</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {done ? (
                        <div className="text-center py-4">
                            <FaCheckCircle className="text-green-400 text-4xl mx-auto mb-4" />
                            <h2 className="text-white font-bold text-lg mb-2">Account Created!</h2>
                            <p className="text-slate-400 text-sm">Redirecting to login in 3 seconds...</p>
                        </div>
                    ) : (
                        <>
                            {/* Invitation info */}
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <FaEnvelope className="text-indigo-400" />
                                    <div>
                                        <p className="text-white text-sm font-bold">{invitation?.email}</p>
                                        <p className="text-slate-400 text-xs">Role: <span className="text-indigo-400 font-semibold">{invitation?.roleName}</span></p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                                        <div className="relative">
                                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="First" className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-500 pl-9 pr-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                                        <div className="relative">
                                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Last" className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-500 pl-9 pr-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                        <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 8 characters" className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-500 pl-11 pr-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                            {showPw ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Repeat password" className="w-full bg-white/10 border border-white/10 text-white placeholder-slate-500 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50">
                                    {loading ? 'Creating account...' : 'Create Admin Account'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcceptInvitation;
