import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Handshake, Store, TrendingUp, User, Briefcase, Mail, Phone, MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';

export default function VendorPage() {
    const [formData, setFormData] = useState({
        your_name: '',
        business_name: '',
        email: '',
        phone_number: '',
        product_details: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/inquiry`, {
                inquiryType: 'Vendor',
                formData: formData
            });
            setStatusMessage(res.data.msg);
            setFormData({ your_name: '', business_name: '', email: '', phone_number: '', product_details: '' }); // Reset form
        } catch (error) {
            setStatusMessage(error.response?.data?.msg || 'An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://images.pexels.com/photos/2255459/pexels-photo-2255459.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Lush Farmland" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-800/80 to-red-600/50"></div>
                </div>
                <motion.div
                    className="relative z-10 max-w-4xl mx-auto text-center py-24 sm:py-32 px-4 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl sm:text-6xl font-bold tracking-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Partner with Sresta Mart</h1>
                    <p className="mt-4 text-lg sm:text-xl max-w-2xl mx-auto" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        Join our mission to deliver pure, high-quality products. We're looking for passionate farmers and producers to grow with us.
                    </p>
                </motion.div>
            </div>

            <div className="py-16 sm:py-24 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">Why Partner With Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <motion.div className="bg-slate-50 p-8 rounded-xl border" whileHover={{ y: -8, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                            <Handshake className="mx-auto h-12 w-12 text-red-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair Pricing</h3>
                            <p className="text-gray-600">We believe in ethical sourcing and offer competitive, fair prices for your high-quality produce.</p>
                        </motion.div>
                        <motion.div className="bg-slate-50 p-8 rounded-xl border" whileHover={{ y: -8, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                            <Store className="mx-auto h-12 w-12 text-red-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Wide Market Reach</h3>
                            <p className="text-gray-600">Connect your products with a large, loyal customer base that values quality and authenticity.</p>
                        </motion.div>
                        <motion.div className="bg-slate-50 p-8 rounded-xl border" whileHover={{ y: -8, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                            <TrendingUp className="mx-auto h-12 w-12 text-red-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth & Support</h3>
                            <p className="text-gray-600">We provide our partners with support and insights to help you grow your business sustainably.</p>
                        </motion.div>
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-50 py-16 sm:py-24">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">Become a Vendor Partner</h2>
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/><input type="text" name="your_name" value={formData.your_name} onChange={handleChange} placeholder="Your Name" required className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" /></div>
                            <div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/><input type="text" name="business_name" value={formData.business_name} onChange={handleChange} placeholder="Business/Farm Name" required className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" /></div>
                            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" /></div>
                            <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/><input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" required className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" /></div>
                        </div>
                        <div className="relative"><MessageSquare className="absolute left-3 top-4 text-gray-400" size={20}/><textarea name="product_details" value={formData.product_details} onChange={handleChange} placeholder="Tell us about your products..." rows="4" required className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"></textarea></div>
                        <div className="text-center">
                            <motion.button type="submit" disabled={isSubmitting} className="bg-red-600 text-white font-bold py-3 px-12 rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2 mx-auto" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                {isSubmitting ? <><Loader2 className="animate-spin" /> Sending...</> : <><Send size={18} /> Submit Inquiry</>}
                            </motion.button>
                        </div>
                        {statusMessage && <p className={`mt-4 text-center text-sm font-semibold ${statusMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{statusMessage}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
}