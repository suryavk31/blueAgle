import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { getImageUrl } from '../../utils/imageHelper';
import {
    FaBox, FaShoppingCart, FaUsers, FaChartLine, FaArrowUp, FaArrowDown, FaMoneyBillWave, FaSortAmountUp, FaEllipsisH
} from 'react-icons/fa';

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [categoryDist, setCategoryDist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // adminApi automatically attaches the admin JWT
                const [statsRes, salesRes, topRes, catRes] = await Promise.all([
                    adminApi.get('/analytics/stats'),
                    adminApi.get('/analytics/sales-chart'),
                    adminApi.get('/analytics/top-products'),
                    adminApi.get('/analytics/category-dist')
                ]);

                setStats(statsRes.data);
                setSalesData(salesRes.data);
                setTopProducts(topRes.data);
                setCategoryDist(catRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading Analytics...</p>
            </div>
        </div>
    );

    if (!stats) return (
        <div className="flex justify-center items-center h-[80vh]">
            <div className="bg-red-50 text-red-500 p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center gap-2">
                <FaChartLine size={32} />
                <h3 className="font-bold text-lg">Failed to load data</h3>
                <p className="text-sm">Please check your network and try again.</p>
            </div>
        </div>
    );

    const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900">
                        Admin Overview
                    </h2>
                    <p className="text-gray-500 font-medium">Welcome back! Here's what's happening in your store today.</p>
                </div>
                <div className="relative z-10 flex items-center gap-3 bg-gray-50/80 px-4 py-2 rounded-xl border border-gray-100 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-600">
                        Live Data &middot; {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <PremKPICard
                    title="Total Revenue"
                    value={`₹${stats.revenue.total.toLocaleString()}`}
                    subValue={`₹${stats.revenue.currentMonth} this month`}
                    growth={stats.revenue.growth}
                    icon={<FaMoneyBillWave size={22} />}
                    gradient="from-emerald-500 to-teal-400"
                    shadowColor="shadow-emerald-500/20"
                />
                <PremKPICard
                    title="Total Orders"
                    value={stats.orders.total.toLocaleString()}
                    subValue={`${stats.orders.currentMonth} this month`}
                    growth={stats.orders.growth}
                    icon={<FaShoppingCart size={22} />}
                    gradient="from-indigo-500 to-blue-500"
                    shadowColor="shadow-indigo-500/20"
                />
                <PremKPICard
                    title="Total Customers"
                    value={stats.users.total.toLocaleString()}
                    subValue={`+${stats.users.newThisMonth} new this month`}
                    icon={<FaUsers size={22} />}
                    gradient="from-purple-500 to-fuchsia-400"
                    shadowColor="shadow-purple-500/20"
                />
                <PremKPICard
                    title="Products Portfolio"
                    value={stats.products.total.toLocaleString()}
                    subValue={`${stats.products.lowStock} Items Low in Stock`}
                    icon={<FaBox size={20} />}
                    gradient="from-rose-500 to-orange-400"
                    shadowColor="shadow-rose-500/20"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Sales Area Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 text-left">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-xl text-gray-800">Revenue Trend</h3>
                            <p className="text-sm text-gray-400 font-medium">Last 30 Days Performance</p>
                        </div>
                        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors"><FaEllipsisH className="text-gray-400" /></button>
                    </div>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenuePremium" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} 
                                    tickFormatter={(str) => new Date(str).toLocaleDateString([], { month: 'short', day: 'numeric' })} 
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 500 }} 
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                    tickFormatter={(val) => `₹${val/1000}k`}
                                />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#1f2937' }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                    labelStyle={{ color: '#6b7280', marginBottom: '4px', fontSize: '12px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#6366f1" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenuePremium)" 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5', style: { filter: 'drop-shadow(0px 4px 6px rgba(79, 70, 229, 0.4))' } }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Pie Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 text-left">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-xl text-gray-800">Sales by Category</h3>
                            <p className="text-sm text-gray-400 font-medium">Product Distribution</p>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryDist}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={6}
                                    dataKey="productCount"
                                    stroke="none"
                                >
                                    {categoryDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Legend 
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '13px', fontWeight: 500, paddingTop: '20px' }} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-xl text-gray-800">Top Selling Products</h3>
                        <p className="text-sm text-gray-400 font-medium">Items generating the most revenue</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2">
                        <FaSortAmountUp /> View All
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-y-3">
                        <thead className="text-gray-400 font-medium bg-gray-50/50">
                            <tr>
                                <th className="py-3 px-4 font-semibold rounded-l-xl">Product Name</th>
                                <th className="py-3 px-4 font-semibold">Total Sold</th>
                                <th className="py-3 px-4 font-semibold text-right rounded-r-xl">Revenue Generated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50/80 transition-colors shadow-sm bg-white border border-gray-50">
                                    <td className="py-4 px-4 rounded-l-xl border-y border-l border-gray-100 group-hover:border-transparent transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-400 overflow-hidden shrink-0 border border-gray-200/50">
                                                {item.Product?.images?.[0] ? (
                                                    <img src={getImageUrl(item.Product.images[0])} alt="Product" className="w-full h-full object-cover" />
                                                ) : (

                                                    <span>{idx + 1}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 line-clamp-1">{item.Product?.name || 'Unknown Product'}</p>
                                                <p className="text-xs text-gray-400 font-medium mt-0.5">ID: {item.productId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 border-y border-gray-100 group-hover:border-transparent transition-colors">
                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                                            {item.totalSold} Units
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 rounded-r-xl border-y border-r border-gray-100 text-right group-hover:border-transparent transition-colors">
                                        <span className="font-bold text-gray-800 text-base">₹{parseFloat(item.totalRevenue).toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const PremKPICard = ({ title, value, subValue, growth, icon, gradient, shadowColor }) => (
    <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group text-left relative overflow-hidden">
        {/* Subtle background glow effect using the gradient colors */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${gradient} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
        
        <div className="flex justify-between items-start mb-6 relative z-10 w-full">
            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg ${shadowColor}`}>
                {icon}
            </div>
            {growth !== undefined && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold leading-none
                    ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {growth >= 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                    {Math.abs(growth).toFixed(1)}%
                </div>
            )}
        </div>
        
        <div className="relative z-10">
            <h3 className="text-3xl font-black text-gray-800 mb-1 tracking-tight">{value}</h3>
            <p className="text-gray-400 font-semibold text-sm mb-1 uppercase tracking-wider">{title}</p>
            <p className="text-gray-400 text-xs font-medium">{subValue}</p>
        </div>
    </div>
);

export default Dashboard;
