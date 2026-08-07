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
            setAds(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (currentUser) fetchAds();
    }, [currentUser]);

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
        setFormData({
            title: ad.title,
            type: ad.type,
            mediaType: ad.mediaType,
            redirectUrl: ad.redirectUrl,
            location: ad.location,
            isActive: ad.isActive
        });
        setEditingId(ad.id);
        setMediaFile(null);
        setMediaPreview(ad.mediaUrl ? getImageUrl(ad.mediaUrl) : null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ title: '', type: 'banner', mediaType: 'image', redirectUrl: '', location: 'home-top', isActive: true });
        setMediaFile(null);
        setMediaPreview(null);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaBullhorn className="text-indigo-600" /> Advertising & Campaigns
                    </h2>
                    <p className="text-gray-500 font-medium">Manage promotional banners, track ad performance, and drive engagement.</p>
                </div>
            </div>

            {/* Main Form Section */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative text-left transition-all">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {editingId ? <><FaEdit className="text-indigo-500" /> Edit Campaign</> : <><FaPlus className="text-indigo-500" /> Create New Campaign</>}
                    </h3>
                    {editingId && (
                        <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Editing Mode Active</span>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-8 items-start">
                    {/* Media Upload Box */}
                    <div className="w-full xl:w-1/3 shrink-0">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Campaign Media ({formData.mediaType})</label>
                        <label className="relative flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden group transition-all">
                            {mediaPreview ? (
                                <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                                    {formData.mediaType === 'video' ? (
                                        <video src={mediaPreview} className="w-full max-h-full object-contain" controls />
                                    ) : (
                                        <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <p className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Change Media</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                                        {formData.mediaType === 'video' ? <FaVideo size={24} /> : <FaImage size={24} />}
                                    </div>
                                    <p className="text-sm text-gray-700 font-bold mb-1">Upload {formData.mediaType === 'video' ? 'Video' : 'Image'}</p>
                                    <p className="text-xs text-gray-500 font-medium">Click or drag and drop</p>
                                </div>
                            )}
                            <input type="file" className="hidden" onChange={handleMediaChange} accept={formData.mediaType === 'video' ? 'video/*' : 'image/*'} />
                        </label>
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 w-full space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Campaign Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Summer Sale Banner"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Ad Type</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors appearance-none"
                                    value={formData.type} 
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="banner">Banner (Horizontal)</option>
                                    <option value="card">Card (Vertical/Square)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Media Format</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors appearance-none"
                                    value={formData.mediaType} 
                                    onChange={e => {
                                        setFormData({ ...formData, mediaType: e.target.value });
                                        // Clear preview if switching types to prevent broken previews
                                        setMediaPreview(null);
                                        setMediaFile(null);
                                    }}
                                >
                                    <option value="image">Image (JPG, PNG, WEBP)</option>
                                    <option value="video">Video (MP4, WEBM)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Display Location</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors appearance-none"
                                    value={formData.location} 
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                >
                                    <option value="home-top">Home Top Carousel</option>
                                    <option value="home-middle">Home Middle Banner</option>
                                    <option value="category-list">Category List Interstitial</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Destination URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors"
                                    value={formData.redirectUrl}
                                    onChange={e => setFormData({ ...formData, redirectUrl: e.target.value })}
                                    placeholder="e.g. /products?category=1"
                                />
                            </div>

                            <div className="md:col-span-2 pt-2 pb-4">
                                <label className="relative inline-flex items-center cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner group-hover:after:scale-95"></div>
                                    <span className="ml-3 text-sm font-bold text-gray-700 transition-colors">
                                        Campaign is {formData.isActive ? <span className="text-emerald-600">Active</span> : <span className="text-gray-500">Paused</span>}
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
                                <FaSave /> {editingId ? 'Update Campaign' : 'Launch Campaign'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                    <FaTimes /> Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Ads List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {ads.map(ad => (
                    <div key={ad.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,40,0.08)] transition-all duration-300 group">
                        
                        {/* Media Section */}
                        <div className="h-48 bg-gray-900 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-md backdrop-blur-md border 
                                    ${ad.isActive ? 'bg-emerald-500/90 text-white border-emerald-400/50' : 'bg-gray-800/90 text-gray-300 border-gray-600/50'}`}>
                                    {ad.isActive ? 'Active' : 'Paused'}
                                </span>
                            </div>
                            
                            <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                <button onClick={() => handleEdit(ad)} className="w-9 h-9 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all">
                                    <FaEdit size={14} />
                                </button>
                                <button onClick={() => handleDelete(ad.id)} className="w-9 h-9 bg-white/90 backdrop-blur-sm text-rose-600 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-500 hover:text-white hover:scale-110 transition-all">
                                    <FaTrash size={14} />
                                </button>
                            </div>

                            {ad.mediaType === 'video' ? (
                                <video src={getImageUrl(ad.mediaUrl)} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" controls />
                            ) : (
                                <img src={getImageUrl(ad.mediaUrl)} alt={ad.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" />
                            )}

                            
                            {/* Gradient Overlay for bottom text readability */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                            
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="font-bold text-lg leading-tight line-clamp-1 drop-shadow-md">{ad.title}</h3>
                                <p className="text-xs text-white/80 font-medium uppercase tracking-wider mt-1 drop-shadow-md">
                                    {ad.type} &middot; {ad.location.replace('-', ' ')}
                                </p>
                            </div>
                        </div>

                        {/* Analytics Section */}
                        <div className="p-6 bg-white">
                            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaChartLine className="text-indigo-500" /> Performance Metrics
                            </h4>
                            
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100 text-center flex flex-col items-center justify-center transition-colors hover:bg-blue-50">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 shadow-sm">
                                        <FaEye size={12} />
                                    </div>
                                    <div className="font-black text-gray-900 text-lg leading-none mb-1">{ad.impressions || 0}</div>
                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Impressions</div>
                                </div>
                                
                                <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-100 text-center flex flex-col items-center justify-center transition-colors hover:bg-emerald-50">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-sm">
                                        <FaMousePointer size={12} />
                                    </div>
                                    <div className="font-black text-gray-900 text-lg leading-none mb-1">{ad.clicks || 0}</div>
                                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Clicks</div>
                                </div>
                                
                                <div className="bg-purple-50/50 rounded-2xl p-3 border border-purple-100 text-center flex flex-col items-center justify-center transition-colors hover:bg-purple-50">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2 shadow-sm">
                                        <FaShoppingBag size={12} />
                                    </div>
                                    <div className="font-black text-gray-900 text-lg leading-none mb-1">{ad.conversions || 0}</div>
                                    <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Conversions</div>
                                </div>
                            </div>
                            
                            {/* Conversion Rate Bar */}
                            <div className="mt-5 space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-500">Click-through Rate</span>
                                    <span className="text-indigo-600">
                                        {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min((ad.clicks / (ad.impressions || 1)) * 100 * 5, 100)}%` }} // *5 just for visualization scaling
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {ads.length === 0 && (
                <div className="bg-white p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-300">
                        <FaBullhorn size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No active campaigns</h3>
                    <p className="text-gray-500 max-w-md mx-auto">Create your first advertising campaign to start driving more traffic and sales to your products.</p>
                </div>
            )}
        </div>
    );
};

export default Ads;
