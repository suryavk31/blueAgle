import React from 'react';
import { FaLeaf, FaShieldAlt, FaCheckCircle, FaTruck, FaAward, FaBox, FaStar, FaHeart, FaCertificate, FaMedal } from 'react-icons/fa';

const ICON_MAP = {
    FaLeaf: { icon: FaLeaf, bg: 'bg-emerald-100', text: 'text-emerald-600' },
    FaShieldAlt: { icon: FaShieldAlt, bg: 'bg-orange-100', text: 'text-orange-600' },
    FaCheckCircle: { icon: FaCheckCircle, bg: 'bg-blue-100', text: 'text-blue-600' },
    FaTruck: { icon: FaTruck, bg: 'bg-purple-100', text: 'text-purple-600' },
    FaAward: { icon: FaAward, bg: 'bg-amber-100', text: 'text-amber-600' },
    FaBox: { icon: FaBox, bg: 'bg-slate-100', text: 'text-slate-600' },
    FaStar: { icon: FaStar, bg: 'bg-yellow-100', text: 'text-yellow-600' },
    FaHeart: { icon: FaHeart, bg: 'bg-rose-100', text: 'text-rose-600' },
    FaCertificate: { icon: FaCertificate, bg: 'bg-indigo-100', text: 'text-indigo-600' },
    FaMedal: { icon: FaMedal, bg: 'bg-cyan-100', text: 'text-cyan-600' },
};

const ProductHighlights = ({ highlights = [] }) => {
    if (!highlights || highlights.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {highlights.map((h, idx) => {
                const conf = ICON_MAP[h.icon] || ICON_MAP.FaLeaf;
                const IconComponent = conf.icon;
                return (
                    <div key={h.id || idx} className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow">
                        <div className={`p-2.5 rounded-xl ${conf.bg} ${conf.text} shrink-0`}>
                            <IconComponent className="text-base" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-800 leading-tight">{h.title}</div>
                            {h.description && (
                                <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">{h.description}</div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProductHighlights;
