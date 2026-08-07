import React from 'react';
import { FaCertificate, FaCheckCircle, FaAward } from 'react-icons/fa';

const ProductCertifications = ({ certifications = [] }) => {
    if (!certifications || certifications.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs mb-6">
            <h3 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center gap-2">
                Quality &amp; Certifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {certifications.map((cert, idx) => (
                    <div key={cert.id || idx} className="flex items-center gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {cert.iconUrl ? (
                                <img src={cert.iconUrl} alt={cert.title} className="w-6 h-6 object-contain" />
                            ) : (
                                <FaAward />
                            )}
                        </div>
                        <div>
                            <div className="text-xs font-extrabold text-slate-800">{cert.title}</div>
                            {cert.certificateNumber && (
                                <div className="text-[11px] font-mono text-purple-700 font-bold mt-0.5">Lic. #{cert.certificateNumber}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductCertifications;
