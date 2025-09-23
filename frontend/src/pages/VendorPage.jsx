import React from 'react';
import { Truck, Package, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const VendorPage = () => {
    const features = [
        { icon: <TrendingUp />, title: "Wider Reach", description: "Access our growing customer base across the region." },
        { icon: <Package />, title: "Streamlined Logistics", description: "Leverage our efficient delivery network and fulfillment." },
        { icon: <Star />, title: "Brand Growth", description: "Partner with a trusted brand known for quality and purity." }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center"
                >
                    <Truck className="mx-auto h-12 w-12 text-red-600" />
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Partner with Sresta Mart
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Join our curated marketplace and bring your quality products to thousands of eager customers.
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                    className="mt-12 bg-white p-8 rounded-2xl shadow-lg"
                >
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Why Sell With Us?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-600 mx-auto">
                                    {React.cloneElement(feature.icon, { size: 24 })}
                                </div>
                                <h4 className="mt-4 text-lg font-semibold">{feature.title}</h4>
                                <p className="mt-1 text-gray-500">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                    className="mt-10 bg-white p-8 rounded-2xl shadow-lg"
                >
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Become a Vendor Partner</h3>
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="business-name" className="block text-sm font-medium text-gray-700">Business Name</label>
                            <input type="text" id="business-name" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
                        </div>
                        <div>
                            <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700">Contact Person</label>
                            <input type="text" id="contact-name" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" id="email" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" id="phone" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
                        </div>
                        <div className="text-right">
                            <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Submit Inquiry
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default VendorPage;
