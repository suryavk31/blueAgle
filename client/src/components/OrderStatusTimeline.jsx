import React from 'react';
import { FaCheckCircle, FaCircle, FaShippingFast, FaBoxOpen, FaTruck, FaUndo, FaTimesCircle } from 'react-icons/fa';

const OrderStatusTimeline = ({ status }) => {
    const statuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    
    if (status === 'Cancelled') {
        return (
            <div className="flex items-center gap-2 text-red-500 font-bold p-3 bg-red-50 rounded-lg border border-red-100">
                <FaTimesCircle /> Order Cancelled
            </div>
        );
    }

    if (status === 'Returned') {
        return (
            <div className="flex items-center gap-2 text-orange-500 font-bold p-3 bg-orange-50 rounded-lg border border-orange-100">
                <FaUndo /> Order Returned
            </div>
        );
    }

    const currentIndex = statuses.indexOf(status);

    const getIcon = (index) => {
        if (index < currentIndex) return <FaCheckCircle className="text-green-500" />;
        if (index === currentIndex) return <div className="animate-bounce"><FaCircle className="text-blue-500" /></div>;
        return <FaCircle className="text-gray-300" />;
    };

    const getLabelIcon = (label) => {
        switch (label) {
            case 'Pending': return <FaBoxOpen />;
            case 'Processing': return <div className="animate-pulse"><FaBoxOpen /></div>;
            case 'Shipped': return <FaShippingFast />;
            case 'Out for Delivery': return <FaTruck />;
            case 'Delivered': return <FaCheckCircle />;
            default: return null;
        }
    };

    return (
        <div className="py-6 px-2">
            <div className="flex justify-between relative">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500" 
                    style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
                ></div>

                {statuses.map((s, index) => (
                    <div key={s} className="flex flex-col items-center gap-2 z-10 bg-white px-1">
                        <div className="bg-white rounded-full">
                            {getIcon(index)}
                        </div>
                        <div className={`text-[10px] md:text-xs font-bold text-center flex flex-col items-center gap-1 ${index <= currentIndex ? 'text-gray-800' : 'text-gray-400'}`}>
                            <span className="text-sm md:text-lg">{getLabelIcon(s)}</span>
                            <span className="hidden md:block">{s}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 md:hidden text-center text-xs font-bold text-blue-600 bg-blue-50 py-1 rounded">
                Current Status: {status}
            </div>
        </div>
    );
};

export default OrderStatusTimeline;
