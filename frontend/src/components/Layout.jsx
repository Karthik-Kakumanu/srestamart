import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingCart, Tag, User, HelpCircle, Phone, MessageSquare, Instagram, X } from 'lucide-react';

import logoUrl from '../assets/logo.png';

const NotificationBadge = ({ count }) => {
    if (!count || count <= 0) return null;
    return (
        <span className="absolute top-1 right-2.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            {count}
        </span>
    );
};

export default function Layout({ loggedInUser, cartItems, coupons, orders }) {
    const [isContactModalOpen, setContactModalOpen] = useState(false);
    
    const cartItemCount = (Array.isArray(cartItems) ? cartItems : []).reduce((acc, item) => acc + item.quantity, 0);
    const couponCount = Array.isArray(coupons) ? coupons.length : 0;
    const deliveryCount = (Array.isArray(orders) ? orders : []).filter(o => o.status === 'out_for_delivery').length;

    useEffect(() => {
        if (loggedInUser?.isNewUser) {
            toast.success(`Welcome to Sresta Mart, ${loggedInUser.name}!`, {
                duration: 4000,
                position: 'top-right',
                style: { background: '#10B981', color: 'white', fontWeight: 'bold' },
            });
        }
    }, [loggedInUser]);

    const activeLinkStyle = {
        color: '#dc2626',
        background: '#fee2e2'
    };
    
    const phoneNumber = '9494837550';
    const instagramHandles = ['sresta_mart', 'sresta_organic_farms'];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Toaster />
            
            <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200/80">
                <div className="flex items-center space-x-3">
                    <img src={logoUrl} alt="Sresta Mart Logo" className="h-10 w-auto" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Sresta Mart</h1>
                        <p className="text-sm text-gray-600">Hello, {loggedInUser?.name || 'Guest'}!</p>
                    </div>
                </div>
            </header>

            <main className="flex-grow pb-24">
                <Outlet />
            </main>

            <AnimatePresence>
                {isContactModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setContactModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800">Contact & Support</h2>
                                <button onClick={() => setContactModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                                    <X size={20} className="text-gray-600" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <a href={`tel:+91${phoneNumber}`} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full">
                                    <Phone size={20} className="text-blue-500" />
                                    <span className="ml-3 font-semibold text-gray-700">Call Us</span>
                                </a>
                                <a href={`https://wa.me/91${phoneNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full">
                                    <MessageSquare size={20} className="text-green-500" />
                                    <span className="ml-3 font-semibold text-gray-700">WhatsApp</span>
                                </a>
                                <a href={`https://instagram.com/${instagramHandles[0]}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full">
                                    <Instagram size={20} className="text-pink-500" />
                                    <span className="ml-3 font-semibold text-gray-700">Instagram</span>
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-40">
                <div className="max-w-md mx-auto grid grid-cols-5 gap-1 p-1">
                    <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                        <Home /><span className="text-xs font-bold mt-1">Home</span>
                    </NavLink>
                    <NavLink to="/cart" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="relative flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                        <NotificationBadge count={cartItemCount} />
                        <ShoppingCart /><span className="text-xs font-bold mt-1">Cart</span>
                    </NavLink>
                    <NavLink to="/coupons" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="relative flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                        <NotificationBadge count={couponCount} />
                        <Tag /><span className="text-xs font-bold mt-1">Coupons</span>
                    </NavLink>
                    <NavLink to="/account" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="relative flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                        <NotificationBadge count={deliveryCount} />
                        <User /><span className="text-xs font-bold mt-1">Account</span>
                    </NavLink>
                    <button onClick={() => setContactModalOpen(true)} className="flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                        <HelpCircle /><span className="text-xs font-bold mt-1">Help</span>
                    </button>
                </div>
            </footer>
        </div>
    );
}