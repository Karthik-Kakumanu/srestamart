import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const getAuthToken = () => localStorage.getItem('adminToken');

// --- List of all your categories ---
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
    
    // --- NEW: State for the category ---
    const [applicableCategory, setApplicableCategory] = useState(''); // Default is empty string (for "All Categories")
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const token = getAuthToken();
            const config = { headers: { 'x-admin-token': token } };
            
            // --- MODIFIED: Added `applicable_category` to the data ---
            const couponData = {
                code: code.toUpperCase(),
                discount_type: discountType,
                discount_value: parseFloat(discountValue),
                expiry_date: expiryDate,
                min_purchase_amount: parseFloat(minPurchase) || 0,
                applicable_category: applicableCategory || null // Send null if empty string
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/coupons`, couponData, config);
            onSave(); // This will close the modal and refresh the data in AdminPage
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create coupon.');
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
                        <h2 className="text-xl font-bold text-gray-800">Add New Coupon</h2>
                    </div>
                    {/* --- MODIFIED: Grid now has 2 cols, and a new category field --- */}
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
                            <input type="number" step="0.01" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        {/* Minimum Purchase */}
                        <div className="sm:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Minimum Purchase (₹)</label>
                            <input type="number" step="0.01" placeholder="0.00" value={minPurchase} onChange={e => setMinPurchase(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>

                        {/* --- NEW: Applicable Category --- */}
                        <div className="sm:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Applicable Category</label>
                            <select value={applicableCategory} onChange={e => setApplicableCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                <option value="">All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                    {error && <div className="px-6 pb-4 text-sm text-red-600">{error}</div>}
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