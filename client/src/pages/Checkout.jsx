import React, { useState, useEffect } from 'react';
import { trackBeginCheckout, trackPurchase } from '../utils/gaTracker';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaTruck, FaArrowLeft, FaCheckCircle, FaRocket, FaGift } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import AddressForm from '../components/AddressForm';

const Checkout = () => {
    const { currentUser } = useAuth();
    const { cartItems, subtotal, itemCount, clearCart } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Online');
    const [deliveryMethod, setDeliveryMethod] = useState('Standard');
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [deliveryCalculation, setDeliveryCalculation] = useState({
        subtotal: subtotal,
        discountAmount: 0,
        deliveryCharge: 49.00,
        taxAmount: 0.00,
        totalAmount: subtotal + 49.00,
        deliveryMethod: 'Standard',
        isFreeDelivery: false,
        amountForFreeDelivery: 999.00,
        freeDeliveryThreshold: 999.00,
        freeDeliveryEnabled: true,
        expressDeliveryEnabled: false,
        currencySymbol: '₹',
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            toast.info("Please login to proceed to checkout");
            navigate('/login');
        }
    }, [currentUser]);

    const fetchAddresses = async () => {
        if (!currentUser) return;
        try {
            const token = await currentUser.getIdToken();
            const res = await api.get('/addresses', {
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

    const fetchDeliveryCalculation = async () => {
        try {
            const payload = {
                items: cartItems,
                couponCode: appliedCoupon?.code || null,
                deliveryMethod: deliveryMethod,
            };
            const res = await api.post('/delivery/calculate', payload);
            if (res.data) {
                setDeliveryCalculation({
                    subtotal: parseFloat(res.data.subtotal) || subtotal,
                    discountAmount: parseFloat(res.data.discountAmount) || 0,
                    deliveryCharge: parseFloat(res.data.deliveryCharge) || 0,
                    taxAmount: parseFloat(res.data.taxAmount) || 0,
                    totalAmount: parseFloat(res.data.totalAmount) || subtotal,
                    deliveryMethod: res.data.deliveryMethod || 'Standard',
                    isFreeDelivery: Boolean(res.data.isFreeDelivery),
                    amountForFreeDelivery: parseFloat(res.data.amountForFreeDelivery) || 0,
                    freeDeliveryThreshold: parseFloat(res.data.freeDeliveryThreshold) || 999,
                    freeDeliveryEnabled: Boolean(res.data.freeDeliveryEnabled),
                    expressDeliveryEnabled: Boolean(res.data.expressDeliveryEnabled),
                    currencySymbol: res.data.currencySymbol || '₹',
                });
            }
        } catch (err) {
            console.error('Error calculating delivery & total:', err);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchAddresses();
        }
    }, [currentUser]);

    useEffect(() => {
        if (cartItems.length > 0) {
            fetchDeliveryCalculation();
        }
    }, [cartItems, appliedCoupon, deliveryMethod]);

    useEffect(() => {
        if (itemCount === 0 && !loading && !orderSuccess) {
            navigate('/products');
        }
    }, [itemCount, loading, orderSuccess]);

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.warning("Please select a delivery address");
            return;
        }

        setLoading(true);
        try {
            const token = await currentUser.getIdToken();

            if (paymentMethod === 'COD') {
                const res = await api.post('/orders/cod', {
                    address: selectedAddress,
                    couponCode: appliedCoupon?.code || null,
                    deliveryMethod: deliveryMethod,
                    items: cartItems
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Order Placed Successfully!");
                if (res.data?.order) {
                    trackPurchase({
                        ...res.data.order,
                        shippingFee: deliveryFee,
                        deliveryFee: deliveryFee,
                    });
                }
                setOrderSuccess(true);
                clearCart();
                navigate('/profile');
            } else {
                // Razorpay Flow
                const orderRes = await api.post('/orders/create-order', {
                    couponCode: appliedCoupon?.code || null,
                    deliveryMethod: deliveryMethod,
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
                            const verifyRes = await api.post('/orders/verify-payment', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                address: selectedAddress,
                                couponCode: appliedCoupon?.code || null,
                                deliveryMethod: deliveryMethod,
                                amount: orderRes.data.totalAmount,
                                items: cartItems
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            toast.success("Order Placed Successfully!");
                            if (verifyRes.data?.order || orderRes.data?.order) {
                                trackPurchase({
                                    ...(verifyRes.data?.order || orderRes.data?.order),
                                    shippingFee: deliveryFee,
                                    deliveryFee: deliveryFee,
                                });
                            }
                            setOrderSuccess(true);
                            clearCart();
                            navigate('/profile');
                        } catch (error) {
                            console.error(error);
                            toast.error("Payment verification failed");
                        }
                    },
                    prefill: {
                        name: selectedAddress.contactName || currentUser.displayName || "Customer",
                        contact: selectedAddress.contactPhone || currentUser.phoneNumber || ""
                    },
                    theme: { color: "#3c006b" }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    const deliveryFee = deliveryCalculation.deliveryCharge;
    const finalTotal = deliveryCalculation.totalAmount;
    const progressPercent = Math.min(100, Math.round((subtotal / deliveryCalculation.freeDeliveryThreshold) * 100));

    return (
        <div className="bg-[#f8fafc] min-h-screen py-6 px-2 sm:px-4 md:px-8 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Top Nav / Back */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/products')}
                        className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-xs"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Checkout</h1>
                        <p className="text-xs text-gray-400 font-medium">Complete your order with secure delivery &amp; payment options</p>
                    </div>
                </div>

                {/* Free Shipping Banner */}
                {deliveryCalculation.freeDeliveryEnabled && (
                    <div className="mb-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-3 sm:p-4 shadow-md border border-purple-800">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5 text-xs font-extrabold">
                                <FaGift className="text-amber-400 text-base" />
                                <span>
                                    {deliveryCalculation.isFreeDelivery ? (
                                        '🎉 FREE Delivery Unlocked for your order!'
                                    ) : (
                                        `Add ${deliveryCalculation.currencySymbol}${deliveryCalculation.amountForFreeDelivery.toFixed(0)} more for FREE Delivery`
                                    )}
                                </span>
                            </div>
                            <span className="text-[11px] font-extrabold bg-white/10 px-3 py-1 rounded-full border border-white/10 shrink-0">
                                {progressPercent}% Completed
                            </span>
                        </div>
                        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-2.5">
                            <div
                                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Address & Payment Selection */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 1. Delivery Address */}
                        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-[#ff3269] border border-rose-100/50">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-800">Delivery Address</h2>
                                        <p className="text-xs text-gray-400">Select where you want your order delivered</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddressForm(true)}
                                    className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all"
                                >
                                    {selectedAddress ? 'Change Address' : '+ Add Address'}
                                </button>
                            </div>

                            {selectedAddress ? (
                                <div className="bg-gray-50/60 rounded-2xl p-5 border border-gray-100 relative">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-[#3c006b] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                                            {selectedAddress.label || 'Home'}
                                        </span>
                                        {selectedAddress.isDefault && (
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                Default Address
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 mb-1">{selectedAddress.flatNo}, {selectedAddress.area}</p>
                                    {selectedAddress.landmark && <p className="text-xs text-gray-500 mb-1">Landmark: {selectedAddress.landmark}</p>}
                                    <div className="mt-4 pt-4 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-600">
                                        <span>Recipient: <strong>{selectedAddress.contactName || 'Customer'}</strong></span>
                                        <span>Contact: <strong>{selectedAddress.contactPhone || 'N/A'}</strong></span>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAddressForm(true)}
                                    className="w-full py-12 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-gray-400"
                                >
                                    <FaMapMarkerAlt className="text-3xl" />
                                    <span className="font-bold text-sm">Add a delivery address to proceed</span>
                                </button>
                            )}
                        </div>

                        {/* 2. Delivery Options */}
                        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                                    <FaTruck />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-800">Delivery Options</h2>
                                    <p className="text-xs text-gray-400">Choose preferred delivery speed</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setDeliveryMethod('Standard')}
                                    className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 ${
                                        deliveryMethod === 'Standard' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                                            <FaTruck className="text-indigo-600" /> Standard Delivery
                                        </span>
                                        <span className={`text-xs font-black ${deliveryCalculation.isFreeDelivery ? 'text-emerald-600' : 'text-gray-800'}`}>
                                            {deliveryCalculation.isFreeDelivery ? 'FREE' : `${deliveryCalculation.currencySymbol}49`}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">Delivered within 2–4 business days</p>
                                </button>

                                {deliveryCalculation.expressDeliveryEnabled && (
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('Express')}
                                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 ${
                                            deliveryMethod === 'Express' ? 'border-amber-500 bg-amber-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                                                <FaRocket className="text-amber-500" /> Express Delivery
                                            </span>
                                            <span className="text-xs font-black text-gray-800">
                                                {deliveryCalculation.currencySymbol}99
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">Express delivery within 24 hours</p>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 3. Payment Method */}
                        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 shadow-sm border border-gray-100">
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
                                        <p className="text-xs text-gray-500 mt-1">UPI, Credit/Debit Cards, Netbanking</p>
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
                                        <p className="text-xs text-gray-500 mt-1">Pay when your order is delivered</p>
                                    </div>
                                    <FaMoneyBillWave className={`absolute bottom-5 right-5 text-2xl transition-all ${paymentMethod === 'COD' ? 'text-[#3c006b]' : 'text-gray-200'}`} />
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4 sticky top-24">
                        <div className="bg-[#1a1a4e] rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mb-24 blur-3xl"></div>

                            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                                <FaTruck className="text-pink-400" /> Order Summary
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm opacity-80">
                                    <span>Items Subtotal ({itemCount})</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-sm opacity-80">
                                    <span>Delivery Charge ({deliveryCalculation.deliveryMethod})</span>
                                    <span className={`font-bold ${deliveryFee === 0 ? 'text-emerald-400' : 'text-white'}`}>
                                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                                    </span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-400 font-bold">
                                        <span>Coupon Discount</span>
                                        <span>- ₹{discount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                    <span className="font-bold">Grand Total</span>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-white leading-none">₹{finalTotal.toFixed(0)}</p>
                                        <p className="text-[10px] opacity-60 mt-1">Inclusive of all taxes &amp; delivery</p>
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
                                        <span>Processing Order...</span>
                                    </>
                                ) : (
                                    <span>{paymentMethod === 'COD' ? `Place Order (COD ₹${finalTotal.toFixed(0)})` : `Pay ₹${finalTotal.toFixed(0)}`}</span>
                                )}
                            </button>

                            <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-pink-400 shrink-0">
                                    <FaShieldAlt size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-pink-300">Fast &amp; Secure Delivery</p>
                                    <p className="text-[9px] opacity-60 mt-0.5 leading-relaxed">By placing your order, you agree to BlueAgle's terms of service and privacy policy.</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="mt-4 bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 border border-gray-100 shadow-sm">
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
