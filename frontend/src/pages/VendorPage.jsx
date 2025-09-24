import React from 'react';
import { motion } from 'framer-motion';
import { Handshake, Store, TrendingUp } from 'lucide-react';

export default function VendorPage() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <motion.div 
        className="relative bg-gradient-to-r from-red-600 to-red-800 text-white text-center py-20 sm:py-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.h1 
            className="text-4xl sm:text-6xl font-bold mb-4"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Partner with Sresta Mart
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl max-w-2xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Join our mission to deliver pure, high-quality products. We're looking for passionate farmers and producers to grow with us.
          </motion.p>
        </div>
      </motion.div>

      <div className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">Why Partner With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg"
              whileHover={{ y: -10 }}
            >
              <Handshake className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair Pricing</h3>
              <p className="text-gray-600">We believe in ethical sourcing and offer competitive, fair prices for your high-quality produce.</p>
            </motion.div>
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg"
              whileHover={{ y: -10 }}
            >
              <Store className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Wide Market Reach</h3>
              <p className="text-gray-600">Connect your products with a large, loyal customer base that values quality and authenticity.</p>
            </motion.div>
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-lg"
              whileHover={{ y: -10 }}
            >
              <TrendingUp className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth & Support</h3>
              <p className="text-gray-600">We provide our partners with support and insights to help you grow your business sustainably.</p>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">Become a Vendor Partner</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Your Name" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none" />
                <input type="text" placeholder="Business/Farm Name" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none" />
                <input type="email" placeholder="Email Address" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none" />
                <input type="tel" placeholder="Phone Number" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none" />
                <textarea placeholder="Tell us about your products..." rows="4" className="md:col-span-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"></textarea>
                <div className="md:col-span-2 text-center">
                    <motion.button 
                        type="submit" 
                        className="bg-red-600 text-white font-bold py-3 px-12 rounded-full hover:bg-red-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Submit Inquiry
                    </motion.button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}

