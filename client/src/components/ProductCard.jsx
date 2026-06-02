import React from 'react';
import { Link } from 'react-router-dom';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart, updateQuantity, getQuantity } = useCart();
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
        <Link to={`/product/${product.id}`} className="block w-[160px] md:w-[180px] bg-white rounded-xl hover:shadow-xl transition-all duration-300 relative flex-shrink-0 group border border-gray-100 hover:border-gray-200 overflow-hidden">

            {/* Discount Badge */}
            {discountPercent > 0 && (
                <div className="absolute top-0 left-0 bg-[#3c006b] text-white text-[9px] font-bold px-2 py-1 rounded-br-lg z-10 uppercase tracking-wider">
                    {discountPercent}% OFF
                </div>
            )}

            {/* Image Container — fixed height */}
            <div className="w-full h-[150px] relative p-3 flex items-center justify-center bg-gray-50/50">
                {product.images?.[0] ? (
                    <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110" />
                ) : (
                    <div className="text-gray-300 text-xs">No Image</div>
                )}

                {/* Add / Quantity Button */}
                <div className="absolute -bottom-3 right-2 z-20" onClick={(e) => e.preventDefault()}>
                    {quantity === 0 ? (
                        <button
                            onClick={handleAdd}
                            className="bg-white border border-[#ff3269] text-[#ff3269] text-xs font-bold px-4 py-1.5 rounded-lg shadow-md uppercase tracking-wide hover:bg-[#fff0f5] transition-colors"
                        >
                            ADD
                        </button>
                    ) : (
                        <div className="bg-[#ff3269] text-white flex items-center justify-between px-2.5 py-1.5 rounded-lg gap-2 min-w-[80px] shadow-md">
                            <button onClick={handleDecrement} className="text-white text-[10px] w-5 h-5 flex items-center justify-center"><FaMinus /></button>
                            <span className="text-white text-xs font-bold">{quantity}</span>
                            <button onClick={handleIncrement} className="text-white text-[10px] w-5 h-5 flex items-center justify-center"><FaPlus /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content — fixed bottom section */}
            <div className="pt-5 px-3 pb-3 flex flex-col min-h-[100px]">
                {/* Title — exactly 2 lines */}
                <h4 className="font-semibold text-gray-800 text-[13px] leading-tight mb-1 line-clamp-2 h-[34px]" title={product.name}>
                    {product.name}
                </h4>

                {/* Unit */}
                <div className="text-[11px] text-gray-400 font-medium mb-2 truncate">
                    {unit}
                </div>

                {/* Price Row */}
                <div className="mt-auto flex items-center gap-2">
                    <span className="bg-[#e5f7ed] text-[#1a7428] text-xs font-bold px-2 py-0.5 rounded-md">
                        ₹{price}
                    </span>
                    {savings > 0 && (
                        <span className="text-gray-400 text-[11px] line-through">
                            ₹{mrp}
                        </span>
                    )}
                </div>

                {/* Savings text */}
                {savings > 0 && (
                    <div className="text-[10px] text-green-600 font-semibold mt-1">
                        Save ₹{savings}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;
