import React, { useState } from 'react';
import axios from 'axios';
import { X, Plus, Trash2 } from 'lucide-react';

const getAuthToken = () => localStorage.getItem('adminToken');

export default function EditProductModal({ product, onClose, onSave }) {
    const [productData, setProductData] = useState({ ...product });
    const [variants, setVariants] = useState(product.variants ? [...product.variants.filter(v => v.id != null)] : []);
    const [selectedFile, setSelectedFile] = useState(null); // For new image upload
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleProductChange = (e) => {
        setProductData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleVariantChange = (index, e) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [e.target.name]: e.target.value };
        setVariants(newVariants);
    };

    const handleAddVariant = () => {
        setVariants([...variants, { product_id: product.id, label: '', price: '', isNew: true }]);
    };
    
    const handleRemoveVariant = (index) => {
        const variantToRemove = variants[index];
        if (variantToRemove.isNew) {
             setVariants(variants.filter((_, i) => i !== index));
        } else {
            const newVariants = variants.map((v, i) => i === index ? { ...v, isDeleted: true } : v);
            setVariants(newVariants);
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError('');
        
        const token = getAuthToken();
        if (!token) {
            setError('No admin token, authorization denied');
            setIsSaving(false);
            return;
        }

        const config = { headers: { 'x-admin-token': token } };
        let updatedProductData = { ...productData };

        try {
            // Step 1: If a new image is selected, upload it first
            if (selectedFile) {
                const formData = new FormData();
                formData.append('productImage', selectedFile);
                const uploadConfig = { headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } };
                const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/upload`, formData, uploadConfig);
                updatedProductData.image_url = uploadRes.data.imageUrl; // Update the image_url
            }

            // Step 2: Update main product details (with new or old image_url)
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/products/${product.id}`, updatedProductData, config);
            
            // Step 3: Process all variant changes
            for (const variant of variants) {
                if (variant.isDeleted && variant.id) {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/variants/${variant.id}`, config);
                } else if (variant.isNew && !variant.isDeleted) {
                    await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/variants`, { product_id: product.id, label: variant.label, price: variant.price }, config);
                } else if (variant.id && !variant.isNew && !variant.isDeleted) {
                    await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/variants/${variant.id}`, { label: variant.label, price: variant.price }, config);
                }
            }
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
                    </div>
                    <p className="text-sm text-gray-500">Editing: {product.name}</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">Product Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="name" value={productData.name} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" value={productData.description} onChange={handleProductChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <input type="text" name="category" value={productData.category} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Image</label>
                            <img src={productData.image_url} alt="Current product" className="mt-1 h-20 w-20 object-cover rounded-md" />
                            <label className="block text-sm font-medium text-gray-700 mt-2">Upload New Image (Optional)</label>
                            <input type="file" name="image_file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700">Variants</h3>
                            <button onClick={handleAddVariant} className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium">
                                <Plus size={16} className="mr-1" /> Add Variant
                            </button>
                        </div>
                        <div className="space-y-3">
                            {variants.map((variant, index) => !variant.isDeleted && (
                                <div key={variant.id || `new-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-600">Label (e.g., 250g)</label>
                                        <input type="text" name="label" value={variant.label} onChange={(e) => handleVariantChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-600">Price (₹)</label>
                                        <input type="number" name="price" value={variant.price} onChange={(e) => handleVariantChange(index, e)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                    </div>
                                    <button onClick={() => handleRemoveVariant(index)} className="text-gray-400 hover:text-red-500 mt-5">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                </div>
                <div className="p-6 bg-gray-50 border-t sticky bottom-0 z-10">
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSaveChanges} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 disabled:bg-red-300">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}