import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminApi from '../../../services/adminApi';
import { toast } from 'react-toastify';
import InvoiceDocumentRenderer from '../../../components/invoice/InvoiceDocumentRenderer';
import {
    FaSave, FaArrowLeft, FaEye, FaUndo, FaRedo, FaCopy, FaTrash,
    FaPlus, FaLayerGroup, FaFont, FaHeading, FaParagraph, FaTable,
    FaImage, FaSquare, FaGripLines, FaQrcode, FaBarcode, FaPenFancy,
    FaStamp, FaLock, FaLockOpen, FaEyeSlash, FaArrowUp, FaArrowDown,
    FaDesktop, FaPrint, FaSearchPlus, FaSearchMinus, FaExpand, FaCompress,
} from 'react-icons/fa';

const ELEMENT_TYPES = [
    { type: 'text', name: 'Text Block', icon: FaFont, defaultW: 200, defaultH: 30, text: 'Sample Text' },
    { type: 'heading', name: 'Heading', icon: FaHeading, defaultW: 300, defaultH: 40, text: 'Section Heading', fontSize: 20, fontWeight: 'bold' },
    { type: 'paragraph', name: 'Paragraph', icon: FaParagraph, defaultW: 400, defaultH: 60, text: 'Enter detailed clause description...' },
    { type: 'image', name: 'Logo / Image', icon: FaImage, defaultW: 150, defaultH: 60, url: '' },
    { type: 'box', name: 'Box / Container', icon: FaSquare, defaultW: 200, defaultH: 100, backgroundColor: '#f8fafc', borderColor: '#cbd5e1', borderWidth: 1 },
    { type: 'divider', name: 'Divider Line', icon: FaGripLines, defaultW: 500, defaultH: 2, color: '#e2e8f0' },
    { type: 'dynamic_table', name: 'Dynamic Table', icon: FaTable, defaultW: 550, defaultH: 200, columns: ['Product', 'SKU', 'Qty', 'Unit Price', 'Amount'] },
    { type: 'signature', name: 'Digital Signature', icon: FaPenFancy, defaultW: 150, defaultH: 50, label: 'Authorized Signatory' },
    { type: 'footer', name: 'Footer Notice', icon: FaFont, defaultW: 550, defaultH: 30, text: '{{invoice.footerNotes}}', fontSize: 9, textAlign: 'center' },
];

const InvoiceVisualEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [template, setTemplate] = useState(null);
    const [name, setName] = useState('');
    const [documentType, setDocumentType] = useState('Invoice');
    const [paperSize, setPaperSize] = useState('A4');
    const [orientation, setOrientation] = useState('Portrait');
    const [elements, setElements] = useState([]);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [variables, setVariables] = useState([]);

    const [leftPanelTab, setLeftPanelTab] = useState('elements'); // 'elements' or 'layers'
    const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' or 'preview'
    const [zoom, setZoom] = useState(85); // % scale
    const [isSaving, setIsSaving] = useState(false);

    // Interactive Dragting state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [elementInitialPos, setElementInitialPos] = useState({ x: 0, y: 0 });
    const canvasRef = useRef(null);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const [tplRes, varRes] = await Promise.all([
                    adminApi.get(`/invoice-builder/templates/${id}`),
                    adminApi.get('/invoice-builder/variables'),
                ]);
                const t = tplRes.data;
                setTemplate(t);
                setName(t.name);
                setDocumentType(t.documentType);
                setPaperSize(t.paperSize || 'A4');
                setOrientation(t.orientation || 'Portrait');
                setVariables(varRes.data || []);
                setElements(t.canvasJson?.elements || []);
            } catch (err) {
                toast.error('Failed to load template');
                navigate('/admin/rbac/invoice-builder/templates');
            }
        };
        fetchTemplate();
    }, [id, navigate]);

    const selectedElement = elements.find((el) => el.id === selectedElementId);

    // Add Element
    const addElement = (elType) => {
        const spec = ELEMENT_TYPES.find((t) => t.type === elType) || ELEMENT_TYPES[0];
        const newEl = {
            id: `el-${Date.now()}`,
            type: spec.type,
            x: 40,
            y: 40 + (elements.length % 10) * 30,
            w: spec.defaultW,
            h: spec.defaultH,
            text: spec.text || '',
            url: spec.url || '',
            columns: spec.columns || undefined,
            fontSize: spec.fontSize || 12,
            fontWeight: spec.fontWeight || 'normal',
            color: '#1e293b',
            backgroundColor: spec.backgroundColor || 'transparent',
            borderColor: spec.borderColor || 'transparent',
            borderWidth: spec.borderWidth || 0,
            borderRadius: 0,
            textAlign: 'left',
            hidden: false,
            locked: false,
        };
        setElements((prev) => [...prev, newEl]);
        setSelectedElementId(newEl.id);
    };

    const updateSelectedElement = (fields) => {
        if (!selectedElementId) return;
        setElements((prev) =>
            prev.map((el) => (el.id === selectedElementId ? { ...el, ...fields } : el))
        );
    };

    const deleteSelectedElement = () => {
        if (!selectedElementId) return;
        setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
        setSelectedElementId(null);
    };

    const duplicateSelectedElement = () => {
        if (!selectedElement) return;
        const dup = {
            ...JSON.parse(JSON.stringify(selectedElement)),
            id: `el-${Date.now()}`,
            x: selectedElement.x + 20,
            y: selectedElement.y + 20,
        };
        setElements((prev) => [...prev, dup]);
        setSelectedElementId(dup.id);
    };

    const moveLayer = (direction) => {
        if (!selectedElementId) return;
        const idx = elements.findIndex((e) => e.id === selectedElementId);
        if (idx < 0) return;
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= elements.length) return;
        const next = [...elements];
        const [moved] = next.splice(idx, 1);
        next.splice(targetIdx, 0, moved);
        setElements(next);
    };

    // Mouse Click & Drag to Move Elements
    const handleElementClick = (e, el) => {
        e.stopPropagation();
        setSelectedElementId(el.id);
    };

    const handleElementMouseDown = (e, el) => {
        e.stopPropagation();
        setSelectedElementId(el.id);

        if (el.locked) return;

        setIsDragging(true);
        setDragStartPos({ x: e.clientX, y: e.clientY });
        setElementInitialPos({ x: el.x, y: el.y });
    };

    const handleCanvasMouseMove = (e) => {
        if (!isDragging || !selectedElement || selectedElement.locked) return;

        const deltaX = Math.round((e.clientX - dragStartPos.x) / (zoom / 100));
        const deltaY = Math.round((e.clientY - dragStartPos.y) / (zoom / 100));

        const newX = Math.max(0, elementInitialPos.x + deltaX);
        const newY = Math.max(0, elementInitialPos.y + deltaY);

        setElements((prev) =>
            prev.map((el) => (el.id === selectedElementId ? { ...el, x: newX, y: newY } : el))
        );
    };

    const handleCanvasMouseUp = () => {
        setIsDragging(false);
    };

    // Save Template
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const canvasJson = {
                paperSize,
                orientation,
                margins: { top: 15, right: 15, bottom: 15, left: 15 },
                elements,
            };

            await adminApi.put(`/invoice-builder/templates/${id}`, {
                name,
                documentType,
                paperSize,
                orientation,
                canvasJson,
            });

            toast.success('Invoice template saved successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save template');
        } finally {
            setIsSaving(false);
        }
    };

    if (!template) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-400">Loading Canvas Studio...</p>
                </div>
            </div>
        );
    }

    const canvasWidth = orientation === 'Landscape' ? 1123 : 794;
    const canvasHeight = orientation === 'Landscape' ? 794 : 1123;

    return (
        <div className="-m-8 -mt-8 h-[calc(100vh)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative z-20">
            {/* Top Toolbar Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-md">
                {/* Left: Back & Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/rbac/invoice-builder/templates')}
                        className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                        title="Back to Templates"
                    >
                        <FaArrowLeft />
                    </button>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="font-black text-sm md:text-base text-white bg-transparent border-b border-dashed border-slate-700 focus:border-indigo-500 focus:outline-none px-1 py-0.5 max-w-xs"
                        />
                        <span className="bg-indigo-500/20 text-indigo-400 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                            v{template.version}.0
                        </span>
                    </div>
                </div>

                {/* Center: Paper Controls & Zoom */}
                <div className="hidden md:flex items-center gap-3 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60 text-xs">
                    <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
                        <span className="text-slate-400 font-bold">Paper:</span>
                        <select
                            value={paperSize}
                            onChange={(e) => setPaperSize(e.target.value)}
                            className="bg-slate-900 text-white rounded px-2 py-1 focus:outline-none"
                        >
                            <option value="A4">A4 (210×297mm)</option>
                            <option value="Letter">Letter (8.5×11")</option>
                            <option value="Legal">Legal (8.5×14")</option>
                        </select>
                        <select
                            value={orientation}
                            onChange={(e) => setOrientation(e.target.value)}
                            className="bg-slate-900 text-white rounded px-2 py-1 focus:outline-none"
                        >
                            <option value="Portrait">Portrait</option>
                            <option value="Landscape">Landscape</option>
                        </select>
                    </div>
                </div>

                {/* Mobile View Disclaimer */}
                <div className="lg:hidden bg-indigo-950/60 text-indigo-300 text-[10px] px-2.5 py-1 rounded-lg border border-indigo-800/50 font-medium text-center">
                    💡 Tip: Switch to landscape or tablet/desktop for optimal canvas editing
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                    {/* View Tabs */}
                    <div className="flex bg-slate-800 p-1 rounded-xl font-semibold text-[11px]">
                        <button
                            onClick={() => setActiveTab('canvas')}
                            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                                activeTab === 'canvas' ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <FaDesktop /> Canvas
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                                activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <FaEye /> Preview
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                    >
                        <FaSave /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Main Studio Body */}
            {activeTab === 'canvas' ? (
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                    {/* Left Sidebar: Element Library & Layers */}
                    <div className="w-full lg:w-72 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col overflow-hidden shrink-0 z-10 max-h-[35vh] lg:max-h-none">
                        {/* Tab Headers */}
                        <div className="flex border-b border-slate-800 bg-slate-900/50 p-1">
                            <button
                                onClick={() => setLeftPanelTab('elements')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                    leftPanelTab === 'elements' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Elements Library
                            </button>
                            <button
                                onClick={() => setLeftPanelTab('layers')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                    leftPanelTab === 'layers' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Layers ({elements.length})
                            </button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 p-4 overflow-y-auto">
                            {leftPanelTab === 'elements' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {ELEMENT_TYPES.map((el) => {
                                        const Icon = el.icon;
                                        return (
                                            <button
                                                key={el.type}
                                                onClick={() => addElement(el.type)}
                                                className="flex flex-col items-center justify-center p-3 bg-slate-800/80 hover:bg-indigo-600 hover:text-white rounded-2xl border border-slate-700/60 text-slate-300 transition-all text-xs gap-1.5 group shadow-2xs"
                                            >
                                                <Icon className="text-base group-hover:scale-110 transition-transform text-indigo-400 group-hover:text-white" />
                                                <span className="text-[11px] font-semibold text-center leading-tight">{el.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-1.5 text-xs">
                                    {elements.length === 0 ? (
                                        <p className="text-slate-500 text-center py-6">No elements on canvas.</p>
                                    ) : (
                                        elements.map((el) => (
                                            <div
                                                key={el.id}
                                                onClick={() => setSelectedElementId(el.id)}
                                                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                                                    selectedElementId === el.id
                                                        ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-md'
                                                        : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
                                                }`}
                                            >
                                                <span className="truncate pr-2 font-mono text-[11px]">
                                                    {el.type.toUpperCase()}: {el.text?.substring(0, 14) || el.id}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateSelectedElement({ hidden: !el.hidden });
                                                        }}
                                                        title="Toggle Hide"
                                                    >
                                                        {el.hidden ? <FaEyeSlash className="text-red-400" /> : <FaEye />}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateSelectedElement({ locked: !el.locked });
                                                        }}
                                                        title="Toggle Lock"
                                                    >
                                                        {el.locked ? <FaLock className="text-amber-400" /> : <FaLockOpen />}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center Work Canvas Studio */}
                    <div
                        ref={canvasRef}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onClick={() => setSelectedElementId(null)}
                        className="flex-1 bg-slate-950 p-8 overflow-auto flex justify-center items-start relative select-none"
                    >
                        <div
                            style={{
                                width: `${canvasWidth * (zoom / 100)}px`,
                                height: `${canvasHeight * (zoom / 100)}px`,
                                position: 'relative',
                                shrink: 0,
                            }}
                        >
                            <div
                                className="bg-white relative shadow-2xl border border-slate-800"
                                style={{
                                    width: `${canvasWidth}px`,
                                    height: `${canvasHeight}px`,
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: 'top left',
                                }}
                            >
                            {elements.map((el) => {
                                const isSelected = el.id === selectedElementId;
                                return (
                                    <div
                                        key={el.id}
                                        onMouseDown={(e) => handleElementMouseDown(e, el)}
                                        onClick={(e) => handleElementClick(e, el)}
                                        style={{
                                            position: 'absolute',
                                            left: `${el.x}px`,
                                            top: `${el.y}px`,
                                            width: `${el.w}px`,
                                            height: `${el.h}px`,
                                            fontSize: `${el.fontSize || 12}px`,
                                            fontWeight: el.fontWeight || 'normal',
                                            color: el.color || '#1e293b',
                                            backgroundColor: el.backgroundColor || 'transparent',
                                            borderColor: el.borderColor || 'transparent',
                                            borderWidth: el.borderWidth ? `${el.borderWidth}px` : 0,
                                            borderStyle: el.borderWidth ? 'solid' : 'none',
                                            textAlign: el.textAlign || 'left',
                                            outline: isSelected ? '2px solid #6366f1' : 'none',
                                            cursor: el.locked ? 'not-allowed' : 'move',
                                            whiteSpace: 'pre-wrap',
                                            overflow: 'hidden',
                                            opacity: el.hidden ? 0.2 : 1,
                                            userSelect: 'none',
                                        }}
                                        className={`group transition-shadow ${isSelected ? 'z-30 shadow-lg' : 'z-10'}`}
                                    >
                                        {/* Selection Helper Position Tooltip */}
                                        {isSelected && (
                                            <div className="absolute -top-6 left-0 bg-indigo-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                                X: {el.x}px | Y: {el.y}px
                                            </div>
                                        )}

                                        {el.type === 'image' || el.type === 'logo' ? (
                                            <img
                                                src={el.url || 'https://via.placeholder.com/150x50?text=Company+Logo'}
                                                alt="Logo"
                                                className="w-full h-full object-contain pointer-events-none"
                                            />
                                        ) : el.type === 'dynamic_table' ? (
                                            <table className="w-full text-left text-xs border-collapse border border-gray-300 pointer-events-none">
                                                <thead className="bg-slate-100 font-bold uppercase text-[10px]">
                                                    <tr>
                                                        {(el.columns || ['Product', 'Qty', 'Price', 'Amount']).map((c, i) => (
                                                            <th key={i} className="p-1 border border-gray-300">{c}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b border-gray-200 text-[10px]">
                                                        <td className="p-1 border">Sample Item 1</td>
                                                        <td className="p-1 border">2</td>
                                                        <td className="p-1 border">₹499</td>
                                                        <td className="p-1 border">₹998</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        ) : (
                                            el.text || `[${el.type}]`
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                    {/* Right Sidebar: Element Properties Inspector */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-80 bg-slate-900 border-l border-slate-800 p-4 flex flex-col gap-6 overflow-y-auto shrink-0 z-10"
                    >
                        {selectedElement ? (
                            <div className="space-y-5 text-xs">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                                        Inspector ({selectedElement.type})
                                    </h4>
                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => moveLayer(-1)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded" title="Send Backward"><FaArrowDown size={10} /></button>
                                        <button onClick={() => moveLayer(1)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded" title="Bring Forward"><FaArrowUp size={10} /></button>
                                        <button onClick={duplicateSelectedElement} className="p-1.5 text-slate-400 hover:text-indigo-400 bg-slate-800 rounded" title="Duplicate"><FaCopy size={10} /></button>
                                        <button onClick={deleteSelectedElement} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded" title="Delete"><FaTrash size={10} /></button>
                                    </div>
                                </div>

                                {/* Dynamic Variable Binder */}
                                <div className="space-y-1">
                                    <label className="block text-slate-400 font-bold text-[11px]">Bind Variable Placeholder</label>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                updateSelectedElement({ text: `${selectedElement.text || ''} {{${e.target.value}}}` });
                                            }
                                        }}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200 text-xs focus:outline-none"
                                    >
                                        <option value="">Insert Dynamic Placeholder...</option>
                                        {variables.map((v) => (
                                            <option key={v.id} value={v.variableName}>{v.placeholder} ({v.category})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Text Content Input */}
                                <div className="space-y-1">
                                    <label className="block text-slate-400 font-bold text-[11px]">Text Content</label>
                                    <textarea
                                        value={selectedElement.text || ''}
                                        onChange={(e) => updateSelectedElement({ text: e.target.value })}
                                        rows={3}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none font-mono"
                                    />
                                </div>

                                {/* Position Controls (X, Y, W, H) */}
                                <div className="space-y-2 border-t border-slate-800 pt-3">
                                    <h5 className="font-bold text-slate-400 uppercase text-[10px]">Position &amp; Dimensions</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-slate-500 text-[10px]">X Position (px)</label>
                                            <input
                                                type="number"
                                                value={selectedElement.x}
                                                onChange={(e) => updateSelectedElement({ x: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-500 text-[10px]">Y Position (px)</label>
                                            <input
                                                type="number"
                                                value={selectedElement.y}
                                                onChange={(e) => updateSelectedElement({ y: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-500 text-[10px]">Width (px)</label>
                                            <input
                                                type="number"
                                                value={selectedElement.w}
                                                onChange={(e) => updateSelectedElement({ w: parseInt(e.target.value) || 10 })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-500 text-[10px]">Height (px)</label>
                                            <input
                                                type="number"
                                                value={selectedElement.h}
                                                onChange={(e) => updateSelectedElement({ h: parseInt(e.target.value) || 10 })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Image URL if image type */}
                                {(selectedElement.type === 'image' || selectedElement.type === 'logo') && (
                                    <div className="space-y-1 border-t border-slate-800 pt-3">
                                        <label className="block text-slate-400 font-bold text-[11px]">Image / Logo Source URL</label>
                                        <input
                                            type="text"
                                            value={selectedElement.url || ''}
                                            onChange={(e) => updateSelectedElement({ url: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-xs font-mono"
                                        />
                                    </div>
                                )}

                                {/* Typography & Color */}
                                <div className="space-y-2 border-t border-slate-800 pt-3">
                                    <h5 className="font-bold text-slate-400 uppercase text-[10px]">Typography &amp; Colors</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-slate-500 text-[10px]">Font Size (px)</label>
                                            <input
                                                type="number"
                                                value={selectedElement.fontSize || 12}
                                                onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) || 12 })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-500 text-[10px]">Text Color</label>
                                            <input
                                                type="color"
                                                value={selectedElement.color || '#1e293b'}
                                                onChange={(e) => updateSelectedElement({ color: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg h-9 cursor-pointer"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-slate-500 text-[10px]">Background Color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={selectedElement.backgroundColor && selectedElement.backgroundColor !== 'transparent' ? selectedElement.backgroundColor : '#ffffff'}
                                                    onChange={(e) => updateSelectedElement({ backgroundColor: e.target.value })}
                                                    className="bg-slate-800 border border-slate-700 rounded-lg h-9 w-12 cursor-pointer"
                                                />
                                                <button
                                                    onClick={() => updateSelectedElement({ backgroundColor: 'transparent' })}
                                                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
                                                >
                                                    Clear (Transparent)
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Borders & Styling */}
                                <div className="space-y-2 border-t border-slate-800 pt-3">
                                    <h5 className="font-bold text-slate-400 uppercase text-[10px]">Border &amp; Appearance</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-slate-500 text-[10px]">Border Width (px)</label>
                                            <input
                                                type="number"
                                                value={selectedElement.borderWidth || 0}
                                                onChange={(e) => updateSelectedElement({ borderWidth: parseInt(e.target.value) || 0 })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-500 text-[10px]">Border Color</label>
                                            <input
                                                type="color"
                                                value={selectedElement.borderColor || '#e2e8f0'}
                                                onChange={(e) => updateSelectedElement({ borderColor: e.target.value })}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg h-9 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500 text-xs my-auto">
                                Click or drag any element on the paper canvas to inspect properties.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex justify-center">
                    <InvoiceDocumentRenderer canvasJson={{ paperSize, orientation, elements }} />
                </div>
            )}
        </div>
    );
};

export default InvoiceVisualEditor;
