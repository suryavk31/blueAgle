import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaTimes, FaHome, FaBriefcase, FaHotel, FaEllipsisH, FaCheck } from 'react-icons/fa';

const LABELS = [
    { value: 'Home', icon: FaHome, color: 'bg-orange-100 text-orange-600 border-orange-300' },
    { value: 'Work', icon: FaBriefcase, color: 'bg-blue-100 text-blue-600 border-blue-300' },
    { value: 'Hotel', icon: FaHotel, color: 'bg-purple-100 text-purple-600 border-purple-300' },
    { value: 'Other', icon: FaEllipsisH, color: 'bg-gray-100 text-gray-600 border-gray-300' },
];

const AddressForm = ({ addresses, selectedAddress, onSelect, onClose, onRefresh }) => {
    const { currentUser } = useAuth();
    const [showForm, setShowForm] = useState(addresses.length === 0);
    const [label, setLabel] = useState('Home');
    const [flatNo, setFlatNo] = useState('');
    const [floor, setFloor] = useState('');
    const [area, setArea] = useState('');
    const [landmark, setLandmark] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const err = {};
        if (!flatNo.trim()) err.flatNo = 'Flat/House number is required';
        if (!area.trim()) err.area = 'Area/Sector/Locality is required';
        if (!contactName.trim()) err.contactName = 'Name is required';
        else if (contactName.trim().length < 2) err.contactName = 'Name must be at least 2 characters';
        if (contactPhone && !/^[6-9]\d{9}$/.test(contactPhone.trim())) {
            err.contactPhone = 'Enter a valid 10-digit phone number';
        }
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.post('http://localhost:5000/api/addresses', {
                label, flatNo, floor, area, landmark, contactName, contactPhone,
                isDefault: addresses.length === 0
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Address saved!');
            await onRefresh();
            onSelect(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`http://localhost:5000/api/addresses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Address deleted');
            await onRefresh();
            if (selectedAddress?.id === id) onSelect(null);
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    const resetForm = () => {
        setLabel('Home');
        setFlatNo('');
        setFloor('');
        setArea('');
        setLandmark('');
        setContactName('');
        setContactPhone('');
        setErrors({});
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center md:justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
            <div className="relative w-full h-full md:w-[420px] md:h-full bg-white md:shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <h3 className="font-bold text-lg text-gray-800">
                        {showForm ? 'Enter Complete Address' : 'Select Address'}
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {showForm ? (
                        /* Address Form */
                        <div className="p-5 space-y-5">
                            {/* Label Selector */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Save address as*</label>
                                <div className="flex gap-2">
                                    {LABELS.map(l => {
                                        const Icon = l.icon;
                                        const active = label === l.value;
                                        return (
                                            <button
                                                key={l.value}
                                                onClick={() => setLabel(l.value)}
                                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all ${active ? l.color + ' ring-2 ring-offset-1 ring-blue-400' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                <Icon className="text-sm" />
                                                {l.value}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Flat No */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Flat / House no / Building name *"
                                    value={flatNo}
                                    onChange={e => setFlatNo(e.target.value)}
                                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.flatNo ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                />
                                {errors.flatNo && <p className="text-red-500 text-xs mt-1">{errors.flatNo}</p>}
                            </div>

                            {/* Floor */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Floor (optional)"
                                    value={floor}
                                    onChange={e => setFloor(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {/* Area */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Area / Sector / Locality*</label>
                                <input
                                    type="text"
                                    placeholder="e.g. MG Road, Sector 12"
                                    value={area}
                                    onChange={e => setArea(e.target.value)}
                                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.area ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                />
                                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                            </div>

                            {/* Landmark */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Nearby landmark (optional)"
                                    value={landmark}
                                    onChange={e => setLandmark(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {/* Divider */}
                            <div>
                                <p className="text-xs text-gray-400 mb-3">Enter your details for a seamless delivery experience</p>
                            </div>

                            {/* Contact Name */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Your Name *"
                                    value={contactName}
                                    onChange={e => setContactName(e.target.value)}
                                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.contactName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                />
                                {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>}
                            </div>

                            {/* Contact Phone */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Your phone number (optional)"
                                    value={contactPhone}
                                    onChange={e => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.contactPhone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                />
                                {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>}
                            </div>
                        </div>
                    ) : (
                        /* Address List */
                        <div className="p-4 space-y-3">
                            {addresses.map(addr => (
                                <div
                                    key={addr.id}
                                    onClick={() => onSelect(addr)}
                                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedAddress?.id === addr.id ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'}`}>
                                        {selectedAddress?.id === addr.id && <FaCheck className="text-[8px]" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{addr.label}</span>
                                            {addr.isDefault && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Default</span>}
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1">{addr.flatNo}{addr.floor ? `, Floor ${addr.floor}` : ''}</p>
                                        <p className="text-sm text-gray-500">{addr.area}</p>
                                        {addr.landmark && <p className="text-xs text-gray-400">Near: {addr.landmark}</p>}
                                        <p className="text-xs text-gray-500 mt-1">{addr.contactName}{addr.contactPhone ? ` • ${addr.contactPhone}` : ''}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}
                                        className="text-red-400 hover:text-red-600 text-xs p-1"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={() => { resetForm(); setShowForm(true); }}
                                className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-all"
                            >
                                + Add New Address
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom Button */}
                {showForm && (
                    <div className="shrink-0 p-4 border-t border-gray-100">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-[#1a1a4e] text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#2a2a5e] transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Address'}
                        </button>
                        {addresses.length > 0 && (
                            <button
                                onClick={() => setShowForm(false)}
                                className="w-full text-gray-500 text-sm mt-2 py-2"
                            >
                                ← Back to saved addresses
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressForm;
