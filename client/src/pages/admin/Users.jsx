import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaSearch, FaUserShield, FaUserCircle } from 'react-icons/fa';

const Users = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = await currentUser.getIdToken();
                const res = await axios.get('http://localhost:5000/api/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(res.data);
            } catch (error) {
                console.error(error);
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
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-16 text-gray-400 font-medium">No users found.</td>
                                </tr>
                            ) : (
                                users.map((user, idx) => (
                                    <tr key={user.id} className="group hover:bg-gray-50 shadow-sm bg-white border-y border-gray-50 transition-colors">
                                        <td className="px-6 py-4 rounded-l-xl border-y border-l border-gray-100 group-hover:border-transparent">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-200/50 shrink-0 shadow-sm">
                                                    {user.name ? user.name[0].toUpperCase() : <FaUserCircle />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-base">{user.name || 'Anonymous User'}</span>
                                                    <span className="text-xs text-gray-400 font-medium mt-0.5">User ID: #{user.id.toString().padStart(4, '0')}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-y border-gray-100 group-hover:border-transparent">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700">{user.phone}</span>
                                                <span className="text-xs text-indigo-500 font-bold">Verified OTP</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-y border-gray-100 group-hover:border-transparent">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border 
                                                ${user.role === 'admin' 
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                {user.role === 'admin' && <FaUserShield size={10} />}
                                                <span className="capitalize">{user.role}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 rounded-r-xl border-y border-r border-gray-100 group-hover:border-transparent">
                                            <span className="font-bold text-gray-600">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'N/A'}
                                            </span>
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
