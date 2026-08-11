import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaChartLine, FaUsers, FaUserPlus, FaEye, FaExchangeAlt, FaClock,
    FaShoppingBag, FaSync, FaCog, FaMobileAlt, FaDesktop, FaTabletAlt,
    FaGlobe, FaExternalLinkAlt, FaCheckCircle, FaExclamationCircle, FaDollarSign
} from 'react-icons/fa';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';

const DATE_RANGES = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: '7daysAgo' },
    { label: 'Last 30 Days', value: '30daysAgo' },
    { label: 'Last 90 Days', value: '90daysAgo' },
];

const GoogleAnalyticsDashboard = () => {
    const [dateRange, setDateRange] = useState('30daysAgo');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnalytics(false);
    }, [dateRange]);

    const fetchAnalytics = async (forceRefresh = false) => {
        if (forceRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await adminApi.get('/analytics/ga4/dashboard', {
                params: {
                    startDate: dateRange,
                    endDate: 'today',
                    forceRefresh: forceRefresh ? 'true' : 'false',
                },
            });
            setData(res.data);
            if (forceRefresh) {
                toast.success('Analytics data refreshed from Google API');
            }
        } catch (err) {
            console.error('Error loading GA4 Dashboard:', err);
            setData({
                isConfigured: err.response?.data?.isConfigured !== false,
                status: 'Error',
                message: err.response?.data?.message || 'Failed to retrieve Google Analytics data',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex flex-col justify-center items-center min-h-[500px] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-xs font-bold text-slate-500 animate-pulse">
                    Retrieving real-time data from Google Analytics 4 API...
                </p>
            </div>
        );
    }

    if (!data?.isConfigured) {
        return (
            <div className="p-8 max-w-3xl mx-auto my-12 text-center bg-white rounded-2xl border border-slate-100 p-10 shadow-xs space-y-6">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto border border-amber-100">
                    <FaExclamationCircle />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900">Google Analytics Not Connected</h2>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        To view real-time visitors, traffic sources, landing pages, and ecommerce metrics directly inside your dashboard, please configure your GA4 Property ID.
                    </p>
                </div>
                <div>
                    <Link
                        to="/admin/settings/google-analytics"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                        <FaCog /> Configure Google Analytics 4
                    </Link>
                </div>
            </div>
        );
    }

    const { overview = {}, trafficOverview = [], trafficSources = [], topPages = [], topProducts = [], devices = [], geo = [], realtimeUsers = 0 } = data;

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
            {/* Header Control Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Google Analytics 4</h1>
                        {data.isDemoData ? (
                            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black rounded-full flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                Demo Preview Mode
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black rounded-full flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                Live GA4 Connected
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {data.isDemoData
                            ? 'Displaying demonstration analytics report. Connect your GA4 Property in Settings for live traffic data.'
                            : 'Real-time visitor metrics & e-commerce analytics directly from official Google Analytics Data API.'
                        }
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Real-time active users counter */}
                    <div className="px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
                        <div className="text-left">
                            <span className="text-[10px] font-extrabold uppercase text-purple-700 tracking-wider block">Active Users (30m)</span>
                            <span className="text-sm font-black text-purple-900">{realtimeUsers} Online</span>
                        </div>
                    </div>

                    {/* Date Range Selector */}
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 px-3.5 py-2.5 rounded-xl focus:outline-none"
                    >
                        {DATE_RANGES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>

                    {/* Refresh Button */}
                    <button
                        type="button"
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-100 transition-all flex items-center gap-2"
                        title="Fetch fresh data from Google Analytics API"
                    >
                        <FaSync className={refreshing ? 'animate-spin' : ''} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                </div>
            </div>

            {/* Demo Mode Notice Banner */}
            {data.isDemoData && (
                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-base shrink-0 font-bold shadow-xs">
                            📊
                        </div>
                        <div>
                            <p className="font-extrabold text-slate-900">Previewing Demonstration Analytics Report</p>
                            <p className="text-[11px] text-slate-600">
                                This dashboard is displaying realistic demonstration metrics until your official GA4 Property credentials are configured in Settings.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/admin/settings/google-analytics"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-all flex items-center gap-2"
                    >
                        <FaCog /> Configure GA4 API Keys
                    </Link>
                </div>
            )}

            {/* Last Updated Timestamp */}
            {data.updatedAt && (
                <div className="text-[11px] text-slate-400 font-medium text-right -mt-4">
                    Last updated: {new Date(data.updatedAt).toLocaleTimeString()} {data.isCached ? '(Cached)' : '(Fresh API)'}
                </div>
            )}

            {/* TOP 8 KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider">Active Users</span>
                        <FaUsers className="text-indigo-500 text-base" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{overview.activeUsers?.toLocaleString() || 0}</div>
                    <span className="text-[10px] text-slate-400 font-medium">Total unique visitors</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider">New Users</span>
                        <FaUserPlus className="text-emerald-500 text-base" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{overview.newUsers?.toLocaleString() || 0}</div>
                    <span className="text-[10px] text-slate-400 font-medium">First time visitors</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider">Sessions</span>
                        <FaExchangeAlt className="text-purple-500 text-base" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{overview.sessions?.toLocaleString() || 0}</div>
                    <span className="text-[10px] text-slate-400 font-medium">Total browsing sessions</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider">Engagement Rate</span>
                        <FaChartLine className="text-amber-500 text-base" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{overview.engagementRate || 'N/A'}</div>
                    <span className="text-[10px] text-slate-400 font-medium">Engaged sessions ratio</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider">Avg Engagement Time</span>
                        <FaClock className="text-blue-500 text-base" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{overview.avgEngagementTime || '0s'}</div>
                    <span className="text-[10px] text-slate-400 font-medium">Time spent per user</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider">Page Views</span>
                        <FaEye className="text-teal-500 text-base" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{overview.pageViews?.toLocaleString() || 0}</div>
                    <span className="text-[10px] text-slate-400 font-medium">Total screens/pages viewed</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider">Conversions</span>
                        <FaCheckCircle className="text-purple-600 text-base" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{overview.conversions?.toLocaleString() || 0}</div>
                    <span className="text-[10px] text-slate-400 font-medium">Completed goal actions</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Revenue</span>
                        <span className="text-emerald-600 font-extrabold text-sm">₹</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-600">₹{(overview.totalRevenue || 0).toLocaleString()}</div>
                    <span className="text-[10px] text-slate-400 font-medium">Recorded GA4 purchase revenue</span>
                </div>
            </div>

            {/* TRAFFIC OVERVIEW DAILY CHART */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <FaChartLine className="text-indigo-600" /> Daily Traffic Trend
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-indigo-600"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Users</span>
                        <span className="flex items-center gap-1.5 text-purple-600"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Sessions</span>
                        <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Views</span>
                    </div>
                </div>

                {trafficOverview.length > 0 ? (
                    <div className="h-48 flex items-end gap-1.5 pt-6 pb-2 border-b border-slate-100 overflow-x-auto">
                        {trafficOverview.map((item, idx) => {
                            const maxVal = Math.max(...trafficOverview.map(t => t.views || 1), 10);
                            const heightPct = Math.max(10, Math.round((item.views / maxVal) * 100));
                            return (
                                <div key={idx} className="flex-1 min-w-[20px] flex flex-col items-center gap-1 group relative">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded-lg z-20 whitespace-nowrap shadow-md">
                                        <div className="font-bold">{item.date}</div>
                                        <div>Users: {item.users}</div>
                                        <div>Sessions: {item.sessions}</div>
                                        <div>Views: {item.views}</div>
                                    </div>
                                    <div
                                        className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-sm hover:opacity-80 transition-all"
                                        style={{ height: `${heightPct}%` }}
                                    />
                                    <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">
                                        {item.date.length === 8 ? item.date.substring(6) : item.date}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 text-xs text-slate-400 font-medium">
                        No traffic trend data available for selected date range.
                    </div>
                )}
            </div>

            {/* TWO COLUMNS: TRAFFIC SOURCES & TOP LANDING PAGES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <FaGlobe className="text-purple-600" /> Traffic Acquisition Channels
                    </h2>

                    {trafficSources.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {trafficSources.map((source, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                                    <div>
                                        <span className="font-extrabold text-slate-800">{source.channel}</span>
                                        <span className="text-[10px] text-slate-400 font-medium block">{source.sessions} sessions</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-indigo-600">{source.users.toLocaleString()}</span>
                                        <span className="text-[10px] text-slate-400 font-medium block">users</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-xs text-slate-400">No acquisition source data recorded yet.</div>
                    )}
                </div>

                {/* Top Landing Pages */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <FaEye className="text-indigo-600" /> Top Landing Pages
                    </h2>

                    {topPages.length > 0 ? (
                        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                            {topPages.map((page, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                                    <div className="truncate max-w-[240px]">
                                        <a
                                            href={page.page}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-bold text-slate-800 hover:text-indigo-600 truncate flex items-center gap-1"
                                        >
                                            <span className="truncate">{page.page}</span>
                                            <FaExternalLinkAlt className="text-[9px] shrink-0" />
                                        </a>
                                        <span className="text-[10px] text-slate-400 block">{page.views} views • {page.engagementRate} engagement</span>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="font-black text-slate-900">{page.users}</span>
                                        <span className="text-[10px] text-slate-400 block">users</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-xs text-slate-400">No landing page data recorded yet.</div>
                    )}
                </div>
            </div>

            {/* TOP E-COMMERCE PRODUCTS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <FaShoppingBag className="text-emerald-600" /> Top E-Commerce Products Analytics
                </h2>

                {topProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                                    <th className="pb-3">Product Name</th>
                                    <th className="pb-3 text-right">Views</th>
                                    <th className="pb-3 text-right">Add to Cart</th>
                                    <th className="pb-3 text-right">Purchases</th>
                                    <th className="pb-3 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                                {topProducts.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="py-3 font-bold text-slate-900">{p.productName}</td>
                                        <td className="py-3 text-right">{p.views}</td>
                                        <td className="py-3 text-right">{p.addToCarts}</td>
                                        <td className="py-3 text-right font-bold text-purple-700">{p.purchases}</td>
                                        <td className="py-3 text-right font-black text-emerald-600">₹{(p.revenue || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-xs text-slate-400 font-medium">
                        No product e-commerce events recorded in GA4 for this period yet. Place a test purchase on customer store to generate events.
                    </div>
                )}
            </div>

            {/* DEVICE & GEOGRAPHIC BREAKDOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Categories */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <FaMobileAlt className="text-indigo-600" /> Devices Breakdown
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        {devices.map((d, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-xl text-center space-y-1">
                                <div className="text-indigo-600 text-lg flex justify-center">
                                    {d.device === 'mobile' ? <FaMobileAlt /> : d.device === 'tablet' ? <FaTabletAlt /> : <FaDesktop />}
                                </div>
                                <div className="text-xs font-black text-slate-900 capitalize">{d.device}</div>
                                <div className="text-base font-black text-indigo-700">{d.users}</div>
                                <div className="text-[10px] text-slate-400">{d.engagementRate} eng.</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Geography */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
                    <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <FaGlobe className="text-teal-600" /> Geographic Traffic
                    </h2>
                    <div className="divide-y divide-slate-100 max-h-[200px] overflow-y-auto text-xs">
                        {geo.map((g, idx) => (
                            <div key={idx} className="py-2.5 flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-slate-800">{g.city !== 'Unknown' ? `${g.city}, ` : ''}{g.country}</span>
                                </div>
                                <div className="font-black text-slate-900">{g.users} users</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoogleAnalyticsDashboard;
