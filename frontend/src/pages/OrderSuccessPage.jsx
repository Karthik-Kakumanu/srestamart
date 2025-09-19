import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, User } from 'lucide-react';

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
        const newConfetti = Array.from({ length: 100 }).map((_, i) => ({
            id: Date.now() + i,
            x: centerX,
            y: centerY,
            color: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'][Math.floor(Math.random() * 5)],
            angle: Math.random() * 360,
            distance: 100 + Math.random() * (Math.max(window.innerWidth, window.innerHeight) / 2),
        }));
        setConfetti(newConfetti);
    }, []);

    return (
        <div className="flex-grow bg-slate-100 p-4 sm:p-8 flex items-center justify-center">
            {confetti.map(c => <ConfettiPiece key={c.id} {...c} />)}
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.6, 0.01, -0.05, 0.9] }}
                className="max-w-2xl w-full mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-xl text-center"
            >
                <CheckCircle className="mx-auto text-green-500 h-20 w-20" strokeWidth={1.5} />
                <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-gray-800">Order Placed Successfully!</h1>
                <p className="text-gray-600 mt-2">Thank you for your purchase. We'll notify you once it ships.</p>
                
                {orderId && (
                    <div className="mt-8 text-left bg-slate-50 p-6 rounded-xl border">
                        <h2 className="font-bold text-lg text-gray-700 mb-4">Order Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order ID:</span>
                                <span className="font-semibold text-gray-800">#{orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Amount:</span>
                                <span className="font-semibold text-gray-800">₹{Number(totalAmount).toFixed(2)}</span>
                            </div>
                            <div className="pt-2 border-t">
                                <span className="text-gray-500">Items:</span>
                                <ul className="list-disc list-inside text-gray-700 mt-1">
                                    {items?.map((item, index) => (
                                        <li key={index}>{item.name} (x{item.quantity})</li>
                                    ))}
                                </ul>
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