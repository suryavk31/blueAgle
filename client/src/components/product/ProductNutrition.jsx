import React from 'react';

const ProductNutrition = ({ nutrition = [] }) => {
    if (!nutrition || nutrition.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs mb-6">
            <h3 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center gap-2">
                Nutrition Facts
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-slate-900 text-white font-bold p-3 uppercase tracking-wider text-[10px]">
                    <div>Nutrient</div>
                    <div className="text-center">Amount per Serving</div>
                    <div className="text-right">% Daily Value</div>
                </div>
                <div className="divide-y divide-slate-100">
                    {nutrition.map((item, idx) => (
                        <div key={item.id || idx} className={`grid grid-cols-3 p-3 font-medium text-slate-700 ${idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
                            <div className="font-bold text-slate-900">{item.nutrient}</div>
                            <div className="text-center font-semibold">{item.amount}</div>
                            <div className="text-right font-bold text-indigo-600">{item.dailyValue || '—'}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductNutrition;
