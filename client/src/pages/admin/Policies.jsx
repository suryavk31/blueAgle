import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaFileAlt, FaShieldAlt, FaSave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const Policies = () => {
    const { currentUser } = useAuth();
    const [type, setType] = useState('return'); // return, terms
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/policies/${type}`);
                setContent(res.data.content || '');
            } catch (error) {
                setContent('');
            }
        };
        fetchPolicy();
    }, [type]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = await currentUser.getIdToken();
            await axios.post(`http://localhost:5000/api/policies/${type}`, { content }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Policy Saved Successfully");
            setLastSaved(new Date());
        } catch (error) {
            toast.error("Error saving policy document");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaShieldAlt className="text-indigo-600" /> Legal Policies
                    </h2>
                    <p className="text-gray-500 font-medium">Manage and update your customer-facing legal agreements and rules.</p>
                </div>
            </div>

            {/* Policy Editor Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Navigation Sidebar */}
                <div className="w-full lg:w-72 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-6 shrink-0 flex flex-col gap-2 relative overflow-hidden">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Document Type</h3>
                    
                    <button 
                        onClick={() => setType('return')} 
                        className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all text-left w-full
                            ${type === 'return' 
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 translate-x-2' 
                                : 'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                            }`}
                    >
                        <FaFileAlt className={type === 'return' ? 'text-white/80' : 'text-gray-400'} size={18} />
                        Return Policy
                    </button>
                    
                    <button 
                        onClick={() => setType('terms')} 
                        className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all text-left w-full
                            ${type === 'terms' 
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 translate-x-2' 
                                : 'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                            }`}
                    >
                        <FaFileAlt className={type === 'terms' ? 'text-white/80' : 'text-gray-400'} size={18} />
                        Terms & Conditions
                    </button>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <h4 className="flex items-center gap-2 text-indigo-800 font-bold text-sm mb-2">
                                <FaExclamationCircle /> Editor Notes
                            </h4>
                            <p className="text-xs text-indigo-600/80 leading-relaxed font-medium">
                                The editor supports standard HTML and Markdown syntax. Any changes you save here will be instantly visible to customers on the frontend application.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Editor */}
                <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col overflow-hidden w-full relative">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {type === 'return' ? 'Return & Refund Policy' : 'Terms & Conditions'} Document
                        </h3>
                        {lastSaved && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                <FaCheckCircle /> 
                                Last saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                        <textarea
                            className="w-full h-[500px] bg-gray-50 border-2 border-gray-100 text-gray-800 text-sm font-mono leading-relaxed rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white block p-6 outline-none transition-all resize-none mb-6 shadow-inner"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder={`Enter ${type === 'return' ? 'Return Policy' : 'Terms & Conditions'} content here...\n\nYou can use Markdown or HTML snippets.`}
                            spellCheck="false"
                        ></textarea>
                        
                        <div className="flex justify-end pt-2">
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving || content.trim() === ''}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <FaSave size={18} />
                                )}
                                {isSaving ? 'Saving Document...' : 'Publish Content'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Policies;
