import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { FaUsers, FaSearch, FaUserShield, FaUserCircle } from 'react-icons/fa';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await adminApi.get('/customer-users');
                setUsers(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaUsers className="text-indigo-600" /> Manage Customers
                    </h2>
                    <p className="text-gray-500 font-medium">View and manage all registered user accounts and their roles.</p>
                </div>
                <div className="relative z-10 flex gap-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search customers..." className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64 transition-all" />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden text-left">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-y-3">
                        <thead className="bg-transparent text-gray-400 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 rounded-l-xl">Customer Details</th>
                                <th className="px-6 py-4">Contact Logic</th>
                                <th className="px-6 py-4">Account Role</th>
                                <th className="px-6 py-4 rounded-r-xl">Member Since</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-10 text-gray-400 font-medium">No registered customer accounts found.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="bg-gray-50/50 hover:bg-gray-50 transition-all rounded-2xl">
                                        <td className="px-6 py-4 rounded-l-2xl border-y border-l border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                    {user.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{user.name || 'Unnamed'}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-y border-gray-100 font-medium text-gray-700">
                                            {user.phone || user.email || '—'}
                                        </td>
                                        <td className="px-6 py-4 border-y border-gray-100">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full inline-flex items-center gap-1.5 border border-indigo-100">
                                                <FaUserShield className="text-indigo-500" /> Customer
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-100 text-xs text-gray-500 font-medium">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
