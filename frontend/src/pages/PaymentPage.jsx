// src/pages/PaymentPage.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function PaymentPage({ user, checkoutDetails, handleClearCart, isFirstOrder }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const { discount, finalTotal } = useMemo(() => {
    const total = checkoutDetails?.totalAmount || 0;
    const discount = isFirstOrder ? total * 0.10 : 0;
    const finalTotal = total - discount;
    return { discount, finalTotal };
  }, [isFirstOrder, checkoutDetails]);

  if (!checkoutDetails || checkoutDetails.items.length === 0) {
       return (
          <div className="text-center bg-white p-12 rounded-xl shadow-md my-8 max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-700">Something went wrong.</h3>
              <p className="text-gray-500 mt-2">No checkout details found. Please return to your cart.</p>
              <Link to="/cart" className="mt-6 inline-block bg-red-600 text-white font-bold py-2 px-6 rounded-lg">Return to Cart</Link>
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
        // --- CORRECTED API URL ---
        await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData, {
            headers: { 'x-auth-token': token }
        });
        handleClearCart();
        navigate('/order-success');
    } catch (error) {
        console.error("Failed to place order:", error);
        alert("There was an error placing your order. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    // ... The design of this page is correct and remains the same.
    <div className="flex-grow bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>
            <div className="space-y-4">
                <p className="text-center text-gray-600">This is a demo payment page. No real transaction will occur.</p>
                <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Demo Credit Card</h4>
                    <div className="mt-2 space-y-3">
                        <input type="text" placeholder="Card Number (e.g., 1234 5678 9012 3456)" className="block w-full border border-gray-300 rounded-md p-2"/>
                        <div className="flex gap-4">
                            <input type="text" placeholder="MM/YY" className="block w-full border border-gray-300 rounded-md p-2"/>
                            <input type="text" placeholder="CVC" className="block w-full border border-gray-300 rounded-md p-2"/>
                        </div>
                    </div>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold">Demo UPI</h4>
                    <p className="text-sm text-gray-500 mt-1">Clicking "Confirm Order" will simulate a successful payment.</p>
                </div>
            </div>
        </div>
        <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md sticky top-28">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-3">Final Summary</h3>
                <div className="space-y-3 mt-4 text-base">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">₹{checkoutDetails.totalAmount.toFixed(2)}</span>
                    </div>
                    {isFirstOrder && (
                      <div className="flex justify-between text-green-600">
                        <span>First Order Discount (10%)</span>
                        <span className="font-medium">- ₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                </div>
                <div className="flex justify-between font-bold text-2xl text-gray-800 pt-4 mt-4 border-t">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                </div>
                <button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors text-lg disabled:bg-gray-400">
                    {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}