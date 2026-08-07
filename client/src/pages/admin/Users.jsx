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
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaUsers className="text-indigo-600" /> Manage Customers
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">View and manage all registered user accounts and their roles.</p>
                </div>
                <div className="relative z-10 flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input type="text" placeholder="Search customers..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden text-left">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-y-2.5 min-w-[500px]">
                        <thead className="bg-transparent text-gray-400 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 rounded-l-xl">Customer Details</th>
                                <th className="px-4 sm:px-6 py-3">Phone</th>
                                <th className="px-4 sm:px-6 py-3">Account Role</th>
                                <th className="px-4 sm:px-6 py-3 rounded-r-xl">Member Since</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 sm:px-6 py-3"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                                        <td className="px-4 sm:px-6 py-3"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                                        <td className="px-4 sm:px-6 py-3"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                                        <td className="px-4 sm:px-6 py-3"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-10 text-gray-400 font-medium">No registered customer accounts found.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="bg-gray-50/50 hover:bg-gray-50 transition-all rounded-2xl">
                                        <td className="px-4 sm:px-6 py-3.5 rounded-l-2xl border-y border-l border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                                                    {(user.name || 'U')[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 truncate text-xs sm:text-sm">{user.name || 'Unnamed'}</p>
                                                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 border-y border-gray-100 font-medium text-gray-700 text-xs sm:text-sm">
                                            {user.phone || 'N/A'}
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 border-y border-gray-100">
                                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold text-[10px] sm:text-xs">
                                                <FaUserShield size={10} /> {user.role || 'Customer'}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-3.5 rounded-r-2xl border-y border-r border-gray-100 text-gray-500 font-medium text-xs">
                                            {new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
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
