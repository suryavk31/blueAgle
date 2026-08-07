import React, { useState } from 'react';
import { FaFileCode, FaDownload, FaUpload, FaTimes, FaCopy, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { compileJsonToHtml } from '../../utils/policyHelper';

/**
 * PolicyImportExportModal Component
 *
 * Allows importing and exporting policy data in JSON, Markdown, or HTML formats.
 */
const PolicyImportExportModal = ({ policyJson, onImport, onClose }) => {
    const [mode, setMode] = useState('export'); // 'export' or 'import'
    const [format, setFormat] = useState('json'); // 'json', 'markdown', 'html'
    const [importText, setImportText] = useState('');
    const [copied, setCopied] = useState(false);

    const getExportText = () => {
        if (!policyJson) return '';
        if (format === 'json') {
            return JSON.stringify(policyJson, null, 2);
        } else if (format === 'html') {
            return compileJsonToHtml(policyJson);
        } else if (format === 'markdown') {
            let md = `# ${policyJson.title || 'Policy'}\n\n`;
            (policyJson.sections || []).forEach((sec) => {
                md += `## ${sec.title}\n\n`;
                (sec.content || []).forEach((blk) => {
                    if (blk.text) md += `${blk.text}\n\n`;
                    if (Array.isArray(blk.items)) {
                        blk.items.forEach((item) => {
                            md += `- ${typeof item === 'string' ? item : item.text || ''}\n`;
                        });
                        md += '\n';
                    }
                });
            });
            return md;
        }
        return '';
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getExportText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const contentStr = getExportText();
        const blob = new Blob([contentStr], { type: format === 'json' ? 'application/json' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `policy-${Date.now()}.${format === 'json' ? 'json' : format === 'html' ? 'html' : 'md'}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExecuteImport = () => {
        if (!importText.trim()) {
            toast.error('Import string cannot be empty');
            return;
        }

        try {
            if (format === 'json') {
                const parsed = JSON.parse(importText);
                if (!Array.isArray(parsed.sections)) {
                    throw new Error('Imported JSON must have a "sections" array');
                }
                onImport(parsed);
                toast.success('Successfully imported structured JSON policy');
                onClose();
            } else {
                toast.error('Direct Markdown/HTML import is experimental. Please use JSON format for full accuracy.');
            }
        } catch (err) {
            toast.error(`Import Failed: ${err.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <FaFileCode />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-gray-900">Import / Export Policy Data</h3>
                            <p className="text-xs text-gray-400">Transfer document schema via JSON, Markdown, or HTML</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><FaTimes /></button>
                </div>

                {/* Mode & Format Selection */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-gray-50 p-2 rounded-2xl">
                    <div className="flex bg-white p-1 rounded-xl shadow-2xs gap-1">
                        <button
                            onClick={() => setMode('export')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                mode === 'export' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600'
                            }`}
                        >
                            Export
                        </button>
                        <button
                            onClick={() => setMode('import')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                mode === 'import' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600'
                            }`}
                        >
                            Import
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-gray-400">Format:</span>
                        {['json', 'markdown', 'html'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFormat(f)}
                                className={`px-3 py-1.5 rounded-lg uppercase transition-colors ${
                                    format === f ? 'bg-indigo-100 text-indigo-700 font-bold border border-indigo-200' : 'text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Box */}
                {mode === 'export' ? (
                    <div className="space-y-4">
                        <textarea
                            readOnly
                            value={getExportText()}
                            rows={12}
                            className="w-full bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs focus:outline-none resize-none"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleCopy}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                                {copied ? 'Copied to Clipboard' : 'Copy Text'}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-500/20"
                            >
                                <FaDownload /> Download .{format === 'json' ? 'json' : format === 'html' ? 'html' : 'md'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <textarea
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="Paste structured JSON payload here..."
                            rows={12}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                        <button
                            onClick={handleExecuteImport}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-500/20"
                        >
                            <FaUpload /> Import &amp; Apply JSON Schema
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyImportExportModal;
