/**
 * Client Policy Helper Utilities
 */

export function compileJsonToHtml(json) {
    if (!json || !Array.isArray(json.sections)) {
        return '<p>No policy content available.</p>';
    }

    let html = '';

    json.sections.forEach((sec) => {
        html += `<h2>${sec.title || 'Section'}</h2>\n`;
        if (Array.isArray(sec.content)) {
            sec.content.forEach((blk) => {
                switch (blk.type) {
                    case 'paragraph':
                        html += `<p>${blk.text || ''}</p>\n`;
                        break;
                    case 'heading':
                        html += `<h3>${blk.text || ''}</h3>\n`;
                        break;
                    case 'subheading':
                        html += `<h4>${blk.text || ''}</h4>\n`;
                        break;
                    case 'unordered_list':
                        html += `<ul>\n${(blk.items || []).map(i => `  <li>${typeof i === 'string' ? i : i.text || ''}</li>`).join('\n')}\n</ul>\n`;
                        break;
                    case 'ordered_list':
                        html += `<ol>\n${(blk.items || []).map(i => `  <li>${typeof i === 'string' ? i : i.text || ''}</li>`).join('\n')}\n</ol>\n`;
                        break;
                    case 'warning_box':
                    case 'info_box':
                    case 'success_box':
                        html += `<div style="background:#f8fafc; border-left:4px solid #ef4444; padding:16px; margin:16px 0;"><strong>${blk.title || 'Notice'}:</strong> <p>${blk.text || ''}</p></div>\n`;
                        break;
                    case 'faq':
                        if (Array.isArray(blk.items)) {
                            blk.items.forEach(faq => {
                                html += `<h3>${faq.question || ''}</h3>\n<p>${faq.answer || ''}</p>\n`;
                            });
                        }
                        break;
                    case 'contact_block':
                        html += `<p>Email: ${blk.email || ''}<br/>Phone: ${blk.phone || ''}<br/>Address: ${blk.address || ''}</p>\n`;
                        break;
                    default:
                        if (blk.text) html += `<p>${blk.text}</p>\n`;
                        break;
                }
            });
        }
    });

    return html;
}
