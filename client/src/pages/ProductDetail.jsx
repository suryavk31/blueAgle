import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { FaHeart, FaShare, FaTruck, FaShieldAlt, FaLeaf, FaCheckCircle, FaStar, FaMinus, FaPlus } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const { addToCart, updateQuantity, getQuantity } = useCart();
    const navigate = useNavigate();

    const quantity = product ? getQuantity(product.id) : 0;

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProduct(res.data);

                if (res.data.subCategoryId) {
                    const allProdRes = await axios.get('http://localhost:5000/api/products');
                    const related = allProdRes.data
                        .filter(p => p.subCategoryId === res.data.subCategoryId && p.id !== res.data.id)
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
        addToCart(product, 1);
    };

    if (!product) return (
        <>
            <Helmet>
                <title>Loading Product... | Premium E-commerce</title>
            </Helmet>
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3c006b]"></div>
            </div>
        </>
    );

    const price = parseFloat(product.price);
    const mrp = product.mrp ? parseFloat(product.mrp) : Math.round(price * 1.2);
    const savings = mrp - price;
    const discountPercent = product.offerPercentage ? Math.round(product.offerPercentage) : Math.round((savings / mrp) * 100);
    const unit = product.weight || product.description || '1 pack';

    return (
        <div className="bg-[#f5f7fd] min-h-screen pb-24 md:pb-12">
            <Helmet>
                <title>{product.name} | Premium E-commerce</title>
                <meta name="description" content={product.description?.substring(0, 160) || "Buy premium products at the best prices."} />
                <meta property="og:title" content={product.name} />
                <meta property="og:description" content={product.description?.substring(0, 160)} />
                {product.images?.[0] && <meta property="og:image" content={getImageUrl(product.images[0])} />}
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4 text-xs text-gray-500">
                <Link to="/" className="hover:text-[#3c006b]">Home</Link> /
                <span className="mx-1">{product.SubCategory?.Category?.name}</span> /
                <span className="font-bold text-gray-700 ml-1">{product.name}</span>
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">

                    {/* Left: Image Gallery */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
                        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
                            <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors border border-gray-100">
                                <FaHeart />
                            </button>
                            <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors border border-gray-100">
                                <FaShare />
                            </button>
                        </div>

                        <div className="w-full h-80 md:h-[500px] flex items-center justify-center">
                            {product.images && product.images.length > 0 ? (
                                <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform hover:scale-105 duration-500" />
                            ) : (
                                <div className="text-gray-300">No Image Available</div>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-1">
                            <span className="text-[10px] font-bold text-[#3c006b] bg-purple-50 px-2 py-1 rounded uppercase tracking-wider">
                                {product.SubCategory?.name || 'Premium'}
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-4xl font-extrabold text-[#1a1a1a] mb-2 leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-sm text-gray-500 font-semibold">{unit}</div>
                            {product.weight && product.description && (
                                <div className="text-sm text-gray-400 font-medium">({product.description})</div>
                            )}
                            <div className="flex items-center text-yellow-400 text-xs gap-1 bg-yellow-50 px-2 py-0.5 rounded">
                                <FaStar /> <span>4.8 (120 reviews)</span>
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-6" />

                        <div className="flex items-end gap-3 mb-6">
                            <div className="text-3xl font-bold text-[#1a1a1a]">₹{price}</div>
                            <div className="text-lg text-gray-400 line-through mb-1">₹{mrp}</div>
                            <div className="flex flex-col mb-1 gap-1">
                                <div className="bg-[#e5f7ed] text-[#1a7428] font-bold text-xs px-2 py-1 rounded border border-[#c3e6d0] text-center w-max">
                                    SAVE ₹{savings}
                                </div>
                                {discountPercent > 0 && (
                                    <div className="bg-purple-100 text-[#3c006b] font-bold text-[10px] px-2 py-0.5 rounded border border-purple-200 text-center w-max">
                                        {discountPercent}% OFF
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="bg-green-100 text-green-600 p-2 rounded-full text-sm"><FaLeaf /></div>
                                <div className="text-xs font-semibold text-gray-700">100% Organic & Natural</div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="bg-orange-100 text-orange-600 p-2 rounded-full text-sm"><FaShieldAlt /></div>
                                <div className="text-xs font-semibold text-gray-700">Chemical Free Processing</div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="bg-blue-100 text-blue-600 p-2 rounded-full text-sm"><FaCheckCircle /></div>
                                <div className="text-xs font-semibold text-gray-700">Lab Tested for Purity</div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="bg-purple-100 text-purple-600 p-2 rounded-full text-sm"><FaTruck /></div>
                                <div className="text-xs font-semibold text-gray-700">10 Min Delivery</div>
                            </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex gap-4 mb-8">
                            {quantity === 0 ? (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0}
                                    className="flex-grow bg-[#ff3269] hover:bg-[#e62e5c] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                                >
                                    <FaTruck className="text-sm" />
                                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            ) : (
                                <>
                                    <div className="flex items-center border border-[#ff3269] rounded-xl bg-white overflow-hidden">
                                        <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-12 h-12 text-[#ff3269] font-bold hover:bg-pink-50 flex items-center justify-center"><FaMinus /></button>
                                        <span className="w-12 h-12 flex items-center justify-center font-bold text-[#ff3269] bg-pink-50">{quantity}</span>
                                        <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-12 h-12 text-[#ff3269] font-bold hover:bg-pink-50 flex items-center justify-center"><FaPlus /></button>
                                    </div>
                                    <div className="flex-grow bg-[#1a1a4e] text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center justify-center gap-2">
                                        <span>₹{(price * quantity).toFixed(0)} in Cart</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Product Description */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                Product Details
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                {product.description || "Experience the pure essence of nature with our premium range of products. Sourced directly from farmers and processed with care."}
                            </p>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> Shelf Life: 6 Months</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> Country of Origin: India</li>
                                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> FSSAI License: 100123456789</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="mt-12 mb-8">
                        <h3 className="font-bold text-xl mb-6">You Might Also Like</h3>
                        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                            {similarProducts.map(prod => (
                                <div key={prod.id} className="snap-start">
                                    <ProductCard product={prod} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Sticky Action Bar */}
            <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-3 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {quantity === 0 ? (
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className="flex-grow bg-[#ff3269] text-white font-bold rounded-xl shadow-lg flex flex-col items-center justify-center leading-tight py-3"
                    >
                        <span className="text-sm">{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                        <span className="text-[10px] opacity-90">₹{price}</span>
                    </button>
                ) : (
                    <>
                        <div className="flex items-center border border-[#ff3269] rounded-lg bg-white overflow-hidden">
                            <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-3 py-3 text-[#ff3269] font-bold"><FaMinus size={12} /></button>
                            <span className="w-8 text-center font-bold text-sm text-[#ff3269] bg-pink-50 py-3">{quantity}</span>
                            <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-3 py-3 text-[#ff3269] font-bold"><FaPlus size={12} /></button>
                        </div>
                        <div className="flex-grow bg-[#1a1a4e] text-white font-bold rounded-xl shadow-lg flex flex-col items-center justify-center leading-tight py-2">
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
