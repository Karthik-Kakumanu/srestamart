import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Home, Briefcase, MapPin, Trash2 } from 'lucide-react';

const brandingImageUrl = "https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

export default function ManageAddressPage({ addresses, setAddresses }) {
    const [label, setLabel] = useState('');
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!label || !value) {
            setError("Both a label (e.g., Home) and an address are required.");
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const newAddress = { label, value };
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/addresses`, { newAddress }, {
                headers: { 'x-auth-token': token }
            });
            setAddresses(res.data);
            setLabel('');
            setValue('');
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to add address.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAddress = async (addressToDelete) => {
        // In a real app, you would make an API call to delete the address from the database.
        // For this demo, we'll filter it from the local state.
        if (window.confirm(`Are you sure you want to delete the address labeled "${addressToDelete.label}"?`)) {
            setAddresses(prev => prev.filter(addr => addr.value !== addressToDelete.value));
        }
    };

    return (
        <div className="flex-grow bg-slate-100">
            {/* --- HERO HEADER --- */}
            <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${brandingImageUrl})` }}>
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <MapPin className="mx-auto h-16 w-16 text-white" strokeWidth={1.5} />
                        <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-white tracking-tight">Manage Your Addresses</h1>
                        <p className="mt-2 text-lg text-slate-300">Add, view, and manage your delivery locations with ease.</p>
                    </motion.div>
                </div>
            </div>
            
            <div className="p-4 sm:p-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-3xl mx-auto -mt-24 relative"
                >
                    {/* --- ADD NEW ADDRESS FORM --- */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Add a New Address</h2>
                        <form onSubmit={handleAddAddress} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Label</label>
                                <input type="text" placeholder="e.g., Home, Work Office" value={label} onChange={(e) => setLabel(e.target.value)}
                                    className="mt-1 block w-full border-2 border-gray-200 rounded-lg shadow-sm p-3 focus:border-red-500 focus:ring-0 outline-none transition"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Address</label>
                                <textarea placeholder="123 Main Street, Ponnur, Andhra Pradesh, 522124" value={value} onChange={(e) => setValue(e.target.value)}
                                    rows="3" className="mt-1 block w-full border-2 border-gray-200 rounded-lg shadow-sm p-3 focus:border-red-500 focus:ring-0 outline-none transition"></textarea>
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit" disabled={isSubmitting}
                                className="w-full flex justify-center items-center gap-2 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-all shadow-lg"
                            >
                                <PlusCircle size={20} />
                                {isSubmitting ? 'Saving...' : 'Save New Address'}
                            </motion.button>
                        </form>
                    </div>

                    {/* --- SAVED ADDRESSES LIST --- */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Saved Addresses</h2>
                        <AnimatePresence>
                            {addresses.length > 0 ? (
                                <motion.div className="space-y-4">
                                    {addresses.map((addr, index) => (
                                        <motion.div 
                                            key={addr.value}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                                            className="p-4 border rounded-xl flex items-start justify-between group hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 text-red-600 mt-1">
                                                    {addr.label.toLowerCase().includes('home') ? <Home /> : <Briefcase />}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="font-bold text-gray-800">{addr.label}</p>
                                                    <p className="text-gray-600 text-sm">{addr.value}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteAddress(addr)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-8">
                                    <MapPin className="mx-auto h-16 w-16 text-red-200" strokeWidth={1} />
                                    <p className="mt-4 text-gray-500">You haven't saved any addresses yet.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}