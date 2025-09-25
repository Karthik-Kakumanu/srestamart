import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Truck, Wallet, Tag, XCircle, Loader2 } from 'lucide-react'; // --- MODIFIED: Added more icons

// --- HELPER FUNCTION TO PARSE WEIGHT FROM VARIANT LABEL ---
const parseWeightFromLabel = (label) => {
    if (!label || typeof label !== 'string') return 0;
    const lowerLabel = label.toLowerCase();
    const match = lowerLabel.match(/(\d*\.?\d+)\s*(kg|g)/);
    if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2];
        return unit === 'g' ? value / 1000 : value;
    }
    return 0;
};

// --- HELPER FUNCTION FOR SHIPPING CALCULATION ---
const calculateShipping = (subtotal, address, totalWeight) => {
    if (!address || !address.value || totalWeight === 0) return 0;
    const addressString = address.value.toLowerCase();
    if (addressString.includes('hyderabad')) return subtotal > 1500 ? 0 : 50 * Math.max(1, totalWeight); // --- MODIFIED: Ensure minimum shipping charge if not free
    if (addressString.includes('telangana')) return 150 * Math.max(1, totalWeight);
    if (addressString.includes('andhra pradesh') || addressString.includes('a.p')) return 200 * Math.max(1, totalWeight);
    return 350 * Math.max(1, totalWeight);
};


export default function PaymentPage({ user, checkoutDetails, handleClearCart, isFirstOrder }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    
    // --- NEW: State for coupon functionality ---
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

    
    // --- MODIFIED: useMemo now calculates coupon discounts ---
    const { firstOrderDiscount, couponDiscount, shippingCost, finalTotal, totalWeight, subtotal } = useMemo(() => {
        const subtotal = checkoutDetails?.totalAmount || 0;
        
        const firstOrderDiscount = isFirstOrder ? subtotal * 0.10 : 0;
        
        let couponDiscount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.discount_type === 'percentage') {
                couponDiscount = subtotal * (appliedCoupon.discount_value / 100);
            } else { // 'fixed'
                couponDiscount = appliedCoupon.discount_value;
            }
        }
        
        const totalDiscount = firstOrderDiscount + couponDiscount;
        const discountedSubtotal = subtotal - totalDiscount;

        const totalWeight = checkoutDetails?.items.reduce((acc, item) => {
            const weightPerUnit = parseWeightFromLabel(item.variantLabel);
            return acc + (weightPerUnit * item.quantity);
        }, 0) || 0;

        const shippingCost = calculateShipping(subtotal, checkoutDetails?.shippingAddress, totalWeight);

        const finalTotal = discountedSubtotal + shippingCost;

        return { firstOrderDiscount, couponDiscount, shippingCost, finalTotal, totalWeight, subtotal };
    }, [isFirstOrder, checkoutDetails, appliedCoupon]);

    if (!checkoutDetails || checkoutDetails.items.length === 0) {
        return ( <div className="flex-grow bg-slate-50 flex items-center justify-center p-4"> {/* ... (Error display unchanged) ... */} </div> );
    }

    // --- NEW: Function to handle applying the coupon ---
    const handleApplyCoupon = async () => {
        if (!couponCode) {
            setCouponError("Please enter a coupon code.");
            return;
        }
        setIsCheckingCoupon(true);
        setCouponError('');
        setCouponSuccess('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/coupons/apply`, {
                couponCode: couponCode,
                cartTotal: subtotal
            }, {
                headers: { 'x-auth-token': token }
            });

            if (res.data.success) {
                setAppliedCoupon(res.data.coupon);
                setCouponSuccess("Coupon applied successfully!");
            }
        } catch (error) {
            setAppliedCoupon(null);
            setCouponError(error.response?.data?.msg || "An error occurred.");
        } finally {
            setIsCheckingCoupon(false);
        }
    };

    // --- NEW: Function to remove an applied coupon ---
    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
        setCouponSuccess('');
    };

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const orderData = {
                userId: user.id,
                cartItems: checkoutDetails.items,
                shippingAddress: checkoutDetails.shippingAddress,
                totalAmount: finalTotal, // The final calculated total is sent
                // Optional: You could add coupon info to the order for your records
                // coupon_code: appliedCoupon ? appliedCoupon.code : null,
                // discount_amount: firstOrderDiscount + couponDiscount
            };
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData, {
                headers: { 'x-auth-token': token }
            });
            handleClearCart();
            navigate('/order-success', { state: { 
                orderId: res.data.orderId,
                totalAmount: finalTotal,
                items: checkoutDetails.items
            }});
        } catch (error) {
            console.error("Failed to place order:", error);
            alert("There was an error placing your order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-grow bg-slate-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* --- Payment Method Section (Unchanged) --- */}
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Method</h1>
                    <p className="text-gray-500 mb-6">Please confirm your payment option to complete the order.</p>
                    <div className="border-2 border-red-500 bg-red-50/50 p-5 rounded-xl ring-2 ring-red-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center"><Wallet size={24} /></div>
                            <div className="ml-4">
                                <h2 className="font-bold text-lg text-gray-800">Cash on Delivery (COD)</h2>
                                <p className="text-gray-600 text-sm">Pay directly to the delivery agent upon receiving your order.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl text-sm text-slate-600">
                        <p>You have selected <strong>Cash on Delivery</strong>. Please ensure you have the exact amount available to avoid any inconvenience.</p>
                    </div>
                </motion.div>

                {/* --- Final Summary Section (MODIFIED) --- */}
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-xl sticky top-28">
                        <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Final Summary</h3>
                        
                        {/* --- NEW: Coupon Input Section --- */}
                        <div className="my-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Have a coupon?</label>
                                <Link to="/coupons" className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1">
                                    <Tag size={12}/> View Coupons
                                </Link>
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Enter Coupon Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                    disabled={!!appliedCoupon}
                                />
                                <button 
                                    onClick={handleApplyCoupon}
                                    disabled={isCheckingCoupon || !!appliedCoupon}
                                    className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center w-28"
                                >
                                    {isCheckingCoupon ? <Loader2 className="animate-spin" size={20}/> : 'Apply'}
                                </button>
                            </div>
                            {couponError && <p className="text-red-600 text-xs mt-1">{couponError}</p>}
                            {couponSuccess && <p className="text-green-600 text-xs mt-1">{couponSuccess}</p>}
                        </div>

                        {/* --- MODIFIED: Order Totals --- */}
                        <div className="space-y-3 pt-4 border-t text-base">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                            </div>

                            {isFirstOrder && firstOrderDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>First Order Discount (10%)</span>
                                    <span className="font-medium">- ₹{firstOrderDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            
                            {/* --- NEW: Display Applied Coupon Discount --- */}
                            {appliedCoupon && couponDiscount > 0 && (
                                <div className="flex justify-between text-green-600 items-center">
                                    <span>Coupon '{appliedCoupon.code}'</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">- ₹{couponDiscount.toFixed(2)}</span>
                                        <button onClick={handleRemoveCoupon}><XCircle size={16} className="text-gray-400 hover:text-red-500"/></button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping ({totalWeight.toFixed(2)} kg)</span>
                                <span className={`font-semibold ${shippingCost > 0 ? 'text-gray-900' : 'text-green-600'}`}>
                                    {shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE'}
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-2xl text-gray-800 pt-4 mt-4 border-t border-gray-200">
                            <span>Total</span>
                            <span>₹{finalTotal.toFixed(2)}</span>
                        </div>

                        {/* --- Confirm Order Button (Unchanged) --- */}
                        <motion.button whileHover={!isSubmitting ? { scale: 1.05 } : {}} whileTap={!isSubmitting ? { scale: 0.95 } : {}} onClick={handlePlaceOrder} disabled={isSubmitting} className="relative w-full flex items-center justify-center mt-6 bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition-all text-lg shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed overflow-hidden">
                            {isSubmitting ? (<> <motion.div className="absolute left-0" initial={{ x: '-100%' }} animate={{ x: '450%' }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} > <Truck size={24} /> </motion.div> <span>Placing Order...</span> </>
                            ) : (<div className="flex items-center justify-center gap-2"><Truck size={20} /><span>Confirm Order</span></div>)}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}