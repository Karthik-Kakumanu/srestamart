// src/pages/CouponsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, PlusCircle, Tag, Trash2 } from 'lucide-react';
import AddCouponModal from '../components/admin/AddCouponModal.jsx';

const getAuthToken = () => localStorage.getItem('adminToken');

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const config = { headers: { 'x-admin-token': token } };
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/coupons`, config);
      setCoupons(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch coupons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDeleteCoupon = async (couponId, code) => {
    if (window.confirm(`Are you sure you want to delete "${code}"?`)) {
      try {
        const token = getAuthToken();
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/coupons/${couponId}`, {
          headers: { 'x-admin-token': token },
        });
        fetchCoupons();
      } catch (err) {
        alert(err.response?.data?.msg || 'Failed to delete coupon.');
      }
    }
  };

  const handleSave = () => {
    setIsAddCouponModalOpen(false);
    fetchCoupons();
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
          <Tag className="text-green-600" /> Coupons & Offers
        </h1>
        <div className="flex gap-3">
          <button
            onClick={fetchCoupons}
            className="flex items-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setIsAddCouponModalOpen(true)}
            className="flex items-center gap-2 text-sm bg-green-600 text-white px-3 py-2 rounded-md shadow hover:bg-green-700"
          >
            <PlusCircle size={16} /> Add Coupon
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {isLoading ? (
        <div className="text-center text-gray-500">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center text-gray-400 italic">No coupons found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-100 flex flex-col justify-between"
            >
              {coupon.poster_url && (
                <img
                  src={coupon.poster_url}
                  alt={coupon.code}
                  className="h-32 w-full object-cover rounded-md mb-3"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-800">{coupon.code}</h2>
                {coupon.description && (
                  <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Discount:</strong>{' '}
                  {coupon.discount_type === 'percentage'
                    ? `${coupon.discount_value}%`
                    : `₹${coupon.discount_value}`}
                </p>
                {coupon.applicable_category && (
                  <p className="text-sm text-gray-500">
                    <strong>Category:</strong> {coupon.applicable_category}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  <strong>Expires:</strong>{' '}
                  {new Date(coupon.expiry_date).toLocaleDateString('en-IN')}
                </p>
              </div>

              <button
                onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                className="mt-3 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm py-2 rounded-md"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {isAddCouponModalOpen && (
        <AddCouponModal onClose={() => setIsAddCouponModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}
