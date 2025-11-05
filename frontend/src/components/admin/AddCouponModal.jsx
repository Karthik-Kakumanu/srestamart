import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const getAuthToken = () => localStorage.getItem('adminToken');

const CATEGORIES = [
    { value: 'livebirds', label: 'Live Birds' },
    { value: 'meat', label: 'Meat' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'pickles', label: 'Pickles' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'dryfruits', label: 'Dry Fruits' },
    { value: 'oils', label: 'Oils' },
    { value: 'millets', label: 'Millets' },
];

export default function AddCouponModal({ onClose, onSave }) {
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [minPurchase, setMinPurchase] = useState('');
    const [applicableCategory, setApplicableCategory] = useState('');
    
    const [description, setDescription] = useState('');
    const [posterFile, setPosterFile] = useState(null);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        setPosterFile(e.target.files[0]);
    };

    // --- MODIFIED: handleSubmit now has two try/catch blocks ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const token = getAuthToken();
        if (!token) {
            setError("Admin token not found. Please log in again.");
            setIsLoading(false);
            return;
        }
        const config = { headers: { 'x-admin-token': token } };
        
        let posterUrl = null;

        // --- Step 1: Upload poster in its OWN try...catch block ---
        if (posterFile) {
            try {
                const formData = new FormData();
                formData.append('productImage', posterFile); 
                
                const uploadConfig = { headers: { ...config.headers, 'Content-Type': 'multipart/form-data' } };
                const uploadResponse = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/upload`, formData, uploadConfig);
                posterUrl = uploadResponse.data.imageUrl;
            } catch (err) {
                // Give a specific error for the upload!
                console.error("Upload error:", err);
                setError(err.response?.data?.msg || 'ERROR: Failed to upload poster image. Check server/Cloudinary keys.');
                setIsLoading(false);
                return; // Stop execution if upload fails
            }
        }

        // --- Step 2: Create coupon in its OWN try...catch block ---
        try {
            const couponData = {
                code: code.toUpperCase(),
                discount_type: discountType,
                discount_value: parseFloat(discountValue),
                expiry_date: expiryDate,
                min_purchase_amount: parseFloat(minPurchase) || 0,
                applicable_category: applicableCategory || null, // This is already correct
                poster_url: posterUrl,
                description: description || null
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/coupons`, couponData, config);
            onSave(); // This will close the modal and refresh the data
        } catch (err) {
            // This error is now specific to coupon creation
            console.error("Coupon creation error:", err);
            setError(err.response?.data?.msg || 'ERROR: Failed to create coupon. (Upload may have succeeded)');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-lg w-full max-w-lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Add New Coupon / Offer</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        {/* Coupon Code */}
                        <div className="sm:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Coupon Code</label>
                            <input type="text" value={code} onChange={e => setCode(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        {/* Expiry Date */}
                        <div className="sm:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                            <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        {/* Discount Type */}
                        <div className="sm:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Discount Type</label>
                            <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>
                        {/* Discount Value */}
                        <div className="sm:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Discount Value</label>
                            {/* --- ADDED: required and min="0" for better validation --- */}
                            <input type="number" step="0.01" value={discountValue} min="0" onChange={e => setDiscountValue(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        {/* Minimum Purchase */}
                        <div className="sm:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Minimum Purchase (₹)</label>
                            <input type="number" step="0.01" placeholder="0.00" min="0" value={minPurchase} onChange={e => setMinPurchase(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        {/* Applicable Category */}
                        <div className="sm:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Applicable Category</label>
                            <select value={applicableCategory} onChange={e => setApplicableCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                <option value="">All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Attractive Quote/Description */}
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Attractive Quote / Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows="2"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                placeholder="e.g., Festive offer on all our fresh products!"
                            ></textarea>
                        </div>

                        {/* Coupon Poster */}
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Coupon Poster (Optional)</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/webp"
                                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                            />
                        </div>

                    </div>
                    {error && <div className="px-6 pb-4 text-sm text-red-600 font-bold">{error}</div>}
                    <div className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                            {isLoading ? 'Saving...' : 'Save Coupon'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}