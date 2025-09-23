import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import logoUrl from '../images/icon.png';
import { Home, ShoppingCart, Tag, User, Menu, X, Building, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ loggedInUser, handleLogout, cartItems }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const cartItemCount = (Array.isArray(cartItems) ? cartItems : []).reduce((acc, item) => acc + item.quantity, 0);
    const activeLinkStyle = { color: '#dc2626' };

    const menuVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
        exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="bg-white/80 backdrop-blur-sm shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center space-x-3">
                    <img src={logoUrl} alt="Sresta Mart Logo" className="h-10 w-auto" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Sresta Mart</h1>
                        <p className="text-sm text-gray-600"> Hello, {loggedInUser?.name || 'Guest'}!</p>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                <Outlet />
            </main>

            <footer className="sticky bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] p-2 z-40">
                <AnimatePresence>
                    {isMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMenuOpen(false)}
                                className="fixed inset-0 bg-black/40 z-40"
                            />
                            <motion.div
                                variants={menuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm bg-white rounded-2xl shadow-2xl p-4 z-50"
                            >
                                <h3 className="font-bold text-gray-700 text-center mb-4">Explore Portals</h3>
                                <div className="space-y-2">
                                    <Link to="/vendor" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 text-gray-600 font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-all">
                                        <Truck className="text-red-500" />
                                        <span>Vendor Portal</span>
                                    </Link>
                                    <Link to="/franchise" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-3 text-gray-600 font-medium rounded-lg hover:bg-red-50 hover:text-red-600 transition-all">
                                        <Building className="text-red-500" />
                                        <span>Franchise Portal</span>
                                    </Link>
                                </div>
                                <button onClick={() => setIsMenuOpen(false)} className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
                    <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-3 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                        <Home /><span className="text-xs font-bold mt-1">Home</span>
                    </NavLink>
                    <NavLink to="/cart" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="relative flex flex-col items-center p-3 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                        {cartItemCount > 0 && <span className="absolute top-1 right-3 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartItemCount}</span>}
                        <ShoppingCart /><span className="text-xs font-bold mt-1">Cart</span>
                    </NavLink>
                    <NavLink to="/coupons" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-3 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                        <Tag /><span className="text-xs font-bold mt-1">Coupons</span>
                    </NavLink>
                    <NavLink to="/account" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-3 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                        <User /><span className="text-xs font-bold mt-1">Account</span>
                    </NavLink>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex flex-col items-center p-3 rounded-lg text-gray-500 hover:text-red-500 focus:outline-none focus:text-red-500 transition-colors">
                        <Menu /><span className="text-xs font-bold mt-1">More</span>
                    </button>
                </div>
            </footer>
        </div>
    );
}
