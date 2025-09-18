import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Phone, Lock } from "lucide-react";
import logoUrl from "../../images/icon.png";

// A beautiful, relevant background image for the branding panel
const brandingImageUrl = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

export default function AuthPage({ setLoggedInUser }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLoginView) {
        const res = await axios.post("http://localhost:4000/api/login", {
          phone,
          password,
        });
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        setLoggedInUser(res.data.user);
      } else {
        const res = await axios.post("http://localhost:4000/api/register", {
          name,
          phone,
          password,
        });
        setSuccess(res.data.msg + " Now you can sign in!");
        setName("");
        setPhone("");
        setPassword("");
        setIsLoginView(true);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
        {/* --- BRANDING PANEL --- */}
        <div 
            className="w-full md:w-1/2 lg:w-3/5 min-h-[50vh] md:min-h-screen flex flex-col justify-between p-8 sm:p-12 text-white relative bg-cover bg-center"
            style={{ backgroundImage: `url(${brandingImageUrl})` }}
        >
            <div className="absolute inset-0 bg-black/60" aria-hidden="true"></div>
            <motion.div 
                initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6}}
                className="relative flex items-center gap-4"
            >
                <img src={logoUrl} alt="Logo" className="h-12 w-12" />
                <span className="text-2xl font-bold font-serif">Sresta Mart</span>
            </motion.div>
            <motion.div 
                initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6, delay: 0.2}}
                className="relative"
            >
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                    Healthy is always wealthy.
                </h1>
                <p className="mt-4 text-lg text-slate-300">
                    Your one-stop shop for fresh, tangy, and tasty products.
                </p>
            </motion.div>
        </div>

        {/* --- FORM PANEL --- */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 sm:p-12">
             <div className="max-w-md w-full">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="w-full"
                >
                    <div className="text-left mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {isLoginView ? "Welcome Back" : "Create Your Account"}
                        </h2>
                        <p className="mt-2 text-gray-500">
                        {isLoginView ? "Sign in to continue to Sresta Mart." : "Join our family to get started."}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                    {isLoginView ? (
                        <motion.form
                            key="login"
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-5"
                        >
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Phone className="absolute left-3.5 top-11 text-gray-400" size={18} />
                                <input
                                    type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                    className="mt-1 block w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition"
                                    placeholder="Your Phone Number"
                                />
                            </div>
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <Lock className="absolute left-3.5 top-11 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full pl-10 pr-10 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-10 text-gray-500 hover:text-gray-800">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                            {success && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-lg">{success}</p>}
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading}
                                className="w-full py-3 px-4 rounded-lg text-base font-semibold bg-red-600 text-white shadow-lg hover:bg-red-700 disabled:opacity-60 transition-all transform"
                            >
                                {isLoading ? "Processing..." : "Sign In"}
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="signup" onSubmit={handleSubmit} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }}
                            className="space-y-5"
                        >
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <User className="absolute left-3.5 top-11 text-gray-400" size={18} />
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <Phone className="absolute left-3.5 top-11 text-gray-400" size={18} />
                                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                    className="mt-1 block w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition"
                                    placeholder="Your Phone Number"
                                />
                            </div>
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <Lock className="absolute left-3.5 top-11 text-gray-400" size={18} />
                                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full pl-10 pr-10 py-3 rounded-lg bg-slate-100 border-2 border-transparent focus:border-red-500 focus:ring-0 outline-none transition"
                                    placeholder="Choose a strong password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-10 text-gray-500 hover:text-gray-800" >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading}
                                className="w-full py-3 px-4 rounded-lg text-base font-semibold bg-red-600 text-white shadow-lg hover:bg-red-700 disabled:opacity-60 transition-all transform"
                            >
                                {isLoading ? "Creating Account..." : "Create Account"}
                            </motion.button>
                        </motion.form>
                    )}
                    </AnimatePresence>

                    <div className="text-center text-sm pt-4">
                        <button
                            onClick={() => { setIsLoginView(!isLoginView); setError(""); setSuccess(""); }}
                            className="font-medium text-red-600 hover:text-red-700 transition-all"
                        >
                            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                        </button>
                    </div>
                </motion.div>
             </div>
        </div>
    </div>
  );
}