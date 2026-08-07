import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { FaHeart, FaShare, FaTruck, FaStar, FaMinus, FaPlus, FaCheck, FaUtensils, FaLeaf } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import ProductCarousel from '../components/ProductCarousel';

// Import Modular Components
import ProductHighlights from '../components/product/ProductHighlights';
import ProductSpecifications from '../components/product/ProductSpecifications';
import ProductNutrition from '../components/product/ProductNutrition';
import ProductCertifications from '../components/product/ProductCertifications';
import ProductDeliveryInfo from '../components/product/ProductDeliveryInfo';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const { addToCart, updateQuantity, getQuantity } = useCart();
    const navigate = useNavigate();

    const quantity = product ? getQuantity(product.id) : 0;

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                const prodData = res.data;
                setProduct(prodData);
                setSelectedImage(prodData.images?.[0] || null);

                if (prodData.subCategoryId) {
                    const allProdRes = await api.get('/products');
                    const related = allProdRes.data
                        .filter(p => p.subCategoryId === prodData.subCategoryId && p.id !== prodData.id)
                        .slice(0, 5);
                    setSimilarProducts(related);
                }

                window.scrollTo(0, 0);
            } catch (error) {
                console.error(error);
            }
        };
        fetchProductData();
    }, [id]);

    const handleAddToCart = () => {
        if (product) addToCart(product, 1);
    };

    if (!product) return (
        <>
            <Helmet>
                <title>Loading Product... | BlueAgle</title>
            </Helmet>
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        </>
    );

    const price = parseFloat(product.price);
    const mrp = product.mrp ? parseFloat(product.mrp) : Math.round(price * 1.2);
    const savings = mrp - price;
    const discountPercent = product.offerPercentage ? Math.round(product.offerPercentage) : Math.round((savings / mrp) * 100);
    const unit = product.weight || product.shortDescription || '';

    // Badges array
    const badges = product.badges || [];
    const ingredients = Array.isArray(product.ingredients) ? product.ingredients : [];
    const benefits = Array.isArray(product.benefits) ? product.benefits : [];
    const usageInstructions = Array.isArray(product.usageInstructions) ? product.usageInstructions : [];

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-24 md:pb-12 text-slate-800 font-sans">
            <Helmet>
                <title>{product.metaTitle || `${product.name} | BlueAgle`}</title>
                <meta name="description" content={product.metaDescription || product.shortDescription || product.description?.substring(0, 160) || "Buy premium products at best prices."} />
                {product.metaKeywords && <meta name="keywords" content={product.metaKeywords} />}
                <meta property="og:title" content={product.name} />
                <meta property="og:description" content={product.shortDescription || product.description?.substring(0, 160)} />
                {product.images?.[0] && <meta property="og:image" content={getImageUrl(product.images[0])} />}
            </Helmet>

            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4 text-xs text-slate-500">
                <Link to="/" className="hover:text-indigo-600 font-medium">Home</Link>
                {product.SubCategory?.Category?.name && (
                    <>
                        <span className="mx-1.5 text-slate-300">/</span>
                        <span className="font-medium text-slate-600">{product.SubCategory.Category.name}</span>
                    </>
                )}
                {product.SubCategory?.name && (
                    <>
                        <span className="mx-1.5 text-slate-300">/</span>
                        <span className="font-medium text-slate-600">{product.SubCategory.name}</span>
                    </>
                )}
                <span className="mx-1.5 text-slate-300">/</span>
                <span className="font-bold text-slate-900">{product.name}</span>
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 mb-8">

                    {/* Left: Media Gallery */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 relative overflow-hidden">
                            {/* Badges Container */}
                            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
                                {product.isBestSeller && (
                                    <span className="bg-amber-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">Best Seller</span>
                                )}
                                {product.isNewArrival && (
                                    <span className="bg-indigo-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">New Arrival</span>
                                )}
                                {badges.map((b, idx) => (
                                    <span key={b.id || idx} style={{ backgroundColor: b.color || '#10b981' }} className="text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                                        {b.badgeText}
                                    </span>
                                ))}
                            </div>

                            <div className="absolute top-4 right-4 flex flex-col gap-2.5 z-10">
                                <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors border border-slate-100">
                                    <FaHeart />
                                </button>
                                <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors border border-slate-100">
                                    <FaShare />
                                </button>
                            </div>

                            <div className="w-full h-80 md:h-[460px] flex items-center justify-center">
                                {selectedImage ? (
                                    <img src={getImageUrl(selectedImage)} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform hover:scale-105 duration-500" />
                                ) : (
                                    <div className="text-slate-300 text-sm font-medium">No Image Available</div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Selector */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-white shrink-0 transition-all ${
                                            selectedImage === img ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain p-1" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info & Actions */}
                    <div className="flex flex-col">
                        {product.brand && (
                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                                {product.brand}
                            </div>
                        )}

                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-snug">
                            {product.name}
                        </h1>

                        {/* Rating & Review Info */}
                        <div className="flex items-center gap-4 mb-4">
                            {unit && <div className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">{unit}</div>}
                            {parseFloat(product.rating) > 0 ? (
                                <div className="flex items-center text-amber-500 text-xs font-bold gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                                    <FaStar /> <span>{parseFloat(product.rating).toFixed(1)} ({product.reviewCount || 0} reviews)</span>
                                </div>
                            ) : null}
                            {product.sku && (
                                <div className="text-xs text-slate-400 font-mono">SKU: {product.sku}</div>
                            )}
                        </div>

                        <hr className="border-slate-200/60 mb-5" />

                        {/* Price Display */}
                        <div className="flex items-end gap-3 mb-6">
                            <div className="text-3xl md:text-4xl font-black text-slate-900">₹{price}</div>
                            {mrp > price && (
                                <div className="text-lg text-slate-400 line-through mb-1 font-medium">₹{mrp}</div>
                            )}
                            {savings > 0 && (
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-emerald-200">
                                        SAVE ₹{savings}
                                    </span>
                                    {discountPercent > 0 && (
                                        <span className="bg-purple-100 text-purple-800 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-purple-200">
                                            {discountPercent}% OFF
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Dynamic Trust Badges / Highlights */}
                        <ProductHighlights highlights={product.highlights} />

                        {/* Action Buttons */}
                        <div className="hidden md:flex gap-4 mb-6">
                            {quantity === 0 ? (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className="flex-grow bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold py-3.5 px-8 rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
                                >
                                    <FaTruck className="text-sm" />
                                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            ) : (
                                <>
                                    <div className="flex items-center border border-rose-500 rounded-2xl bg-white overflow-hidden shadow-xs">
                                        <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-12 h-12 text-rose-600 font-bold hover:bg-rose-50 flex items-center justify-center"><FaMinus /></button>
                                        <span className="w-12 h-12 flex items-center justify-center font-bold text-rose-600 bg-rose-50/50">{quantity}</span>
                                        <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-12 h-12 text-rose-600 font-bold hover:bg-rose-50 flex items-center justify-center"><FaPlus /></button>
                                    </div>
                                    <div className="flex-grow bg-slate-900 text-white font-extrabold py-3.5 px-8 rounded-2xl shadow-md flex items-center justify-center gap-2">
                                        <span>₹{(price * quantity).toFixed(0)} in Cart</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Dynamic Delivery Info Component */}
                        <ProductDeliveryInfo product={product} />

                        {/* Full Description & Repeatable Bullet Sections */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs mb-6 space-y-4">
                            <h3 className="font-extrabold text-slate-900 text-lg mb-2">Product Description</h3>
                            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {product.description || product.shortDescription || "No detailed description provided for this product."}
                            </div>

                            {/* Repeatable Ingredients */}
                            {ingredients.length > 0 && (
                                <div className="border-t border-slate-100 pt-4 mt-4">
                                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                        <FaUtensils className="text-indigo-600" /> Key Ingredients
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {ingredients.map((ing, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-lg">
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Repeatable Benefits */}
                            {benefits.length > 0 && (
                                <div className="border-t border-slate-100 pt-4 mt-4">
                                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                        <FaLeaf className="text-emerald-600" /> Key Health Benefits
                                    </h4>
                                    <ul className="space-y-1.5 text-xs text-slate-600">
                                        {benefits.map((ben, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <FaCheck className="text-emerald-500 mt-0.5 shrink-0" />
                                                <span>{ben}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Relational Sections: Specifications, Nutrition, Certifications */}
                <ProductSpecifications specifications={product.specifications} />
                <ProductNutrition nutrition={product.nutrition} />
                <ProductCertifications certifications={product.certifications} />

                {/* Similar Products Carousel */}
                {similarProducts.length > 0 && (
                    <div className="mt-12 mb-8">
                        <ProductCarousel
                            title="You Might Also Like"
                            subtitle="Handpicked items matching this category"
                            products={similarProducts}
                            showSeeAll={false}
                        />
                    </div>
                )}
            </div>

            {/* Mobile Sticky Action Bar */}
            <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-slate-200 p-3 flex gap-3 z-40 shadow-lg">
                {quantity === 0 ? (
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className="flex-grow bg-rose-600 text-white font-extrabold rounded-xl shadow-md flex flex-col items-center justify-center leading-tight py-3"
                    >
                        <span className="text-sm">{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                        <span className="text-[10px] opacity-90">₹{price}</span>
                    </button>
                ) : (
                    <>
                        <div className="flex items-center border border-rose-500 rounded-xl bg-white overflow-hidden">
                            <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-3 py-3 text-rose-600 font-bold"><FaMinus size={12} /></button>
                            <span className="w-8 text-center font-bold text-sm text-rose-600 bg-rose-50 py-3">{quantity}</span>
                            <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-3 py-3 text-rose-600 font-bold"><FaPlus size={12} /></button>
                        </div>
                        <div className="flex-grow bg-slate-900 text-white font-bold rounded-xl shadow-md flex flex-col items-center justify-center leading-tight py-2">
                            <span className="text-sm">₹{(price * quantity).toFixed(0)} in Cart</span>
                            <span className="text-[10px] opacity-70">{quantity} item{quantity > 1 ? 's' : ''}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
