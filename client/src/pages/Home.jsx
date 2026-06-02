import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdComponent from '../components/AdComponent';
import ProductCard from '../components/ProductCard';
import { getImageUrl } from '../utils/imageHelper';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [ads, setAds] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, prodRes, adRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/categories'),
                    axios.get('http://localhost:5000/api/products'),
                    axios.get('http://localhost:5000/api/ads')
                ]);
                setCategories(catRes.data);
                setProducts(prodRes.data);
                setAds(adRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const topBanners = ads.filter(ad => ad.location === 'home-top' && ad.isActive);
    const middleBanners = ads.filter(ad => ad.location === 'home-middle' && ad.isActive);

    const ProductRail = ({ title, products, colorClass = "text-gray-800" }) => (
        <section className="py-6 border-b border-gray-100 last:border-0 pl-1">
            <div className="flex justify-between items-end px-4 mb-4">
                <h3 className={`font-bold text-xl md:text-2xl ${colorClass}`}>{title}</h3>
                <Link to="/products" className="text-[#ff3269] text-sm font-bold hover:underline">See All</Link>
            </div>
            <div className="flex overflow-x-auto gap-4 px-4 pb-8 -mb-4 scrollbar-hide snap-x">
                {products.map(prod => (
                    <div key={prod.id} className="snap-start h-full">
                        <ProductCard product={prod} />
                    </div>
                ))}
            </div>
        </section>
    );

    return (
        <div className="bg-[#f5f7fd] min-h-screen pb-20">
            {/* Top Banners - Full Width on Mobile, Container on Desktop */}
            {/* Top Banners - Full Width on Mobile and Desktop */}
            {topBanners.length > 0 && (
                <div className="w-full">
                    <div className="flex overflow-x-auto scrollbar-hide snap-x">
                        {topBanners.map(ad => (
                            <div key={ad.id} className="min-w-full snap-center relative aspect-[21/9] md:aspect-[21/6]">
                                <AdComponent ad={ad} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="container mx-auto max-w-7xl">
                {/* Categories - Bento Style */}
                <section className="px-4 py-8">
                    <h3 className="font-bold text-lg text-gray-400 uppercase tracking-widest mb-4 text-[11px]">Shop by Category</h3>
                    {/* First Row - Large Items */}
                    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
                        {categories.slice(0, 16).map((cat, index) => (
                            <Link key={cat.id} to={`/products?category=${cat.id}`} className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className={`w-full aspect-square rounded-[20px] flex items-center justify-center p-3 shadow-sm border border-transparent hover:border-[#3c006b]/20 transition-all group-hover:shadow-md relative overflow-hidden bg-white`}>
                                    {/* Subtle Background Pattern/Color based on index */}
                                    {index % 4 === 0 && <div className="absolute inset-0 bg-purple-50/50"></div>}
                                    {index % 4 === 1 && <div className="absolute inset-0 bg-green-50/50"></div>}
                                    {index % 4 === 2 && <div className="absolute inset-0 bg-orange-50/50"></div>}
                                    {index % 4 === 3 && <div className="absolute inset-0 bg-blue-50/50"></div>}

                                    {cat.image ? (
                                        <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-contain mix-blend-multiply z-10 transition-transform group-hover:scale-110 duration-500" />
                                    ) : (
                                        <div className="text-3xl font-bold text-gray-200 z-10">{cat.name[0]}</div>
                                    )}
                                </div>
                                <span className="text-[11px] md:text-xs font-bold text-center text-gray-700 leading-tight w-full truncate">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Main Product Rails */}
                <ProductRail title="Fresh Arrivals" products={products.slice(0, 8)} />

                {/* Middle Banner */}
                {middleBanners.length > 0 && (
                    <div className="px-4 py-4">
                        <AdComponent ad={middleBanners[0]} className="w-full h-32 md:h-56 object-cover rounded-xl shadow-sm" />
                    </div>
                )}

                <ProductRail title="Your Daily Needs" products={products.slice(2, 12)} colorClass="text-[#3c006b]" />

                {/* Simulated 'Explore' Grid for variety */}
                <section className="px-4 py-6">
                    <h3 className="font-bold text-xl mb-4">Explore New</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {products.slice(0, 4).map(prod => (
                            <ProductCard key={prod.id} product={prod} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
