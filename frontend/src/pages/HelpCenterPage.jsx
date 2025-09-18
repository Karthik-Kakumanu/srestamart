import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Instagram, ChevronDown, HelpCircle } from 'lucide-react';

const brandingImageUrl = "https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

const faqData = [
    {
        question: "How do I track my order?",
        answer: "Once your order is shipped, you will receive an update. You can also view the status of all your orders in the 'Order History' section of your Account page."
    },
    {
        question: "What are the delivery charges?",
        answer: "We are happy to offer FREE delivery on all orders within our serviceable areas in Ponnur. There are no hidden charges."
    },
    {
        question: "How can I be sure of the quality of the products?",
        answer: "Quality is our top priority. We source our products fresh and ensure they go through rigorous quality checks before being dispatched. Our Natu Kodi eggs are farm-fresh and packed with care."
    },
    {
        question: "Can I change my delivery address after placing an order?",
        answer: "Unfortunately, the delivery address cannot be changed once an order is placed. Please ensure you select the correct address from your saved addresses during checkout."
    }
];

export default function HelpCenterPage() {
    return (
        <div className="flex-grow bg-slate-100">
            {/* --- HERO HEADER --- */}
            <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${brandingImageUrl})` }}>
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <HelpCircle className="mx-auto h-16 w-16 text-white" strokeWidth={1.5} />
                        <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-white tracking-tight">How can we help?</h1>
                        <p className="mt-2 text-lg text-slate-300">We're here to answer your questions and provide support.</p>
                    </motion.div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="p-4 sm:p-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-4xl mx-auto -mt-24 relative"
                >
                    {/* --- CONTACT CARDS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <ContactCard 
                            icon={<Phone />} 
                            title="Call Us" 
                            content="+91 94948 37550"
                            href="tel:+919494837550"
                        />
                        <ContactCard 
                            icon={<Mail />} 
                            title="Email Us" 
                            content="support@srestamart.com"
                            href="mailto:support@srestamart.com"
                        />
                        <ContactCard 
                            icon={<Instagram />} 
                            title="Follow Us" 
                            content="@sresta_mart"
                            href="https://instagram.com/sresta_mart"
                        />
                    </div>

                    {/* --- FAQ SECTION --- */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqData.map((item, index) => (
                                <FaqItem key={index} question={item.question} answer={item.answer} />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS for a clean and professional look ---

const ContactCard = ({ icon, title, content, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-2xl shadow-lg text-center group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
        <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white">
            {React.cloneElement(icon, { size: 32, strokeWidth: 2 })}
        </div>
        <h3 className="mt-4 font-bold text-xl text-gray-800">{title}</h3>
        <p className="mt-1 text-gray-500 group-hover:text-red-600 transition-colors">{content}</p>
    </a>
);

const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4"
            >
                <h4 className="font-semibold text-lg text-gray-800">{question}</h4>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown className="text-gray-400" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 text-gray-600">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};