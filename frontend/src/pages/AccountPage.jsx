import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Shield, HelpCircle, LogOut, ChevronDown, ShoppingBag, Truck, CheckCircle2, PackageCheck, Info, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountPage({ loggedInUser, orders, ordersLoading, handleLogout }) {
    const [activeTab, setActiveTab] = useState('orders');

    const updateOrderInList = () => {
        window.location.reload(); 
    };

    return (
        <div className="flex-grow bg-slate-50">
            <main className="p-4 sm:p-8">
                <div className="max-w-5xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 flex items-center space-x-6"
                    >
                        <div className="w-16 h-16 bg-gradient-to-tr from-red-500 to-orange-400 text-white flex items-center justify-center rounded-full text-3xl font-bold">
                            {loggedInUser.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Hello, {loggedInUser.name}</h2>
                            <p className="text-gray-500 mt-1">{loggedInUser.phone}</p>
                        </div>
                    </motion.div>

                    <div className="flex border-b border-gray-200 mb-6">
                        <TabButton name="Order History" activeTab={activeTab} setActiveTab={setActiveTab} tabId="orders" />
                        <TabButton name="Account Settings" activeTab={activeTab} setActiveTab={setActiveTab} tabId="settings" />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'orders' && <OrderHistoryView orders={orders} loading={ordersLoading} onOrderUpdate={updateOrderInList} />}
                            {activeTab === 'settings' && <SettingsView handleLogout={handleLogout} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

const TabButton = ({ name, activeTab, setActiveTab, tabId }) => (
    <button
        onClick={() => setActiveTab(tabId)}
        className={`relative px-4 py-3 text-sm sm:text-base font-semibold transition-colors duration-300 ${
            activeTab === tabId ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
        }`}
    >
        {name}
        {activeTab === tabId && (
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                layoutId="underline"
            />
        )}
    </button>
);

const OrderHistoryView = ({ orders, loading, onOrderUpdate }) => {
    if (loading) {
        return <OrderSkeletonLoader />;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center bg-white p-12 rounded-xl shadow-md">
                <ShoppingBag className="mx-auto text-gray-300 h-16 w-16" />
                <h3 className="mt-4 text-xl font-semibold text-gray-700">No Orders Yet</h3>
                <p className="text-gray-500 mt-2">Looks like you haven't placed any orders with us.</p>
                <Link to="/" className="mt-6 inline-block bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map(order => <OrderCard key={order.id} order={order} onOrderUpdate={onOrderUpdate} />)}
        </div>
    );
};

const SettingsView = ({ handleLogout }) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
        <div className="divide-y divide-gray-100">
            <SettingsLink to="/about-us" icon={<Info size={20} />} text="About Us" />
            <SettingsLink to="/account/addresses" icon={<MapPin size={20} />} text="Manage Addresses" />
            <SettingsLink to="/privacy" icon={<Shield size={20} />} text="Privacy Policy" />
            <SettingsLink to="/help" icon={<HelpCircle size={20} />} text="Help Center" />
            <div onClick={handleLogout} className="flex items-center p-4 rounded-lg text-red-600 font-bold cursor-pointer hover:bg-red-50 transition-colors">
                <LogOut size={20} className="mr-4" /> Log Out
            </div>
        </div>
    </div>
);
const SettingsLink = ({ to, icon, text }) => (
    <Link to={to} className="flex items-center p-4 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
        <span className="text-gray-500">{icon}</span>
        <span className="ml-4 flex-grow">{text}</span>
        <ChevronDown className="-rotate-90 text-gray-400" size={20}/>
    </Link>
);

const OrderCard = ({ order, onOrderUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [partnerLocation, setPartnerLocation] = useState(null);

    const statusInfo = {
        Processing: { color: "bg-yellow-100 text-yellow-700" },
        Assigned: { color: "bg-blue-100 text-blue-700" },
        'Out for Delivery': { color: "bg-cyan-100 text-cyan-700" },
        Delivered: { color: "bg-green-100 text-green-700" },
        Completed: { color: "bg-green-100 text-green-700" },
        Cancelled: { color: "bg-red-100 text-red-700" },
        Pending: { color: "bg-gray-100 text-gray-700" }
    };

    const isAutomated = order.delivery_type === 'automated';
    
    // Tracking is only possible if the order is NOT automated AND its status is active.
    const isTrackable = !isAutomated && ['Assigned', 'Out for Delivery'].includes(order.delivery_status);

    useEffect(() => {
        let intervalId = null;

        const fetchPartnerLocation = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${order.id}/location`, {
                    headers: { 'x-auth-token': token }
                });
                setPartnerLocation(res.data);
            } catch (err) {
                console.error("Failed to fetch partner location:", err);
            }
        };

        if (isExpanded && isTrackable) {
            fetchPartnerLocation(); 
            intervalId = setInterval(fetchPartnerLocation, 15000); // Fetch every 15 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId); // Stop polling
            }
        };
    }, [isExpanded, isTrackable, order.id]);


    const handleMarkAsDelivered = async (e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you have received this order?")) return;
        
        setIsSubmitting(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${order.id}/mark-delivered`, {}, {
                headers: { 'x-auth-token': token }
            });
            onOrderUpdate();
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to update status.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentStatusStyle = statusInfo[order.delivery_status] || statusInfo.Pending;
    const isDelivered = order.delivery_status === 'Delivered' || order.status === 'Completed';

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-bold text-lg text-red-700">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center mt-3 sm:mt-0">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${currentStatusStyle.color}`}>
                            {order.delivery_status}
                        </span>
                        <ChevronDown className={`ml-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </div>
            
            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="border-t border-gray-100 p-4 sm:p-5 bg-slate-50">
                            
                            <h4 className="font-semibold mb-2 text-gray-700">Items Ordered:</h4>
                            <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
                                {order.items?.map((item, index) => (
                                    <li key={index}>{item.name} ({item.variantLabel}) (x{item.quantity})</li>
                                ))}
                            </ul>
                            
                            <h4 className="font-semibold mb-2 text-gray-700">Shipping Address:</h4>
                            <p className="text-sm text-gray-600 mb-4">{order.shipping_address?.value}</p>

                            <div className="mt-4 pt-4 border-t text-sm">
                                {isAutomated && !isDelivered && (
                                    <div className="mb-4">
                                        <p className="font-semibold text-gray-700">Expected Delivery:</p>
                                        <div className="flex items-center gap-2 mt-1 text-blue-600">
                                            <Truck size={16} />
                                            <span>By {new Date(order.expected_delivery_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                )}
                                
                                {order.partner_name && order.partner_phone && (
                                     <div className="mb-4">
                                        <p className="font-semibold text-gray-700">Delivery Partner:</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <div>
                                                <p className="text-gray-800 font-medium">{order.partner_name}</p>
                                                <p className="text-sm text-gray-500">{order.partner_phone}</p>
                                            </div>
                                            <a 
                                                href={`tel:${order.partner_phone}`}
                                                onClick={(e) => e.stopPropagation()} 
                                                className="flex items-center gap-2 bg-blue-500 text-white text-xs font-bold py-1.5 px-3 rounded-full hover:bg-blue-600 transition-colors"
                                            >
                                                <Phone size={12} />
                                                <span>Call</span>
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {isTrackable && (
                                    <div className="mt-4">
                                        <p className="font-semibold text-gray-700">Live Tracking:</p>
                                        {partnerLocation ? (
                                            <a 
                                                href={`https://maps.google.com/?q=${partnerLocation.latitude},${partnerLocation.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-2 mt-1 text-green-600 font-bold hover:underline"
                                            >
                                                <MapPin size={14} />
                                                <span>View Live Location on Map</span>
                                            </a>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic mt-1">Fetching partner's current location...</p>
                                        )}
                                    </div>
                                )}

                                {isAutomated && !isDelivered && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <h5 className="font-bold text-green-800">Have you received your order?</h5>
                                        <p className="text-xs text-green-700 mb-3">Please click the button below to confirm delivery.</p>
                                        <button 
                                            onClick={handleMarkAsDelivered}
                                            disabled={isSubmitting}
                                            className="bg-green-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                                        >
                                            <PackageCheck size={16} />
                                            {isSubmitting ? 'Confirming...' : 'Mark as Delivered'}
                                        </button>
                                        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                                    </div>
                                )}
                            </div>

                            <div className="text-right font-bold text-gray-800 text-lg border-t pt-3 mt-3">
                                Total: ₹{Number(order.total_amount).toFixed(2)}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const OrderSkeletonLoader = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-5">
                <div className="flex justify-between items-center animate-pulse">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
            </div>
        ))}
    </div>
);