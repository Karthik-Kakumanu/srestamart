import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Gift } from 'lucide-react';

export default function CouponsPage({ isFirstOrder }) {
  return (
    <div className="flex-grow bg-slate-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
        >
            <Tag className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-800">Your Coupons</h1>
            <p className="mt-2 text-lg text-gray-500">Here are the special offers available to you.</p>
        </motion.div>

        {isFirstOrder ? (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden group transition-all duration-300 hover:shadow-2xl"
            >
                <div className="p-8 bg-gradient-to-br from-red-50 to-orange-100 text-center flex flex-col justify-center items-center md:w-1/3">
                    <h3 className="text-5xl font-bold text-red-600">10%</h3>
                    <p className="text-xl font-semibold text-red-500">OFF</p>
                </div>
                <div className="p-8 flex-grow">
                    <h2 className="font-bold text-2xl text-gray-800">Welcome to Sresta Mart!</h2>
                    <p className="text-gray-600 mt-2">
                        As a special gift for your first order, a <strong>10% discount</strong> will be automatically applied to your total at checkout. No code needed!
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                        This offer is valid only for your first purchase.
                    </p>
                </div>
            </motion.div>
        ) : (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-white p-12 rounded-2xl shadow-xl"
            >
                <Gift className="mx-auto text-red-200 h-24 w-24" strokeWidth={1} />
                <h2 className="mt-6 text-2xl font-bold text-gray-800">No Coupons Available Right Now</h2>
                <p className="text-gray-500 mt-2">We appreciate your loyalty! Please check back later for new deals and offers.</p>
            </motion.div>
        )}
      </div>
    </div>
  );
}