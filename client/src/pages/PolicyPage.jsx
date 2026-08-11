import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import PolicyRenderer from '../components/policy/PolicyRenderer';
import {
    FaFileAlt, FaShieldAlt, FaPrint, FaShareAlt, FaClock,
    FaExclamationCircle, FaListUl, FaQuestionCircle, FaChevronRight,
    FaSearch,
} from 'react-icons/fa';

const POLICY_LIST = [
    { type: 'account-deletion', label: 'Account Deletion Policy', icon: FaShieldAlt },
    { type: 'privacy', label: 'Privacy Policy', icon: FaShieldAlt },
    { type: 'terms', label: 'Terms & Conditions', icon: FaFileAlt },
    { type: 'return', label: 'Return & Refund Policy', icon: FaFileAlt },
    { type: 'cancellation', label: 'Cancellation Policy', icon: FaFileAlt },
    { type: 'shipping', label: 'Shipping & Delivery', icon: FaFileAlt },
    { type: 'cookie', label: 'Cookie Policy', icon: FaFileAlt },
    { type: 'contact', label: 'Contact Support', icon: FaQuestionCircle },
    { type: 'about', label: 'About Us', icon: FaFileAlt },
    { type: 'faq', label: 'FAQ', icon: FaQuestionCircle },
];

const PolicyPage = () => {
    const { type = 'privacy' } = useParams();

    const [policy, setPolicy] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPolicy = async () => {
            setLoading(true);
            setError(false);
            try {
                const res = await api.get(`/policies/${type}`);
                setPolicy(res.data);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, [type]);

    // Table of Contents list from policyJson sections
    const tocSections = useMemo(() => {
        if (!policy?.contentJson?.sections) return [];
        return policy.contentJson.sections.map((sec, idx) => ({
            id: sec.id || `section-${idx + 1}`,
            title: sec.title || `Section ${idx + 1}`,
        }));
    }, [policy?.contentJson]);

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: policy?.title || 'Policy Document',
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.info('Policy link copied to clipboard!');
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen py-10 px-4 md:px-8">

            <div className="max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#1a1a4e] via-[#2d1b69] to-[#3c006b] rounded-3xl p-8 md:p-12 mb-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 max-w-3xl">
                        <span className="text-xs uppercase font-bold text-indigo-300 tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">
                            Legal &amp; Policy Document
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black mt-4 mb-3 tracking-tight">
                            {policy?.title || type.replace('-', ' ').toUpperCase()}
                        </h1>
                        <p className="text-indigo-200 text-sm md:text-base leading-relaxed">
                            Structured policy terms governing usage, transactions, privacy rights, and user protection on BlueAgle.
                        </p>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Sticky Sidebar Navigation (Desktop) */}
                    <div className="w-full lg:w-72 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm shrink-0 lg:sticky lg:top-24 space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
                                Policy Documents
                            </h3>
                            <div className="space-y-1">
                                {POLICY_LIST.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = type === item.type;
                                    return (
                                        <Link
                                            key={item.type}
                                            to={`/policy/${item.type}`}
                                            className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                                                isActive
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 truncate">
                                                <Icon className={isActive ? 'text-white' : 'text-gray-400'} />
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                            <FaChevronRight className={`text-[10px] ${isActive ? 'text-white' : 'text-gray-300'}`} />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Table of Contents List */}
                        {tocSections.length > 0 && (
                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5">
                                    <FaListUl className="text-indigo-500" /> Document Sections
                                </h4>
                                <ul className="space-y-1.5 text-xs">
                                    {tocSections.map((sec) => (
                                        <li key={sec.id}>
                                            <a
                                                href={`#${sec.id}`}
                                                className="text-gray-600 hover:text-indigo-600 font-medium hover:underline block truncate px-2 py-1 rounded hover:bg-gray-50"
                                            >
                                                • {sec.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Policy Content Viewer */}
                    <div className="flex-1 bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm w-full space-y-6">
                        {loading ? (
                            <div className="animate-pulse space-y-6 py-6">
                                <div className="h-8 bg-gray-100 rounded-xl w-2/3"></div>
                                <div className="h-4 bg-gray-100 rounded-lg w-full"></div>
                                <div className="h-4 bg-gray-100 rounded-lg w-5/6"></div>
                                <div className="h-32 bg-gray-100 rounded-2xl"></div>
                            </div>
                        ) : error || !policy ? (
                            <div className="py-16 text-center">
                                <FaExclamationCircle className="text-amber-500 text-5xl mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Policy Document Unavailable</h2>
                                <p className="text-gray-500 text-sm mb-6">
                                    The requested policy document could not be loaded.
                                </p>
                                <Link to="/" className="bg-[#1a1a4e] text-white px-6 py-3 rounded-xl font-bold text-sm">
                                    Return to Home
                                </Link>
                            </div>
                        ) : (
                            <div>
                                {/* Action Bar & Metadata */}
                                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                        <FaClock className="text-indigo-500" />
                                        <span>Last Updated: <strong>{new Date(policy.lastUpdated || policy.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                                        <span className="mx-1">•</span>
                                        <span className="bg-green-50 text-green-700 font-bold px-2.5 py-0.5 rounded-full border border-green-200">
                                            v{policy.version || 1}.0 Structured JSON
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handlePrint}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                                        >
                                            <FaPrint /> Print
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors"
                                        >
                                            <FaShareAlt /> Share
                                        </button>
                                    </div>
                                </div>

                                {/* Section Search Bar */}
                                <div className="relative mb-8">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                    <input
                                        type="text"
                                        placeholder="Search terms inside this document..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {/* Dynamic JSON Policy Renderer */}
                                {policy.contentJson ? (
                                    <PolicyRenderer policyJson={policy.contentJson} searchQuery={searchQuery} />
                                ) : (
                                    <div
                                        className="prose prose-indigo max-w-none text-gray-700 leading-relaxed text-sm"
                                        dangerouslySetInnerHTML={{ __html: policy.content }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyPage;
