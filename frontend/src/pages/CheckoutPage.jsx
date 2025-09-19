import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, PlusCircle, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CheckoutPage({ user, addresses, setAddresses, setCheckoutDetails, cartItems }) {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setSelectedAddress(addresses[0]);
    } else {
      setShowNewAddressForm(true);
    }
  }, [addresses]);
  
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
      return (
          <div className="flex-grow bg-slate-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-lg mx-auto"
            >
              <ShoppingBag className="mx-auto text-red-200 h-24 w-24" strokeWidth={1} />
              <h2 className="mt-6 text-2xl font-bold text-gray-800">Your Cart is Empty</h2>
              <p className="text-gray-500 mt-2">You can't proceed to checkout without any items. Let's find something for you!</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/" className="mt-8 inline-flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl">
                    Back to Shopping
                </Link>
              </motion.div>
            </motion.div>
          </div>
      );
  }

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      alert("Please select or add a shipping address.");
      return;
    }
    setCheckoutDetails(prev => ({
      ...prev,
      shippingAddress: selectedAddress
    }));
    navigate('/payment');
  };

  return (
    <div className="flex-grow bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-xl"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Shipping Information</h1>
          <p className="text-gray-500 mb-6">Confirm your details and delivery address.</p>

          <div className="mb-6 p-4 border rounded-xl bg-slate-50">
            <p>Deliver to: <span className="font-bold text-gray-800">{user.name}</span></p>
            <p>Contact: <span className="font-bold text-gray-800">{user.phone}</span></p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Select Shipping Address</h2>
            <div className="space-y-4">
              {addresses.map((addr, index) => (
                <AddressCard 
                    key={index} 
                    address={addr} 
                    isSelected={selectedAddress?.value === addr.value} 
                    onSelect={() => { setSelectedAddress(addr); setShowNewAddressForm(false); }}
                />
              ))}
              <button onClick={() => { setShowNewAddressForm(true); setSelectedAddress(null); }}
                className={`w-full p-4 border-2 rounded-xl text-left transition-all ${showNewAddressForm ? 'border-red-500 bg-red-50/50' : 'border-gray-300 border-dashed hover:border-red-400'}`}>
                 <span className="font-semibold text-red-600 flex items-center gap-2"><PlusCircle size={20} /> Add a New Address</span>
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {showNewAddressForm && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <NewAddressForm setAddresses={setAddresses} setSelectedAddress={setSelectedAddress} setShowNewAddressForm={setShowNewAddressForm} />
                </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
        >
            <div className="bg-white p-6 rounded-2xl shadow-xl sticky top-28">
                <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Order Summary</h3>
                <div className="space-y-2 my-4 text-sm max-h-48 overflow-y-auto pr-2">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-gray-600">
                            <span>{item.name} <span className="text-xs"> (x{item.quantity})</span></span>
                            <span className="font-medium text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium text-gray-900">₹{cartSubtotal.toFixed(2)}</span></div>
                    {/* Shipping line removed from here */}
                    <div className="flex justify-between font-bold text-xl text-gray-800 pt-4 border-t border-gray-200"><span>Total</span><span>₹{cartSubtotal.toFixed(2)}</span></div>
                </div>
                 <p className="text-xs text-center text-gray-400 my-4">Final shipping cost will be calculated on the next page.</p>
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleProceedToPayment} 
                    disabled={!selectedAddress}
                    className="w-full flex items-center justify-center gap-2 mt-6 bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-all text-lg shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Proceed to Payment <ArrowRight size={20} />
                </motion.button>
            </div>
        </motion.div>

      </div>
    </div>
  );
}

const AddressCard = ({ address, isSelected, onSelect }) => (
    <motion.div 
        onClick={onSelect}
        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected ? 'border-red-500 bg-red-50/50 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-400'}`}
        whileTap={{ scale: 0.98 }}
    >
        <div className="flex items-center">
            <div className="flex-shrink-0 text-red-600">
                {address.label.toLowerCase() === 'home' ? <Home /> : <Briefcase />}
            </div>
            <div className="ml-4">
                <p className="font-bold text-gray-800">{address.label}</p>
                <p className="text-gray-600 text-sm">{address.value}</p>
            </div>
        </div>
    </motion.div>
);

function NewAddressForm({ setAddresses, setSelectedAddress, setShowNewAddressForm }) {
    const [addressValue, setAddressValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSaveNewAddress = async (e) => {
        e.preventDefault();
        if (!addressValue.trim()) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const newAddress = { label: "Home", value: addressValue };
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/addresses`, { newAddress }, {
                headers: { 'x-auth-token': token }
            });
            setAddresses(res.data);
            setSelectedAddress(newAddress);
            setShowNewAddressForm(false);
        } catch (error) {
            console.error("Failed to save new address:", error);
            alert("Could not save the address. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSaveNewAddress} className="mt-4 p-4 border-t border-gray-200">
            <h4 className="font-semibold text-lg mb-3 text-gray-700">Enter New Address Details</h4>
            <textarea
                value={addressValue}
                onChange={(e) => setAddressValue(e.target.value)}
                placeholder="Full Address (e.g., 123 Main St, Ponnur, 522124)"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-0 outline-none transition"
                rows="3"
                required
            />
            <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                type="submit" 
                disabled={isSubmitting} 
                className="mt-3 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
                {isSubmitting ? 'Saving...' : 'Save and Use this Address'}
            </motion.button>
        </form>
    );
}