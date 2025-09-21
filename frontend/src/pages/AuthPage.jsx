// src/pages/AuthPage.jsx (Full Frontend Code)

import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Phone, Lock, KeyRound } from "lucide-react";
import logoUrl from "../../images/icon.png";

// CHANGED IMAGE URL: This image now represents non-veg items (fresh, uncooked poultry)
const brandingImageUrl = "https://images.pexels.com/photos/616335/pexels-photo-616335.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"; 
// Alternative options could be:
// For eggs: "https://images.pexels.com/photos/162712/egg-yolk-chicken-raw-162712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
// For fresh meat variety: "https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" (Your previous one, which is also good for general fresh non-veg)


export default function AuthPage({ setLoggedInUser }) {
  const [view, setView] = useState('login');
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetFormState = () => {
    setError("");
    setSuccess("");
    // Keep phone number if moving between password reset steps
    if (view !== 'forgotPassword' && view !== 'resetPassword') {
        setPhone("");
    }
    setPassword("");
    setOtp("");
    setNewPassword("");
    setName("");
  };

  const handleViewChange = (newView) => {
    resetFormState();
    setView(newView);
  };
  
  const handleSubmitAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (view === 'login') {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, { phone, password });
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        setLoggedInUser(res.data.user);
      } else { // 'signup'
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, { name, phone, password });
        setSuccess(res.data.msg + " Now you can sign in!");
        handleViewChange('login');
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong.");
    }
    setIsLoading(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/forgot-password-twilio`, { phone });
        setSuccess("An OTP has been sent. Please check your messages.");
        setView('resetPassword');
    } catch (err) {
        setError(err.response?.data?.msg || "Failed to send OTP.");
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/reset-password-twilio`, { phone, otp, newPassword });
        setSuccess(res.data.msg);
        handleViewChange('login');
    } catch (err) {
        setError(err.response?.data?.msg || "Password reset failed.");
    }
    setIsLoading(false);
  };
  
  const getTitle = () => {
    switch (view) {
      case 'login': return "Welcome Back";
      case 'signup': return "Create Your Account";
      case 'forgotPassword': return "Forgot Password";
      case 'resetPassword': return "Reset Your Password";
      default: return "";
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'login': return "Sign in to continue to Sresta Mart.";
      case 'signup': return "Join our family to get started.";
      case 'forgotPassword': return "Enter your phone number to receive a reset code.";
      case 'resetPassword': return "Enter the OTP from your phone and your new password.";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      <div 
        className="w-full md:w-1/2 lg:w-3/5 min-h-[50vh] md:min-h-screen flex flex-col justify-between p-8 sm:p-12 text-white relative bg-cover bg-center"
        style={{ backgroundImage: `url(${brandingImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/60" aria-hidden="true"></div>
        <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6}} className="relative flex items-center gap-4">
          <img src={logoUrl} alt="Logo" className="h-12 w-12" />
          <span className="text-2xl font-bold font-serif">Sresta Mart</span>
        </motion.div>
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6, delay: 0.2}} className="relative">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">Healthy is always wealthy.</h1>
          <p className="mt-4 text-lg text-slate-300">Your one-stop shop for fresh, tangy, and tasty products.</p>
        </motion.div>
      </div>
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full"
          >
            <div className="text-left mb-8">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{getTitle()}</h2>
              <p className="mt-2 text-gray-500">{getSubtitle()}</p>
            </div>
            
            <AnimatePresence mode="wait">
              {view === 'login' && (
                <motion.form key="login" onSubmit={handleSubmitAuth} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="space-y-5">
                  <div className="relative"><label className="text-sm font-medium text-gray-700">Phone Number</label><Phone className="absolute left-3.5 top-11 text-gray-400" size={18} /><input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" placeholder="Your Phone Number" /></div>
                  <div className="relative"><label className="text-sm font-medium text-gray-700">Password</label><Lock className="absolute left-3.5 top-11 text-gray-400" size={18} /><input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full pl-10 pr-10 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-10 text-gray-500 hover:text-gray-800">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
                  <div className="text-right -mt-2"><button type="button" onClick={() => handleViewChange('forgotPassword')} className="text-sm font-medium text-red-600 hover:text-red-700">Forgot Password?</button></div>
                  {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}{success && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-lg">{success}</p>}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-lg text-base font-semibold bg-red-600 text-white shadow-lg hover:bg-red-700 disabled:opacity-60 transition-all transform">{isLoading ? "Processing..." : "Sign In"}</motion.button>
                </motion.form>
              )}

              {view === 'signup' && (
                <motion.form key="signup" onSubmit={handleSubmitAuth} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }} className="space-y-5">
                    <div className="relative"><label className="text-sm font-medium text-gray-700">Full Name</label><User className="absolute left-3.5 top-11 text-gray-400" size={18} /><input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" placeholder="Your Name" /></div>
                    <div className="relative"><label className="text-sm font-medium text-gray-700">Phone Number</label><Phone className="absolute left-3.5 top-11 text-gray-400" size={18} /><input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" placeholder="Your Phone Number" /></div>
                    <div className="relative"><label className="text-sm font-medium text-gray-700">Password</label><Lock className="absolute left-3.5 top-11 text-gray-400" size={18} /><input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full pl-10 pr-10 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" placeholder="Choose a strong password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-10 text-gray-500 hover:text-gray-800">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-lg text-base font-semibold bg-red-600 text-white shadow-lg hover:bg-red-700 disabled:opacity-60 transition-all transform">{isLoading ? "Creating Account..." : "Create Account"}</motion.button>
                </motion.form>
              )}
              
              {view === 'forgotPassword' && (
                <motion.form key="forgotPassword" onSubmit={handleSendOtp} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
                    <div className="relative"><label className="text-sm font-medium text-gray-700">Registered Phone Number</label><Phone className="absolute left-3.5 top-11 text-gray-400" size={18} /><input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" placeholder="Your Phone Number" /></div>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}{success && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-lg">{success}</p>}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-lg text-base font-semibold bg-red-600 text-white shadow-lg hover:bg-red-700 disabled:opacity-60 transition-all transform">{isLoading ? "Sending OTP..." : "Send OTP"}</motion.button>
                </motion.form>
              )}

              {view === 'resetPassword' && (
                <motion.form key="resetPassword" onSubmit={handlePasswordReset} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
                    <div className="relative"><label className="text-sm font-medium text-gray-700">OTP Code</label><KeyRound className="absolute left-3.5 top-11 text-gray-400" size={18} /><input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className="mt-1 block w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" placeholder="6-digit code from SMS" /></div>
                    <div className="relative"><label className="text-sm font-medium text-gray-700">New Password</label><Lock className="absolute left-3.5 top-11 text-gray-400" size={18} /><input type={showPassword ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full pl-10 pr-10 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition" placeholder="Choose a new strong password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-10 text-gray-500 hover:text-gray-800">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-lg text-base font-semibold bg-red-600 text-white shadow-lg hover:bg-red-700 disabled:opacity-60 transition-all transform">{isLoading ? "Resetting Password..." : "Reset Password"}</motion.button>
                </motion.form>
              )}
            </AnimatePresence>
            
            <div className="text-center text-sm pt-4">
              <button onClick={() => {
                  if (view === 'login') {
                      handleViewChange('signup');
                  } else if (view === 'signup') {
                      handleViewChange('login');
                  } else {
                      handleViewChange('login');
                  }
              }} className="font-medium text-red-600 hover:text-red-700 transition-all">
                {view === 'login' ? "Don't have an account? Sign Up" 
                 : view === 'signup' ? "Already have an account? Sign In" 
                 : "Back to Sign In"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}