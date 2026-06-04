import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Users, Package, RefreshCw, PlusCircle, ShoppingCart, ChevronDown, DollarSign, BarChart2, UserCheck, Tag, Bot, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import EditProductModal from '../components/admin/EditProductModal.jsx';
import AddProductModal from '../components/admin/AddProductModal.jsx';
import AddCouponModal from '../components/admin/AddCouponModal.jsx';

const getAuthToken = () => localStorage.getItem('adminToken'); 
const OVERVIEW_REFRESH_MS = 15000;
const ACTIVE_ADMIN_REFRESH_MS = 800;

const syncCollectionState = (setState, signatureRef, nextValue = []) => {
    const nextSignature = JSON.stringify(nextValue);
    if (signatureRef.current !== nextSignature) {
        signatureRef.current = nextSignature;
        setState(nextValue);
    }
};

// --- MODIFIED: Accepts `onDataChange` prop from App.jsx ---
export default function AdminPage({ onDataChange }) {
    const [view, setView] = useState('overview');
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [coupons, setCoupons] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [productCategoryFilter, setProductCategoryFilter] = useState('all');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigningOrder, setAssigningOrder] = useState(null);
    const hasLoadedDashboardRef = useRef(false);
    const fetchInProgressRef = useRef(false);
    const productsSignatureRef = useRef('');
    const usersSignatureRef = useRef('');
    const ordersSignatureRef = useRef('');
    const deliveryPartnersSignatureRef = useRef('');
    const couponsSignatureRef = useRef('');

    const fetchData = async ({ silent = false } = {}) => {
        if (fetchInProgressRef.current) return;
        fetchInProgressRef.current = true;
        const shouldShowLoader = !hasLoadedDashboardRef.current;
        if (!silent && shouldShowLoader) setIsLoading(true);
        if (!silent) setError('');
        const token = getAuthToken();
        if (!token) {
            setError("Admin authorization token not found.");
            setIsLoading(false);
            fetchInProgressRef.current = false;
            return;
        }
        
        const config = { headers: { 'x-admin-token': token } };

        try {
            const dashboardRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, config);
            const { products, users, orders, deliveryPartners, coupons } = dashboardRes.data;
            
            syncCollectionState(setProducts, productsSignatureRef, products);
            syncCollectionState(setUsers, usersSignatureRef, users);
            syncCollectionState(setOrders, ordersSignatureRef, orders);
            syncCollectionState(setDeliveryPartners, deliveryPartnersSignatureRef, deliveryPartners);
            syncCollectionState(setCoupons, couponsSignatureRef, coupons);
            hasLoadedDashboardRef.current = true;
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to fetch admin data.');
        } finally {
            setIsLoading(false);
            fetchInProgressRef.current = false;
        }
    };

    useEffect(() => {
        fetchData();
        const refreshDelay = view === 'overview' ? OVERVIEW_REFRESH_MS : ACTIVE_ADMIN_REFRESH_MS;
        const dashboardSyncInterval = setInterval(() => {
            fetchData({ silent: true });
        }, refreshDelay);

        return () => {
            clearInterval(dashboardSyncInterval);
        };
    }, [view]);
    
    const handleAssignClick = (order) => {
        setAssigningOrder(order);
        setIsAssignModalOpen(true);
    };

    const handleAssignOrder = async (orderId, partnerId) => {
        if (!partnerId) {
            alert("Please select a delivery partner.");
            return;
        }
        try {
            const token = getAuthToken();
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}/assign`, 
                { partnerId }, 
                { headers: { 'x-admin-token': token } }
            );
            setIsAssignModalOpen(false);
            fetchData();
        } catch (err) {
            alert("Failed to assign order. Please try again.");
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm(`Are you sure you want to delete Order #${orderId}?`)) {
            return;
        }

        try {
            const token = getAuthToken();
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}`, {
                headers: { 'x-admin-token': token }
            });
            fetchData();
            onDataChange?.();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete order.');
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };
    
    const handleDeleteProduct = async (productId, productName) => {
        if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            try {
                const token = getAuthToken();
                const config = { headers: { 'x-admin-token': token } };
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/products/${productId}`, config);
                fetchData(); 
                onDataChange();
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to delete product.');
            }
        }
    };

    const handleToggleProductStock = async (productId, nextStockValue) => {
        setProducts(prevProducts => prevProducts.map(product =>
            product.id === productId ? { ...product, in_stock: nextStockValue } : product
        ));

        try {
            const token = getAuthToken();
            await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/products/${productId}/stock`,
                { in_stock: nextStockValue },
                { headers: { 'x-admin-token': token } }
            );
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update product stock.');
            fetchData({ silent: true });
        }
    };

    const handleDeleteCoupon = async (couponId, couponCode) => {
        if (window.confirm(`Are you sure you want to delete the coupon "${couponCode}"?`)) {
            try {
                const token = getAuthToken();
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/coupons/${couponId}`, { headers: { 'x-admin-token': token } });
                fetchData();
                onDataChange(); // Also trigger a refresh for coupons
            } catch (err) {
                 setError(err.response?.data?.msg || 'Failed to delete coupon.');
            }
        }
    };
    
    const handleSave = () => {
        setIsEditModalOpen(false);
        setIsAddModalOpen(false);
        setIsAddCouponModalOpen(false);
        fetchData(); 
        onDataChange();
    };

    const totalRevenue = useMemo(() => orders.reduce((acc, order) => acc + Number(order.total_amount), 0), [orders]);

    return (
        <div className="p-4 sm:p-8 bg-slate-100 min-h-screen">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-gray-500">Welcome to the Sresta Mart control panel.</p>
                    </div>
                    <button onClick={fetchData} disabled={isLoading} className="mt-4 sm:mt-0 flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 disabled:opacity-50 transition-colors">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh Data</span>
                    </button>
                </header>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert"><p>{error}</p></div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={<DollarSign />} title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} color="green" />
                    <StatCard icon={<ShoppingCart />} title="Total Orders" value={orders.length} color="orange" />
                    <StatCard icon={<Users />} title="Total Users" value={users.length} color="blue" />
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 border-b border-slate-200">
                        <div className="flex space-x-2 w-full overflow-x-auto pb-2 sm:w-auto sm:overflow-x-visible">
                            <TabButton name="Overview" icon={<BarChart2/>} activeView={view} setView={setView} viewId="overview" />
                            <TabButton name="Products" icon={<Package/>} activeView={view} setView={setView} viewId="products" />
                            <TabButton name="Users" icon={<Users/>} activeView={view} setView={setView} viewId="users" />
                            <TabButton name="Orders" icon={<ShoppingCart/>} activeView={view} setView={setView} viewId="orders" />
                            <TabButton name="Coupons" icon={<Tag/>} activeView={view} setView={setView} viewId="coupons" />
                        </div>
                        <div className="flex items-center gap-4 mt-4 sm:mt-0 self-end sm:self-center mb-2">
                            {view === 'products' && (
                                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-2 shadow transition-transform hover:scale-105">
                                    <PlusCircle size={16} className="mr-2"/> Add Product
                                </button>
                            )}
                            {view === 'coupons' && (
                                <button onClick={() => setIsAddCouponModalOpen(true)} className="flex items-center text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg px-3 py-2 shadow transition-transform hover:scale-105">
                                    <PlusCircle size={16} className="mr-2"/> Add Coupon
                                </button>
                            )}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            {isLoading ? <div className="text-center p-8">Loading Dashboard...</div> : 
                                view === 'overview' ? <AnalyticsOverview orders={orders} products={products} /> :
                                view === 'products' ? <ProductManagement products={products} selectedCategory={productCategoryFilter} onCategoryChange={setProductCategoryFilter} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onToggleStock={handleToggleProductStock} /> :
                                view === 'users' ? <UserTable users={users} /> :
                                view === 'orders' ? <OrdersTable orders={orders} onAssign={handleAssignClick} onDelete={handleDeleteOrder} /> :
                                <CouponTable coupons={coupons} onDelete={handleDeleteCoupon} />
                            }
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {isEditModalOpen && <EditProductModal product={editingProduct} onClose={() => setIsEditModalOpen(false)} onSave={handleSave} />}
            {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} onSave={handleSave} />}
            {isAddCouponModalOpen && <AddCouponModal onClose={() => setIsAddCouponModalOpen(false)} onSave={handleSave} />}

            <AnimatePresence>
                {isAssignModalOpen && (
                    <AssignOrderModal 
                        order={assigningOrder}
                        partners={deliveryPartners}
                        onClose={() => setIsAssignModalOpen(false)}
                        onAssign={handleAssignOrder}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- All sub-components are unchanged, except for CouponTable ---

const StatCard = ({ icon, title, value, color }) => {
    const colors = {
        blue: "from-blue-500 to-blue-400",
        green: "from-green-500 to-green-400",
        orange: "from-orange-500 to-orange-400",
    };
    return (
        <div className={`bg-gradient-to-br ${colors[color]} text-white p-6 rounded-xl shadow-lg flex items-center justify-between`}>
            <div>
                <p className="text-sm font-medium opacity-80">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            <div className="opacity-50">{React.cloneElement(icon, { size: 32 })}</div>
        </div>
    );
};

const TabButton = ({ name, icon, activeView, setView, viewId }) => (
    <button onClick={() => setView(viewId)} className={`flex-shrink-0 flex items-center px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${activeView === viewId ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
        {React.cloneElement(icon, { className: "inline-block mr-2 h-4 w-4" })} {name}
    </button>
);

const formatCategoryName = (category) => {
    if (!category) return 'Uncategorized';
    const normalized = category.toLowerCase().replace(/\s+/g, '');
    if (normalized === 'meatpoultry' || normalized === 'livebirds') return 'Meat & Poultry';
    if (normalized === 'dryfruits') return 'Dry Fruits';
    return category.charAt(0).toUpperCase() + category.slice(1);
};

const normalizeCategory = (category) => (category || 'uncategorized').toLowerCase().replace(/\s+/g, '');

const ProductManagement = ({ products, selectedCategory, onCategoryChange, onEdit, onDelete, onToggleStock }) => {
    const categories = useMemo(() => {
        const categoryMap = new Map();
        products.forEach(product => {
            const normalized = normalizeCategory(product.category);
            if (!categoryMap.has(normalized)) categoryMap.set(normalized, product.category || 'Uncategorized');
        });
        return Array.from(categoryMap.entries()).map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') return products;
        return products.filter(product => normalizeCategory(product.category) === selectedCategory);
    }, [products, selectedCategory]);

    return (
        <div>
            <div className="mb-4 flex flex-wrap gap-2">
                <button onClick={() => onCategoryChange('all')} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedCategory === 'all' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'}`}>
                    All Products ({products.length})
                </button>
                {categories.map(category => {
                    const count = products.filter(product => normalizeCategory(product.category) === category.id).length;
                    return (
                        <button key={category.id} onClick={() => onCategoryChange(category.id)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${selectedCategory === category.id ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'}`}>
                            {formatCategoryName(category.label)} ({count})
                        </button>
                    );
                })}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 hidden md:table-header-group">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="block md:table-row border-b md:border-none mb-4 md:mb-0">
                                <td className="px-6 py-4 whitespace-nowrap block md:table-cell">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-12 w-12"><img className="h-12 w-12 rounded-md object-cover" src={product.image_url || 'https://placehold.co/100'} alt={product.name} /></div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-500 max-w-xs truncate">{product.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap block md:table-cell">
                                    <span className="md:hidden font-bold text-xs uppercase text-gray-500">Category: </span>
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{formatCategoryName(product.category)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap block md:table-cell">
                                    <span className="md:hidden font-bold text-xs uppercase text-gray-500">Stock: </span>
                                    <button
                                        type="button"
                                        onClick={() => onToggleStock(product.id, product.in_stock === false)}
                                        className={`inline-flex w-32 items-center rounded-full border p-1 text-[11px] font-bold transition-colors ${product.in_stock === false ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}
                                        aria-pressed={product.in_stock !== false}
                                        title={product.in_stock === false ? 'Click to mark In Stock' : 'Click to mark Out of Stock'}
                                    >
                                        <span className={`w-1/2 rounded-full px-2 py-1 text-center transition-colors ${product.in_stock !== false ? 'bg-green-600 text-white shadow-sm' : 'text-red-700'}`}>
                                            In
                                        </span>
                                        <span className={`w-1/2 rounded-full px-2 py-1 text-center transition-colors ${product.in_stock === false ? 'bg-red-600 text-white shadow-sm' : 'text-green-700'}`}>
                                            Out
                                        </span>
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 block md:table-cell">
                                    {product.variants && product.variants.length > 0 ? (
                                        <ul className="space-y-1">{product.variants.map(v => (
                                            <li key={v.id} className="text-xs"><span className="font-semibold">{v.label}</span> - ₹{v.price}</li>
                                        ))}</ul>
                                    ) : (<span className="text-xs text-red-500">No variants</span>)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap block md:table-cell text-right">
                                    <button onClick={() => onEdit(product)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => onDelete(product.id, product.name)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No products found in this category.</div>}
            </div>
        </div>
    );
};

const AnalyticsOverview = ({ orders, products }) => {
    const salesData = useMemo(() => {
        const salesByDay = orders.reduce((acc, order) => {
            const date = new Date(order.created_at).toLocaleDateString('en-CA');
            if (!acc[date]) acc[date] = { orders: 0, revenue: 0 };
            acc[date].orders += 1;
            acc[date].revenue += Number(order.total_amount || 0);
            return acc;
        }, {});
        return Object.keys(salesByDay).map(date => ({ date, orders: salesByDay[date].orders, revenue: salesByDay[date].revenue })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-14);
    }, [orders]);

    const categoryData = useMemo(() => {
        const categoryCount = products.reduce((acc, product) => {
            const category = formatCategoryName(product.category);
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(categoryCount).map(name => ({ name, value: categoryCount[name] }));
    }, [products]);

    const insights = useMemo(() => {
        const now = new Date();
        const todayKey = now.toLocaleDateString('en-CA');
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 6);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const todayOrders = orders.filter(order => new Date(order.created_at).toLocaleDateString('en-CA') === todayKey);
        const weekOrders = orders.filter(order => new Date(order.created_at) >= weekStart);
        const monthOrders = orders.filter(order => new Date(order.created_at) >= monthStart);
        const pendingOrders = orders.filter(order => !['Delivered', 'Completed', 'Cancelled'].includes(order.delivery_status) && !['Completed', 'Cancelled'].includes(order.status));
        const outstationOrders = orders.filter(order => order.shipping_address?.value && !order.shipping_address.value.toLowerCase().includes('hyderabad'));
        const outOfStockProducts = products.filter(product => product.in_stock === false);
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
        return {
            todayOrders: todayOrders.length,
            todayRevenue: todayOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
            weekOrders: weekOrders.length,
            weekRevenue: weekOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
            monthOrders: monthOrders.length,
            monthRevenue: monthOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
            pendingOrders: pendingOrders.length,
            outstationOrders: outstationOrders.length,
            outOfStockProducts: outOfStockProducts.length,
            stockPercent: products.length ? Math.round(((products.length - outOfStockProducts.length) / products.length) * 100) : 0,
            avgOrderValue: orders.length ? totalRevenue / orders.length : 0,
            recentOrders: orders.slice(0, 5)
        };
    }, [orders, products]);

    const colors = ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316'];

    return (
        <div className="space-y-6 p-2 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <AnalyticsCard label="Today" value={`${insights.todayOrders} orders`} sub={`₹${insights.todayRevenue.toFixed(0)} revenue`} tone="red" />
                <AnalyticsCard label="Last 7 Days" value={`${insights.weekOrders} orders`} sub={`₹${insights.weekRevenue.toFixed(0)} revenue`} tone="blue" />
                <AnalyticsCard label="This Month" value={`${insights.monthOrders} orders`} sub={`₹${insights.monthRevenue.toFixed(0)} revenue`} tone="green" />
                <AnalyticsCard label="Avg Order Value" value={`₹${insights.avgOrderValue.toFixed(0)}`} sub={`${orders.length} total orders`} tone="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold text-gray-800">Orders & Revenue Trend</h3>
                    <p className="text-xs text-slate-500 mb-4">Last 14 active sales days</p>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis yAxisId="left" fontSize={12} />
                            <YAxis yAxisId="right" orientation="right" fontSize={12} />
                            <Tooltip wrapperClassName="!bg-white !border-slate-200 !rounded-lg !shadow-lg" />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#ef4444" strokeWidth={3} name="Orders" dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
                            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} name="Revenue (₹)" dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-1">Product & Delivery Health</h3>
                    <p className="text-xs text-slate-500 mb-4">{insights.stockPercent}% products in stock</p>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden mb-4">
                        <div className="h-full bg-green-500" style={{ width: `${insights.stockPercent}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <MiniMetric label="In Stock" value={products.length - insights.outOfStockProducts} tone="green" />
                        <MiniMetric label="Out" value={insights.outOfStockProducts} tone="red" />
                        <MiniMetric label="Pending" value={insights.pendingOrders} tone="amber" />
                        <MiniMetric label="Outstation" value={insights.outstationOrders} tone="blue" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Category Mix</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} isAnimationActive={false}>
                                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                                </Pie>
                                <Tooltip wrapperClassName="!bg-white !border-slate-200 !rounded-lg !shadow-lg" />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[280px] items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">No products to chart yet.</div>
                    )}
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Latest Orders</h3>
                    <div className="space-y-3">
                        {insights.recentOrders.map(order => (
                            <div key={order.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                                <div>
                                    <p className="font-semibold text-slate-800">Order #{order.id}</p>
                                    <p className="text-xs text-slate-500">{order.customer_name || 'Customer'} • {order.delivery_status}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">₹{Number(order.total_amount || 0).toFixed(0)}</p>
                                    <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                        {insights.recentOrders.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No orders yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnalyticsCard = ({ label, value, sub, tone }) => {
    const tones = {
        red: 'bg-red-50 text-red-700 border-red-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        green: 'bg-green-50 text-green-700 border-green-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100'
    };
    return (
        <div className={`rounded-xl border p-4 shadow-sm ${tones[tone]}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs opacity-75">{sub}</p>
        </div>
    );
};

const MiniMetric = ({ label, value, tone }) => {
    const tones = {
        red: 'bg-red-50 text-red-700',
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        amber: 'bg-amber-50 text-amber-700'
    };
    return (
        <div className={`rounded-lg p-3 ${tones[tone]}`}>
            <p className="text-xs opacity-75">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    );
};

const OverviewCharts = ({ orders, products }) => {
    const salesData = useMemo(() => {
        const salesByDay = orders.reduce((acc, order) => {
            const date = new Date(order.created_at).toLocaleDateString('en-CA');
            if (!acc[date]) acc[date] = { orders: 0, revenue: 0 };
            acc[date].orders += 1;
            acc[date].revenue += Number(order.total_amount);
            return acc;
        }, {});
        return Object.keys(salesByDay).map(date => ({ date, orders: salesByDay[date].orders, revenue: salesByDay[date].revenue })).sort((a,b) => new Date(a.date) - new Date(b.date));
    }, [orders]);

    const categoryData = useMemo(() => {
        const categoryCount = products.reduce((acc, product) => {
            const category = product.category || 'Uncategorized';
            if (!acc[category]) acc[category] = 0;
            acc[category]++;
            return acc;
        }, {});
        return Object.keys(categoryCount).map(name => ({ name, value: categoryCount[name] }));
    }, [products]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-700 mb-4">Daily Orders & Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis yAxisId="left" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" fontSize={12} />
                        <Tooltip wrapperClassName="!bg-white !border-slate-200 !rounded-lg !shadow-lg" />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#ef4444" name="Orders" dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
                        <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (₹)" dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
                 <h3 className="font-bold text-gray-700 mb-4">Product Categories Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} isAnimationActive={false}>
                            {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip wrapperClassName="!bg-white !border-slate-200 !rounded-lg !shadow-lg" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const ProductTable = ({ products, onEdit, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 hidden md:table-header-group">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                    <tr key={product.id} className="block md:table-row border-b md:border-none mb-4 md:mb-0">
                        <td className="px-6 py-4 whitespace-nowrap block md:table-cell">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12"><img className="h-12 w-12 rounded-md object-cover" src={product.image_url || 'https://placehold.co/100'} alt={product.name} /></div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-xs text-gray-500 max-w-xs truncate">{product.description}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap block md:table-cell">
                            <span className="md:hidden font-bold text-xs uppercase text-gray-500">Category: </span>
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{product.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 block md:table-cell">
                            {product.variants && product.variants.length > 0 ? (
                                <ul className="space-y-1">{product.variants.map(v => (
                                    <li key={v.id} className="text-xs"><span className="font-semibold">{v.label}</span> - ₹{v.price}</li>
                                ))}</ul>
                            ) : (<span className="text-xs text-red-500">No variants</span>)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap block md:table-cell text-right">
                            <button onClick={() => onEdit(product)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                            <button onClick={() => onDelete(product.id, product.name)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const UserTable = ({ users }) => {
    const UserAvatar = ({ name }) => (
        <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
            {name.charAt(0).toUpperCase()}
        </div>
    );
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-slate-50 hidden md:table-header-group">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Addresses</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Joined</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {users.map(user => (
                        <tr key={user.id} className="block md:table-row border-b md:border-none mb-4 md:mb-0">
                            <td className="px-6 py-4 whitespace-nowrap block md:table-cell">
                                <div className="flex items-center">
                                    <UserAvatar name={user.name} />
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 block md:table-cell">
                                <span className="md:hidden font-bold text-xs uppercase text-gray-500">Contact: </span>
                                {user.phone}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs block md:table-cell">
                                <span className="md:hidden font-bold text-xs uppercase text-gray-500">Addresses: </span>
                                {user.addresses && user.addresses.length > 0 ? (
                                    <ul className="space-y-1 inline-block md:block">{user.addresses.map((addr, idx) => (
                                        <li key={idx}><strong>{addr.label}:</strong> {addr.value}</li>
                                    ))}</ul>
                                ) : <span className="text-slate-400 italic">No addresses</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 block md:table-cell">
                                <span className="md:hidden font-bold text-xs uppercase text-gray-500">Joined: </span>
                                {new Date(user.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const OrdersTable = ({ orders, onAssign, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full">
            <thead className="bg-slate-50 hidden md:table-header-group">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order & Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount & Date</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {orders.map(order => <OrderRow key={order.id} order={order} onAssign={onAssign} onDelete={onDelete} />)}
            </tbody>
        </table>
    </div>
);

const OrderRow = ({ order, onAssign, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isOutsideHyderabad = order.shipping_address?.value && !order.shipping_address.value.toLowerCase().includes('hyderabad');
    const isAutomated = order.delivery_type === 'automated';

    return (
        <>
            <tr className={`block md:table-row mb-4 md:mb-0 ${
                isOutsideHyderabad 
                    ? 'bg-amber-50 border-l-4 border-amber-400' 
                    : 'border-b md:border-none'
            }`}>
                <td className="px-6 py-4 block md:table-cell" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="font-medium text-gray-800 cursor-pointer hover:text-red-600">{`Order #${order.id}`}</div>
                    <div className="flex items-center mt-1">
                        {isOutsideHyderabad && (
                            <span className="bg-amber-200 text-amber-800 text-xs font-semibold mr-2 px-2 py-0.5 rounded-full">
                                Outstation
                            </span>
                        )}
                        <div className="text-xs text-gray-500">{order.customer_name}</div>
                    </div>
                </td>
                <td className="px-6 py-4 block md:table-cell">
                    <span className="md:hidden font-bold text-xs uppercase text-gray-500">Status: </span>
                    <div className="text-sm text-gray-700 inline-block md:block">{order.delivery_status}</div>
                    {isAutomated ? (
                        <div className="text-xs text-blue-500 flex items-center gap-1">
                            <Bot size={12} /> Automated
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500">{order.partner_name ? `by ${order.partner_name}` : 'Unassigned'}</div>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap block md:table-cell text-left md:text-right">
                    <div className="font-semibold text-gray-800">₹{Number(order.total_amount).toFixed(2)}</div>
                    {order.expected_delivery_date ? (
                        <div className="text-xs text-gray-500">Exp: {new Date(order.expected_delivery_date).toLocaleDateString()}</div>
                    ) : (
                        <div className="text-xs text-gray-500">On: {new Date(order.created_at).toLocaleDateString()}</div>
                    )}
                </td>
                <td className="px-6 py-4 block md:table-cell text-left md:text-center">
                    <div className="flex flex-wrap justify-start md:justify-center gap-2">
                        <button 
                            onClick={() => onAssign(order)} 
                            disabled={isAutomated || order.delivery_status !== 'Pending'}
                            className="bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            title={isAutomated ? "This order is handled automatically" : ""}
                        >
                            Assign
                        </button>
                        <button
                            onClick={() => onDelete(order.id)}
                            className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold py-1 px-3 rounded-full hover:bg-red-100 transition-colors"
                        >
                            <Trash2 size={12} /> Delete
                        </button>
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr className="block md:table-row">
                    <td colSpan="4" className="p-0">
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                            <div className="bg-slate-100/80 p-4 m-2 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <p className="font-bold text-slate-700">Full Item List:</p>
                                        <ul className="list-disc list-inside text-slate-600 mt-1">
                                            {order.items?.map((item, index) => (
                                                <li key={index}>{item.name} ({item.variantLabel}) - <span className="font-medium">{item.quantity} x ₹{item.price.toFixed(2)}</span></li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">Shipping Details:</p>
                                        <p className="text-slate-600 mt-1">{order.shipping_address?.label}: {order.shipping_address?.value}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </td>
                </tr>
            )}
        </>
    );
};

const AssignOrderModal = ({ order, partners, onClose, onAssign }) => {
    const [selectedPartnerId, setSelectedPartnerId] = useState('');
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl shadow-lg w-full max-w-md"
            >
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Assign Order #{order.id}</h2>
                    <p className="text-sm text-gray-500">Select a delivery partner for this order.</p>
                </div>
                <div className="p-6">
                    <label className="text-sm font-medium text-gray-700">Available Partners</label>
                    <select
                        value={selectedPartnerId}
                        onChange={(e) => setSelectedPartnerId(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                        <option value="">-- Select a Partner --</option>
                        {partners.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>)}
                    </select>
                </div>
                <div className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-100">Cancel</button>
                    <button onClick={() => onAssign(order.id, selectedPartnerId)} disabled={!selectedPartnerId} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400">
                        Confirm Assignment
                    </button>
                </div>
            </motion.div>
        </div>
    );
};


const getCouponStatus = (coupon) => {
    const expiryDate = new Date(coupon.expiry_date);
    expiryDate.setHours(23, 59, 59, 999);
    if (expiryDate < new Date()) {
        return { label: 'Expired', className: 'bg-amber-100 text-amber-800' };
    }
    if (!coupon.is_active) {
        return { label: 'Inactive', className: 'bg-red-100 text-red-800' };
    }
    return { label: 'Active', className: 'bg-green-100 text-green-800' };
};

// --- MODIFIED: Coupon Table is now responsive and shows a poster thumbnail ---
const CouponTable = ({ coupons, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 hidden md:table-header-group">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon / Offer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Purchase</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map(coupon => (
                    <tr key={coupon.id} className="block md:table-row border-b md:border-none mb-4 md:mb-0">
                        <td className="px-6 py-4 whitespace-nowrap block md:table-cell">
                            <div className="flex items-center">
                                {coupon.poster_url && 
                                    <div className="flex-shrink-0 h-12 w-12 mr-4">
                                        <img className="h-12 w-12 rounded-md object-cover" src={coupon.poster_url} alt="Poster" />
                                    </div>
                                }
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{coupon.code}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{coupon.description}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap block md:table-cell">
                            <span className="md:hidden font-bold text-xs uppercase text-gray-500">Discount: </span>
                            <div className="text-sm text-gray-800">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</div>
                            <div className="text-xs text-gray-500">{coupon.discount_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 block md:table-cell">
                            <span className="md:hidden font-bold text-xs uppercase text-gray-500">Min. Purchase: </span>
                            ₹{coupon.min_purchase_amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 block md:table-cell">
                            <span className="md:hidden font-bold text-xs uppercase text-gray-500">Category: </span>
                            {coupon.applicable_category ? 
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{coupon.applicable_category}</span> : 
                                <span className="text-xs text-gray-400">All Categories</span>
                            }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 block md:table-cell">
                            <span className="md:hidden font-bold text-xs uppercase text-gray-500">Expires: </span>
                            {new Date(coupon.expiry_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap block md:table-cell">
                             <span className="md:hidden font-bold text-xs uppercase text-gray-500">Status: </span>
                            {(() => {
                                const status = getCouponStatus(coupon);
                                return (
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                                        {status.label}
                                    </span>
                                );
                            })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right block md:table-cell">
                            <button onClick={() => onDelete(coupon.id, coupon.code)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
