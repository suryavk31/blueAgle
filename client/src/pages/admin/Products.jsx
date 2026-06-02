import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaTrash, FaEdit, FaPlus, FaBoxOpen, FaArrowLeft, FaImage } from 'react-icons/fa';

const Products = () => {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [view, setView] = useState('LIST'); // LIST, FORM

    // Form State
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', stock: '', categoryId: '', subCategoryId: '',
        mrp: '', offerPercentage: '', weight: ''
    });
    const [images, setImages] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            setProducts(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (formData.categoryId) {
            const cat = categories.find(c => c.id == formData.categoryId);
            setSubCategories(cat?.SubCategories || []);
        } else {
            setSubCategories([]);
        }
    }, [formData.categoryId, categories]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newFormData = { ...formData, [name]: value };

        if (name === 'mrp' || name === 'offerPercentage') {
            const mrp = name === 'mrp' ? parseFloat(value) : parseFloat(formData.mrp);
            const offer = name === 'offerPercentage' ? parseFloat(value) : parseFloat(formData.offerPercentage);
            if (!isNaN(mrp) && !isNaN(offer)) {
                newFormData.price = (mrp - (mrp * offer / 100)).toFixed(2);
            }
        } else if (name === 'price') {
            const mrp = parseFloat(formData.mrp);
            const price = parseFloat(value);
            if (!isNaN(mrp) && !isNaN(price) && mrp > 0) {
                newFormData.offerPercentage = (((mrp - price) / mrp) * 100).toFixed(2);
            }
        }

        setFormData(newFormData);
    };

    const handleFileChange = (e) => {
        setImages(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        for (let i = 0; i < images.length; i++) {
            data.append('images', images[i]);
        }

        try {
            const token = await currentUser.getIdToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingId) {
                await axios.put(`http://localhost:5000/api/products/${editingId}`, data, config);
                toast.success("Product Updated");
            } else {
                await axios.post('http://localhost:5000/api/products', data, config);
                toast.success("Product Created");
            }

            setView('LIST');
            setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', subCategoryId: '', mrp: '', offerPercentage: '', weight: '' });
            setImages([]);
            setEditingId(null);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const token = await currentUser.getIdToken();
            await axios.delete(`http://localhost:5000/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Product Deleted");
            fetchProducts();
        } catch (error) {
            toast.error("Error deleting");
        }
    };

    const handleEdit = (prod) => {
        setFormData({
            name: prod.name,
            description: prod.description,
            price: prod.price,
            stock: prod.stock,
            categoryId: prod.SubCategory?.categoryId || '',
            subCategoryId: prod.subCategoryId,
            mrp: prod.mrp || '',
            offerPercentage: prod.offerPercentage || '',
            weight: prod.weight || ''
        });
        setEditingId(prod.id);
        setView('FORM');
    };

    const cancelEdit = () => {
        setView('LIST');
        setEditingId(null);
        setFormData({ name: '', description: '', price: '', stock: '', categoryId: '', subCategoryId: '', mrp: '', offerPercentage: '', weight: '' });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaBoxOpen className="text-indigo-600" /> Manage Products
                    </h2>
                    <p className="text-gray-500 font-medium">Add, update, or remove products from your catalog.</p>
                </div>
                <div className="relative z-10">
                    {view === 'LIST' ? (
                        <button 
                            onClick={() => setView('FORM')} 
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <FaPlus /> New Product
                        </button>
                    ) : (
                        <button 
                            onClick={cancelEdit} 
                            className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all"
                        >
                            <FaArrowLeft /> Back to List
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            {view === 'FORM' && (
                <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative text-left">
                    <h3 className="text-xl font-bold mb-8 text-gray-800 border-b border-gray-100 pb-4">
                        {editingId ? 'Edit Product Details' : 'Create New Product'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Product Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors" placeholder="e.g. Organic Honey" required />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">MRP (₹)</label>
                                    <input type="number" name="mrp" value={formData.mrp} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors" placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Offer (%)</label>
                                    <input type="number" name="offerPercentage" value={formData.offerPercentage} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors" placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Price (₹)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors" placeholder="0.00" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Weight/Size</label>
                                    <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors" placeholder="e.g. 500g" />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Stock Count</label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors" placeholder="100" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Primary Category</label>
                                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors appearance-none" required>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Sub Category</label>
                                <select name="subCategoryId" value={formData.subCategoryId} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors appearance-none disabled:opacity-50" required disabled={!subCategories.length}>
                                    <option value="">Select Sub Category</option>
                                    {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Product Images</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FaImage className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-400">PNG, JPG or WEBP (MAX. 5MB)</p>
                                        </div>
                                        <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                    </label>
                                </div>
                                {images.length > 0 && <p className="text-sm text-indigo-600 font-medium">{images.length} files selected</p>}
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors" rows="4" placeholder="Detailed product description..."></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button type="button" onClick={cancelEdit} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
                                {editingId ? 'Save Changes' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {view === 'LIST' && (
                <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden text-left">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-separate border-spacing-y-3">
                            <thead className="bg-transparent text-gray-400 font-bold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4 rounded-l-xl">Product</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Category Path</th>
                                    <th className="px-6 py-4 text-right rounded-r-xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-400 font-medium">No products found. Start by adding one!</td>
                                    </tr>
                                ) : (
                                    products.map(prod => (
                                        <tr key={prod.id} className="group hover:bg-gray-50 shadow-sm bg-white border-y border-gray-50 transition-colors">
                                            <td className="px-6 py-4 rounded-l-xl border-y border-l border-gray-100 group-hover:border-transparent">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                                                        {prod.images && prod.images.length > 0 ? (
                                                            <img src={`http://localhost:5000${prod.images[0]}`} alt={prod.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <FaImage className="text-gray-300 size-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-base">{prod.name}</p>
                                                        <p className="text-xs text-gray-500 font-medium">ID: {prod.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-y border-gray-100 group-hover:border-transparent font-bold text-gray-800">
                                                ₹{parseFloat(prod.price).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 border-y border-gray-100 group-hover:border-transparent">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold
                                                    ${prod.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 
                                                      prod.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {prod.stock} Units
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 border-y border-gray-100 group-hover:border-transparent">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-700">{prod.SubCategory?.Category?.name || 'Uncategorized'}</span>
                                                    <span className="text-xs text-indigo-500 font-bold tracking-wide">{prod.SubCategory?.name || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 rounded-r-xl border-y border-r border-gray-100 group-hover:border-transparent">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(prod)} className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors">
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(prod.id)} className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors">
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
