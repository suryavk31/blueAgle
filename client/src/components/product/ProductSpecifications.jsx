import React from 'react';

const ProductSpecifications = ({ specifications = [] }) => {
    if (!specifications || specifications.length === 0) return null;

    // Group specs by groupName
    const groups = specifications.reduce((acc, s) => {
        const gName = s.groupName || 'General Specifications';
        if (!acc[gName]) acc[gName] = [];
        acc[gName].push(s);
        return acc;
    }, {});

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs mb-6">
            <h3 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center gap-2">
                Technical Specifications
            </h3>

            <div className="space-y-6">
                {Object.entries(groups).map(([groupTitle, specs]) => (
                    <div key={groupTitle} className="space-y-2">
                        {Object.keys(groups).length > 1 && (
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/60 px-2.5 py-1 rounded-md w-max">
                                {groupTitle}
                            </h4>
                        )}
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                            {specs.map((item, idx) => (
                                <div key={item.id || idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 text-xs ${idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
                                    <span className="font-semibold text-slate-500 sm:w-1/3">{item.specKey || item.key}</span>
                                    <span className="font-bold text-slate-800 sm:w-2/3 sm:text-right mt-1 sm:mt-0">{item.specValue || item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductSpecifications;
