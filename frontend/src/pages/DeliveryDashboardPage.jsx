import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MapPin, Box, Check, ExternalLink, RefreshCw, RadioTower } from 'lucide-react';
import jwtDecode from 'jwt-decode'; // Consistent camelCase

const getPartnerToken = () => localStorage.getItem('deliveryPartnerToken') || '';

// Custom hook for location tracking
const useLocationTracker = () => {
  const locationIntervalRef = useRef(null);

  useEffect(() => {
    const sendLocation = (position) => {
      const { latitude, longitude } = position.coords;
      const token = getPartnerToken();
      if (!token) return;

      axios.put(`${process.env.VITE_API_URL || 'https://srestamart.onrender.com'}/api/delivery/location`, 
        { latitude, longitude },
        { headers: { 'x-partner-token': token } }
      ).catch(err => console.error("Failed to send location:", err));
    };

    const handleError = (error) => {
      console.warn(`Location Error: ${error.message}`);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(sendLocation, handleError);
      locationIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(sendLocation, handleError);
      }, 30000); // 30 seconds
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, []);
};

export default function DeliveryDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const partner = JSON.parse(localStorage.getItem('deliveryPartner')) || {};
  const token = getPartnerToken();
  const userRole = token ? jwtDecode(token).role : null;

  useLocationTracker();

  const fetchOrders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const config = { headers: { 'x-partner-token': token } };
      let url = `${process.env.VITE_API_URL || 'https://srestamart.onrender.com'}/api/delivery/orders`;
      
      if (userRole === 'admin') {
        url = `${process.env.VITE_API_URL || 'https://srestamart.onrender.com'}/api/admin/orders`;
      } else if (userRole === 'partner' && partner.id) {
        url += `?partnerId=${partner.id}`;
      }

      const res = await axios.get(url, config);
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    try {
      const config = { headers: { 'x-partner-token': token } };
      await axios.put(`${process.env.VITE_API_URL || 'https://srestamart.onrender.com'}/api/delivery/orders/${orderId}/accept`, {}, config);
      fetchOrders();
    } catch (err) {
      alert("Failed to accept order. Please try again.");
    }
  };

  const getGoogleMapsUrl = (address) => {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <header className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Delivery Dashboard</h1>
          <p className="text-gray-500">Welcome, {partner?.name || 'Partner'}!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <RadioTower size={20} className="animate-pulse" />
            <span>Tracking Active</span>
          </div>
          <button onClick={fetchOrders} disabled={isLoading} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {isLoading ? <p>Loading assigned orders...</p> :
         error ? <p className="text-red-500">{error}</p> :
         orders.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-2xl shadow-xl">
            <Box className="mx-auto text-red-200 h-24 w-24" strokeWidth={1} />
            <h2 className="mt-6 text-2xl font-bold text-gray-800">No Orders Assigned</h2>
            <p className="text-gray-500 mt-2">There are currently no deliveries assigned to you. Please check back later.</p>
          </div>
         ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <motion.div 
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-5 border-b grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-bold text-red-600">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Customer</p>
                    <p className="font-semibold text-gray-800">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount to Collect</p>
                    <p className="font-bold text-green-600">₹{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${order.delivery_status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.delivery_status}
                    </span>
                  </div>
                </div>
                <div className="p-5 bg-slate-50">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin size={20} />
                        <p>{order.shipping_address?.value || 'No address'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-center">
                      {userRole === 'partner' && order.delivery_status === 'Assigned' && (
                        <button onClick={() => handleAcceptOrder(order.id)} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors shadow">
                          <Check size={18} /> Accept Delivery
                        </button>
                      )}
                      <a href={getGoogleMapsUrl(order.shipping_address?.value || '')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow">
                        <ExternalLink size={18} /> Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
         )
        }
      </main>
    </div>
  );
}