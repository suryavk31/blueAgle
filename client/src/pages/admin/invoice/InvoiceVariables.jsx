import React, { useEffect, useState } from 'react';
import adminApi from '../../../services/adminApi';
import { toast } from 'react-toastify';
import { FaCode, FaCopy, FaCheck } from 'react-icons/fa';

const InvoiceVariables = () => {
    const [variables, setVariables] = useState([]);
    const [copiedName, setCopiedName] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVars = async () => {
            try {
                const res = await adminApi.get('/invoice-builder/variables');
                setVariables(res.data || []);
            } catch {
                toast.error('Failed to load variables');
            } finally {
                setLoading(false);
            }
        };
        fetchVars();
    }, []);

    const handleCopy = (placeholder) => {
        navigator.clipboard.writeText(placeholder);
        setCopiedName(placeholder);
        setTimeout(() => setCopiedName(null), 2000);
    };

    const grouped = variables.reduce((acc, v) => {
        const cat = v.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(v);
        return acc;
    }, {});

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <FaCode className="text-indigo-600" /> Dynamic Variable Registry
                </h2>
                <p className="text-gray-500 font-medium text-sm mt-1">Available placeholders for binding live company, customer, order, and invoice data inside visual canvas layouts.</p>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading variables registry...</div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([cat, list]) => (
                        <div key={cat} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-indigo-600"></span> {cat} Variables ({list.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {list.map((v) => (
                                    <div key={v.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70 flex items-center justify-between group">
                                        <div>
                                            <code className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 font-mono">
                                                {v.placeholder}
                                            </code>
                                            <p className="text-xs text-gray-500 mt-2">{v.description || v.variableName}</p>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(v.placeholder)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 rounded-xl border border-gray-200 text-xs flex items-center gap-1 font-semibold transition-colors"
                                            title="Copy Placeholder"
                                        >
                                            {copiedName === v.placeholder ? <FaCheck className="text-green-600" /> : <FaCopy />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvoiceVariables;
