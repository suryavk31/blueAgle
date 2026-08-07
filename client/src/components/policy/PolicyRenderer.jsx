import React, { useState, useMemo } from 'react';
import {
    FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaQuoteLeft,
    FaCode, FaExternalLinkAlt, FaCopy, FaCheck, FaSearch, FaListUl,
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaChevronDown, FaChevronUp,
} from 'react-icons/fa';

/**
 * PolicyRenderer Component
 *
 * Dynamically renders a structured JSON policy object into accessible, styled,
 * responsive UI blocks. Features TOC generation, section searching, and deep anchor linking.
 */
const PolicyRenderer = ({ policyJson, searchQuery = '' }) => {
    const [copiedSectionId, setCopiedSectionId] = useState(null);
    const [openAccordions, setOpenAccordions] = useState({});

    // Filter sections and blocks based on searchQuery
    const filteredSections = useMemo(() => {
        if (!policyJson || !Array.isArray(policyJson.sections)) return [];
        if (!searchQuery || !searchQuery.trim()) return policyJson.sections;

        const q = searchQuery.toLowerCase().trim();
        return policyJson.sections.filter((sec) => {
            const titleMatch = sec.title?.toLowerCase().includes(q);
            const contentMatch = (sec.content || []).some((blk) => {
                if (blk.text && blk.text.toLowerCase().includes(q)) return true;
                if (blk.title && blk.title.toLowerCase().includes(q)) return true;
                if (Array.isArray(blk.items) && blk.items.some((i) => typeof i === 'string' && i.toLowerCase().includes(q))) return true;
                if (Array.isArray(blk.items) && blk.items.some((i) => i.question?.toLowerCase().includes(q) || i.answer?.toLowerCase().includes(q))) return true;
                return false;
            });
            return titleMatch || contentMatch;
        });
    }, [policyJson, searchQuery]);

    const handleCopyLink = (sectionId) => {
        const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;
        navigator.clipboard.writeText(url);
        setCopiedSectionId(sectionId);
        setTimeout(() => setCopiedSectionId(null), 2500);
    };

    const toggleAccordion = (key) => {
        setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    if (!policyJson || !Array.isArray(policyJson.sections) || policyJson.sections.length === 0) {
        return (
            <div className="p-8 text-center text-gray-400">
                <p>No structured content blocks available for this document.</p>
            </div>
        );
    }

    if (filteredSections.length === 0) {
        return (
            <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-200">
                <FaSearch className="text-3xl text-gray-400 mx-auto mb-3" />
                <h4 className="font-bold text-base text-gray-800 mb-1">No matching results</h4>
                <p className="text-xs text-gray-500">No sections or clauses matched your search query "{searchQuery}".</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {filteredSections.map((section, sIdx) => {
                const sectionId = section.id || `section-${sIdx + 1}`;
                return (
                    <section
                        key={sectionId}
                        id={sectionId}
                        className="scroll-mt-24 bg-white rounded-3xl p-6 md:p-8 border border-gray-100/80 shadow-sm relative group"
                    >
                        {/* Section Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                {section.title}
                            </h2>

                            {/* Copy Anchor Link Button */}
                            <button
                                onClick={() => handleCopyLink(sectionId)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-xl text-xs flex items-center gap-1 font-semibold"
                                title="Copy section link"
                            >
                                {copiedSectionId === sectionId ? (
                                    <>
                                        <FaCheck className="text-green-500" /> Copied!
                                    </>
                                ) : (
                                    <>
                                        <FaCopy /> Link
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Section Content Blocks */}
                        <div className="space-y-5 text-sm md:text-base leading-relaxed text-gray-700">
                            {Array.isArray(section.content) &&
                                section.content.map((blk, bIdx) => (
                                    <RenderBlock
                                        key={blk.id || `blk-${sIdx}-${bIdx}`}
                                        block={blk}
                                        openAccordions={openAccordions}
                                        toggleAccordion={toggleAccordion}
                                    />
                                ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

/**
 * Render single content block based on type
 */
const RenderBlock = ({ block, openAccordions, toggleAccordion }) => {
    switch (block.type) {
        case 'paragraph':
            return <p className="text-gray-700 leading-relaxed">{block.text}</p>;

        case 'heading':
            return <h3 className="text-lg font-bold text-gray-900 mt-6 mb-2">{block.text}</h3>;

        case 'subheading':
            return <h4 className="text-base font-semibold text-gray-800 mt-4 mb-1">{block.text}</h4>;

        case 'unordered_list':
        case 'bullet':
            return (
                <ul className="list-disc list-inside space-y-2 text-gray-700 pl-2">
                    {(block.items || []).map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                            {typeof item === 'string' ? item : item.text}
                        </li>
                    ))}
                </ul>
            );

        case 'ordered_list':
            return (
                <ol className="list-decimal list-inside space-y-2 text-gray-700 pl-2">
                    {(block.items || []).map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                            {typeof item === 'string' ? item : item.text}
                        </li>
                    ))}
                </ol>
            );

        case 'warning_box':
            return (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-r-2xl p-5 my-4 text-red-900">
                    <div className="flex items-start gap-3">
                        <FaExclamationTriangle className="text-red-500 text-lg shrink-0 mt-0.5" />
                        <div>
                            {block.title && <h5 className="font-bold text-sm mb-1">{block.title}</h5>}
                            <p className="text-xs md:text-sm leading-relaxed">{block.text}</p>
                        </div>
                    </div>
                </div>
            );

        case 'info_box':
            return (
                <div className="bg-indigo-50/70 border-l-4 border-indigo-500 rounded-r-2xl p-5 my-4 text-indigo-950">
                    <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-indigo-500 text-lg shrink-0 mt-0.5" />
                        <div>
                            {block.title && <h5 className="font-bold text-sm mb-1">{block.title}</h5>}
                            <p className="text-xs md:text-sm leading-relaxed">{block.text}</p>
                        </div>
                    </div>
                </div>
            );

        case 'success_box':
            return (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-r-2xl p-5 my-4 text-green-950">
                    <div className="flex items-start gap-3">
                        <FaCheckCircle className="text-green-500 text-lg shrink-0 mt-0.5" />
                        <div>
                            {block.title && <h5 className="font-bold text-sm mb-1">{block.title}</h5>}
                            <p className="text-xs md:text-sm leading-relaxed">{block.text}</p>
                        </div>
                    </div>
                </div>
            );

        case 'quote':
            return (
                <blockquote className="bg-gray-50 border-l-4 border-gray-400 p-5 rounded-r-2xl italic text-gray-700 my-4 relative">
                    <FaQuoteLeft className="text-gray-300 text-xl mb-2" />
                    <p className="text-sm">{block.text}</p>
                    {block.author && <span className="block mt-2 text-xs font-bold text-gray-500 not-italic">— {block.author}</span>}
                </blockquote>
            );

        case 'table':
            return (
                <div className="overflow-x-auto my-4 rounded-2xl border border-gray-200">
                    <table className="w-full text-left text-xs md:text-sm border-collapse">
                        {Array.isArray(block.headers) && block.headers.length > 0 && (
                            <thead className="bg-gray-100 text-gray-800 font-bold uppercase tracking-wider text-[11px]">
                                <tr>
                                    {block.headers.map((h, i) => (
                                        <th key={i} className="px-4 py-3 border-b border-gray-200">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                        )}
                        <tbody>
                            {Array.isArray(block.rows) &&
                                block.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-gray-100 hover:bg-gray-50">
                                        {Array.isArray(row)
                                            ? row.map((cell, cIdx) => <td key={cIdx} className="px-4 py-3">{cell}</td>)
                                            : <td className="px-4 py-3">{row}</td>}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            );

        case 'accordion':
        case 'faq':
            return (
                <div className="space-y-3 my-4">
                    {(block.items || []).map((faq, fIdx) => {
                        const accKey = `${block.id || 'faq'}-${fIdx}`;
                        const isOpen = !!openAccordions[accKey];
                        return (
                            <div key={fIdx} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                                <button
                                    onClick={() => toggleAccordion(accKey)}
                                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors"
                                >
                                    <span>{faq.question || faq.title}</span>
                                    {isOpen ? <FaChevronUp className="text-xs text-indigo-600" /> : <FaChevronDown className="text-xs text-gray-400" />}
                                </button>
                                {isOpen && (
                                    <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50/50 text-xs md:text-sm text-gray-600 leading-relaxed">
                                        {faq.answer || faq.content}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );

        case 'contact_block':
            return (
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 my-4 shadow-md">
                    {block.title && <h5 className="font-bold text-base mb-4 text-indigo-300">{block.title}</h5>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                        {block.email && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-400">
                                    <FaEnvelope />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Email</span>
                                    <a href={`mailto:${block.email}`} className="text-indigo-300 hover:underline">{block.email}</a>
                                </div>
                            </div>
                        )}
                        {block.phone && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-400">
                                    <FaPhone />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Phone</span>
                                    <span>{block.phone}</span>
                                </div>
                            </div>
                        )}
                        {block.address && (
                            <div className="flex items-center gap-3 md:col-span-2">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-400">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Address</span>
                                    <span>{block.address}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'numbered_steps':
        case 'timeline':
            return (
                <div className="space-y-4 my-4 pl-4 border-l-2 border-indigo-200">
                    {(block.steps || block.items || []).map((step, sIdx) => (
                        <div key={sIdx} className="relative">
                            <div className="absolute -left-[25px] top-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                                {step.stepNumber || sIdx + 1}
                            </div>
                            <div className="pl-4">
                                <h5 className="font-bold text-sm text-gray-900">{step.title}</h5>
                                <p className="text-xs md:text-sm text-gray-600 leading-relaxed mt-0.5">{step.description || step.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            );

        case 'button':
        case 'link':
            return (
                <div className="my-4">
                    <a
                        href={block.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                    >
                        <span>{block.text || 'Learn More'}</span>
                        <FaExternalLinkAlt className="text-[10px]" />
                    </a>
                </div>
            );

        case 'code_block':
            return (
                <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto my-4 border border-slate-800">
                    <code>{block.code || block.text}</code>
                </div>
            );

        case 'divider':
            return <hr className="my-6 border-gray-200" />;

        default:
            return <p className="text-gray-700">{block.text || ''}</p>;
    }
};

export default PolicyRenderer;
