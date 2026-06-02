import React from 'react';

const ProductSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col gap-3 animate-pulse">
            {/* Image Placeholder */}
            <div className="w-full aspect-square bg-gray-200 rounded-xl"></div>
            
            {/* Title Placeholder */}
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            
            {/* Price Placeholder */}
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            
            {/* Action Placeholder */}
            <div className="h-10 bg-gray-200 rounded-xl w-full mt-2"></div>
        </div>
    );
};

export default ProductSkeleton;
