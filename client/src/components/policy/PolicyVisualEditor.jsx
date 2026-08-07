import React, { useState } from 'react';
import {
    FaPlus, FaTrash, FaCopy, FaArrowUp, FaArrowDown, FaChevronDown,
    FaChevronRight, FaExclamationTriangle, FaCheck, FaEdit, FaParagraph,
    FaListUl, FaTable, FaQuestionCircle, FaInfoCircle, FaCode, FaLink,
    FaAddressCard, FaLayerGroup, FaPlusCircle, FaTimes,
} from 'react-icons/fa';

const BLOCK_CATEGORIES = [
    {
        name: 'Text & Headings',
        blocks: [
            { type: 'paragraph', name: 'Paragraph', icon: FaParagraph, desc: 'Standard body text block' },
            { type: 'heading', name: 'Heading (H3)', icon: FaParagraph, desc: 'Section sub-heading' },
            { type: 'subheading', name: 'Sub-Heading (H4)', icon: FaParagraph, desc: 'Minor section sub-heading' },
            { type: 'quote', name: 'Quote / Citation', icon: FaParagraph, desc: 'Blockquote with author citation' },
        ],
    },
    {
        name: 'Lists & Steps',
        blocks: [
            { type: 'unordered_list', name: 'Bulleted List', icon: FaListUl, desc: 'Unordered list items' },
            { type: 'ordered_list', name: 'Numbered List', icon: FaListUl, desc: 'Sequential step list' },
            { type: 'numbered_steps', name: 'Step Process', icon: FaListUl, desc: 'Visual step-by-step process' },
        ],
    },
    {
        name: 'Callouts & Boxes',
        blocks: [
            { type: 'warning_box', name: 'Warning Box', icon: FaExclamationTriangle, desc: 'Red alert warning callout' },
            { type: 'info_box', name: 'Information Box', icon: FaInfoCircle, desc: 'Blue info callout' },
            { type: 'success_box', name: 'Success Box', icon: FaCheck, desc: 'Green success callout' },
        ],
    },
    {
        name: 'Structured Data',
        blocks: [
            { type: 'faq', name: 'FAQ Accordion', icon: FaQuestionCircle, desc: 'Collapsible Q&A list' },
            { type: 'table', name: 'Data Table', icon: FaTable, desc: 'Structured columns and rows' },
            { type: 'contact_block', name: 'Contact Card', icon: FaAddressCard, desc: 'Email, phone, and address block' },
        ],
    },
    {
        name: 'Interactive & Layout',
        blocks: [
            { type: 'link', name: 'Action Button / Link', icon: FaLink, desc: 'Clickable CTA button' },
            { type: 'code_block', name: 'Code Snippet', icon: FaCode, desc: 'Monospace code box' },
            { type: 'divider', name: 'Horizontal Divider', icon: FaLayerGroup, desc: 'Visual separator line' },
        ],
    },
];

const PolicyVisualEditor = ({ policyJson, onChange, validationErrors = [] }) => {
    const [openSections, setOpenSections] = useState({ 0: true });
    const [showAddBlockModal, setShowAddBlockModal] = useState(null); // sectionIndex

    const sections = policyJson?.sections || [];

    const handleUpdateJson = (newSections) => {
        onChange({
            ...policyJson,
            sections: newSections,
        });
    };

    // ─── Section Operations ───────────────────────────────────────────────────

    const addSection = () => {
        const nextOrder = sections.length + 1;
        const newSec = {
            id: `section-${nextOrder}`,
            title: `New Section ${nextOrder}`,
            order: nextOrder,
            content: [
                {
                    id: `blk-${nextOrder}-1`,
                    type: 'paragraph',
                    text: 'Enter clause description here...',
                },
            ],
        };
        const next = [...sections, newSec];
        handleUpdateJson(next);
        setOpenSections((prev) => ({ ...prev, [next.length - 1]: true }));
    };

    const updateSection = (sIdx, fields) => {
        const next = [...sections];
        next[sIdx] = { ...next[sIdx], ...fields };
        handleUpdateJson(next);
    };

    const deleteSection = (sIdx) => {
        if (!window.confirm('Delete this entire section?')) return;
        const next = sections.filter((_, i) => i !== sIdx);
        handleUpdateJson(next);
    };

    const duplicateSection = (sIdx) => {
        const sec = sections[sIdx];
        const nextOrder = sections.length + 1;
        const dup = {
            ...JSON.parse(JSON.stringify(sec)),
            id: `${sec.id}-copy`,
            title: `${sec.title} (Copy)`,
            order: nextOrder,
        };
        const next = [...sections];
        next.splice(sIdx + 1, 0, dup);
        handleUpdateJson(next);
    };

    const moveSection = (sIdx, direction) => {
        const targetIdx = sIdx + direction;
        if (targetIdx < 0 || targetIdx >= sections.length) return;
        const next = [...sections];
        const [temp] = next.splice(sIdx, 1);
        next.splice(targetIdx, 0, temp);
        handleUpdateJson(next);
    };

    const toggleSectionOpen = (sIdx) => {
        setOpenSections((prev) => ({ ...prev, [sIdx]: !prev[sIdx] }));
    };

    // ─── Block Operations ─────────────────────────────────────────────────────

    const addBlock = (sIdx, blockType) => {
        const sec = sections[sIdx];
        const bIdx = (sec.content || []).length + 1;
        let newBlk = {
            id: `blk-${sIdx + 1}-${bIdx}`,
            type: blockType,
            text: '',
        };

        if (blockType === 'unordered_list' || blockType === 'ordered_list') {
            newBlk.items = ['List item 1', 'List item 2'];
        } else if (blockType === 'faq') {
            newBlk.items = [{ question: 'Sample Question?', answer: 'Sample answer response.' }];
        } else if (blockType === 'table') {
            newBlk.headers = ['Header 1', 'Header 2'];
            newBlk.rows = [['Cell 1', 'Cell 2']];
        } else if (blockType === 'warning_box' || blockType === 'info_box' || blockType === 'success_box') {
            newBlk.title = 'Alert Title';
            newBlk.text = 'Alert detail message...';
        } else if (blockType === 'contact_block') {
            newBlk.title = 'Contact Support';
            newBlk.email = 'support@blueeagle.com';
            newBlk.phone = '+91 1800-123-4567';
            newBlk.address = 'Bengaluru, Karnataka, India';
        }

        const nextBlocks = [...(sec.content || []), newBlk];
        updateSection(sIdx, { content: nextBlocks });
        setShowAddBlockModal(null);
    };

    const updateBlock = (sIdx, bIdx, fields) => {
        const sec = sections[sIdx];
        const nextBlocks = [...sec.content];
        nextBlocks[bIdx] = { ...nextBlocks[bIdx], ...fields };
        updateSection(sIdx, { content: nextBlocks });
    };

    const deleteBlock = (sIdx, bIdx) => {
        const sec = sections[sIdx];
        const nextBlocks = sec.content.filter((_, i) => i !== bIdx);
        updateSection(sIdx, { content: nextBlocks });
    };

    const duplicateBlock = (sIdx, bIdx) => {
        const sec = sections[sIdx];
        const blk = sec.content[bIdx];
        const dup = JSON.parse(JSON.stringify(blk));
        dup.id = `${blk.id}-copy`;
        const nextBlocks = [...sec.content];
        nextBlocks.splice(bIdx + 1, 0, dup);
        updateSection(sIdx, { content: nextBlocks });
    };

    const moveBlock = (sIdx, bIdx, direction) => {
        const sec = sections[sIdx];
        const targetIdx = bIdx + direction;
        if (targetIdx < 0 || targetIdx >= sec.content.length) return;
        const nextBlocks = [...sec.content];
        const [temp] = nextBlocks.splice(bIdx, 1);
        nextBlocks.splice(targetIdx, 0, temp);
        updateSection(sIdx, { content: nextBlocks });
    };

    return (
        <div className="space-y-6">
            {/* Real-time Validation Banner */}
            {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-900 text-xs space-y-1">
                    <h5 className="font-bold flex items-center gap-1.5 text-red-700">
                        <FaExclamationTriangle /> Validation Warnings ({validationErrors.length})
                    </h5>
                    <ul className="list-disc list-inside space-y-0.5 pl-1">
                        {validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                    </ul>
                </div>
            )}

            {/* Sections Accordion List */}
            <div className="space-y-4">
                {sections.map((sec, sIdx) => {
                    const isOpen = !!openSections[sIdx];
                    return (
                        <div key={sec.id || sIdx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                            {/* Section Top Header Bar */}
                            <div className="p-4 bg-gray-50 flex items-center justify-between border-b border-gray-200">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <button onClick={() => toggleSectionOpen(sIdx)} className="text-gray-400 hover:text-indigo-600">
                                        {isOpen ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
                                    </button>
                                    <input
                                        type="text"
                                        value={sec.title}
                                        onChange={(e) => updateSection(sIdx, { title: e.target.value })}
                                        placeholder="Section Title"
                                        className="font-bold text-sm text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-indigo-600 focus:outline-none px-1 py-0.5 flex-1 max-w-md"
                                    />
                                    <span className="text-[10px] font-mono text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded">#{sec.id}</span>
                                </div>

                                {/* Section Action Controls */}
                                <div className="flex items-center gap-1">
                                    <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="p-1.5 text-gray-400 hover:text-indigo-600 disabled:opacity-30" title="Move Up"><FaArrowUp className="text-xs" /></button>
                                    <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sections.length - 1} className="p-1.5 text-gray-400 hover:text-indigo-600 disabled:opacity-30" title="Move Down"><FaArrowDown className="text-xs" /></button>
                                    <button onClick={() => duplicateSection(sIdx)} className="p-1.5 text-gray-400 hover:text-indigo-600" title="Duplicate Section"><FaCopy className="text-xs" /></button>
                                    <button onClick={() => deleteSection(sIdx)} className="p-1.5 text-gray-400 hover:text-red-600" title="Delete Section"><FaTrash className="text-xs" /></button>
                                </div>
                            </div>

                            {/* Section Content Blocks Editor */}
                            {isOpen && (
                                <div className="p-6 bg-white space-y-4">
                                    {(sec.content || []).map((blk, bIdx) => (
                                        <div key={blk.id || bIdx} className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 relative group">
                                            {/* Block Header */}
                                            <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 pb-2">
                                                <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                                                    {blk.type}
                                                </span>
                                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => moveBlock(sIdx, bIdx, -1)} disabled={bIdx === 0} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><FaArrowUp className="text-[10px]" /></button>
                                                    <button onClick={() => moveBlock(sIdx, bIdx, 1)} disabled={bIdx === (sec.content || []).length - 1} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><FaArrowDown className="text-[10px]" /></button>
                                                    <button onClick={() => duplicateBlock(sIdx, bIdx)} className="p-1 text-gray-400 hover:text-indigo-600"><FaCopy className="text-[10px]" /></button>
                                                    <button onClick={() => deleteBlock(sIdx, bIdx)} className="p-1 text-gray-400 hover:text-red-600"><FaTrash className="text-[10px]" /></button>
                                                </div>
                                            </div>

                                            {/* Block Specific Form Fields */}
                                            <BlockFieldEditor block={blk} onChange={(fields) => updateBlock(sIdx, bIdx, fields)} />
                                        </div>
                                    ))}

                                    {/* Add Block Trigger Button */}
                                    <button
                                        onClick={() => setShowAddBlockModal(sIdx)}
                                        className="w-full py-3 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50/50 flex items-center justify-center gap-2 transition-all"
                                    >
                                        <FaPlusCircle /> Add Content Block
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Section Button */}
            <button
                onClick={addSection}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all"
            >
                <FaPlus /> Add New Section
            </button>

            {/* Add Block Selection Modal */}
            {showAddBlockModal !== null && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                            <h3 className="font-black text-lg text-gray-900">Choose Content Block Type</h3>
                            <button onClick={() => setShowAddBlockModal(null)} className="p-2 text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>

                        <div className="space-y-6">
                            {BLOCK_CATEGORIES.map((cat) => (
                                <div key={cat.name}>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{cat.name}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {cat.blocks.map((blk) => {
                                            const Icon = blk.icon;
                                            return (
                                                <button
                                                    key={blk.type}
                                                    onClick={() => addBlock(showAddBlockModal, blk.type)}
                                                    className="flex items-start gap-3 p-3.5 border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50/30 rounded-2xl text-left transition-all group"
                                                >
                                                    <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-indigo-600 group-hover:text-white text-gray-600 flex items-center justify-center shrink-0 transition-colors">
                                                        <Icon />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-xs text-gray-900 group-hover:text-indigo-600">{blk.name}</h5>
                                                        <p className="text-[11px] text-gray-400 leading-normal">{blk.desc}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Individual Block Field Inputs Editor
 */
const BlockFieldEditor = ({ block, onChange }) => {
    switch (block.type) {
        case 'paragraph':
        case 'heading':
        case 'subheading':
            return (
                <textarea
                    value={block.text || ''}
                    onChange={(e) => onChange({ text: e.target.value })}
                    placeholder="Enter text..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
            );

        case 'unordered_list':
        case 'ordered_list':
            return (
                <div className="space-y-2">
                    {(block.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}.</span>
                            <input
                                type="text"
                                value={typeof item === 'string' ? item : item.text || ''}
                                onChange={(e) => {
                                    const next = [...(block.items || [])];
                                    next[idx] = e.target.value;
                                    onChange({ items: next });
                                }}
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            />
                            <button
                                onClick={() => {
                                    const next = (block.items || []).filter((_, i) => i !== idx);
                                    onChange({ items: next });
                                }}
                                className="p-1 text-gray-400 hover:text-red-500"
                            >
                                <FaTrash className="text-xs" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => onChange({ items: [...(block.items || []), 'New list item'] })}
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 pt-1"
                    >
                        <FaPlus className="text-[10px]" /> Add List Item
                    </button>
                </div>
            );

        case 'warning_box':
        case 'info_box':
        case 'success_box':
            return (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={block.title || ''}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="Alert Title"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <textarea
                        value={block.text || ''}
                        onChange={(e) => onChange({ text: e.target.value })}
                        placeholder="Alert body text..."
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                </div>
            );

        case 'faq':
            return (
                <div className="space-y-3">
                    {(block.items || []).map((item, idx) => (
                        <div key={idx} className="p-3 border border-gray-200 rounded-xl space-y-2 bg-white">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Q&amp;A #{idx + 1}</span>
                                <button onClick={() => onChange({ items: block.items.filter((_, i) => i !== idx) })} className="text-gray-400 hover:text-red-500"><FaTrash className="text-xs" /></button>
                            </div>
                            <input
                                type="text"
                                value={item.question || ''}
                                onChange={(e) => {
                                    const next = [...block.items];
                                    next[idx] = { ...next[idx], question: e.target.value };
                                    onChange({ items: next });
                                }}
                                placeholder="Question?"
                                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <textarea
                                value={item.answer || ''}
                                onChange={(e) => {
                                    const next = [...block.items];
                                    next[idx] = { ...next[idx], answer: e.target.value };
                                    onChange({ items: next });
                                }}
                                placeholder="Answer response..."
                                rows={2}
                                className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    ))}
                    <button
                        onClick={() => onChange({ items: [...(block.items || []), { question: 'New Question?', answer: 'Answer...' }] })}
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                        <FaPlus className="text-[10px]" /> Add FAQ Pair
                    </button>
                </div>
            );

        case 'contact_block':
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input type="email" value={block.email || ''} onChange={(e) => onChange({ email: e.target.value })} placeholder="Email" className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white" />
                    <input type="text" value={block.phone || ''} onChange={(e) => onChange({ phone: e.target.value })} placeholder="Phone" className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white" />
                    <input type="text" value={block.address || ''} onChange={(e) => onChange({ address: e.target.value })} placeholder="Address" className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white" />
                </div>
            );

        default:
            return (
                <textarea
                    value={block.text || ''}
                    onChange={(e) => onChange({ text: e.target.value })}
                    placeholder="Enter block text..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
            );
    }
};

export default PolicyVisualEditor;
