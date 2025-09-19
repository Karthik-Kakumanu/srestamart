import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Truck, Wallet } from 'lucide-react';

export default function PaymentPage({ user, checkoutDetails, handleClearCart, isFirstOrder }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // --- DYNAMIC CALCULATION LOGIC ---
  const { discount, shippingCost, finalTotal, totalWeight } = useMemo(() => {
    const subtotal = checkoutDetails?.totalAmount || 0;
    
    // 1. First Order Discount
    const discount = isFirstOrder ? subtotal * 0.10 : 0;
    const discountedSubtotal = subtotal - discount;

    // 2. Calculate Total Weight
    // Assumption: Each item in `checkoutDetails.items` has a `weight` property (in kg) and a `quantity`.
    const totalWeight = checkoutDetails?.items.reduce((acc, item) => acc + ((item.weight || 0) * item.quantity), 0) || 0;

    // 3. Shipping Cost Calculation based on user-provided rules
    // Assumption: `checkoutDetails.shippingAddress` is an object with `city` and `state` properties.
    let shippingCost = 0;
    const address = checkoutDetails?.shippingAddress;
    
    if (address && totalWeight > 0) {
        // Normalize strings for reliable comparison
        const city = (address.city || '').toLowerCase().trim();
        const state = (address.state || '').toLowerCase().trim();

        if (city === 'hyderabad') {
            // Rule 1 & 2: Hyderabad (within ORR limits)
            if (subtotal > 1500) {
                shippingCost = 0; // Free delivery for orders above ₹1500
            } else {
                shippingCost = 50 * totalWeight; // ₹50 per kg
            }
        } else if (state === 'telangana') {
            // Rule 3: Rest of Telangana
            shippingCost = 150 * totalWeight; // ₹150 per kg
        } else if (state === 'andhra pradesh') {
            // Rule 4: Andhra Pradesh
            shippingCost = 200 * totalWeight; // ₹200 per kg
        } else {
            // Rule 5: Other states
            shippingCost = 350 * totalWeight; // ₹350 per kg
        }
    }

    // 4. Final Total
    const finalTotal = discountedSubtotal + shippingCost;

    return { discount, shippingCost, finalTotal, totalWeight };
  }, [isFirstOrder, checkoutDetails]);

  // Fallback for missing checkout details
  if (!checkoutDetails || checkoutDetails.items.length === 0) {
      return (
        <div className="flex-grow bg-slate-50 flex items-center justify-center p-4">
          <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-lg mx-auto"
          >
            <ShoppingBag className="mx-auto text-red-200 h-24 w-24" strokeWidth={1} />
            <h2 className="mt-6 text-2xl font-bold text-gray-800">Something Went Wrong</h2>
            <p className="text-gray-500 mt-2">No checkout details found. Please return to your cart to continue.</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/cart" className="mt-8 inline-flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl">
                  Return to Cart
              </Link>
            </motion.div>
          </motion.div>
        </div>
      );
  }

  const handlePlaceOrder = async () => {
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
        // Replaced alert with a more user-friendly error handling mechanism if available
        alert("There was an error placing your order. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* --- PAYMENT METHOD (Left Column) --- */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-xl"
        >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Method</h1>
            <p className="text-gray-500 mb-6">Please select your preferred payment option.</p>

            <div className="border-2 border-red-500 bg-red-50/50 p-5 rounded-xl ring-2 ring-red-200">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <Wallet size={24} />
                    </div>
                    <div className="ml-4">
                        <h2 className="font-bold text-lg text-gray-800">Cash on Delivery (COD)</h2>
                        <p className="text-gray-600 text-sm">Pay directly to the delivery agent upon receiving your order.</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl text-sm text-slate-600">
                <p>You have selected <strong>Cash on Delivery</strong>. Please ensure you have the exact amount available to avoid any inconvenience. Our delivery partner will not be able to provide change.</p>
            </div>
        </motion.div>

        {/* --- ORDER SUMMARY (Right Column) --- */}
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
        >
            <div className="bg-white p-6 rounded-2xl shadow-xl sticky top-28">
                <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Final Summary</h3>
                <div className="space-y-3 my-4 text-base">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">₹{checkoutDetails.totalAmount.toFixed(2)}</span>
                    </div>

                    {isFirstOrder && discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>First Order Discount (10%)</span>
                        <span className="font-medium">- ₹{discount.toFixed(2)}</span>
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
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlaceOrder} 
                    disabled={isSubmitting} 
                    className="w-full flex items-center justify-center gap-2 mt-6 bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition-all text-lg shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Truck size={20} /> {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
                </motion.button>
            </div>
        </motion.div>

      </div>
    </div>
  );
}
