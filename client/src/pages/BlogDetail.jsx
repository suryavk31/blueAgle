import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaClock, FaUser, FaTag, FaArrowLeft, FaShareAlt, FaChevronRight, FaShoppingBag, FaCheckCircle, FaBookOpen } from 'react-icons/fa';
import blogService from '../services/blogService';
const BlogDetail = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            try {
                const data = await blogService.getPublicBlogBySlug(slug);
                setArticle(data.blog);
                setRelated(data.related || []);
            } catch (err) {
                console.error('Error fetching blog details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
        window.scrollTo(0, 0);
    }, [slug]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article?.title,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 py-20 px-4 flex justify-center items-center">
                <div className="max-w-3xl w-full bg-white rounded-3xl p-8 shadow-sm space-y-6 animate-pulse border border-slate-200">
                    <div className="h-8 bg-slate-200 rounded-xl w-3/4"></div>
                    <div className="h-64 bg-slate-200 rounded-2xl"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
                        <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
                        <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-slate-50 py-20 px-4 text-center">
                <div className="max-w-md mx-auto bg-white rounded-3xl p-10 shadow-sm border border-slate-200 space-y-4">
                    <FaBookOpen className="text-4xl text-slate-300 mx-auto" />
                    <h2 className="text-xl font-black text-slate-900">Article Not Found</h2>
                    <p className="text-xs text-slate-500">The guide you are looking for does not exist or may have been moved.</p>
                    <Link to="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-[#3c006b] text-white text-xs font-extrabold rounded-xl shadow-md">
                        <FaArrowLeft /> Back to Guides
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header / Breadcrumb */}
            <div className="bg-gradient-to-r from-[#1b1b4b] via-[#2c1b64] to-[#3c006b] text-white py-12 px-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
                        <FaArrowLeft className="text-[10px]" /> Back to All Guides
                    </Link>

                    <div className="flex items-center gap-3">
                        <span className="bg-white/10 text-purple-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                            {article.category}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                            <FaClock className="text-purple-300" /> {article.readTime}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                        {article.title}
                    </h1>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-medium text-slate-300">
                        <div className="flex items-center gap-2">
                            <FaUser className="text-purple-300" />
                            <span>By <strong className="text-white">{article.author}</strong></span>
                            <span className="text-slate-500">•</span>
                            <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>

                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
                        >
                            <FaShareAlt /> {copied ? 'Link Copied!' : 'Share'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Article Main Container */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
                    {/* Featured Image */}
                    {article.image && (
                        <div className="w-full h-72 sm:h-96 overflow-hidden bg-slate-100 relative">
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6 sm:p-10 space-y-8">
                        {/* Excerpt Box */}
                        {article.excerpt && (
                            <div className="p-5 bg-purple-50/70 border-l-4 border-[#3c006b] rounded-r-2xl text-slate-800 text-sm font-semibold leading-relaxed">
                                {article.excerpt}
                            </div>
                        )}

                        {/* Article Body HTML Content */}
                        <div
                            className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 font-normal"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />

                        {/* Culinary Quality Checklist (Non-Medical) */}
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                <FaCheckCircle className="text-emerald-600" /> BlueAgle Quality Standards
                            </h4>
                            <ul className="text-xs text-slate-600 space-y-2 font-medium">
                                <li className="flex items-center gap-2">✓ 100% Raw seeds &amp; nuts extracted via traditional wooden Marachekku press</li>
                                <li className="flex items-center gap-2">✓ Zero chemical refining, bleaching, or artificial deodorization</li>
                                <li className="flex items-center gap-2">✓ Retains natural aroma, rich viscosity, and culinary flavor profile</li>
                            </ul>
                        </div>

                        {/* Internal Category CTA Card */}
                        <div className="p-6 bg-gradient-to-r from-[#1b1b4b] to-[#3c006b] rounded-3xl text-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg">
                            <div className="space-y-1 text-center sm:text-left">
                                <h3 className="font-black text-lg">Taste Pure Wood-Pressed Excellence</h3>
                                <p className="text-xs text-slate-300 font-medium">Shop 100% natural wood pressed oils delivered fresh to your home.</p>
                            </div>
                            <Link
                                to="/products?category=7"
                                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
                            >
                                <FaShoppingBag /> Explore Cold Pressed Oils
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Related Articles Section */}
                {related.length > 0 && (
                    <div className="pt-12 space-y-6">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <FaBookOpen className="text-[#3c006b]" /> Related Guides &amp; Articles
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {related.map((rel) => (
                                <Link
                                    key={rel.id}
                                    to={`/blog/${rel.slug}`}
                                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all space-y-3 group block"
                                >
                                    <div className="h-32 rounded-xl overflow-hidden bg-slate-100">
                                        <img src={rel.image || 'https://ik.imagekit.io/mbioov6us/project_one/Cold_Pressed_Groundnut_Oil_-_500ml_i9aZOmd2Z.jpg'} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#3c006b] transition-colors line-clamp-2">
                                        {rel.title}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogDetail;
