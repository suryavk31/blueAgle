import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import { useCart } from '../context/CartContext';

const ProductCard = memo(({ product }) => {
    const { addToCart, updateQuantity, getQuantity } = useCart();
    if (!product) return null;

    const quantity = getQuantity(product.id);
    const price = parseFloat(product.price);
    const mrp = product.mrp ? parseFloat(product.mrp) : Math.round(price * 1.2);
    const savings = mrp - price;
    const discountPercent = product.offerPercentage ? Math.round(product.offerPercentage) : Math.round((savings / mrp) * 100);
    const unit = product.weight || product.description || '1 pack';

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
    };

    const handleIncrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.id, quantity + 1);
    };

    const handleDecrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuantity(product.id, quantity - 1);
    };

    return (
        <Link 
            to={`/product/${product.id}`} 
            className="block w-full h-full bg-white rounded-2xl border border-gray-100 hover:border-purple-200 shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col group overflow-hidden"
        >
            {/* Discount Badge */}
            {discountPercent > 0 && (
                <div className="absolute top-0 left-0 bg-[#3c006b] text-white text-[9px] sm:text-[10px] font-extrabold px-2 py-1 rounded-br-xl z-10 uppercase tracking-wider shadow-sm">
                    {discountPercent}% OFF
                </div>
            )}

            {/* Image Container — fixed height ratio */}
            <div className="w-full h-[150px] sm:h-[165px] relative p-3 flex items-center justify-center bg-gray-50/60 shrink-0">
                {product.images?.[0] ? (
                    <img 
                        src={getImageUrl(product.images[0])} 
                        alt={product.name} 
                        className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
                        loading="lazy"
                    />
                ) : (
                    <div className="text-gray-300 text-xs font-semibold">No Image</div>
                )}

                {/* Add / Quantity Button */}
                <div className="absolute -bottom-3 right-2.5 z-20" onClick={(e) => e.preventDefault()}>
                    {quantity === 0 ? (
                        <button
                            onClick={handleAdd}
                            className="bg-white border border-[#ff3269] text-[#ff3269] text-xs font-black px-4 py-1.5 rounded-xl shadow-md uppercase tracking-wider hover:bg-[#ff3269] hover:text-white transition-all active:scale-95"
                        >
                            ADD
                        </button>
                    ) : (
                        <div className="bg-[#ff3269] text-white flex items-center justify-between px-2.5 py-1.5 rounded-xl gap-2 min-w-[84px] shadow-md">
                            <button onClick={handleDecrement} className="text-white text-[10px] w-5 h-5 flex items-center justify-center hover:bg-black/10 rounded"><FaMinus /></button>
                            <span className="text-white text-xs font-extrabold">{quantity}</span>
                            <button onClick={handleIncrement} className="text-white text-[10px] w-5 h-5 flex items-center justify-center hover:bg-black/10 rounded"><FaPlus /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content — fixed bottom section */}
            <div className="pt-5 px-3.5 pb-3 flex flex-col flex-1">
                {/* Title — max 2 lines with set height */}
                <h4 className="font-bold text-gray-800 text-[13px] sm:text-[14px] leading-tight mb-1 line-clamp-2 h-[34px] group-hover:text-[#3c006b] transition-colors" title={product.name}>
                    {product.name}
                </h4>

                {/* Unit */}
                <div className="text-[11px] text-gray-400 font-medium mb-2 truncate">
                    {unit}
                </div>

                {/* Price Row */}
                <div className="mt-auto flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-2 py-0.5 rounded-md border border-emerald-100/50">
                        ₹{price}
                    </span>
                    {savings > 0 && (
                        <span className="text-gray-400 text-[11px] line-through font-medium">
                            ₹{mrp}
                        </span>
                    )}
                </div>

                {/* Savings text */}
                <div className="text-[10px] text-emerald-600 font-bold mt-1 h-[14px]">
                    {savings > 0 ? `Save ₹${savings}` : ''}
                </div>
            </div>
        </Link>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

