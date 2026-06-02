import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
    const { loginAsStaff } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            if (email.trim().toLowerCase() === 'admin@blueeagle.com' && password.trim() === 'admin123') {
                loginAsStaff({ id: 1, name: 'Admin User', email: 'admin@blueeagle.com', role: 'admin', phone: '9999999999' });
                toast.success("Welcome, Admin!");
                navigate('/admin');
                return;
            }
            toast.error("Invalid credentials");
        } catch (error) {
            toast.error("Login failed");
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen px-4 bg-[#f8fbfa]">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-black mb-2 text-[#1a1a4e]">Admin Portal</h2>
                    <p className="text-gray-400 text-sm">Sign in to manage the store</p>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Staff Email</label>
                        <input
                            type="email"
                            className="w-full border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:border-[#1a1a4e] focus:ring-1 focus:ring-[#1a1a4e]"
                            placeholder="admin@blueeagle.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:border-[#1a1a4e] focus:ring-1 focus:ring-[#1a1a4e]"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#1a1a4e] text-white py-4 rounded-xl hover:bg-[#111133] font-black shadow-lg shadow-blue-100 mt-4">
                        Secure Login
                    </button>
                    <button type="button" onClick={() => navigate('/login')} className="w-full text-center text-sm font-bold text-gray-400 hover:text-gray-600 mt-4">
                        ← Back to Customer Store
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
