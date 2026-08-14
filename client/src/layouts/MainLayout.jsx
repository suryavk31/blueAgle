import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import CartSidebar from '../components/CartSidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    const [cartOpen, setCartOpen] = useState(false);

    return (
        <div className="bg-gray-50 flex flex-col min-h-screen pb-16 md:pb-0"> {/* Padding bottom for mobile nav */}
            <Navbar onCartClick={() => setCartOpen(true)} />
            <div className="flex-grow container mx-auto px-2 sm:px-4 py-3 sm:py-8">
                <Outlet />
            </div>
            <Footer />
            <BottomNav onCartClick={() => setCartOpen(true)} />
            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
};

export default MainLayout;

