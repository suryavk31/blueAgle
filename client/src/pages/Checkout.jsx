import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaTruck, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import AddressForm from '../components/AddressForm';

const Checkout = () => {
    const { currentUser } = useAuth();
    const { cartItems, subtotal, itemCount, clearCart } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Online');
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const navigate = useNavigate();

    const fetchAddresses = async () => {
        if (!currentUser) return;
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.get('http://localhost:5000/api/addresses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(res.data);
            const def = res.data.find(a => a.isDefault);
            if (def) setSelectedAddress(def);
            else if (res.data.length > 0) setSelectedAddress(res.data[0]);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchAddresses();
        }
    }, [currentUser]);

    useEffect(() => {
        if (itemCount === 0 && !loading) {
            navigate('/products');
        }
    }, [itemCount]);

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.warning("Please select a delivery address");
            return;
        }

        setLoading(true);
        try {
            const token = await currentUser.getIdToken();
            
            if (paymentMethod === 'COD') {
                const res = await axios.post('http://localhost:5000/api/orders/cod', {
                    address: selectedAddress,
                    couponCode: appliedCoupon?.code || null,
                    items: cartItems
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Order Placed Successfully!");
                clearCart();
                navigate('/profile');
            } else {
                // Razorpay Flow
                const orderRes = await axios.post('http://localhost:5000/api/orders/create-order', {
                    couponCode: appliedCoupon?.code || null,
                    address: selectedAddress,
                    items: cartItems
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                    amount: orderRes.data.amount,
                    currency: orderRes.data.currency,
                    name: "BlueAgle",
                    description: "Order Payment",
                    order_id: orderRes.data.id,
                    handler: async function (response) {
                        try {
                            await axios.post('http://localhost:5000/api/orders/verify-payment', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                address: selectedAddress,
                                couponCode: appliedCoupon?.code || null,
                                amount: orderRes.data.totalAmount,
                                items: cartItems
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success("Order Placed Successfully!");
                            clearCart();
                            navigate('/profile');
                        } catch (err) {
                            toast.error("Payment Verification Failed");
                        }
                    },
                    prefill: {
                        name: currentUser.displayName || "User",
                        contact: currentUser.phoneNumber
                    },
                    theme: { color: "#3c006b" }
                };
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Order Placement Failed");
        } finally {
            setLoading(false);
        }
    };

    const handlingCharge = 0;
    const deliveryFee = 0;
    const total = subtotal - discount + handlingCharge + deliveryFee;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                        <FaArrowLeft />
                    </button>
                    <h1 className="text-xl font-black text-gray-800 tracking-tight">Checkout</h1>
                    <div className="ml-auto flex items-center gap-2">
                        <FaShieldAlt className="text-[#1a7428]" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:block">100% Secure</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Address & Payment */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* 1. Delivery Address */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-100 transition-colors"></div>
                            
                            <div className="flex items-center justify-between mb-6 relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <h2 className="text-lg font-black text-gray-800">Delivery Address</h2>
                                </div>
                                <button 
                                    onClick={() => setShowAddressForm(true)}
                                    className="text-sm font-bold text-[#ff3269] bg-pink-50 px-4 py-2 rounded-xl hover:bg-pink-100 transition-colors"
                                >
                                    {selectedAddress ? 'Change Address' : '+ New Address'}
                                </button>
                            </div>

                            {selectedAddress ? (
                                <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 relative">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-gray-100 text-gray-500">
                                            {selectedAddress.label}
                                        </span>
                                        {selectedAddress.isDefault && (
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 text-emerald-600">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-bold text-gray-800 mb-1">{selectedAddress.flatNo}</p>
                                    <p className="text-sm text-gray-500 leading-relaxed">{selectedAddress.area}</p>
                                    {selectedAddress.landmark && (
                                        <p className="text-xs text-gray-400 mt-1 italic">Near {selectedAddress.landmark}</p>
                                    )}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <p className="text-sm font-bold text-gray-700">{selectedAddress.contactName}</p>
                                        <p className="text-sm text-gray-500">{selectedAddress.contactPhone}</p>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setShowAddressForm(true)}
                                    className="w-full py-12 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-gray-400"
                                >
                                    <FaMapMarkerAlt className="text-3xl" />
                                    <span className="font-bold">Add a delivery address to proceed</span>
                                </button>
                            )}
                        </div>

                        {/* 2. Payment Method */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
                                    <FaCreditCard />
                                </div>
                                <h2 className="text-lg font-black text-gray-800">Payment Option</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setPaymentMethod('Online')}
                                    className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-start gap-3 group ${paymentMethod === 'Online' ? 'border-[#3c006b] bg-purple-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'Online' ? 'border-[#3c006b] bg-[#3c006b] text-white' : 'border-gray-300'}`}>
                                        {paymentMethod === 'Online' && <FaCheckCircle className="text-[10px]" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Online Payment</h3>
                                        <p className="text-xs text-gray-500 mt-1">UPI, CC/DC, Netbanking</p>
                                    </div>
                                    <FaCreditCard className={`absolute bottom-5 right-5 text-2xl transition-all ${paymentMethod === 'Online' ? 'text-[#3c006b]' : 'text-gray-200'}`} />
                                </button>

                                <button 
                                    onClick={() => setPaymentMethod('COD')}
                                    className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-start gap-3 group ${paymentMethod === 'COD' ? 'border-[#3c006b] bg-purple-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'COD' ? 'border-[#3c006b] bg-[#3c006b] text-white' : 'border-gray-300'}`}>
                                        {paymentMethod === 'COD' && <FaCheckCircle className="text-[10px]" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Cash on Delivery</h3>
                                        <p className="text-xs text-gray-500 mt-1">Pay when your order arrives</p>
                                    </div>
                                    <FaMoneyBillWave className={`absolute bottom-5 right-5 text-2xl transition-all ${paymentMethod === 'COD' ? 'text-[#3c006b]' : 'text-gray-200'}`} />
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4 sticky top-24">
                        <div className="bg-[#1a1a4e] rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mb-24 blur-3xl"></div>
                            
                            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                                <FaTruck className="text-pink-400" /> Order Summary
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm opacity-80">
                                    <span>Items ({itemCount})</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm opacity-80">
                                    <span>Delivery Fee</span>
                                    <span className="text-emerald-400 font-bold">FREE</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-400 font-bold">
                                        <span>Discount</span>
                                        <span>- ₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                    <span className="font-bold">Total Amount</span>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-white leading-none">₹{total.toFixed(0)}</p>
                                        <p className="text-[10px] opacity-60 mt-1">Inclusive of all taxes</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || !selectedAddress}
                                className="w-full bg-[#ff3269] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#ff1b58] transition-all shadow-lg shadow-pink-500/20 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mb-4"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>{paymentMethod === 'COD' ? 'Place Order (COD)' : `Pay ₹${total.toFixed(0)}`}</span>
                                )}
                            </button>

                            <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-pink-400 shrink-0">
                                    <FaShieldAlt size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-pink-300">Fast & Secure Delivery</p>
                                    <p className="text-[9px] opacity-60 mt-0.5 leading-relaxed">By placing your order, you agree to BlueAgle's terms of service and privacy policy.</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="mt-6 bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                                Review Items ({itemCount})
                            </h3>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-gray-50 flex-shrink-0 border border-gray-100 overflow-hidden p-1">
                                            <img src={getImageUrl(item.images[0])} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                            <p className="text-sm font-black text-[#1a7428] mt-1">₹{(item.price * item.quantity).toFixed(0)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Address Form Modal */}
            {showAddressForm && (
                <AddressForm
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    onSelect={(addr) => { setSelectedAddress(addr); setShowAddressForm(false); }}
                    onClose={() => setShowAddressForm(false)}
                    onRefresh={() => fetchAddresses()}
                />
            )}
        </div>
    );
};

export default Checkout;
