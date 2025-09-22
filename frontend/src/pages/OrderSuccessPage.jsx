import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, User, Calendar, Package, CreditCard } from 'lucide-react';

// Confetti component for a celebratory effect
const ConfettiPiece = ({ x, y, angle, distance, color }) => (
    <motion.div
        className="fixed rounded-full w-2.5 h-2.5 z-50 pointer-events-none"
        style={{ background: color, left: x, top: y, transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 1 }}
        animate={{ 
            transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${distance}px) scale(0)`,
            opacity: 0 
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
    />
);

export default function OrderSuccessPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId, totalAmount, items } = location.state || {}; // Safely get order details

    const [confetti, setConfetti] = useState([]);

    useEffect(() => {
        // Trigger confetti effect on page load
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const newConfetti = Array.from({ length: 150 }).map((_, i) => ({
            id: Date.now() + i,
            x: centerX,
            y: centerY,
            color: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#3b82f6'][Math.floor(Math.random() * 6)],
            angle: Math.random() * 360,
            distance: 100 + Math.random() * (Math.max(window.innerWidth, window.innerHeight) / 2),
        }));
        setConfetti(newConfetti);
    }, []);

    // Get current date for "Booked on"
    const orderDate = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
            {confetti.map(c => <ConfettiPiece key={c.id} {...c} />)}
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.6, 0.01, -0.05, 0.9] }}
                className="max-w-3xl w-full mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-2xl text-center ring-1 ring-red-100"
            >
                <CheckCircle className="mx-auto text-green-500 h-20 w-20 animate-pulse" strokeWidth={1.5} />
                <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-gray-800">Order Placed Successfully!</h1>
                <p className="text-gray-600 mt-2 text-lg">Thank you for your purchase. Your order is being prepared and we'll notify you once it ships.</p>
                
                {orderId && (
                    <div className="mt-8 space-y-6">
                        {/* Order Info Section */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-100">
                            <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center justify-center gap-2">
                                <Package size={24} className="text-red-600" /> Order Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                <div className="flex items-center gap-2">
                                    <User size={20} className="text-gray-500" />
                                    <div>
                                        <span className="text-gray-500 block text-sm">Order ID:</span>
                                        <span className="font-semibold text-gray-800">#{orderId}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={20} className="text-gray-500" />
                                    <div>
                                        <span className="text-gray-500 block text-sm">Booked on:</span>
                                        <span className="font-semibold text-gray-800">{orderDate}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CreditCard size={20} className="text-gray-500" />
                                    <div>
                                        <span className="text-gray-500 block text-sm">Total Amount:</span>
                                        <span className="font-semibold text-gray-800">₹{Number(totalAmount).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-gray-500" />
                                    <div>
                                        <span className="text-gray-500 block text-sm">Items:</span>
                                        <span className="font-semibold text-gray-800">{items?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items List Section */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center justify-center gap-2">
                                <ShoppingBag size={24} className="text-red-600" /> Your Items
                            </h2>
                            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                {items?.map((item, index) => (
                                    <motion.div 
                                        key={index} 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img 
                                                src={item.image_url || 'https://placehold.co/60x60?text=Product'} 
                                                alt={item.name} 
                                                className="h-12 w-12 object-cover rounded-md shadow" 
                                            />
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                <p className="text-sm text-gray-500">{item.variantLabel}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/')} 
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <ShoppingBag size={20} /> Continue Shopping
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/account')} 
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        <User size={20} /> View My Orders
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}