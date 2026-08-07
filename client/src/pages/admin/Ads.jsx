import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';
import { FaTrash, FaEdit, FaEye, FaMousePointer, FaChartLine, FaShoppingBag, FaBullhorn, FaPlus, FaSave, FaTimes, FaImage, FaVideo } from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageHelper';

const Ads = () => {
    const [ads, setAds] = useState([]);
    const [formData, setFormData] = useState({
        title: '', type: 'banner', mediaType: 'image', redirectUrl: '', location: 'home-top', isActive: true
    });
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const fetchAds = async () => {
        try {
            const res = await adminApi.get('/ads/admin');
            setAds(res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (mediaFile) data.append('media', mediaFile);

        try {
            if (editingId) {
                await adminApi.put(`/ads/${editingId}`, data);
                toast.success("Ad Updated Successfully");
            } else {
                await adminApi.post('/ads', data);
                toast.success("Ad Created Successfully");
            }

            cancelEdit();
            fetchAds();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error saving ad");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this ad?")) return;
        try {
            await adminApi.delete(`/ads/${id}`);
            toast.success("Ad Deleted");
            fetchAds();
        } catch (error) {
            toast.error("Error deleting ad");
        }
    };

    const handleEdit = (ad) => {
        setEditingId(ad.id);
        setFormData({
            title: ad.title,
            type: ad.type,
            mediaType: ad.mediaType,
            redirectUrl: ad.redirectUrl || '',
            location: ad.location,
            isActive: ad.isActive
        });
        setMediaPreview(ad.mediaUrl ? getImageUrl(ad.mediaUrl) : null);
        setMediaFile(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            title: '', type: 'banner', mediaType: 'image', redirectUrl: '', location: 'home-top', isActive: true
        });
        setMediaFile(null);
        setMediaPreview(null);
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaBullhorn className="text-indigo-600" /> Advertisements &amp; Banners
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Create and manage marketing banners, promo popups, and ad placements.</p>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {editingId ? <><FaEdit className="text-indigo-500" /> Edit Campaign</> : <><FaPlus className="text-indigo-500" /> New Ad Campaign</>}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
                        <div>
                            <label className="block mb-1 font-bold">Campaign Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="e.g. Festival Special Offer 50% Off"
                                className="w-full bg-gray-50 border p-3 rounded-xl focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-bold">Ad Format / Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-gray-50 border p-3 rounded-xl focus:outline-none"
                            >
                                <option value="banner">Hero Banner</option>
                                <option value="popup">Promo Popup</option>
                                <option value="card">Feature Card</option>
                                <option value="interstitial">Interstitial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-bold">Media Type</label>
                            <select
                                value={formData.mediaType}
                                onChange={e => setFormData({ ...formData, mediaType: e.target.value })}
                                className="w-full bg-gray-50 border p-3 rounded-xl focus:outline-none"
                            >
                                <option value="image">Image (JPG, PNG, WEBP)</option>
                                <option value="video">Video (MP4, WEBM)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-bold">Display Location</label>
                            <select
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-gray-50 border p-3 rounded-xl focus:outline-none"
                            >
                                <option value="home-top">Home Top Carousel</option>
                                <option value="home-middle">Home Middle Banner</option>
                                <option value="category-list">Category List Interstitial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-bold">Target Destination URL</label>
                            <input
                                type="text"
                                value={formData.redirectUrl}
                                onChange={e => setFormData({ ...formData, redirectUrl: e.target.value })}
                                placeholder="/products?categoryId=2"
                                className="w-full bg-gray-50 border p-3 rounded-xl focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-bold">Upload Media File</label>
                            <input
                                type="file"
                                accept={formData.mediaType === 'video' ? 'video/*' : 'image/*'}
                                onChange={handleMediaChange}
                                className="w-full bg-gray-50 border p-2.5 rounded-xl text-xs"
                            />
                        </div>
                    </div>

                    {mediaPreview && (
                        <div className="mt-4">
                            <label className="block text-xs font-bold mb-2">Media Preview</label>
                            <div className="w-full max-w-xs h-36 rounded-xl overflow-hidden border bg-black flex items-center justify-center">
                                {formData.mediaType === 'video' ? (
                                    <video src={mediaPreview} className="w-full h-full object-cover" controls />
                                ) : (
                                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            <span className="ml-3 text-xs font-bold text-gray-700">
                                Campaign is {formData.isActive ? <span className="text-emerald-600">Active</span> : <span className="text-gray-500">Paused</span>}
                            </span>
                        </label>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                            >
                                <FaSave /> {editingId ? 'Update Campaign' : 'Launch Campaign'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Ads List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {ads.map(ad => (
                    <div key={ad.id} className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-all">
                        <div className="h-40 bg-gray-900 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute top-3 left-3 z-10">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${ad.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
                                    {ad.isActive ? 'Active' : 'Paused'}
                                </span>
                            </div>

                            <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                                <button onClick={() => handleEdit(ad)} className="w-8 h-8 bg-white/90 text-indigo-600 rounded-lg flex items-center justify-center shadow-md hover:bg-white">
                                    <FaEdit size={12} />
                                </button>
                                <button onClick={() => handleDelete(ad.id)} className="w-8 h-8 bg-white/90 text-rose-600 rounded-lg flex items-center justify-center shadow-md hover:bg-rose-500 hover:text-white">
                                    <FaTrash size={12} />
                                </button>
                            </div>

                            {ad.mediaType === 'video' ? (
                                <video src={getImageUrl(ad.mediaUrl)} className="w-full h-full object-cover" controls />
                            ) : (
                                <img src={getImageUrl(ad.mediaUrl)} alt={ad.title} className="w-full h-full object-cover" />
                            )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <h4 className="font-extrabold text-gray-900 text-sm truncate">{ad.title}</h4>
                                <p className="text-[11px] text-gray-400 font-medium uppercase mt-0.5">{ad.type} &middot; {ad.location}</p>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-bold">
                                <span className="flex items-center gap-1"><FaEye className="text-indigo-500" /> {ad.impressions || 0} Views</span>
                                <span className="flex items-center gap-1"><FaMousePointer className="text-emerald-500" /> {ad.clicks || 0} Clicks</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Ads;
