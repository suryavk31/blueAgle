import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaBookOpen, FaClock, FaUser, FaTag, FaChevronRight, FaRegBookmark } from 'react-icons/fa';
import blogService from '../services/blogService';
const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const data = await blogService.getPublicBlogs({
                    category: selectedCategory,
                    search: searchQuery,
                    page,
                    limit: 9
                });
                setBlogs(data.blogs || []);
                setTotalPages(data.totalPages || 1);
                if (data.categories && data.categories.length > 0) {
                    setCategories(data.categories);
                }
            } catch (err) {
                console.error('Error loading blog articles:', err);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(() => {
            fetchBlogs();
        }, 300);

        return () => clearTimeout(timeout);
    }, [selectedCategory, searchQuery, page]);

    const featuredArticle = blogs.length > 0 ? blogs[0] : null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header Hero Section */}
            <div className="bg-gradient-to-r from-[#1b1b4b] via-[#2c1b64] to-[#3c006b] text-white py-16 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="max-w-6xl mx-auto text-center space-y-4 relative z-10">
                    <span className="inline-flex items-center gap-2 bg-white/10 text-purple-200 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border border-white/10">
                        <FaBookOpen /> Knowledge Hub &amp; Culinary Guides
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                        Cold Pressed Oil Guides &amp; Wellness Insights
                    </h1>
                    <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
                        Discover expert culinary advice, traditional Marachekku wood-pressing methods, cooking oil smoke point comparisons, and kitchen storage tips.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto pt-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                placeholder="Search articles (e.g. groundnut oil, smoke points, wood pressed)..."
                                className="w-full bg-white text-slate-900 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-400/30 transition-all placeholder:text-slate-400"
                            />
                            <FaSearch className="absolute left-4 top-5 text-slate-400 text-base" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
                {/* Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => { setSelectedCategory(cat); setPage(1); }}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 ${
                                selectedCategory === cat
                                    ? 'bg-[#3c006b] text-white shadow-md shadow-purple-900/20'
                                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                        >
                            <FaTag className="text-[10px]" /> {cat}
                        </button>
                    ))}
                </div>

                {/* Featured Article Banner (Only on page 1 with no search) */}
                {featuredArticle && page === 1 && !searchQuery && selectedCategory === 'All' && (
                    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 hover:shadow-2xl transition-all group">
                        <div className="h-64 md:h-auto overflow-hidden relative">
                            <img
                                src={featuredArticle.image || 'https://ik.imagekit.io/mbioov6us/project_one/Cold_Pressed_Groundnut_Oil_-_500ml_i9aZOmd2Z.jpg'}
                                alt={featuredArticle.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-4 left-4 bg-[#3c006b] text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                                Featured Guide
                            </span>
                        </div>
                        <div className="p-8 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-1.5"><FaUser className="text-purple-600" /> {featuredArticle.author}</span>
                                    <span className="flex items-center gap-1.5"><FaClock className="text-purple-600" /> {featuredArticle.readTime}</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#3c006b] transition-colors leading-snug">
                                    {featuredArticle.title}
                                </h2>
                                <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed font-medium">
                                    {featuredArticle.excerpt || featuredArticle.content.slice(0, 180)}...
                                </p>
                            </div>
                            <div>
                                <Link
                                    to={`/blog/${featuredArticle.slug}`}
                                    className="inline-flex items-center gap-2 bg-[#3c006b] hover:bg-[#2e0052] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-all"
                                >
                                    Read Complete Guide <FaChevronRight className="text-[10px]" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Articles Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-white rounded-3xl p-4 h-80 animate-pulse space-y-4 border border-slate-200">
                                <div className="bg-slate-200 rounded-2xl h-40"></div>
                                <div className="bg-slate-200 rounded-xl h-4 w-3/4"></div>
                                <div className="bg-slate-200 rounded-xl h-3 w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200 max-w-md mx-auto">
                        <FaRegBookmark className="text-4xl text-slate-300 mx-auto" />
                        <h3 className="text-lg font-bold text-slate-800">No articles found</h3>
                        <p className="text-xs text-slate-500">Try adjusting your search criteria or category filter.</p>
                        <button
                            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                            className="px-5 py-2.5 bg-[#3c006b] text-white text-xs font-bold rounded-xl"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((article) => (
                            <article
                                key={article.id}
                                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                            >
                                <div className="h-48 overflow-hidden relative bg-slate-100">
                                    <img
                                        src={article.image || 'https://ik.imagekit.io/mbioov6us/project_one/Cold_Pressed_Groundnut_Oil_-_500ml_i9aZOmd2Z.jpg'}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {article.category}
                                    </span>
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
                                            <span className="flex items-center gap-1"><FaClock className="text-purple-600" /> {article.readTime}</span>
                                            <span>•</span>
                                            <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#3c006b] transition-colors leading-snug line-clamp-2">
                                            <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                                        </h3>
                                        <p className="text-xs text-slate-600 line-clamp-3 font-medium leading-relaxed">
                                            {article.excerpt || article.content.slice(0, 140)}
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-slate-500">{article.author}</span>
                                        <Link
                                            to={`/blog/${article.slug}`}
                                            className="text-xs font-black text-[#3c006b] hover:text-[#5a00a3] flex items-center gap-1"
                                        >
                                            Read <FaChevronRight className="text-[9px]" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-6">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-10 h-10 rounded-xl text-xs font-extrabold transition-all ${
                                    page === p
                                        ? 'bg-[#3c006b] text-white shadow-md'
                                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogList;
