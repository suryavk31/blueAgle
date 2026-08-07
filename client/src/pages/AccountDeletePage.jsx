import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    FaExclamationTriangle, FaShieldAlt, FaTrash, FaCheckCircle,
    FaArrowLeft, FaLock, FaEnvelope, FaFileAlt, FaInfoCircle,
} from 'react-icons/fa';

const DELETION_REASONS = [
    'Privacy concerns',
    'No longer using the service',
    'Created another account',
    'Poor user experience',
    'Receiving too many communications',
    'Other reason',
];

const AccountDeletePage = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [reason, setReason] = useState(DELETION_REASONS[0]);
    const [feedback, setFeedback] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletedSuccess, setDeletedSuccess] = useState(false);

    if (!currentUser) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-400 mb-4">
                    <FaLock />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
                <p className="text-gray-500 mb-6">Please log in to manage your account deletion request.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-[#1a1a4e] text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-900 transition-colors"
                >
                    Log In Now
                </button>
            </div>
        );
    }

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!agreed) {
            toast.error('You must check the confirmation agreement box');
            return;
        }
        if (confirmText.toUpperCase() !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await currentUser.getIdToken();
            await api.delete('/account', {
                headers: { Authorization: `Bearer ${token}` },
                data: {
                    reason,
                    feedback,
                    confirmText: confirmText.toUpperCase(),
                },
            });

            setDeletedSuccess(true);
            setTimeout(async () => {
                await logout();
                navigate('/');
            }, 5000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Account deletion failed');
            setIsSubmitting(false);
        }
    };

    if (deletedSuccess) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        <FaCheckCircle />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Account Deleted</h1>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Your account and personal identity data have been successfully anonymized. A confirmation email has been sent.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 mb-6">
                        Redirecting to home page in 5 seconds...
                    </div>
                    <Link
                        to="/"
                        className="inline-block w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors"
                    >
                        Return to Store Immediately
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            {/* Header */}
            <div className="mb-8">
                <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium mb-4">
                    <FaArrowLeft className="text-xs" /> Back to Account Settings
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl">
                        <FaTrash />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Delete Your Account</h1>
                        <p className="text-gray-500 text-sm">Permanent account termination and data privacy controls</p>
                    </div>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 text-red-900">
                <div className="flex items-start gap-4">
                    <FaExclamationTriangle className="text-red-600 text-2xl shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-base mb-1">Warning: This action is permanent and cannot be undone</h3>
                        <p className="text-sm text-red-700 leading-relaxed">
                            Once you confirm account deletion, your active session will be terminated immediately. You will lose access to your profile, saved addresses, active wishlist, and loyalty items.
                        </p>
                    </div>
                </div>
            </div>

            {/* Data Removal & Retention Breakdown */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm mb-8 space-y-6">
                <div>
                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <FaShieldAlt className="text-indigo-600" /> What happens when you delete your account?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="font-bold text-red-600 block mb-1">Data Permanently Removed:</span>
                            <ul className="list-disc list-inside space-y-1 text-gray-500">
                                <li>Active login tokens & sessions</li>
                                <li>Saved shipping & billing addresses</li>
                                <li>Wishlist & active shopping cart items</li>
                                <li>Notification preferences</li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="font-bold text-blue-600 block mb-1">Data Anonymized for Legal Compliance:</span>
                            <ul className="list-disc list-inside space-y-1 text-gray-500">
                                <li>Completed order transaction records</li>
                                <li>GST invoices & tax accounting ledgers</li>
                                <li>Payment transaction reference IDs</li>
                                <li>Personal identifiers anonymized</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                    <span className="flex items-center gap-2">
                        <FaInfoCircle className="text-indigo-600 text-sm" />
                        Want to learn more about our data retention policies?
                    </span>
                    <Link to="/policy/account-deletion" target="_blank" className="font-bold text-indigo-600 underline hover:text-indigo-800">
                        Read Account Deletion Policy →
                    </Link>
                </div>
            </div>

            {/* Deletion Request Form */}
            <form onSubmit={handleDelete} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-4">Account Deletion Confirmation</h3>

                {/* Reason Selection */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Why are you leaving BlueAgle? (Optional)
                    </label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50/50 font-medium"
                    >
                        {DELETION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {/* Feedback Textarea */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Additional Comments or Suggestions (Optional)
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us how we could have improved your experience..."
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50/50 resize-none"
                    />
                </div>

                {/* Confirmation Checkbox */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="w-5 h-5 rounded accent-red-600 mt-0.5"
                        />
                        <span className="text-xs text-gray-700 font-semibold leading-relaxed">
                            I understand that this action is permanent, my active sessions will be terminated, and my personal identity will be anonymized across all systems.
                        </span>
                    </label>
                </div>

                {/* Type DELETE confirmation */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Type <span className="text-red-600 font-mono font-bold">DELETE</span> below to confirm *
                    </label>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type DELETE"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 uppercase tracking-widest"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="flex-1 py-3.5 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors"
                    >
                        Cancel & Return
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !agreed || confirmText.toUpperCase() !== 'DELETE'}
                        className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Deleting Account...
                            </span>
                        ) : (
                            <>
                                <FaTrash className="text-xs" /> DELETE MY ACCOUNT
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccountDeletePage;
