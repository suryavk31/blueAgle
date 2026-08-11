import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebookF, FaApple, FaGooglePlay } from 'react-icons/fa';

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
                            Organic &amp; Wood-Pressed Essentials.<br />
                            Pure, healthy, and delivered fresh to your doorstep.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 transition-colors">
                                <FaInstagram size={14} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-sky-500 transition-colors">
                                <FaTwitter size={14} />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-colors">
                                <FaFacebookF size={14} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Explore</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-[#ff3269] transition">Home</Link></li>
                            <li><Link to="/products" className="hover:text-[#ff3269] transition">All Products</Link></li>
                            <li><Link to="/blog" className="hover:text-[#ff3269] transition">Blog &amp; Guides</Link></li>
                            <li><Link to="/policy/about" className="hover:text-[#ff3269] transition">About Us</Link></li>
                            <li><Link to="/policy/faq" className="hover:text-[#ff3269] transition">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Policies */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Policies &amp; Trust</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/policy/privacy" className="hover:text-[#ff3269] transition">Privacy Policy</Link></li>
                            <li><Link to="/policy/terms" className="hover:text-[#ff3269] transition">Terms &amp; Conditions</Link></li>
                            <li><Link to="/policy/account-deletion" className="hover:text-[#ff3269] transition">Account Deletion Policy</Link></li>
                            <li><Link to="/policy/return" className="hover:text-[#ff3269] transition">Return Policy</Link></li>
                            <li><Link to="/policy/cancellation" className="hover:text-[#ff3269] transition">Cancellation Policy</Link></li>
                            <li><Link to="/policy/shipping" className="hover:text-[#ff3269] transition">Shipping Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Apps */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
                        <ul className="space-y-3 text-sm mb-6 text-gray-400">
                            <li>Email: support@blueeagle.com</li>
                            <li>Phone: +91 99444 56008</li>
                            <li>Location: Puliampatti-Bhavanisagar-Bannari Rd, Sengundhapuram, Puliampatti, Tamil Nadu 638459</li>
                        </ul>
                        <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Download Mobile App</h5>
                        <div className="flex gap-2.5">
                            <div className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl border border-gray-700/80 flex items-center gap-2 cursor-pointer transition-colors">
                                <FaApple className="text-xl text-white" />
                                <div className="text-left leading-tight">
                                    <div className="text-[9px] text-gray-400">Available on</div>
                                    <div className="text-xs font-bold text-white">App Store</div>
                                </div>
                            </div>
                            <div className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl border border-gray-700/80 flex items-center gap-2 cursor-pointer transition-colors">
                                <FaGooglePlay className="text-lg text-emerald-400" />
                                <div className="text-left leading-tight">
                                    <div className="text-[9px] text-gray-400">Get it on</div>
                                    <div className="text-xs font-bold text-white">Google Play</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} BlueAgle Commerce Pvt Ltd. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
