import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage({ cartItems, handleQuantityChange, handleRemoveFromCart, setCheckoutDetails }) {
  const navigate = useNavigate();
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleProceedToCheckout = () => {
    setCheckoutDetails({
      items: cartItems,
      totalAmount: cartSubtotal,
      shippingAddress: null
    });
    navigate('/checkout');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

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
          <h2 className="mt-6 text-2xl font-bold text-gray-800">Your Cart is a Blank Canvas</h2>
          <p className="text-gray-500 mt-2">Looks like you haven't added anything yet. Let's find something amazing for you!</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="mt-8 inline-flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl">
                Start Shopping <ArrowRight size={20}/>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="flex-grow bg-slate-50 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-gray-800 mb-8"
            >
                Your Shopping Cart
            </motion.h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="lg:col-span-2 space-y-4"
                >
                    {cartItems.map((item) => (
                        <motion.div key={item.id} variants={itemVariants} className="flex items-center bg-white p-4 rounded-2xl shadow-lg">
                            <img src={item.image_url || 'https://placehold.co/100x100'} alt={item.name} className="h-24 w-24 object-cover rounded-xl" />
                            <div className="flex-grow ml-5">
                                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                                <p className="text-sm text-gray-500">{item.variantLabel}</p>
                                <p className="text-md text-red-600 font-semibold mt-1">₹{item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-3 bg-slate-100 p-2 rounded-lg">
                                <button onClick={() => handleQuantityChange(item.id, -1)} className="p-1.5 rounded-md hover:bg-slate-200 transition-colors"><Minus size={16} /></button>
                                <span className="font-semibold w-8 text-center text-lg">{item.quantity}</span>
                                <button onClick={() => handleQuantityChange(item.id, 1)} className="p-1.5 rounded-md hover:bg-slate-200 transition-colors"><Plus size={16} /></button>
                            </div>
                            <span className="font-bold text-xl text-gray-800 w-28 text-right hidden sm:block">₹{(item.price * item.quantity).toFixed(2)}</span>
                            <button onClick={() => handleRemoveFromCart(item.id)} className="ml-4 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                        </motion.div>
                    ))}
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-white p-6 rounded-2xl shadow-xl sticky top-28">
                        <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Order Summary</h3>
                        <div className="space-y-4 my-6 text-lg">
                            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium text-gray-900">₹{cartSubtotal.toFixed(2)}</span></div>
                            {/* Shipping line removed from here */}
                            <div className="flex justify-between font-bold text-2xl text-gray-800 pt-4 border-t border-gray-200"><span>Total</span><span>₹{cartSubtotal.toFixed(2)}</span></div>
                        </div>
                        <p className="text-xs text-center text-gray-400 mb-4">Shipping and discounts will be calculated at checkout.</p>
                        <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                            onClick={handleProceedToCheckout} 
                            className="w-full flex items-center justify-center gap-2 mt-6 bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-all text-lg shadow-lg hover:shadow-xl"
                        >
                            Proceed to Checkout <ArrowRight size={20} />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    </div>
  );
};