import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Import Pages and Components with correct paths
import Layout from './components/Layout.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';
import CartPage from './pages/CartPage.jsx';
import CouponsPage from './pages/CouponsPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import ManageAddressPage from './pages/ManageAddressPage.jsx';
import HelpCenterPage from './pages/HelpCenterPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import VendorPage from './pages/VendorPage.jsx';
import FranchisePage from './pages/FranchisePage.jsx';

// Admin Imports
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';

// Delivery Partner Imports
import DeliveryLoginPage from './pages/DeliveryLoginPage.jsx';
import DeliveryDashboardPage from './pages/DeliveryDashboardPage.jsx';
import DeliveryProtectedRoute from './components/DeliveryProtectedRoute.jsx';

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({
    shippingAddress: null,
    totalAmount: 0,
    items: [],
  });
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (loggedInUser && token) {
        const config = { headers: { 'x-auth-token': token } };
        try {
          setOrdersLoading(true);
          const [ordersRes, addressesRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, config),
            axios.get(`${import.meta.env.VITE_API_URL}/api/addresses`, config)
          ]);
          setOrders(ordersRes.data);
          setAddresses(addressesRes.data);
          setIsFirstOrder(ordersRes.data.length === 0);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          if (error.response && error.response.status === 401) handleLogout();
        } finally {
          setOrdersLoading(false);
        }
      } else {
        setOrdersLoading(false);
      }
    };
    fetchUserData();
  }, [loggedInUser]);

    // --- CRITICAL FIX: handleAddToCart now includes the 'details' object ---
    const handleAddToCart = (product) => {
        setCartItems(prevItems => {
            const itemExists = prevItems.find(item => item.id === product.selectedVariant.id);
            if (itemExists) {
                return prevItems.map(item =>
                    item.id === product.selectedVariant.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevItems, { 
                    id: product.selectedVariant.id, 
                    name: product.name, 
                    variantLabel: product.selectedVariant.label,
                    price: product.selectedVariant.price, 
                    image_url: product.image_url, 
                    quantity: 1,
                    description: product.description, // Pass description
                    details: product.details // Pass the rich details object
                }];
            }
        });
        setCartMessage(`${product.name} added to cart!`);
        setTimeout(() => setCartMessage(''), 2000);
    };

  const handleQuantityChange = (itemId, amount) => {
      setCartItems(prevItems =>
          prevItems.map(item =>
              item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
          )
      );
  };
 
  const handleRemoveFromCart = (itemId) => {
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleClearCart = () => setCartItems([]);

  const handleLogout = () => {
    localStorage.clear();
    setLoggedInUser(null);
    setCartItems([]);
    setOrders([]);
    setAddresses([]);
  };

  return (
    <>
      {cartMessage && <div className="fixed top-24 right-8 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-[60]">{cartMessage}</div>}
      <Routes>
        {/* Standalone Admin, Delivery, and Auth Routes */}
        <Route path="/delivery/login" element={<DeliveryLoginPage />} />
        <Route 
            path="/delivery/dashboard" 
            element={<DeliveryProtectedRoute><DeliveryDashboardPage /></DeliveryProtectedRoute>} 
        />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminPage /></AdminProtectedRoute>} />
        <Route path="/auth" element={loggedInUser ? <Navigate to="/" /> : <AuthPage setLoggedInUser={setLoggedInUser} />} />
        
        {/* Main Application Layout */}
        <Route path="/" element={<Layout loggedInUser={loggedInUser} handleLogout={handleLogout} cartItems={cartItems} />}>
            {/* Publicly Accessible Routes */}
            <Route index element={<HomePage handleAddToCart={handleAddToCart} />} />
            <Route path="vendor" element={<VendorPage />} />
            <Route path="franchise" element={<FranchisePage />} />
            <Route path="coupons" element={<CouponsPage isFirstOrder={isFirstOrder} />} />
            <Route path="help" element={<HelpCenterPage />} />
            <Route path="privacy" element={<PrivacyPolicyPage />} />

            {/* Protected Routes - Require Login */}
            <Route path="cart" element={loggedInUser ? <CartPage cartItems={cartItems} handleQuantityChange={handleQuantityChange} handleRemoveFromCart={handleRemoveFromCart} setCheckoutDetails={setCheckoutDetails} /> : <Navigate to="/auth" replace />} />
            <Route path="account" element={loggedInUser ? <AccountPage loggedInUser={loggedInUser} orders={orders} ordersLoading={ordersLoading} handleLogout={handleLogout} /> : <Navigate to="/auth" replace />} />
            <Route path="/account/addresses" element={loggedInUser ? <ManageAddressPage addresses={addresses} setAddresses={setAddresses} /> : <Navigate to="/auth" replace />} />
            <Route path="/checkout" element={loggedInUser ? <CheckoutPage user={loggedInUser} addresses={addresses} setAddresses={setAddresses} setCheckoutDetails={setCheckoutDetails} cartItems={cartItems} /> : <Navigate to="/auth" replace />} />
            <Route path="/payment" element={loggedInUser ? <PaymentPage user={loggedInUser} checkoutDetails={checkoutDetails} handleClearCart={handleClearCart} isFirstOrder={isFirstOrder} /> : <Navigate to="/auth" replace />} />
            <Route path="/order-success" element={loggedInUser ? <OrderSuccessPage /> : <Navigate to="/auth" replace />} />
        </Route>

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

