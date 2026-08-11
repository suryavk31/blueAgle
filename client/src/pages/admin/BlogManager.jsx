import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaBookOpen, FaCheck, FaTimes, FaGlobe, FaTag, FaMagic } from 'react-icons/fa';
import blogService from '../../services/blogService';
import { toast } from 'react-toastify';

const SAMPLE_TEMPLATES = {
    "Cold Pressed vs Refined": {
        title: "Cold Pressed vs Refined Oils: The Complete Culinary Guide",
        slug: "cold-pressed-vs-refined-oils-complete-guide",
        category: "Extraction & Quality",
        author: "BlueAgle Editorial Team",
        readTime: "6 min read",
        excerpt: "Learn how wooden Marachekku cold pressing retains natural aroma and viscosity without chemical bleaching or high-temperature heat.",
        content: `<h3>What is Cold Pressed (Marachekku) Oil?</h3>
<p>Cold pressed oil is extracted by crushing oilseeds at low ambient temperatures using a traditional wooden press (Marachekku). Because no external heat or chemical solvents are applied, the oil preserves its authentic aroma, rich viscosity, and original flavor profile.</p>

<h3>Key Differences Between Cold Pressed &amp; Refined Oils</h3>
<ul>
  <li><strong>Extraction Temperature:</strong> Cold pressed oils remain under 45°C during extraction. Refined oils are heated to over 200°C.</li>
  <li><strong>Chemical Processing:</strong> Cold pressed oil undergoes natural gravity settling and filter cloth straining. Refined oil uses chemical bleaching, hexane solvents, and deodorization.</li>
  <li><strong>Flavor &amp; Viscosity:</strong> Cold pressed oil features rich natural color and deep nuttiness. Refined oil is light, odorless, and pale.</li>
</ul>

<h3>Best Uses in the Kitchen</h3>
<p>Use cold pressed groundnut oil for traditional Indian frying and tempering. Use cold pressed sesame (gingelly) oil for authentic gravies, South Indian curries, and salad dressings.</p>`,
        metaTitle: "Cold Pressed vs Refined Oils: Differences & Cooking Uses | BlueAgle",
        metaDescription: "Discover how traditional Marachekku wood pressed oils differ from chemically refined oils. Learn smoke points, extraction methods, and culinary tips.",
        metaKeywords: "cold pressed vs refined oil, marachekku oil, wood pressed groundnut oil, cooking oil comparison, blueagle"
    },
    "Cooking Oil Smoke Points": {
        title: "Understanding Cooking Oil Smoke Points for Frying & Tempering",
        slug: "understanding-cooking-oil-smoke-points-guide",
        category: "Culinary & Smoke Points",
        author: "BlueAgle Editorial Team",
        readTime: "5 min read",
        excerpt: "Discover which unrefined wood pressed oils are best suited for deep frying, sautéing, and daily Indian tempering.",
        content: `<h3>Why Smoke Points Matter in Cooking</h3>
<p>The smoke point of an oil is the temperature at which it stops simmering and begins to smoke. Cooking below an oil's smoke point maintains culinary flavor and prevents bitter off-tastes.</p>

<h3>Smoke Point Reference Chart</h3>
<ul>
  <li><strong>Wood Pressed Groundnut Oil:</strong> ~225°C (High — Ideal for deep frying &amp; pakoras)</li>
  <li><strong>Cold Pressed Sesame (Gingelly) Oil:</strong> ~177°C (Medium — Perfect for tempering &amp; sambar)</li>
  <li><strong>Cold Pressed Coconut Oil:</strong> ~175°C (Medium — Excellent for sautéing &amp; coastal curries)</li>
</ul>`,
        metaTitle: "Cooking Oil Smoke Points Reference Guide | BlueAgle",
        metaDescription: "Comprehensive smoke point guide for wood pressed groundnut, sesame, and coconut oils. Find the best oil for deep frying and Indian tempering.",
        metaKeywords: "cooking oil smoke points, deep frying oil, cold pressed groundnut oil smoke point, blueagle guide"
    }
};

const BlogManager = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editorTab, setEditorTab] = useState('CONTENT');
    const [contentViewMode, setContentViewMode] = useState('GUIDED'); // 'GUIDED' | 'RAW_HTML' | 'PREVIEW'

    const [guidedBlocks, setGuidedBlocks] = useState({
        intro: '',
        sections: [{ title: 'Overview & Extraction', body: 'Cold pressed oil is extracted at low temperatures without chemical refining.' }],
        bullets: ['Extracted below 45°C', 'No hexane chemical solvents used', 'Preserves natural aroma and nutrients'],
        tip: 'Store in a cool pantry in dark glass or stainless steel bottles.',
        categoryLink: '/products?category=7'
    });

    const updateBlocksAndSyncHtml = (newBlocks) => {
        setGuidedBlocks(newBlocks);
        let html = '';
        if (newBlocks.intro?.trim()) {
            html += `<p>${newBlocks.intro.trim()}</p>\n\n`;
        }
        if (Array.isArray(newBlocks.sections)) {
            newBlocks.sections.forEach(sec => {
                if (sec.title?.trim()) html += `<h3>${sec.title.trim()}</h3>\n`;
                if (sec.body?.trim()) html += `<p>${sec.body.trim()}</p>\n\n`;
            });
        }
        if (Array.isArray(newBlocks.bullets) && newBlocks.bullets.filter(b => b.trim()).length > 0) {
            html += `<ul>\n`;
            newBlocks.bullets.filter(b => b.trim()).forEach(b => {
                html += `  <li>${b.trim()}</li>\n`;
            });
            html += `</ul>\n\n`;
        }
        if (newBlocks.tip?.trim()) {
            html += `<div class="bg-purple-50 p-4 rounded-2xl border border-purple-100 font-bold text-slate-800 my-4">${newBlocks.tip.trim()}</div>\n\n`;
        }
        if (newBlocks.categoryLink) {
            const labelMap = {
                '/products?category=7': 'Explore Cold Pressed Oils Collection',
                '/products?category=8': 'Explore Traditional Oils Collection',
                '/products?category=9': 'Explore Organic Nuts & Seeds',
                '/products?category=10': 'Explore Combos & Gift Packs'
            };
            const label = labelMap[newBlocks.categoryLink] || 'Shop Organic Essentials';
            html += `<p><a href="${newBlocks.categoryLink}" class="text-purple-700 font-bold underline">${label} →</a></p>\n`;
        }
        setFormData(prev => ({ ...prev, content: html }));
    };

    const handleFormat = (type) => {
        const textarea = document.getElementById('blogContentTextarea');
        if (!textarea) return;

        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const currentText = formData.content || '';
        const selectedText = currentText.substring(start, end);

        let prefix = '';
        let suffix = '';
        let placeholder = '';

        switch (type) {
            case 'H3':
                prefix = '<h3>';
                suffix = '</h3>\n';
                placeholder = 'Heading Title';
                break;
            case 'H4':
                prefix = '<h4>';
                suffix = '</h4>\n';
                placeholder = 'Sub-heading Title';
                break;
            case 'P':
                prefix = '<p>';
                suffix = '</p>\n';
                placeholder = 'Write paragraph text here...';
                break;
            case 'BOLD':
                prefix = '<strong>';
                suffix = '</strong>';
                placeholder = 'bold text';
                break;
            case 'LIST':
                prefix = '<ul>\n  <li>';
                suffix = '</li>\n  <li>Second item</li>\n</ul>\n';
                placeholder = 'First list item';
                break;
            case 'CALLOUT':
                prefix = '<div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 font-bold text-slate-800 my-4">\n  ';
                suffix = '\n</div>\n';
                placeholder = 'Pro Tip or Quality Callout Note...';
                break;
            case 'PRODUCT_LINK':
                prefix = '<a href="/products?category=7" className="text-purple-700 font-bold underline">';
                suffix = '</a>';
                placeholder = 'Shop Cold Pressed Oils';
                break;
            default:
                return;
        }

        const insertText = selectedText || placeholder;
        const newContent = currentText.substring(0, start) + prefix + insertText + suffix + currentText.substring(end);
        setFormData({ ...formData, content: newContent });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + insertText.length);
        }, 50);
    };

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'Extraction & Quality',
        author: 'BlueAgle Editorial Team',
        readTime: '5 min read',
        image: '',
        excerpt: '',
        content: '',
        status: 'Published',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        canonicalUrl: '',
        isIndexed: true
    });

    const loadBlogs = async () => {
        setLoading(true);
        try {
            const data = await blogService.getAllBlogsAdmin({ search, status: statusFilter });
            setBlogs(data.blogs || []);
        } catch (err) {
            toast.error('Failed to load articles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBlogs();
    }, [search, statusFilter]);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            title: '',
            slug: '',
            category: 'Extraction & Quality',
            author: 'BlueAgle Editorial Team',
            readTime: '5 min read',
            image: '',
            excerpt: '',
            content: '',
            status: 'Published',
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
            canonicalUrl: '',
            isIndexed: true
        });
        setEditorTab('CONTENT');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (blog) => {
        setEditingId(blog.id);
        setFormData({
            title: blog.title || '',
            slug: blog.slug || '',
            category: blog.category || 'Extraction & Quality',
            author: blog.author || 'BlueAgle Editorial Team',
            readTime: blog.readTime || '5 min read',
            image: blog.image || '',
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            status: blog.status || 'Published',
            metaTitle: blog.metaTitle || '',
            metaDescription: blog.metaDescription || '',
            metaKeywords: blog.metaKeywords || '',
            canonicalUrl: blog.canonicalUrl || '',
            isIndexed: blog.isIndexed !== undefined ? blog.isIndexed : true
        });
        setEditorTab('CONTENT');
        setIsModalOpen(true);
    };

    const handleApplyTemplate = (tplKey) => {
        const tpl = SAMPLE_TEMPLATES[tplKey];
        if (tpl) {
            setFormData(prev => ({
                ...prev,
                ...tpl
            }));
            toast.success(`Applied "${tplKey}" template`);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await blogService.updateBlogAdmin(editingId, formData);
                toast.success('Article updated & SEO synced successfully!');
            } else {
                await blogService.createBlogAdmin(formData);
                toast.success('Article created & SEO synced successfully!');
            }
            setIsModalOpen(false);
            loadBlogs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving article');
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            await blogService.deleteBlogAdmin(id);
            toast.success('Article deleted');
            loadBlogs();
        } catch (err) {
            toast.error('Error deleting article');
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <FaBookOpen className="text-[#3c006b]" /> Blog &amp; Educational Content Manager
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Create, publish, and sync SEO metadata for culinary guides, smoke point charts, and oil extraction pillar articles.
                    </p>
                </div>

                <button
                    onClick={handleOpenCreate}
                    className="px-5 py-3 bg-[#3c006b] hover:bg-[#2e0052] text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-purple-950/20 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                    <FaPlus /> Write New Article
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search articles by title or slug..."
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:ring-4 focus:ring-[#3c006b]/10 focus:border-[#3c006b] focus:outline-none"
                    />
                    <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-48 bg-white border border-slate-200 rounded-2xl p-3 text-xs font-bold focus:outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                </select>
            </div>

            {/* Articles Table */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-xs text-slate-400 font-bold">Loading articles...</div>
                ) : blogs.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <FaBookOpen className="text-4xl text-slate-300 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-800">No blog articles found</h3>
                        <p className="text-xs text-slate-500">Click "Write New Article" to publish your first educational pillar post.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                                <tr>
                                    <th className="p-4">Article Title &amp; Slug</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Views</th>
                                    <th className="p-4">Published At</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {blogs.map((b) => (
                                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4">
                                            <div className="font-extrabold text-slate-900">{b.title}</div>
                                            <div className="text-[11px] font-mono text-slate-400">/blog/{b.slug}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">
                                                {b.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                                b.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono font-bold text-slate-600">{b.views || 0}</td>
                                        <td className="p-4 text-slate-500 font-mono text-[11px]">
                                            {new Date(b.publishedAt || b.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenEdit(b)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Edit Article & SEO"
                                            >
                                                <FaEdit className="text-sm" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(b.id, b.title)}
                                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Delete Article"
                                            >
                                                <FaTrash className="text-sm" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#1b1b4b] via-[#2c1b64] to-[#3c006b] p-6 text-white flex justify-between items-start shrink-0">
                            <div>
                                <h3 className="font-black text-xl text-white flex items-center gap-2">
                                    {editingId ? <FaEdit className="text-pink-400" /> : <FaPlus className="text-pink-400" />}
                                    {editingId ? `Edit Article: ${formData.title}` : 'Write New Educational Pillar Article'}
                                </h3>
                                <p className="text-xs text-slate-300 font-mono mt-0.5">
                                    /blog/{formData.slug || 'your-article-slug'}
                                </p>
                            </div>

                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-white/70 hover:text-white rounded-xl">
                                <FaTimes className="text-lg" />
                            </button>
                        </div>

                        {/* Preset Template Buttons */}
                        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs font-bold shrink-0">
                            <span className="text-slate-500 flex items-center gap-1"><FaMagic className="text-purple-600" /> Templates:</span>
                            {Object.keys(SAMPLE_TEMPLATES).map((tplKey) => (
                                <button
                                    key={tplKey}
                                    type="button"
                                    onClick={() => handleApplyTemplate(tplKey)}
                                    className="px-3 py-1 bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 text-[11px] font-extrabold transition-all"
                                >
                                    + {tplKey}
                                </button>
                            ))}
                        </div>

                        {/* Navigation Tabs */}
                        <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0">
                            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/70 rounded-2xl text-xs font-bold">
                                <button
                                    type="button"
                                    onClick={() => setEditorTab('CONTENT')}
                                    className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        editorTab === 'CONTENT' ? 'bg-[#3c006b] text-white shadow-md font-extrabold' : 'text-slate-600 font-semibold'
                                    }`}
                                >
                                    <FaBookOpen /> Article Body &amp; Details
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEditorTab('SEO')}
                                    className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        editorTab === 'SEO' ? 'bg-[#3c006b] text-white shadow-md font-extrabold' : 'text-slate-600 font-semibold'
                                    }`}
                                >
                                    <FaGlobe /> SEO Metadata Settings
                                </button>
                            </div>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-semibold text-slate-700">
                            {editorTab === 'CONTENT' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1.5 font-extrabold text-slate-900">Article Title <span className="text-rose-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g. Cold Pressed vs Refined Oils: Complete Guide"
                                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-1.5 font-extrabold text-slate-900">URL Slug <span className="text-rose-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                placeholder="e.g. cold-pressed-vs-refined-oils-complete-guide"
                                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-1.5 font-extrabold text-slate-900">Category</label>
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                placeholder="e.g. Extraction & Quality, Culinary & Smoke Points"
                                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-1.5 font-extrabold text-slate-900">Author &amp; Read Time</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={formData.author}
                                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                                    placeholder="BlueAgle Editorial Team"
                                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    value={formData.readTime}
                                                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                                                    placeholder="5 min read"
                                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-1.5 font-extrabold text-slate-900">Featured Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="https://ik.imagekit.io/.../image.jpg"
                                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1.5 font-extrabold text-slate-900">Short Summary Excerpt</label>
                                        <textarea
                                            rows={2}
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            placeholder="Short 2-sentence summary shown on cards and search result snippets."
                                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 bg-slate-100 p-2 rounded-2xl border border-slate-200">
                                            <label className="font-black text-slate-900 text-xs uppercase tracking-wider px-2">
                                                Editor Mode:
                                            </label>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setContentViewMode('GUIDED')}
                                                    className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${
                                                        contentViewMode === 'GUIDED' ? 'bg-white text-[#3c006b] shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    Guided Form Builder (Zero Code)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setContentViewMode('PREVIEW')}
                                                    className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1 ${
                                                        contentViewMode === 'PREVIEW' ? 'bg-[#3c006b] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    <FaEye className="text-[10px]" /> Live Article Preview
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setContentViewMode('RAW_HTML')}
                                                    className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${
                                                        contentViewMode === 'RAW_HTML' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    HTML Code
                                                </button>
                                            </div>
                                        </div>

                                        {/* 1. GUIDED NO-CODE FORM BUILDER */}
                                        {contentViewMode === 'GUIDED' && (
                                            <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                                <div className="flex items-center gap-2 text-xs font-bold text-purple-800 bg-purple-100 p-2.5 rounded-xl border border-purple-200">
                                                    <span>✨ No HTML tags required! Fill out the labeled sections below and your article will be formatted automatically.</span>
                                                </div>

                                                {/* Introduction Paragraph */}
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-800 mb-1">Introduction Paragraph</label>
                                                    <textarea
                                                        rows={3}
                                                        value={guidedBlocks.intro}
                                                        onChange={(e) => {
                                                            const newB = { ...guidedBlocks, intro: e.target.value };
                                                            updateBlocksAndSyncHtml(newB);
                                                        }}
                                                        placeholder="Introduce the topic in 2-3 sentences..."
                                                        className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                                    />
                                                </div>

                                                {/* Dynamic Article Sections */}
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-xs font-extrabold text-slate-800">Article Sections (Headings &amp; Explanations)</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newSecs = [...guidedBlocks.sections, { title: '', body: '' }];
                                                                updateBlocksAndSyncHtml({ ...guidedBlocks, sections: newSecs });
                                                            }}
                                                            className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 font-extrabold text-[11px] rounded-lg transition-all flex items-center gap-1"
                                                        >
                                                            <FaPlus size={10} /> Add Another Section
                                                        </button>
                                                    </div>

                                                    {guidedBlocks.sections.map((sec, idx) => (
                                                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 relative shadow-2xs">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">Section #{idx + 1}</span>
                                                                {guidedBlocks.sections.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newSecs = guidedBlocks.sections.filter((_, i) => i !== idx);
                                                                            updateBlocksAndSyncHtml({ ...guidedBlocks, sections: newSecs });
                                                                        }}
                                                                        className="text-rose-500 hover:text-rose-700 text-xs p-1"
                                                                        title="Remove Section"
                                                                    >
                                                                        <FaTrash size={12} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <input
                                                                type="text"
                                                                value={sec.title}
                                                                onChange={(e) => {
                                                                    const newSecs = [...guidedBlocks.sections];
                                                                    newSecs[idx].title = e.target.value;
                                                                    updateBlocksAndSyncHtml({ ...guidedBlocks, sections: newSecs });
                                                                }}
                                                                placeholder="Section Heading Title (e.g., Why Extraction Temperature Matters)"
                                                                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-bold focus:outline-none"
                                                            />

                                                            <textarea
                                                                rows={3}
                                                                value={sec.body}
                                                                onChange={(e) => {
                                                                    const newSecs = [...guidedBlocks.sections];
                                                                    newSecs[idx].body = e.target.value;
                                                                    updateBlocksAndSyncHtml({ ...guidedBlocks, sections: newSecs });
                                                                }}
                                                                placeholder="Explain this section in detail..."
                                                                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs focus:outline-none"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Bullet Highlights */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-xs font-extrabold text-slate-800">Key Takeaways &amp; Bullet Points</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newBulls = [...guidedBlocks.bullets, ''];
                                                                updateBlocksAndSyncHtml({ ...guidedBlocks, bullets: newBulls });
                                                            }}
                                                            className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 font-extrabold text-[11px] rounded-lg transition-all flex items-center gap-1"
                                                        >
                                                            <FaPlus size={10} /> Add Bullet Point
                                                        </button>
                                                    </div>

                                                    {guidedBlocks.bullets.map((bullet, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <span className="text-purple-600 font-bold text-xs">•</span>
                                                            <input
                                                                type="text"
                                                                value={bullet}
                                                                onChange={(e) => {
                                                                    const newBulls = [...guidedBlocks.bullets];
                                                                    newBulls[idx] = e.target.value;
                                                                    updateBlocksAndSyncHtml({ ...guidedBlocks, bullets: newBulls });
                                                                }}
                                                                placeholder={`Bullet point ${idx + 1}...`}
                                                                className="flex-grow bg-white border border-slate-200 p-2.5 rounded-lg text-xs focus:outline-none"
                                                            />
                                                            {guidedBlocks.bullets.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newBulls = guidedBlocks.bullets.filter((_, i) => i !== idx);
                                                                        updateBlocksAndSyncHtml({ ...guidedBlocks, bullets: newBulls });
                                                                    }}
                                                                    className="text-rose-500 hover:text-rose-700 text-xs p-1"
                                                                >
                                                                    <FaTrash size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Pro Tip Callout */}
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-800 mb-1">Culinary or Storage Tip Box</label>
                                                    <input
                                                        type="text"
                                                        value={guidedBlocks.tip}
                                                        onChange={(e) => {
                                                            const newB = { ...guidedBlocks, tip: e.target.value };
                                                            updateBlocksAndSyncHtml(newB);
                                                        }}
                                                        placeholder="Pro Tip: Store cold pressed oils in dark glass containers away from direct heat..."
                                                        className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-medium focus:outline-none"
                                                    />
                                                </div>

                                                {/* Store Category Recommendation */}
                                                <div>
                                                    <label className="block text-xs font-extrabold text-slate-800 mb-1">Recommended Shop Category CTA Link</label>
                                                    <select
                                                        value={guidedBlocks.categoryLink}
                                                        onChange={(e) => {
                                                            const newB = { ...guidedBlocks, categoryLink: e.target.value };
                                                            updateBlocksAndSyncHtml(newB);
                                                        }}
                                                        className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold focus:outline-none"
                                                    >
                                                        <option value="/products?category=7">Explore Cold Pressed Oils Range</option>
                                                        <option value="/products?category=8">Explore Traditional Oils Range</option>
                                                        <option value="/products?category=9">Explore Organic Nuts &amp; Seeds</option>
                                                        <option value="/products?category=10">Explore Combos &amp; Gift Packs</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* 2. LIVE ARTICLE PREVIEW MODE */}
                                        {contentViewMode === 'PREVIEW' && (
                                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 max-h-[500px] overflow-y-auto">
                                                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                                                    <FaEye /> Live Reader Preview Mode — Exactly how readers will see your published guide
                                                </div>

                                                <div className="prose prose-purple max-w-none text-slate-800 text-sm leading-relaxed space-y-3"
                                                    dangerouslySetInnerHTML={{ __html: formData.content || '<p className="text-slate-400 italic">No content entered yet. Switch back to Guided Form Builder.</p>' }}
                                                />
                                            </div>
                                        )}

                                        {/* 3. RAW HTML CODE MODE */}
                                        {contentViewMode === 'RAW_HTML' && (
                                            <div className="space-y-2">
                                                <textarea
                                                    id="blogContentTextarea"
                                                    rows={12}
                                                    value={formData.content}
                                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                    placeholder="Raw HTML code view..."
                                                    className="w-full bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs leading-relaxed focus:outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {editorTab === 'SEO' && (
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="font-extrabold text-slate-900">SEO Meta Title</label>
                                            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                                formData.metaTitle.length > 60 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {formData.metaTitle.length} / 60
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.metaTitle}
                                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                            placeholder={formData.title || 'Page title in Google search results'}
                                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="font-extrabold text-slate-900">Meta Description</label>
                                            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                                formData.metaDescription.length > 160 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {formData.metaDescription.length} / 160
                                            </span>
                                        </div>
                                        <textarea
                                            rows={3}
                                            value={formData.metaDescription}
                                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                            placeholder={formData.excerpt || 'Description snippet shown under title in Google.'}
                                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1.5 font-extrabold text-slate-900">Meta Keywords</label>
                                        <input
                                            type="text"
                                            value={formData.metaKeywords}
                                            onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                                            placeholder="cold pressed oil, smoke points, marachekku groundnut oil"
                                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1.5 font-extrabold text-slate-900">Publish Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold focus:outline-none"
                                            >
                                                <option value="Published">Published (Public)</option>
                                                <option value="Draft">Draft (Hidden)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block mb-1.5 font-extrabold text-slate-900">Canonical URL</label>
                                            <input
                                                type="text"
                                                value={formData.canonicalUrl}
                                                onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                                                placeholder="Leave blank for automatic absolute canonical URL"
                                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono focus:ring-4 focus:ring-[#3c006b]/10 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0 rounded-b-3xl">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-[#3c006b] to-[#5a00a3] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-950/20 flex items-center gap-2"
                                >
                                    <FaCheck /> {editingId ? 'Save & Sync SEO' : 'Publish Article'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogManager;
