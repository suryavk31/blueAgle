import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';

const Cart = () => {
    const { currentUser } = useAuth();
    const [cart, setCart] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.get('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (currentUser) fetchCart();
    }, [currentUser]);

    const updateQuantity = async (itemId, qty) => {
        try {
            const token = await currentUser.getIdToken();
            await axios.put(`http://localhost:5000/api/cart/${itemId}`, { quantity: qty }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCart();
        } catch (error) {
            toast.error("Error updating quantity");
        }
    };

    const removeItem = async (itemId) => {
        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`http://localhost:5000/api/cart/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCart();
            toast.success("Item removed");
        } catch (error) {
            toast.error("Error removing item");
        }
    };

    const applyCoupon = async () => {
        if (!couponCode) return;
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.post('http://localhost:5000/api/coupons/verify', { code: couponCode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Simplified discount logic for MVP
            const coupon = res.data;
            let disc = 0;
            if (coupon.discountType === 'fixed') {
                disc = parseFloat(coupon.value);
            } else {
                // percentage logic
            }
            setDiscount(disc);
            toast.success("Coupon Applied");
        } catch (error) {
            setDiscount(0);
            toast.error(error.response?.data?.message || "Invalid Coupon");
        }
    };

    const handleCheckout = async () => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = async () => {
            try {
                const token = await currentUser.getIdToken();
                // Create Order
                const orderRes = await axios.post('http://localhost:5000/api/orders/create-order', {
                    couponCode: discount > 0 ? couponCode : null,
                    address: { line1: "123 Street", city: "City" } // Hardcoded for MVP, should be a form
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const options = {
                    key: "rzp_test_placeholder", // Reads from config ideally
                    amount: orderRes.data.amount,
                    currency: orderRes.data.currency,
                    name: "ProjectOne",
                    description: "Order Payment",
                    order_id: orderRes.data.id,
                    handler: async function (response) {
                        try {
                            await axios.post('http://localhost:5000/api/orders/verify-payment', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                address: { line1: "123 Street", city: "City" }, // Pass actual address
                                couponCode: discount > 0 ? couponCode : null,
                                amount: orderRes.data.totalAmount // Pass verified amount logic
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success("Order Placed Successfully!");
                            setCart(null); // Clear cart locally or fetch
                            navigate('/profile');
                        } catch (err) {
                            toast.error("Payment Verification Failed");
                        }
                    },
                    prefill: {
                        name: currentUser.displayName || "User",
                        email: currentUser.email || "user@example.com",
                        contact: currentUser.phoneNumber
                    },
                    theme: {
                        color: "#2563EB"
                    }
                };
                const rzp1 = new window.Razorpay(options);
                rzp1.open();

            } catch (error) {
                console.error(error);
                toast.error("Checkout Failed");
            }
        };
        document.body.appendChild(script);
    };

    if (!currentUser) return <div className="text-center py-20">Please Login to view Cart</div>;
    if (!cart || cart.CartItems.length === 0) return <div className="text-center py-20">Your Cart is Empty</div>;

    const subtotal = cart.CartItems.reduce((acc, item) => acc + (parseFloat(item.Product.price) * item.quantity), 0);
    const total = subtotal - discount;

    return (
        <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 bg-white p-6 rounded shadow">
                    {cart.CartItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between border-b py-4">
                            <div className="flex items-center gap-4">
                                {item.Product.images && item.Product.images.length > 0 && <img src={getImageUrl(item.Product.images[0])} className="w-16 h-16 object-cover rounded" />}
                                <div>
                                    <h3 className="font-bold">{item.Product.name}</h3>
                                    <p className="text-gray-500">₹{item.Product.price}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, e.target.value)}
                                    className="w-16 border p-1 rounded"
                                />
                                <button onClick={() => removeItem(item.id)} className="text-red-600"><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-full md:w-1/3 bg-white p-6 rounded shadow h-fit">
                    <h3 className="text-lg font-bold mb-4">Summary</h3>
                    <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between mb-2 text-green-600">
                            <span>Discount</span>
                            <span>-₹{discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-xl border-t pt-4 mt-4">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>

                    <div className="mt-6">
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Coupon Code"
                                className="border p-2 rounded flex-1"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button onClick={applyCoupon} className="bg-gray-800 text-white px-4 py-2 rounded">Apply</button>
                        </div>
                        <button onClick={handleCheckout} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
