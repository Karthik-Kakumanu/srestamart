import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Info, Database, Truck, Package, MapPin, AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react';

// A more professional and relevant background image for a policy page
const brandingImageUrl = "https://images.pexels.com/photos/7319328/pexels-photo-7319328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

// Helper component for policy sections to keep the code clean and consistent
const PolicySection = ({ icon, title, children }) => (
    <div className="mt-8">
        <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="mt-4 prose prose-slate max-w-none prose-p:leading-relaxed prose-ul:list-disc prose-ul:pl-6 prose-li:my-1">
            {children}
        </div>
    </div>
);

export default function PrivacyPolicyPage() {
    return (
        <div className="flex-grow bg-slate-100">
            {/* --- HERO HEADER --- */}
            <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${brandingImageUrl})` }}>
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <Shield className="mx-auto h-16 w-16 text-white" strokeWidth={1.5} />
                        <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-white tracking-tight" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>Policies & Terms</h1>
                        <p className="mt-2 text-lg text-slate-300" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>Your trust, privacy, and satisfaction are our top priorities.</p>
                    </motion.div>
                </div>
            </div>
            
            <div className="p-4 sm:p-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-4xl mx-auto -mt-24 relative bg-white p-6 sm:p-10 rounded-2xl shadow-xl"
                >
                    <p className="text-sm text-gray-500 text-center mb-6"><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
                    
                    <PolicySection icon={<Info size={24} className="text-blue-600" />} title="Our Commitment">
                        <p>Sresta Mart we operates the Sresta Mart Website srestamart.com. This page outlines our policies regarding data privacy, shipping, returns, and refunds. By using our Service, you agree to these terms.</p>
                    </PolicySection>
                    
                    <hr className="my-8" />
                    
                    {/* --- NEW, DETAILED SHIPPING & REFUND POLICY --- */}
                    <PolicySection icon={<Truck size={24} className="text-green-600" />} title="Shipping, Returns, and Refund Policy">
                        <p>We are committed to delivering our high-quality products to you safely. Please review our policies regarding shipping and returns.</p>
                        
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="text-yellow-600" size={20}/>
                                <h3 className="text-lg font-semibold text-yellow-800">Refund Eligibility</h3>
                            </div>
                            <p className="mt-2 text-yellow-700">
                                Refunds will only be issued under the following specific conditions:
                            </p>
                            <ul className="mt-2 space-y-1">
                                <li><CheckCircle size={16} className="inline mr-2 text-green-600" />The product you received was completely rotten or spoiled upon arrival.</li>
                                <li><CheckCircle size={16} className="inline mr-2 text-green-600" />You received a mismatched product (i.e., not what you ordered).</li>
                            </ul>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Package className="text-blue-600" size={20}/>
                                <h3 className="text-lg font-semibold text-blue-800">Product Damage During Transit</h3>
                            </div>
                            <p className="mt-2 text-blue-700">Our responsibility for products damaged during delivery depends on your location:</p>
                            <ul className="mt-2 space-y-2">
                                <li>
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="inline mt-1 text-green-600"/>
                                        <div>
                                            <strong>For deliveries within Hyderabad:</strong> Sresta Mart takes full responsibility for any damage that occurs during transit. We will provide a suitable resolution, such as a replacement or refund.
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="inline mt-1 text-red-600"/>
                                        <div>
                                            <strong>For deliveries outside Hyderabad:</strong> While we package our products securely, Sresta Mart is not responsible for damage caused by the third-party courier service during transit. However, we will fully support you by providing necessary documentation and assistance to help you file a claim with the courier company.
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </PolicySection>

                    <hr className="my-8" />

                    <PolicySection icon={<Database size={24} className="text-purple-600" />} title="Information Collection and Use">
                        <p>We collect essential information to provide and improve our Service. This includes:</p>
                        <ul>
                            <li><strong>Personal Data:</strong> Your name, phone number, and shipping addresses are required for order processing and delivery.</li>
                            <li><strong>Usage Data:</strong> We collect data on how you interact with our Service to enhance security, improve user experience, and prevent fraud.</li>
                        </ul>
                    </PolicySection>

                    <hr className="my-8" />
                    
                    <PolicySection icon={<Shield size={24} className="text-red-600" />} title="Data Security">
                        <p>The security of your data is a top priority. We implement industry-standard measures to protect your Personal Data. However, no method of transmission over the Internet is 100% secure, and while we strive to protect your information, we cannot guarantee its absolute security.</p>
                    </PolicySection>

                    <hr className="my-8" />

                    <PolicySection icon={<MessageSquare size={24} className="text-teal-600" />} title="Contact Us">
                        <p>If you have any questions about our policies, please contact us. You can find our contact details on the Help Center page in the website footer.</p>
                    </PolicySection>

                </motion.div>
            </div>
        </div>
    );
}
