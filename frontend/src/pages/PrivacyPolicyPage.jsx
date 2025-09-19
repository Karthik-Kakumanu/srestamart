import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const brandingImageUrl = "https://images.pexels.com/photos/39584/censorship-limitations-freedom-of-expression-restricted-39584.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

export default function PrivacyPolicyPage() {
    return (
        <div className="flex-grow bg-slate-100">
            {/* --- HERO HEADER --- */}
            <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${brandingImageUrl})` }}>
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <Shield className="mx-auto h-16 w-16 text-white" strokeWidth={1.5} />
                        <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-white tracking-tight" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>Privacy Policy</h1>
                        <p className="mt-2 text-lg text-slate-300" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>Your trust and privacy are important to us.</p>
                    </motion.div>
                </div>
            </div>
            
            <div className="p-4 sm:p-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-4xl mx-auto -mt-24 relative bg-white p-6 sm:p-10 rounded-2xl shadow-xl prose prose-slate"
                >
                    <p className="text-sm text-gray-500"><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
                    
                    <p>Sresta Mart ("us", "we", or "our") operates the Sresta Mart mobile application and website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
                    
                    <h2>1. Information Collection and Use</h2>
                    <p>We collect several different types of information for various purposes to provide and improve our Service to you. This includes:</p>
                    <ul>
                        <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to, your name, phone number, and one or more shipping addresses.</li>
                        <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used. This Usage Data may include information such as your computer's IP address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, and other diagnostic data.</li>
                    </ul>

                    <h2>2. Use of Data</h2>
                    <p>Sresta Mart uses the collected data for various purposes:</p>
                    <ul>
                        <li>To provide, maintain, and improve our Service</li>
                        <li>To notify you about changes to our Service</li>
                        <li>To process your orders, manage payments, and handle deliveries</li>
                        <li>To manage your account and provide customer support</li>
                        <li>To monitor the usage of the Service to prevent fraud and improve security</li>
                    </ul>

                    <h2>3. Data Security</h2>
                    <p>The security of your data is important to us. We use commercially acceptable means to protect your Personal Data, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee its absolute security.</p>

                    <h2>4. Your Rights</h2>
                     <p>You have the right to access, update, or delete the information we have on you. You can manage your shipping addresses directly from your account page. For other requests, please contact us.</p>

                    <h2>5. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us through the information provided on our Help Center page.</p>
                </motion.div>
            </div>
        </div>
    );
}