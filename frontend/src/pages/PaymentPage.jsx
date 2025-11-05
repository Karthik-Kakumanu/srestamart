import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Truck, Wallet, Tag, XCircle, Loader2, CreditCard } from 'lucide-react';
import logoIcon from '../../images/icon.png'; // Make sure this path is correct

// --- HELPER FUNCTION TO PARSE WEIGHT FROM VARIANT LABEL ---
const parseWeightFromLabel = (label) => {
    if (!label || typeof label !== 'string') return 0;
    const lowerLabel = label.toLowerCase();
    const match = lowerLabel.match(/(\d*\.?\d+)\s*(kg|g)/);
    if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2];
        return unit === 'g' ? value / 1000 : value; // Convert grams to kg
    }
    return 0; 
};

// --- HELPER FUNCTION FOR SHIPPING CALCULATION ---
const calculateShipping = (subtotal, address, totalWeight) => {
    if (!address || !address.value) return 0; // Don't charge shipping if no address
    const addressString = address.value.toLowerCase();
    
    // Always charge for at least 1kg if there's any weight
    const weightInKg = Math.max(1, Math.ceil(totalWeight)); 
    
    if (addressString.includes('hyderabad')) {
        return subtotal > 1500 ? 0 : 50 * weightInKg; 
    }
    if (addressString.includes('telangana')) return 150 * weightInKg;
    if (addressString.includes('andhra pradesh') || addressString.includes('a.p')) return 200 * weightInKg;
    
    return 350 * weightInKg;
};

// --- NEW: Function to load the Razorpay script ---
const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};


export default function PaymentPage({ user, checkoutDetails, handleClearCart, isFirstOrder }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null); 
    const [appliedDiscount, setAppliedDiscount] = useState(0); 
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

    // --- NEW: State for payment method ---
    const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'razorpay'

    // --- Load Razorpay script on component mount ---
    useEffect(() => {
        loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    }, []);

    
    const { firstOrderDiscount, couponDiscount, shippingCost, finalTotal, totalWeight, subtotal } = useMemo(() => {
        const subtotal = checkoutDetails?.totalAmount || 0;
        const firstOrderDiscount = isFirstOrder ? subtotal * 0.10 : 0;
        const couponDiscount = appliedDiscount || 0;
        const totalDiscount = firstOrderDiscount + couponDiscount;
        const discountedSubtotal = subtotal - totalDiscount;
        const totalWeight = checkoutDetails?.items.reduce((acc, item) => {
            const weightPerUnit = parseWeightFromLabel(item.variantLabel);
            return acc + (weightPerUnit * item.quantity);
        }, 0) || 0;
        const shippingCost = calculateShipping(subtotal, checkoutDetails?.shippingAddress, totalWeight);
        const finalTotal = discountedSubtotal + shippingCost;

        return { 
            firstOrderDiscount, 
            couponDiscount, 
            shippingCost, 
            finalTotal: Math.max(0, finalTotal), 
            totalWeight, 
            subtotal 
        };
    }, [isFirstOrder, checkoutDetails, appliedDiscount, checkoutDetails.shippingAddress]); // Added shippingAddress dependency

    if (!checkoutDetails || checkoutDetails.items.length === 0) {
        return ( 
            <div className="flex-grow bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Your Cart is Empty</h1>
                    <p className="text-gray-500 mt-2">There are no items to check out.</p>
                    <Link to="/" className="mt-4 inline-block bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
                        Go Shopping
                    </Link>
                </div>
            </div> 
        );
    }

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
                cartItems: checkoutDetails.items 
            }, {
                headers: { 'x-auth-token': token }
            });
            if (res.data.success) {
                setAppliedCoupon(res.data.coupon);
                setAppliedDiscount(res.data.discountAmount);
                setCouponSuccess(`Coupon '${res.data.coupon.code}' applied!`);
            }
        } catch (error) {
            setAppliedCoupon(null);
            setAppliedDiscount(0);
            setCouponError(error.response?.data?.msg || "An error occurred.");
        } finally {
            setIsCheckingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setAppliedDiscount(0); 
        setCouponCode('');
        setCouponError('');
        setCouponSuccess('');
    };

    // --- THIS IS THE NEW PAYMENT HANDLER ---
    const handlePayment = () => {
        if (paymentMethod === 'cod') {
            handlePlaceOrderCOD();
        } else {
            handlePlaceOrderRazorpay();
        }
    };

    // --- This is your OLD function, now just for COD ---
    const handlePlaceOrderCOD = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const orderData = {
                userId: user.id,
                cartItems: checkoutDetails.items,
                shippingAddress: checkoutDetails.shippingAddress,
                totalAmount: finalTotal,
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
            setIsSubmitting(false);
        }
        // Don't setIsSubmitting(false) here, as we are navigating away
    };

    // --- THIS IS THE NEW RAZORPAY FUNCTION ---
    const handlePlaceOrderRazorpay = async () => {
        setIsSubmitting(true);
        const token = localStorage.getItem('token');

        try {
            // 1. Create a Razorpay Order
            const orderRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, 
            {
                amount: finalTotal,
                receipt: `receipt_order_${new Date().getTime()}` // A unique receipt ID
            }, 
            {
                headers: { 'x-auth-token': token }
            });

            const { id: order_id, amount, key_id } = orderRes.data;

            // 2. Configure Razorpay Options
            const options = {
                key: key_id,
                amount: amount,
                currency: "INR",
                name: "Sresta Mart",
                description: "Order Payment",
                image: logoIcon, // Your logo
                order_id: order_id,
                // This function is called AFTER payment is successful
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            // Pass all the cart data to create the order in the DB
                            cartItems: checkoutDetails.items,
                            shippingAddress: checkoutDetails.shippingAddress,
                            totalAmount: finalTotal
                        }, {
                            headers: { 'x-auth-token': token }
                        });

                        if (verifyRes.data.success) {
                            handleClearCart();
                            navigate('/order-success', { state: { 
                                orderId: verifyRes.data.orderId,
                                totalAmount: finalTotal,
                                items: checkoutDetails.items,
                                paymentId: verifyRes.data.paymentId
                            }});
                        } else {
                            alert("Payment verification failed. Please contact support.");
                            setIsSubmitting(false);
                        }
                    } catch (err) {
                        alert("Payment verification server error. Please contact support.");
                        setIsSubmitting(false);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email || "customer@srestamart.com", // Razorpay requires an email
                    contact: user.phone,
                },
                notes: {
                    address: checkoutDetails.shippingAddress.value,
                },
                theme: {
                    color: "#DC2626", // Red color
                },
            };

            // 3. Open the Razorpay Modal
            const rzp = new window.Razorpay(options);
            rzp.open();

            // Handle payment failure
            rzp.on('payment.failed', function (response) {
                alert(`Payment Failed: ${response.error.description}`);
                setIsSubmitting(false);
            });

        } catch (error) {
            console.error("Failed to create Razorpay order:", error);
            alert("Could not connect to payment gateway. Please try again.");
            setIsSubmitting(false);
        }
    };


    return (
        <div className="flex-grow bg-slate-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* --- MODIFIED: Payment Method Section --- */}
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Method</h1>
                    <p className="text-gray-500 mb-6">Please select your payment option.</p>
                    
                    <div className="space-y-4">
                        {/* Option 1: Cash on Delivery */}
                        <div 
                            onClick={() => setPaymentMethod('cod')}
                            className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'cod' ? 'border-red-500 bg-red-50/50 ring-2 ring-red-200' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <div className="flex items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'}`}><Wallet size={24} /></div>
                                <div className="ml-4">
                                    <h2 className="font-bold text-lg text-gray-800">Cash on Delivery (COD)</h2>
                                    <p className="text-gray-600 text-sm">Pay directly to the delivery agent.</p>
                                </div>
                            </div>
                        </div>

                        {/* Option 2: Razorpay */}
                        <div 
                            onClick={() => setPaymentMethod('razorpay')}
                            className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === 'razorpay' ? 'border-red-500 bg-red-50/50 ring-2 ring-red-200' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <div className="flex items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'razorpay' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'}`}><CreditCard size={24} /></div>
                                <div className="ml-4">
                                    <h2 className="font-bold text-lg text-gray-800">Pay Online</h2>
                                    <p className="text-gray-600 text-sm">Pay via UPI, Credit/Debit Card, etc.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </motion.div>

                {/* --- Final Summary Section (MODIFIED) --- */}
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-xl sticky top-28">
                        <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Final Summary</h3>
                        
                        {/* Coupon Input Section */}
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

                        {/* Order Totals */}
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

                        {/* --- MODIFIED: Confirm Order Button --- */}
                        <motion.button 
                            whileHover={!isSubmitting ? { scale: 1.05 } : {}} 
                            whileTap={!isSubmitting ? { scale: 0.95 } : {}} 
                            onClick={handlePayment} // Changed from handlePlaceOrder
                            disabled={isSubmitting} 
                            className={`relative w-full flex items-center justify-center mt-6 text-white font-bold py-4 rounded-lg transition-all text-lg shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed overflow-hidden ${paymentMethod === 'cod' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {isSubmitting ? (
                                <> 
                                <motion.div className="absolute left-0" initial={{ x: '-100%' }} animate={{ x: '450%' }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} > <Truck size={24} /> </motion.div> 
                                <span>Processing...</span> 
                                </>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    {paymentMethod === 'cod' ? <Truck size={20} /> : <CreditCard size={20} />}
                                    <span>{paymentMethod === 'cod' ? 'Place COD Order' : `Pay ₹${finalTotal.toFixed(2)}`}</span>
                                </div>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}