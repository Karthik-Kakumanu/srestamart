import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, Outlet, Navigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- ICONS ---
import { Home, ShoppingCart, Tag, User, HelpCircle, Phone, MessageSquare, Instagram, X } from 'lucide-react';

// --- MOCK DATA & ASSETS ---
// In a real app, you would import this, but for a single file, we define it here.
const logoUrl = 'https://img.icons8.com/plasticine/100/sresta.png'; 

// --- Reusable Notification Badge Component ---
const NotificationBadge = ({ count }) => {
    if (count <= 0) return null;
    return (
        <span className="absolute top-1 right-2.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            {count}
        </span>
    );
};

// --- Main Layout Component (Now inside App.jsx) ---
function Layout({ loggedInUser, cartItems, coupons, orders }) {
    const [isContactModalOpen, setContactModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const cartItemCount = (Array.isArray(cartItems) ? cartItems : []).reduce((acc, item) => acc + item.quantity, 0);
    const couponCount = Array.isArray(coupons) ? coupons.length : 0;
    const deliveryCount = (Array.isArray(orders) ? orders : []).filter(o => o.status === 'out_for_delivery').length;

    useEffect(() => {
        if (loggedInUser?.isNewUser) {
            setShowConfetti(true);
            toast.success(`Welcome to Sresta Mart, ${loggedInUser.name}!`, {
                duration: 4000,
                position: 'top-right',
                style: { background: '#10B981', color: 'white', fontWeight: 'bold' },
            });
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [loggedInUser]);

    const activeLinkStyle = {
        color: '#dc2626',
        background: '#fee2e2'
    };
    
    const phoneNumber = '9494837550';
    const instagramHandle = 'sresta_mart';

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Toaster />
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
            <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 flex justify-between items-center sticky top-0 z-50 border-b border-gray-200/80">
                <div className="flex items-center space-x-3">
                    <img src={logoUrl} alt="Sresta Mart Logo" className="h-10 w-auto" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Sresta Mart</h1>
                        <p className="text-sm text-gray-600">Hello, {loggedInUser?.name || 'Guest'}!</p>
                    </div>
                </div>
            </header>
            <main className="flex-grow pb-24">
                <Outlet />
            </main>
            <AnimatePresence>
                {isContactModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setContactModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-800">Contact & Support</h2>
                                <button onClick={() => setContactModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100"><X size={20} className="text-gray-600" /></button>
                            </div>
                            <div className="space-y-3">
                                <a href={`tel:+91${phoneNumber}`} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full">
                                    <Phone size={20} className="text-blue-500" />
                                    <span className="ml-3 font-semibold text-gray-700">Call Us</span>
                                </a>
                                <a href={`https://wa.me/91${phoneNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full">
                                    <MessageSquare size={20} className="text-green-500" />
                                    <span className="ml-3 font-semibold text-gray-700">WhatsApp</span>
                                </a>
                                <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full">
                                    <Instagram size={20} className="text-pink-500" />
                                    <span className="ml-3 font-semibold text-gray-700">Instagram</span>
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <footer className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-40">
                <div className="max-w-md mx-auto grid grid-cols-5 gap-1 p-1">
                    <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors"><Home /><span className="text-xs font-bold mt-1">Home</span></NavLink>
                    <NavLink to="/cart" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="relative flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors"><NotificationBadge count={cartItemCount} /><ShoppingCart /><span className="text-xs font-bold mt-1">Cart</span></NavLink>
                    <NavLink to="/coupons" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="relative flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors"><NotificationBadge count={couponCount} /><Tag /><span className="text-xs font-bold mt-1">Coupons</span></NavLink>
                    <NavLink to="/account" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="relative flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors"><NotificationBadge count={deliveryCount} /><User /><span className="text-xs font-bold mt-1">Account</span></NavLink>
                    <button onClick={() => setContactModalOpen(true)} className="flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-red-500 transition-colors"><HelpCircle /><span className="text-xs font-bold mt-1">Help</span></button>
                </div>
            </footer>
        </div>
    );
}

// --- Placeholder Pages and Components ---
// These are simplified versions of your pages to make the app runnable.
const Placeholder = ({ title }) => <div className="p-8"><h1 className="text-2xl font-bold">{title}</h1><p>This is a placeholder for the {title} page.</p></div>;
const HomePage = ({ handleAddToCart }) => <Placeholder title="Home" />;
const AuthPage = ({ setLoggedInUser }) => <Placeholder title="Authentication" />;
const CartPage = (props) => <Placeholder title="Cart" />;
const CouponsPage = (props) => <Placeholder title="Coupons" />;
const AccountPage = (props) => <Placeholder title="Account" />;
const ManageAddressPage = (props) => <Placeholder title="Manage Addresses" />;
const HelpCenterPage = () => <Placeholder title="Help Center" />;
const PrivacyPolicyPage = () => <Placeholder title="Privacy Policy" />;
const CheckoutPage = (props) => <Placeholder title="Checkout" />;
const PaymentPage = (props) => <Placeholder title="Payment" />;
const OrderSuccessPage = () => <Placeholder title="Order Success" />;
const AdminLoginPage = () => <Placeholder title="Admin Login" />;
const AdminPage = () => <Placeholder title="Admin Dashboard" />;
const AdminProtectedRoute = ({ children }) => children;
const DeliveryLoginPage = () => <Placeholder title="Delivery Login" />;
const DeliveryDashboardPage = () => <Placeholder title="Delivery Dashboard" />;
const DeliveryProtectedRoute = ({ children }) => children;


// --- Main App Component ---
export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({
    shippingAddress: null, totalAmount: 0, items: [],
  });
  const [cartMessage, setCartMessage] = useState('');

  // Mock API fetching
  useEffect(() => {
    const fetchUserData = () => {
      const token = localStorage.getItem('token');
      if (loggedInUser && token) {
        setOrdersLoading(true);
        // Mocking API responses
        setTimeout(() => {
            setOrders([{id: 1, status: 'processing'}, {id: 2, status: 'out_for_delivery'}]);
            setAddresses([{id: 1, street: '123 Main St', city: 'Anytown'}]);
            setCoupons([{id: 1, code: 'SAVE10'}, {id: 2, code: 'FREESHIP'}]);
            setIsFirstOrder(false);
            setOrdersLoading(false);
        }, 1000);
      } else {
        setOrdersLoading(false);
      }
    };
    fetchUserData();
  }, [loggedInUser]);

  const handleAddToCart = (product, event) => {
    setCartItems(prevItems => {
        const itemExists = prevItems.find(item => item.id === product.selectedVariant.id);
        if (itemExists) {
            return prevItems.map(item => item.id === product.selectedVariant.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prevItems, { 
            id: product.selectedVariant.id, name: product.name, variantLabel: product.selectedVariant.label,
            price: product.selectedVariant.price, image_url: product.image_url, quantity: 1 
        }];
    });
    setCartMessage(`${product.name} added to cart!`);
    setTimeout(() => setCartMessage(''), 2000);
  };

  const handleQuantityChange = (itemId, amount) => {
    setCartItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item));
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
    setCoupons([]);
  };

  return (
    <Router>
      {cartMessage && <div className="fixed top-24 right-8 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-[60]">{cartMessage}</div>}
      <Routes>
        <Route path="/delivery/login" element={<DeliveryLoginPage />} />
        <Route path="/delivery/dashboard" element={<DeliveryProtectedRoute><DeliveryDashboardPage /></DeliveryProtectedRoute>} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminPage /></AdminProtectedRoute>} />
        
        {loggedInUser ? (
          <Route path="/" element={<Layout loggedInUser={loggedInUser} handleLogout={handleLogout} cartItems={cartItems} coupons={coupons} orders={orders} />}>
            <Route index element={<HomePage handleAddToCart={handleAddToCart} />} />
            <Route path="cart" element={<CartPage cartItems={cartItems} handleQuantityChange={handleQuantityChange} handleRemoveFromCart={handleRemoveFromCart} setCheckoutDetails={setCheckoutDetails} />} />
            <Route path="coupons" element={<CouponsPage isFirstOrder={isFirstOrder} coupons={coupons} />} />
            <Route path="account" element={<AccountPage loggedInUser={loggedInUser} orders={orders} ordersLoading={ordersLoading} handleLogout={handleLogout} />} />
            <Route path="/account/addresses" element={<ManageAddressPage addresses={addresses} setAddresses={setAddresses} />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/checkout" element={<CheckoutPage user={loggedInUser} addresses={addresses} setAddresses={setAddresses} setCheckoutDetails={setCheckoutDetails} cartItems={cartItems} />} />
            <Route path="/payment" element={<PaymentPage user={loggedInUser} checkoutDetails={checkoutDetails} handleClearCart={handleClearCart} isFirstOrder={isFirstOrder} />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        ) : (
          <>
            <Route path="/auth" element={<AuthPage setLoggedInUser={setLoggedInUser} />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

