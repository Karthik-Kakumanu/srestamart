// frontend/src/components/admin/AddProductModal.jsx (Full and Final Corrected Code)

import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const getAuthToken = () => localStorage.getItem('adminToken');

export default function AddProductModal({ onClose, onSave }) {
    const [product, setProduct] = useState({
        name: '',
        description: '',
        category: 'livebirds', // Set a default category to prevent errors
    });
    const [variant, setVariant] = useState({
        label: '',
        price: ''
    });
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleProductChange = (e) => {
        setProduct(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleVariantChange = (e) => {
        setVariant(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleCreateProduct = async () => {
        if (!product.name || !product.category || !selectedFile) {
            setError('Product Name, Category, and an Image are required.');
            return;
        }
        setIsSaving(true);
        setError('');
        
        const token = getAuthToken();
        if (!token) {
            setError('Admin authentication token not found. Please log in again.');
            setIsSaving(false);
            return;
        }
        
        try {
            // Step 1: Upload the image file first
            const formData = new FormData();
            formData.append('productImage', selectedFile);

            const uploadConfig = { 
                headers: { 
                    'x-admin-token': token,
                    'Content-Type': 'multipart/form-data',
                } 
            };
            
            const uploadResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/upload`, formData, uploadConfig);
            const { imageUrl } = uploadResponse.data;

            // Step 2: Now create the product with the received image URL
            const payload = {
                product: {
                    ...product,
                    image_url: imageUrl
                },
                variant: (variant.label && variant.price) ? variant : null
            };

            const config = { headers: { 'x-admin-token': token } };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/products`, payload, config);
            
            onSave(); // Refreshes the product list on the main admin page
            onClose(); // Closes the modal after a successful save

        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create product.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">Product Details</h3>
                        
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name*</label>
                            <input
                                id="name" type="text" name="name"
                                value={product.name}
                                onChange={handleProductChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description" name="description"
                                value={product.description}
                                onChange={handleProductChange}
                                rows="3"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            ></textarea>
                        </div>
                        
                        {/* --- THIS IS THE CORRECTED CATEGORY DROPDOWN --- */}
                        <div>
                             <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category*</label>
                             <select
                                 id="category" name="category"
                                 value={product.category}
                                 onChange={handleProductChange}
                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                             >
                                <option value="livebirds">Live Birds</option>
                                <option value="pickles">Pickles</option>
                                <option value="dairy">Dairy</option>
                                <option value="dryfruits">Dry Fruits</option>
                                <option value="oils">Oils</option>
                                <option value="millets">Millets</option>
                                <option value="meat">Meat</option>
                             </select>
                         </div>
                        
                        <div>
                            <label htmlFor="image_file" className="block text-sm font-medium text-gray-700">Product Image*</label>
                            <input
                                id="image_file"
                                type="file"
                                name="image_file"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-6">
                        <h3 className="font-semibold text-gray-700">First Variant (Optional)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="label" className="block text-sm font-medium text-gray-700">Label (e.g., 250g)</label>
                                <input
                                    id="label" type="text" name="label"
                                    value={variant.label}
                                    onChange={handleVariantChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                <input
                                    id="price" type="number" name="price"
                                    value={variant.price}
                                    onChange={handleVariantChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                </div>
                
                <div className="p-6 bg-gray-50 border-t sticky bottom-0">
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="button" onClick={handleCreateProduct} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 disabled:bg-red-300">
                            {isSaving ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}