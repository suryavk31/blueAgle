import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaShoppingCart, FaUser } from 'react-icons/fa';
import { BiCategory } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const BottomNav = ({ onCartClick }) => {
    const { currentUser } = useAuth();
    const { itemCount } = useCart();

    const navItems = [
        { name: 'Home', icon: <FaHome size={20} />, path: '/' },
        { name: 'Categories', icon: <BiCategory size={20} />, path: '/products' },
        { name: 'Profile', icon: <FaUser size={20} />, path: currentUser ? '/profile' : '/login' },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50 md:hidden pb-safe">
            {navItems.map((item) => (
                <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${isActive ? 'text-purple-600' : 'text-gray-400'}`
                    }
                >
                    {item.icon}
                    <span>{item.name}</span>
                </NavLink>
            ))}
            <button
                onClick={onCartClick}
                className="flex flex-col items-center gap-1 text-xs font-medium text-gray-400 hover:text-purple-600 transition-colors relative"
            >
                <div className="relative">
                    <FaShoppingCart size={20} />
                    {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#ff3269] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{itemCount}</span>
                    )}
                </div>
                <span>Cart</span>
            </button>
        </div>
    );
};

export default BottomNav;

