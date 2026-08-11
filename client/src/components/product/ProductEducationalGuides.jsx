import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaChevronRight, FaClock } from 'react-icons/fa';
import blogService from '../../services/blogService';

const ProductEducationalGuides = ({ categoryName }) => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuides = async () => {
            setLoading(true);
            try {
                const data = await blogService.getPublicBlogs({ limit: 3 });
                setGuides(data.blogs || []);
            } catch (err) {
                console.error('Error loading educational guides for product:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGuides();
    }, [categoryName]);

    if (loading || guides.length === 0) return null;

    return (
        <div className="mt-12 bg-gradient-to-r from-purple-50 via-indigo-50 to-slate-50 p-6 sm:p-8 rounded-3xl border border-purple-100/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-black text-purple-700 uppercase tracking-widest">
                        <FaBookOpen /> Knowledge Hub &amp; Culinary Guides
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                        Learn More About Cold Pressed &amp; Traditional Oils
                    </h3>
                </div>

                <Link
                    to="/blog"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#3c006b] hover:text-[#5b0099] transition-colors"
                >
                    View All Guides <FaChevronRight className="text-[9px]" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {guides.map((guide) => (
                    <Link
                        key={guide.id}
                        to={`/blog/${guide.slug}`}
                        className="bg-white p-4 rounded-2xl border border-purple-100/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                    >
                        <div className="space-y-2">
                            <span className="inline-block text-[10px] font-extrabold px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                                {guide.category}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#3c006b] transition-colors line-clamp-2 leading-snug">
                                {guide.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 font-medium">
                                {guide.excerpt}
                            </p>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                            <span className="flex items-center gap-1"><FaClock className="text-purple-500" /> {guide.readTime}</span>
                            <span className="text-[#3c006b] font-black group-hover:translate-x-0.5 transition-transform">Read →</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProductEducationalGuides;
