import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CART_KEY = 'cartItems';

const getStoredCart = () => {
    try {
        const data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveCart = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(getStoredCart);

    // Sync to localStorage on every change
    useEffect(() => {
        saveCart(cartItems);
    }, [cartItems]);

    // Add item or increment quantity
    const addToCart = useCallback((product, qty = 1) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + qty }
                        : item
                );
            }
            // Store the full product object for display
            return [...prev, {
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                mrp: product.mrp ? parseFloat(product.mrp) : (parseFloat(product.price) * 1.2),
                description: product.description,
                images: product.images,
                stock: product.stock,
                quantity: qty,
            }];
        });
    }, []);

    // Update quantity directly
    const updateQuantity = useCallback((productId, newQty) => {
        if (newQty <= 0) {
            setCartItems(prev => prev.filter(item => item.id !== productId));
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.id === productId ? { ...item, quantity: newQty } : item
            )
        );
    }, []);

    // Remove item
    const removeFromCart = useCallback((productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
    }, []);

    // Get quantity for a specific product
    const getQuantity = useCallback((productId) => {
        const item = cartItems.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }, [cartItems]);

    // Clear entire cart
    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    // Computed values
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const subtotalMrp = cartItems.reduce((acc, item) => acc + ((item.mrp || (item.price * 1.2)) * item.quantity), 0);

    const value = {
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        getQuantity,
        clearCart,
        itemCount,
        subtotal,
        subtotalMrp,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
