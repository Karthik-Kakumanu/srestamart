import React from 'react';
import { motion } from 'framer-motion';
import { Building, Award, Users } from 'lucide-react';

export default function FranchisePage() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <motion.div 
        className="relative bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-20 sm:py-32"
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
            Own a Sresta Mart Franchise
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl max-w-2xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Bring Sresta Mart's promise of purity and quality to your community. A rewarding business opportunity awaits.
          </motion.p>
        </div>
      </motion.div>

      <div className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">The Sresta Mart Advantage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div className="bg-white p-8 rounded-lg shadow-lg" whileHover={{ y: -10 }}>
              <Award className="mx-auto h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trusted Brand</h3>
              <p className="text-gray-600">Leverage our strong brand recognition and reputation for high-quality, authentic products.</p>
            </motion.div>
            <motion.div className="bg-white p-8 rounded-lg shadow-lg" whileHover={{ y: -10 }}>
              <Building className="mx-auto h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Business Model</h3>
              <p className="text-gray-600">Benefit from our established operational procedures and successful business strategies.</p>
            </motion.div>
            <motion.div className="bg-white p-8 rounded-lg shadow-lg" whileHover={{ y: -10 }}>
              <Users className="mx-auto h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Support</h3>
              <p className="text-gray-600">Receive extensive training, marketing, and operational support from our experienced team.</p>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">Request Franchise Information</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Full Name" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                <input type="email" placeholder="Email Address" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                <input type="tel" placeholder="Phone Number" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                <input type="text" placeholder="City of Interest" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none" />
                <textarea placeholder="Your message (optional)..." rows="4" className="md:col-span-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea>
                <div className="md:col-span-2 text-center">
                    <motion.button 
                        type="submit" 
                        className="bg-orange-500 text-white font-bold py-3 px-12 rounded-full hover:bg-orange-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Learn More
                    </motion.button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}

