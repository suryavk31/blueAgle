import React, { useState } from 'react';
import PolicyRenderer from './PolicyRenderer';
import { FaDesktop, FaMobileAlt } from 'react-icons/fa';

/**
 * PolicyLivePreview Component
 *
 * Renders a real-time live preview of the structured JSON policy with desktop and mobile device view toggles.
 */
const PolicyLivePreview = ({ policyJson }) => {
    const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'

    return (
        <div className="space-y-4">
            {/* View Mode Toggle Header */}
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-2xl">
                <span className="text-xs font-bold text-gray-500 uppercase px-3">Live Device Preview</span>
                <div className="flex bg-white p-1 rounded-xl shadow-xs gap-1">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'desktop' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <FaDesktop /> Desktop View
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'mobile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <FaMobileAlt /> Mobile View (375px)
                    </button>
                </div>
            </div>

            {/* Preview Frame Wrapper */}
            <div className="flex justify-center bg-gray-200/50 p-6 rounded-3xl min-h-[500px]">
                {viewMode === 'desktop' ? (
                    <div className="w-full bg-slate-50 p-6 rounded-2xl shadow-sm border border-gray-200 max-h-[600px] overflow-y-auto">
                        <PolicyRenderer policyJson={policyJson} />
                    </div>
                ) : (
                    <div className="w-[375px] bg-white rounded-[40px] border-[8px] border-slate-900 shadow-2xl p-4 max-h-[650px] overflow-y-auto relative">
                        {/* Notch */}
                        <div className="w-32 h-4 bg-slate-900 rounded-b-xl mx-auto mb-4 sticky top-0 z-20"></div>
                        <PolicyRenderer policyJson={policyJson} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyLivePreview;
