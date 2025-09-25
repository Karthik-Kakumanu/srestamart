// src/pages/AboutUsPage.jsx (Create this new file)

import React from 'react';
import { motion } from 'framer-motion';
import { Beef, Egg, CookingPot, Milk, Leaf, Wheat } from 'lucide-react';

export default function AboutUsPage() {
  // Data for the product highlight cards
  const productHighlights = [
    {
      icon: <Beef size={28} className="text-red-500" />,
      title: "Organic Meats & Poultry",
      description: "From free-range country chicken and edible birds to tender goat and rabbit, all raised ethically on our organic farms."
    },
    {
      icon: <Egg size={28} className="text-yellow-500" />,
      title: "Farm-Fresh Eggs",
      description: "Nutrient-rich, golden-yolked eggs sourced directly from healthy, naturally-fed country hens (Natu Kodi)."
    },
    {
      icon: <CookingPot size={28} className="text-orange-600" />,
      title: "Authentic Pickles",
      description: "Traditional, homemade non-veg and seafood pickles crafted with cherished recipes and premium, pure ingredients."
    },
    {
      icon: <Milk size={28} className="text-blue-400" />,
      title: "Pure Dairy Products",
      description: "Experience the richness of our farm-to-table dairy, including fresh milk, ghee, and more, free from any additives."
    },
    {
      icon: <Leaf size={28} className="text-green-500" />,
      title: "Premium Dry Fruits",
      description: "A handpicked selection of the finest nuts and dry fruits, packed with natural energy and essential nutrients."
    },
    {
      icon: <Wheat size={28} className="text-amber-500" />,
      title: "Wholesome Millets",
      description: "Discover the ancient power of our organic millet products, a healthy and delicious alternative for modern living."
    }
  ];

  // Animation variants for the product grid
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const gridItemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex-grow bg-slate-50">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white overflow-hidden"
        >
          {/* 1. Hero Image Section */}
          <div className="relative h-64 sm:h-80">
            <img 
              src="https://images.pexels.com/photos/2690323/pexels-photo-2690323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Organic Farm"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl font-bold text-white"
                style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}
              >
                From Our Farm to Your Family
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-4 text-lg text-gray-200 max-w-2xl"
                style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}
              >
                "Rooted in Purity, Nurtured by Nature."
              </motion.p>
            </div>
          </div>

          <div className="max-w-5xl mx-auto p-6 sm:p-10 text-gray-700 leading-relaxed">
            {/* 2. Our Story Section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Journey</h2>
              <p className="mb-4 text-lg">
                Welcome to Sresta Mart! We started our journey in **2020** with a simple but powerful mission: to bring pure, healthy, and ethically sourced organic products from our farms in Andhra Pradesh directly to your table. We saw a need for authentic, trustworthy food and decided to be the bridge between nature's best and your family's health.
              </p>
            </motion.div>

            {/* 3. Product Showcase Section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8 }}
              className="mt-12"
            >
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">A Glimpse of Our Offerings</h2>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={gridContainerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
              >
                {productHighlights.map((item, index) => (
                  <motion.div 
                    key={index}
                    variants={gridItemVariants}
                    className="bg-slate-50 border border-slate-200/80 p-6 rounded-xl text-center"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md mb-4">
                      {item.icon}
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* 4. Our Promise Section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8 }}
              className="mt-12 text-center bg-red-50 p-8 rounded-2xl"
            >
              <h2 className="text-3xl font-bold text-red-700 mb-4">The Sresta Mart Promise</h2>
              <p className="max-w-3xl mx-auto text-lg">
                Every product we offer is a testament to our commitment to quality, health, and tradition. We believe that pure food is the foundation of a happy life, and we are honored to be a part of your wellness journey. Thank you for choosing Sresta Mart.
              </p>
            </motion.div>
          </div>
        </motion.div>
    </div>
  );
}