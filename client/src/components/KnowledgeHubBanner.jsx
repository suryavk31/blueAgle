import React from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaChevronRight } from 'react-icons/fa';

const KnowledgeHubBanner = () => {
    return (
        <div className="bg-gradient-to-r from-[#1b1b4b] via-[#2c1b64] to-[#3c006b] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl my-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-2 text-center sm:text-left relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-purple-200 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-white/10">
                    <FaBookOpen /> BlueAgle Knowledge Hub
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Unsure Which Oil Is Best For Your Cooking Needs?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
                    Read our complete guide comparing cold pressed vs refined oils, extraction methods, smoke points, and culinary pairings.
                </p>
            </div>

            <Link
                to="/blog"
                className="px-6 py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all shrink-0 flex items-center gap-2 relative z-10"
            >
                Read Culinary Guides <FaChevronRight className="text-[10px]" />
            </Link>
        </div>
    );
};

export default KnowledgeHubBanner;
