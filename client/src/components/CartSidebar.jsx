import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaMinus, FaPlus, FaTag, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaTruck, FaReceipt } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import AddressForm from './AddressForm';

const CartSidebar = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const { cartItems, updateQuantity, removeFromCart, itemCount, subtotal, subtotalMrp } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [showCoupon, setShowCoupon] = useState(false);
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
        if (isOpen && currentUser) {
            fetchAddresses();
        }
    }, [isOpen, currentUser]);

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        if (!currentUser) {
            toast.warning('Please login to apply coupons');
            return;
        }
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.post('http://localhost:5000/api/coupons/verify', { code: couponCode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const coupon = res.data;
            let disc = 0;
            if (coupon.discountType === 'fixed') {
                disc = parseFloat(coupon.value);
            } else if (coupon.discountType === 'percentage') {
                disc = (subtotal * parseFloat(coupon.value)) / 100;
            }
            setDiscount(disc);
            setAppliedCoupon(coupon);
            toast.success(`Coupon "${coupon.code}" applied!`);
        } catch (error) {
            setDiscount(0);
            setAppliedCoupon(null);
            toast.error(error.response?.data?.message || "Invalid Coupon");
        }
    };

    const removeCoupon = () => {
        setDiscount(0);
        setAppliedCoupon(null);
        setCouponCode('');
    };

    if (!isOpen) return null;

    const handlingCharge = 0;
    const deliveryFee = 0;
    const total = subtotal - discount + handlingCharge + deliveryFee;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-[90]" onClick={onClose}></div>

            {/* Sidebar */}
            <div className="fixed inset-0 md:inset-auto md:right-0 md:top-0 md:w-[420px] md:h-full bg-[#f5f7fd] z-[100] flex flex-col shadow-2xl animate-slide-in">

                {/* Header */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
                    <h2 className="text-lg font-bold text-gray-800">My Cart</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className="text-6xl mb-4">🛒</div>
                            <p className="text-gray-500 font-medium">Your cart is empty</p>
                            <p className="text-gray-400 text-sm mt-1">Add items to get started</p>
                            <button onClick={onClose} className="mt-4 bg-[#ff3269] text-white px-6 py-2 rounded-lg font-bold text-sm">Browse Products</button>
                        </div>
                    ) : (
                        <div className="space-y-2 p-3">

                            {/* Cart Items */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <FaTruck className="text-blue-500" />
                                    <span className="font-semibold">Scheduled Delivery</span>
                                    <span className="ml-auto text-xs text-gray-400">{itemCount} item{itemCount > 1 ? 's' : ''}</span>
                                </div>

                                {cartItems.map(item => {
                                    const itemPrice = item.price * item.quantity;
                                    const mrpVal = item.mrp ? parseFloat(item.mrp) : (item.price * 1.2);
                                    const itemMrp = Math.round(mrpVal) * item.quantity;
                                    return (
                                        <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                                            {/* Image */}
                                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                                                {item.images?.[0] ? (
                                                    <img src={getImageUrl(item.images[0])} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h4>
                                                <p className="text-xs text-gray-400 truncate">{item.description || '1 pack'}</p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-0 border border-[#ff3269] rounded-lg overflow-hidden shrink-0">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-[#ff3269] hover:bg-pink-50 text-xs">
                                                    <FaMinus />
                                                </button>
                                                <span className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[#ff3269] bg-pink-50">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-[#ff3269] hover:bg-pink-50 text-xs">
                                                    <FaPlus />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right shrink-0 w-16">
                                                <div className="text-sm font-bold text-gray-800">₹{itemPrice.toFixed(0)}</div>
                                                <div className="text-[10px] text-gray-400 line-through">₹{itemMrp}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Coupon Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                <button onClick={() => setShowCoupon(!showCoupon)} className="w-full flex items-center justify-between px-4 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <FaTag className="text-blue-500" />
                                        <span className="font-semibold text-sm text-gray-700">
                                            {appliedCoupon ? `"${appliedCoupon.code}" applied` : 'Apply Coupon'}
                                        </span>
                                    </div>
                                    {showCoupon ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
                                </button>

                                {showCoupon && (
                                    <div className="px-4 pb-4">
                                        {appliedCoupon ? (
                                            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                                <div>
                                                    <span className="text-sm font-bold text-green-700">{appliedCoupon.code}</span>
                                                    <span className="text-xs text-green-600 ml-2">- ₹{discount.toFixed(2)} OFF</span>
                                                </div>
                                                <button onClick={removeCoupon} className="text-red-500 text-xs font-bold">Remove</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter coupon code"
                                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                                                    value={couponCode}
                                                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                />
                                                <button onClick={applyCoupon} className="bg-[#1a1a4e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#2a2a5e]">
                                                    Apply
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Bill Summary */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaReceipt className="text-gray-500" />
                                    <h4 className="font-bold text-sm text-gray-700">Bill Summary</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Item Total</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 line-through text-xs">₹{Math.round(subtotalMrp)}</span>
                                            <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Handling Charge</span>
                                        <span className="font-semibold">₹{handlingCharge.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Delivery Fee</span>
                                        <span className="font-semibold text-green-600">{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Coupon Discount</span>
                                            <span className="font-semibold">- ₹{discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <hr className="border-gray-100" />
                                    <div className="flex justify-between font-bold text-base">
                                        <span>Total Bill</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400">Incl. all taxes and charges</p>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-[#ff3269]" />
                                        <span className="font-bold text-sm text-gray-700">Delivering to...</span>
                                    </div>
                                    <button onClick={() => setShowAddressForm(true)} className="text-blue-600 text-xs font-bold">{selectedAddress ? 'Change' : '+ Add'}</button>
                                </div>
                                {selectedAddress ? (
                                    <p className="text-xs text-gray-500 ml-6">{selectedAddress.label} - {selectedAddress.flatNo}, {selectedAddress.area}</p>
                                ) : (
                                    <p className="text-xs text-gray-400 ml-6">No address selected. Add one to proceed.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer */}
                {cartItems.length > 0 && (
                    <div className="bg-white border-t border-gray-200 p-3 shrink-0">
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/checkout');
                            }}
                            className="w-full bg-[#1a1a4e] text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#2a2a5e] transition-colors shadow-lg"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
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
        </>
    );
};

export default CartSidebar;
