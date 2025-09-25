// pages/CouponsPage.jsx (Full Updated Code)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Tag, Gift, Loader2 } from 'lucide-react';

// A new component to display each coupon
const CouponCard = ({ coupon }) => {
    const isPercentage = coupon.discount_type === 'percentage';
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden group transition-all duration-300 hover:shadow-xl"
        >
            <div className="p-8 bg-gradient-to-br from-red-50 to-orange-100 text-center flex flex-col justify-center items-center md:w-1/3">
                <h3 className="text-5xl font-bold text-red-600">{isPercentage ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</h3>
                <p className="text-xl font-semibold text-red-500">OFF</p>
            </div>
            <div className="p-8 flex-grow">
                <h2 className="font-bold text-2xl text-gray-800 tracking-widest bg-gray-100 inline-block px-4 py-1 rounded-md border-dashed border-2">{coupon.code}</h2>
                <p className="text-gray-600 mt-4">
                    Get {isPercentage ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} off on your order.
                    {coupon.min_purchase_amount > 0 && ` Minimum purchase of ₹${coupon.min_purchase_amount} required.`}
                </p>
                <p className="text-sm text-gray-400 mt-4">
                    Expires on: {new Date(coupon.expiry_date).toLocaleDateString()}
                </p>
            </div>
        </motion.div>
    );
};

export default function CouponsPage({ isFirstOrder }) {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/coupons/public`);
                setCoupons(res.data);
            } catch (err) {
                setError('Could not load coupons at this time.');
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    return (
        <div className="flex-grow bg-slate-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <Tag className="mx-auto h-12 w-12 text-red-500" />
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-800">Your Coupons</h1>
                    <p className="mt-2 text-lg text-gray-500">Here are the special offers available to you.</p>
                </motion.div>

                <div className="space-y-6">
                    {/* Special card for first-time users */}
                    {isFirstOrder && (
                        <div className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden group transition-all duration-300 hover:shadow-2xl">
                            <div className="p-8 bg-gradient-to-br from-green-50 to-blue-100 text-center flex flex-col justify-center items-center md:w-1/3">
                                <h3 className="text-5xl font-bold text-green-600">10%</h3>
                                <p className="text-xl font-semibold text-green-500">OFF</p>
                            </div>
                            <div className="p-8 flex-grow">
                                <h2 className="font-bold text-2xl text-gray-800">Welcome to Sresta Mart!</h2>
                                <p className="text-gray-600 mt-2">As a special gift for your first order, a <strong>10% discount</strong> will be automatically applied at checkout. No code needed!</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Dynamic coupon list */}
                    {loading ? (
                        <div className="text-center p-12"><Loader2 className="mx-auto h-12 w-12 animate-spin text-red-400" /></div>
                    ) : error ? (
                        <div className="text-center text-red-500 bg-red-50 p-8 rounded-lg">{error}</div>
                    ) : coupons.length > 0 ? (
                        coupons.map(coupon => <CouponCard key={coupon.code} coupon={coupon} />)
                    ) : (
                        !isFirstOrder && (
                            <div className="text-center bg-white p-12 rounded-2xl shadow-xl">
                                <Gift className="mx-auto text-red-200 h-24 w-24" strokeWidth={1} />
                                <h2 className="mt-6 text-2xl font-bold text-gray-800">No Coupons Available Right Now</h2>
                                <p className="text-gray-500 mt-2">Please check back later for new deals and offers.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}