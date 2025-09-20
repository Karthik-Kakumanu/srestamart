import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Shield, HelpCircle, LogOut, ChevronDown, ShoppingBag, Truck, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// NEW: Import react-leaflet components
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// NEW: Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// NEW: Live Tracking Map Component
const LiveTrackingMap = ({ orderId }) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/tracking`, {
                    headers: { 'x-auth-token': token }
                });
                if (res.data && res.data.latitude && res.data.longitude) {
                    setLocation([res.data.latitude, res.data.longitude]);
                } else {
                    setError('Partner location not available yet.');
                }
            } catch (err) {
                setError('Could not fetch tracking data.');
                console.error(err);
            }
        };

        fetchLocation(); // Fetch immediately
        const interval = setInterval(fetchLocation, 30000); // And then every 30 seconds

        return () => clearInterval(interval);
    }, [orderId]);

    if (error) {
        return <div className="mt-2 p-4 bg-yellow-50 text-yellow-800 rounded-lg">{error}</div>;
    }

    if (!location) {
        return <div className="mt-2 p-4 bg-blue-50 text-blue-800 rounded-lg">Loading map and partner location...</div>;
    }

    return (
        <div className="mt-4 h-64 w-full rounded-lg overflow-hidden z-0">
            <MapContainer center={location} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={location}>
                    <Popup>
                        Your delivery partner is here.
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default function AccountPage({ loggedInUser, orders, ordersLoading, handleLogout }) {
  const [activeTab, setActiveTab] = useState('orders');

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
              {activeTab === 'orders' && <OrderHistoryView orders={orders} loading={ordersLoading} />}
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

const OrderHistoryView = ({ orders, loading }) => {
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
      {orders.map(order => <OrderCard key={order.id} order={order} />)}
    </div>
  );
};

const SettingsView = ({ handleLogout }) => (
  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
    <div className="divide-y divide-gray-100">
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

const OrderCard = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusInfo = {
    Processing: { color: "bg-yellow-100 text-yellow-700" },
    Assigned: { color: "bg-blue-100 text-blue-700" },
    'Out for Delivery': { color: "bg-cyan-100 text-cyan-700" },
    Delivered: { color: "bg-green-100 text-green-700" },
    Cancelled: { color: "bg-red-100 text-red-700" },
    Pending: { color: "bg-gray-100 text-gray-700" }
  };

  const currentStatus = statusInfo[order.status] || statusInfo.Processing;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-lg text-red-700">Order #{order.id}</p>
            <p className="text-sm text-gray-500">Date: {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center mt-3 sm:mt-0">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${currentStatus.color}`}>
              {order.status}
            </span>
            <ChevronDown className={`ml-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 p-4 sm:p-5 bg-slate-50">
              <h4 className="font-semibold mb-2 text-gray-700">Items Ordered:</h4>
              <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
                {order.items?.map((item, index) => (
                  <li key={index}>{item.name} ({item.variantLabel}) (x{item.quantity})</li>
                ))}
              </ul>
              
              <h4 className="font-semibold mb-2 text-gray-700">Shipping Address:</h4>
              <p className="text-sm text-gray-600 mb-4">
                {order.shipping_address ? `${order.shipping_address.label}: ${order.shipping_address.value}` : 'No address provided.'}
              </p>

              {order.partner_name && (
                <div className="mt-4 pt-4 border-t text-sm">
                    <p className="font-semibold text-gray-700">Delivery Partner:</p>
                    <div className="flex items-center gap-2 mt-1 text-gray-600">
                        <UserCheck size={16} />
                        <span>{order.partner_name}</span>
                    </div>
                </div>
              )}

              {order.delivery_status === 'Out for Delivery' && (
                <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-gray-700">Live Tracking</h4>
                    <div className="mt-2 p-4 bg-blue-50 text-blue-800 rounded-lg">
                        <p>Your order is on the way! Live map tracking will be available here soon.</p>
                    </div>
                </div>
              )}

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