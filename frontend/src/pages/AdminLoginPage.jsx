import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoUrl from "../../images/icon.png";
import { Lock, User } from 'lucide-react';

// A high-quality, relevant background image for the branding panel
const brandingImageUrl = "https://images.pexels.com/photos/1458916/pexels-photo-1458916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/login`, { username, password });
            if (res.data.success) {
                localStorage.setItem('adminToken', res.data.token);
                navigate('/admin');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Animation variants for Framer Motion
    const formContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const formItemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut",
            },
        },
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
            {/* --- Branding Panel (Left Side on Desktop) --- */}
            <div className="md:w-1/2 lg:w-3/5 relative flex flex-col items-center justify-center p-8 text-white text-center" style={{ backgroundImage: `url(${brandingImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black/60" aria-hidden="true"></div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10"
                >
                    <img src={logoUrl} alt="Logo" className="mx-auto h-20 w-20" />
                    <h1 className="mt-6 text-4xl font-serif font-bold tracking-tight text-shadow">Sresta Mart</h1>
                    <p className="mt-2 text-lg text-slate-300">Admin Control Panel</p>
                </motion.div>
            </div>

            {/* --- Form Panel (Right Side on Desktop) --- */}
            <div className="md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 sm:p-12">
                <div className="max-w-sm w-full">
                    <motion.div
                        variants={formContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full"
                    >
                        <motion.div variants={formItemVariants} className="text-left mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Admin Sign In</h2>
                            <p className="mt-1 text-gray-500">Please enter your credentials to proceed.</p>
                        </motion.div>
                        
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <motion.div variants={formItemVariants} className="relative">
                                <label className="text-sm font-medium text-gray-700">Admin Username</label>
                                <User className="absolute left-3.5 top-11 text-gray-400" size={18} />
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
                                    className="mt-1 block w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" />
                            </motion.div>
                            
                            <motion.div variants={formItemVariants} className="relative">
                                <label className="text-sm font-medium text-gray-700">Admin Password</label>
                                <Lock className="absolute left-3.5 top-11 text-gray-400" size={18} />
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                    className="mt-1 block w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" />
                            </motion.div>
                            
                            {error && 
                                <motion.p 
                                    initial={{opacity: 0}} animate={{opacity: 1}}
                                    className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg"
                                >
                                    {error}
                                </motion.p>
                            }
                            
                            <motion.div variants={formItemVariants}>
                                <button type="submit" disabled={isLoading}
                                    className="w-full py-3 px-4 rounded-lg text-base font-semibold bg-gray-800 text-white shadow-lg hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]">
                                    {isLoading ? 'Authenticating...' : 'Sign In'}
                                </button>
                            </motion.div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}