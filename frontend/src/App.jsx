import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Layout from './components/Layout.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import DeliveryProtectedRoute from './components/DeliveryProtectedRoute.jsx';

const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));
const CouponsPage = lazy(() => import('./pages/CouponsPage.jsx'));
const AccountPage = lazy(() => import('./pages/AccountPage.jsx'));
const ManageAddressPage = lazy(() => import('./pages/ManageAddressPage.jsx'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage.jsx'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'));
const PaymentPage = lazy(() => import('./pages/PaymentPage.jsx'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage.jsx'));
const VendorPage = lazy(() => import('./pages/VendorPage.jsx'));
const FranchisePage = lazy(() => import('./pages/FranchisePage.jsx'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage.jsx'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const DeliveryLoginPage = lazy(() => import('./pages/DeliveryLoginPage.jsx'));
const DeliveryDashboardPage = lazy(() => import('./pages/DeliveryDashboardPage.jsx'));

const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Loading...
    </div>
);

const USER_DATA_REFRESH_MS = 5 * 60 * 1000;

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
    }
};

export default function App() {
    const [loggedInUser, setLoggedInUser] = useState(getStoredUser);
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

    // --- State to trigger data refetching ---
    const [dataVersion, setDataVersion] = useState(0);

    // --- Function to be called after a product is modified ---
    const refreshData = () => {
        setDataVersion(prevVersion => prevVersion + 1);
    };

    useEffect(() => {
        let isSyncing = false;

        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (loggedInUser && token && !isSyncing) {
                isSyncing = true;
                const config = { headers: { 'x-auth-token': token } };
                try {
                    setOrdersLoading(prev => prev && orders.length === 0);
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
                    isSyncing = false;
                }
            } else {
                setOrdersLoading(false);
            }
        };

        fetchUserData();
        const userSyncInterval = setInterval(fetchUserData, USER_DATA_REFRESH_MS);

        return () => clearInterval(userSyncInterval);
    }, [loggedInUser, orders.length]);

    
    // --- MODIFIED: `handleAddToCart` now saves the product.category ---
    const handleAddToCart = (product) => {
        setCartItems(prevItems => {
            const itemExists = prevItems.find(item => item.id === product.selectedVariant.id);
            if (itemExists) {
                return prevItems.map(item =>
                    item.id === product.selectedVariant.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                // The new cart item object now includes `category`
                return [...prevItems, { 
                    id: product.selectedVariant.id, 
                    name: product.name, 
                    variantLabel: product.selectedVariant.label,
                    price: product.selectedVariant.price, 
                    image_url: product.image_url, 
                    quantity: 1,
                    description: product.description,
                    details: product.details,
                    category: product.category // <-- THIS IS THE NEW, ESSENTIAL LINE
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
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setLoggedInUser(null);
        setCartItems([]);
        setOrders([]);
        setAddresses([]);
    };

    return (
        <>
            {cartMessage && <div className="fixed top-24 right-8 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-[60]">{cartMessage}</div>}
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/delivery/login" element={<DeliveryLoginPage />} />
                    <Route 
                        path="/delivery/dashboard" 
                        element={<DeliveryProtectedRoute><DeliveryDashboardPage /></DeliveryProtectedRoute>} 
                    />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    
                    <Route path="/admin" element={
                        <AdminProtectedRoute>
                            <AdminPage onDataChange={refreshData} />
                        </AdminProtectedRoute>
                    } />
                    
                    <Route path="/auth" element={loggedInUser ? <Navigate to="/" /> : <AuthPage setLoggedInUser={setLoggedInUser} />} />
                    
                    <Route path="/" element={<Layout loggedInUser={loggedInUser} handleLogout={handleLogout} cartItems={cartItems} />}>
                        <Route index element={<HomePage handleAddToCart={handleAddToCart} dataVersion={dataVersion} />} />
                        
                        <Route path="vendor" element={<VendorPage />} />
                        <Route path="franchise" element={<FranchisePage />} />
                        <Route path="coupons" element={<CouponsPage isFirstOrder={isFirstOrder} />} />
                        <Route path="about-us" element={<AboutUsPage />} />
                        <Route path="help" element={<HelpCenterPage />} />
                        <Route path="privacy" element={<PrivacyPolicyPage />} />

                        <Route path="cart" element={loggedInUser ? <CartPage cartItems={cartItems} handleQuantityChange={handleQuantityChange} handleRemoveFromCart={handleRemoveFromCart} setCheckoutDetails={setCheckoutDetails} /> : <Navigate to="/auth" replace />} />
                        <Route path="account" element={loggedInUser ? <AccountPage loggedInUser={loggedInUser} orders={orders} ordersLoading={ordersLoading} handleLogout={handleLogout} /> : <Navigate to="/auth" replace />} />
                        <Route path="/account/addresses" element={loggedInUser ? <ManageAddressPage addresses={addresses} setAddresses={setAddresses} /> : <Navigate to="/auth" replace />} />
                        <Route path="/checkout" element={loggedInUser ? <CheckoutPage user={loggedInUser} addresses={addresses} setAddresses={setAddresses} setCheckoutDetails={setCheckoutDetails} cartItems={cartItems} /> : <Navigate to="/auth" replace />} />
                        <Route path="/payment" element={loggedInUser ? <PaymentPage user={loggedInUser} checkoutDetails={checkoutDetails} handleClearCart={handleClearCart} isFirstOrder={isFirstOrder} /> : <Navigate to="/auth" replace />} />
                        <Route path="/order-success" element={loggedInUser ? <OrderSuccessPage /> : <Navigate to="/auth" replace />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Suspense>
        </>
    );
}
