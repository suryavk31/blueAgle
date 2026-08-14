import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaShoppingCart, FaUser, FaArrowRight } from 'react-icons/fa';
import { BiCategory } from 'react-icons/bi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const BottomNav = ({ onCartClick }) => {
    const { currentUser } = useAuth();
    const { itemCount, subtotal } = useCart();
    const location = useLocation();
    
    const [isAtTop, setIsAtTop] = useState(true);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    // Scroll listener: Zepto behavior (only shows full navbar at absolute top)
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY || document.documentElement.scrollTop;
            setIsAtTop(currentScrollY <= 40);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    // Keyboard & input focus listener
    useEffect(() => {
        const handleFocusIn = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                setIsKeyboardOpen(true);
            }
        };
        const handleFocusOut = () => {
            setIsKeyboardOpen(false);
        };

        const handleViewportResize = () => {
            if (window.visualViewport) {
                const keyboardOpen = window.visualViewport.height < window.innerHeight * 0.8;
                setIsKeyboardOpen(keyboardOpen);
            }
        };

        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportResize);
        }

        return () => {
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewportResize);
            }
        };
    }, []);

    const navItems = [
        { name: 'Home',       icon: FaHome,      path: '/' },
        { name: 'Categories', icon: BiCategory,  path: '/products' },
        { name: 'Profile',    icon: FaUser,       path: currentUser ? '/profile' : '/login' },
    ];

    const isProductPage = location.pathname.startsWith('/product/');
    const isCheckoutPage = location.pathname === '/checkout';

    if (isKeyboardOpen || isProductPage || isCheckoutPage) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 md:hidden pointer-events-none">
            {/* ── 1. FULL BOTTOM NAVBAR (Zepto style: only visible at absolute top) ── */}
            <div
                className={`transition-all duration-300 transform ${
                    isAtTop
                        ? 'translate-y-0 opacity-100 pointer-events-auto'
                        : 'translate-y-24 opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className="mx-3 mb-3 rounded-[1.75rem] flex items-center justify-between px-3 py-2"
                    style={{
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(60,0,107,0.13), 0 1.5px 6px rgba(0,0,0,0.07)',
                        border: '1px solid rgba(255,255,255,0.7)',
                    }}
                >
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            item.path === '/'
                                ? location.pathname === '/'
                                : location.pathname.startsWith(item.path);

                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className="flex-1 flex flex-col items-center py-1 relative"
                            >
                                <span
                                    className="flex flex-col items-center gap-1 transition-all duration-200"
                                    style={{ color: isActive ? '#3c006b' : '#a0aec0' }}
                                >
                                    {/* Active pill background */}
                                    <span
                                        className="relative flex items-center justify-center w-10 h-9 rounded-2xl transition-all duration-300"
                                        style={{
                                            background: isActive
                                                ? 'linear-gradient(135deg, #3c006b18, #6d28d918)'
                                                : 'transparent',
                                        }}
                                    >
                                        <Icon size={isActive ? 20 : 18} />
                                        {/* Active dot */}
                                        {isActive && (
                                            <span
                                                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                                style={{ background: '#3c006b' }}
                                            />
                                        )}
                                    </span>
                                    <span
                                        className="text-[10px] font-bold tracking-wide leading-none transition-all"
                                        style={{
                                            color: isActive ? '#3c006b' : '#a0aec0',
                                            fontWeight: isActive ? 800 : 500,
                                        }}
                                    >
                                        {item.name}
                                    </span>
                                </span>
                            </NavLink>
                        );
                    })}

                    {/* Cart in Full Bar */}
                    <div className="flex-1 flex flex-col items-center py-1">
                        <button
                            onClick={onCartClick}
                            className="flex flex-col items-center gap-1 relative transition-all duration-200 active:scale-95"
                        >
                            <span
                                className="relative flex items-center justify-center w-10 h-9 rounded-2xl transition-all duration-300"
                                style={{ background: '#3c006b' }}
                            >
                                <FaShoppingCart size={18} color="#fff" />
                                {itemCount > 0 && (
                                    <span
                                        className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
                                        style={{ background: '#ff3269' }}
                                    >
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </span>
                            <span
                                className="text-[10px] font-extrabold tracking-wide leading-none"
                                style={{ color: '#3c006b' }}
                            >
                                Cart
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 2. SCROLLED FLOATING CART PILL (Zepto style: floating cart pill when scrolled down) ── */}
            {!isAtTop && itemCount > 0 && (
                <div className="mx-3 mb-3 pointer-events-auto animate-in slide-in-from-bottom duration-300">
                    <button
                        onClick={onCartClick}
                        className="w-full bg-gradient-to-r from-[#1a1a4e] to-[#3c006b] text-white p-2.5 pl-4 rounded-2xl shadow-xl flex items-center justify-between border border-purple-800/40 active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                                <FaShoppingCart size={15} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black tracking-tight">{itemCount} {itemCount === 1 ? 'item' : 'items'} in Cart</p>
                                <p className="text-[10px] text-purple-200">Total: ₹{subtotal?.toFixed(0) || '0'}</p>
                            </div>
                        </div>

                        <div className="bg-[#ff3269] text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md">
                            <span>View Cart</span>
                            <FaArrowRight className="text-[10px]" />
                        </div>
                    </button>
                </div>
            )}

            {/* Safe area spacer for phones with home bar */}
            <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
    );
};

export default BottomNav;
