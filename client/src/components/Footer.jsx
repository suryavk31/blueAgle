import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#0f0f10] text-gray-300 py-12 border-t border-gray-800 font-sans">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="BlueAgle" className="h-10 w-10 rounded-lg object-contain bg-white p-1" />
                            <span className="text-3xl font-extrabold text-white tracking-tight">Blue<span className="text-[#ff3269]">Agle</span></span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Groceries delivered in 10 minutes. <br />
                            Experience the future of shopping.
                        </p>
                        <div className="flex gap-4 pt-2">
                            {/* Social Icons Placeholder */}
                            <div className="w-8 h-8 rounded-full bg-gray-600/30 flex items-center justify-center hover:bg-gray-600 transition">
                                <i className="fab fa-instagram"></i>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-600/30 flex items-center justify-center hover:bg-gray-600 transition">
                                <i className="fab fa-twitter"></i>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-600/30 flex items-center justify-center hover:bg-gray-600 transition">
                                <i className="fab fa-facebook-f"></i>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-[#ff3269] transition">Home</Link></li>
                            <li><Link to="/about" className="hover:text-[#ff3269] transition">About Us</Link></li>
                            <li><Link to="/careers" className="hover:text-[#ff3269] transition">Careers</Link></li>
                            <li><Link to="/blog" className="hover:text-[#ff3269] transition">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Policies */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Policies</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/policy/privacy" className="hover:text-[#ff3269] transition">Privacy Policy</Link></li>
                            <li><Link to="/policy/terms" className="hover:text-[#ff3269] transition">Terms & Conditions</Link></li>
                            <li><Link to="/policy/account-deletion" className="hover:text-[#ff3269] transition">Account Deletion Policy</Link></li>
                            <li><Link to="/policy/return" className="hover:text-[#ff3269] transition">Return Policy</Link></li>
                            <li><Link to="/policy/cancellation" className="hover:text-[#ff3269] transition">Cancellation Policy</Link></li>
                            <li><Link to="/policy/shipping" className="hover:text-[#ff3269] transition">Shipping Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Apps */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Contact</h4>
                        <ul className="space-y-3 text-sm mb-6">
                            <li>support@blueagle.com</li>
                            <li>+91 98765 43210</li>
                        </ul>
                        <h5 className="text-white font-bold text-sm mb-3">Download App</h5>
                        <div className="flex gap-3">
                            <div className="bg-gray-800 px-3 py-2 rounded border border-gray-700 w-32 text-center text-xs">
                                App Store
                            </div>
                            <div className="bg-gray-800 px-3 py-2 rounded border border-gray-700 w-32 text-center text-xs">
                                Play Store
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} BlueAgle. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
