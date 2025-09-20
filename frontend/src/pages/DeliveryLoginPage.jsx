import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoUrl from "../../images/icon.png";
// ✅ --- NEW --- Import Eye and EyeOff icons
import { Lock, Phone, Eye, EyeOff } from 'lucide-react';

const brandingImageUrl = "https://images.pexels.com/photos/4393437/pexels-photo-4393437.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

export default function DeliveryLoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    // ✅ --- NEW --- State for password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'https://srestamart.onrender.com'}/api/delivery/login`, { phone, password });
            if (res.data.success) {
                localStorage.setItem('deliveryPartnerToken', res.data.token);
                localStorage.setItem('deliveryPartner', JSON.stringify(res.data.partner));
                navigate('/delivery/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
            <div className="md:w-1/2 lg:w-3/5 relative flex flex-col items-center justify-center p-8 text-white text-center" style={{ backgroundImage: `url(${brandingImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black/60" aria-hidden="true"></div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative z-10">
                    <img src={logoUrl} alt="Logo" className="mx-auto h-20 w-20" />
                    <h1 className="mt-6 text-4xl font-serif font-bold tracking-tight">Sresta Mart</h1>
                    <p className="mt-2 text-lg text-slate-300">Delivery Partner Portal</p>
                </motion.div>
            </div>
            <div className="md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 sm:p-12">
                <div className="max-w-sm w-full">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full">
                        <div className="text-left mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Partner Sign In</h2>
                            <p className="mt-1 text-gray-500">Enter your credentials to view assigned deliveries.</p>
                        </div>
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Phone className="absolute left-3.5 top-11 text-gray-400" size={18} />
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                                    className="mt-1 block w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" />
                            </div>
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <Lock className="absolute left-3.5 top-11 text-gray-400" size={18} />
                                {/* ✅ --- MODIFIED --- Input type is now dynamic */}
                                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                                    className="mt-1 block w-full pl-10 pr-10 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" />
                                {/* ✅ --- NEW --- Button to toggle password visibility */}
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-11 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                            <div>
                                <button type="submit" disabled={isLoading}
                                    className="w-full py-3 px-4 rounded-lg text-base font-semibold bg-red-600 text-white shadow-lg hover:bg-red-700 disabled:opacity-50">
                                    {isLoading ? 'Authenticating...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    ); 
}