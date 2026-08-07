import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

const ForbiddenPage = ({ requiredPermission = null }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1a1a4e] to-slate-900 p-6">
            <div className="text-center max-w-md w-full">
                {/* Animated lock icon */}
                <div className="relative inline-flex items-center justify-center mb-8">
                    <div className="w-32 h-32 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-pulse">
                        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
                            <FaShieldAlt className="text-red-400 text-5xl" />
                        </div>
                    </div>
                </div>

                {/* 403 badge */}
                <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-widest">
                    <FaLock className="text-xs" />
                    403 FORBIDDEN
                </div>

                <h1 className="text-4xl font-black text-white mb-3">Access Denied</h1>
                <p className="text-slate-400 text-lg mb-4 leading-relaxed">
                    You don't have permission to view this page.
                </p>

                {requiredPermission && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
                        <p className="text-slate-400 text-sm mb-1">Required permission:</p>
                        <code className="text-indigo-400 font-mono text-sm font-bold">{requiredPermission}</code>
                    </div>
                )}

                <p className="text-slate-500 text-sm mb-8">
                    Contact your Super Admin to request access.
                </p>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all duration-200 border border-white/10"
                    >
                        <FaArrowLeft className="text-sm" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all duration-200"
                    >
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForbiddenPage;
