import React from 'react';

/**
 * InvoiceDocumentRenderer Component
 *
 * Renders a visual canvasJson tree with live {{variable}} replacements.
 * Supports printable CSS layout with paper size & margin dimensions.
 */
const InvoiceDocumentRenderer = ({ canvasJson, variables = {}, settings = {} }) => {
    if (!canvasJson || !Array.isArray(canvasJson.elements)) {
        return (
            <div className="p-8 text-center text-gray-400 font-mono text-xs">
                No canvas elements defined for this template.
            </div>
        );
    }

    const replaceVars = (text) => {
        if (!text || typeof text !== 'string') return text || '';
        return text.replace(/\{\{\s*([\w\.]+)\s*\}\}/g, (_, key) => {
            return variables[key] !== undefined ? variables[key] : `{{${key}}}`;
        });
    };

    const paperSize = canvasJson.paperSize || 'A4';
    const orientation = canvasJson.orientation || 'Portrait';

    // Width and height in px for A4 (794 x 1123 px at 96 DPI)
    const isLandscape = orientation === 'Landscape';
    const canvasWidth = isLandscape ? 1123 : 794;
    const canvasHeight = isLandscape ? 794 : 1123;

    return (
        <div
            className="bg-white relative shadow-xl mx-auto border border-gray-200 print:shadow-none print:border-none overflow-hidden"
            style={{
                width: `${canvasWidth}px`,
                minHeight: `${canvasHeight}px`,
                padding: '20px',
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#1e293b',
            }}
        >
            {canvasJson.elements.map((el) => {
                const textVal = replaceVars(el.text);
                const elStyle = {
                    position: 'absolute',
                    left: `${el.x || 0}px`,
                    top: `${el.y || 0}px`,
                    width: `${el.w || 200}px`,
                    height: `${el.h || 40}px`,
                    fontSize: `${el.fontSize || 12}px`,
                    fontWeight: el.fontWeight || 'normal',
                    color: el.color || '#1e293b',
                    backgroundColor: el.backgroundColor || 'transparent',
                    borderColor: el.borderColor || 'transparent',
                    borderWidth: el.borderWidth ? `${el.borderWidth}px` : 0,
                    borderStyle: el.borderWidth ? 'solid' : 'none',
                    borderRadius: el.borderRadius ? `${el.borderRadius}px` : 0,
                    textAlign: el.textAlign || 'left',
                    opacity: el.opacity !== undefined ? el.opacity : 1,
                    display: el.hidden ? 'none' : 'block',
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    lineHeight: '1.4',
                };

                switch (el.type) {
                    case 'header':
                        return (
                            <div key={el.id} style={elStyle} className="font-bold tracking-tight">
                                {textVal}
                            </div>
                        );

                    case 'text':
                    case 'paragraph':
                    case 'heading':
                        return (
                            <div key={el.id} style={elStyle}>
                                {textVal}
                            </div>
                        );

                    case 'box':
                    case 'rectangle':
                        return <div key={el.id} style={elStyle} />;

                    case 'divider':
                    case 'line':
                        return (
                            <div
                                key={el.id}
                                style={{
                                    ...elStyle,
                                    height: '0px',
                                    borderTopWidth: `${el.borderWidth || 1}px`,
                                    borderTopColor: el.color || '#e2e8f0',
                                    borderTopStyle: 'solid',
                                }}
                            />
                        );

                    case 'image':
                    case 'logo':
                        return (
                            <img
                                key={el.id}
                                src={replaceVars(el.url) || settings.companyLogo || 'https://via.placeholder.com/150x50?text=Logo'}
                                alt="Document Graphic"
                                style={{
                                    ...elStyle,
                                    objectFit: 'contain',
                                }}
                            />
                        );

                    case 'dynamic_table':
                    case 'table':
                        const cols = el.columns || ['Product', 'SKU', 'Qty', 'Unit Price', 'Amount'];
                        const orderItems = variables['order.items'] || [
                            { productName: 'Sample Product 1', sku: 'SKU-001', quantity: 2, price: '₹499.00', amount: '₹998.00' },
                            { productName: 'Sample Product 2', sku: 'SKU-002', quantity: 1, price: '₹1,299.00', amount: '₹1,299.00' },
                        ];
                        return (
                            <div key={el.id} style={{ ...elStyle, height: 'auto', overflow: 'visible' }}>
                                <table className="w-full text-left text-xs border-collapse border border-gray-200">
                                    <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                                        <tr>
                                            {cols.map((c, i) => (
                                                <th key={i} className="p-2 border border-gray-200">{c}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item, rIdx) => (
                                            <tr key={rIdx} className="border-b border-gray-200 text-[11px]">
                                                {cols.map((c, cIdx) => {
                                                    const key = c.toLowerCase();
                                                    let val = '';
                                                    if (key.includes('product')) val = item.productName || item.name;
                                                    else if (key.includes('sku')) val = item.sku;
                                                    else if (key.includes('qty') || key.includes('quantity')) val = item.quantity;
                                                    else if (key.includes('price')) val = item.price;
                                                    else if (key.includes('amount') || key.includes('total')) val = item.amount;
                                                    else val = item[key] || '-';
                                                    return <td key={cIdx} className="p-2 border border-gray-200">{val}</td>;
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );

                    case 'signature':
                        return (
                            <div key={el.id} style={elStyle} className="text-center flex flex-col items-center justify-end">
                                {settings.digitalSignature ? (
                                    <img src={settings.digitalSignature} alt="Signature" className="h-10 object-contain mb-1" />
                                ) : (
                                    <div className="w-full border-b border-gray-400 mb-1" />
                                )}
                                <span className="text-[10px] font-bold text-gray-500 uppercase">{el.label || 'Authorized Signatory'}</span>
                            </div>
                        );

                    case 'footer':
                        return (
                            <div key={el.id} style={elStyle} className="text-center italic border-t border-gray-100 pt-2">
                                {textVal}
                            </div>
                        );

                    default:
                        return (
                            <div key={el.id} style={elStyle}>
                                {textVal}
                            </div>
                        );
                }
            })}
        </div>
    );
};

export default InvoiceDocumentRenderer;
