import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Users, Package, RefreshCw, PlusCircle, ShoppingCart, ChevronDown, DollarSign, BarChart2, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import EditProductModal from '../components/admin/EditProductModal.jsx';
import AddProductModal from '../components/admin/AddProductModal.jsx';
import AddCouponModal from '../components/admin/AddCouponModal.jsx';

const getAuthToken = () => localStorage.getItem('adminToken'); 

export default function AdminPage() {
    const [view, setView] = useState('overview');
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [coupons, setCoupons] = useState([]); // --- NEW ---
    const [isLoading, setIsLoading] = useState(true);
    // --- THIS IS THE CORRECTED LINE ---
    const [error, setError] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigningOrder, setAssigningOrder] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        const token = getAuthToken();
        if (!token) {
            setError("Admin authorization token not found.");
            setIsLoading(false);
            return;
        }
        
        const config = { headers: { 'x-admin-token': token } };

        try {
            const [productsRes, usersRes, ordersRes, partnersRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/products`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/orders`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/delivery-partners`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/api/admin/coupons`, config) 
            ]);
            
            setProducts(productsRes.data);
            setUsers(usersRes.data);
            setOrders(ordersRes.data);
            setDeliveryPartners(partnersRes.data);
             setCoupons(couponsRes.data);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to fetch admin data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
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
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to delete product.');
            }
        }
    };

    const handleDeleteCoupon = async (couponId, couponCode) => {
        if (window.confirm(`Are you sure you want to delete the coupon "${couponCode}"?`)) {
            try {
                const token = getAuthToken();
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/coupons/${couponId}`, { headers: { 'x-admin-token': token } });
                fetchData(); // Refresh all data
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
    };

    const totalRevenue = useMemo(() => orders.reduce((acc, order) => acc + Number(order.total_amount), 0), [orders]);

    return (
        <div className="p-4 sm:p-8 bg-slate-100 min-h-screen">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-gray-500">Welcome to the Sresta Mart control panel.</p>
                    </div>
                    <button onClick={fetchData} disabled={isLoading} className="mt-4 sm:mt-0 flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 disabled:opacity-50 transition-colors">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh Data</span>
                    </button>
                </header>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert"><p>{error}</p></div>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={<DollarSign />} title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} color="green" />
                    <StatCard icon={<ShoppingCart />} title="Total Orders" value={orders.length} color="orange" />
                    <StatCard icon={<Users />} title="Total Users" value={users.length} color="blue" />
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 border-b border-slate-200">
                        <div className="flex space-x-2 self-start sm:self-center">
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
                                view === 'overview' ? <OverviewCharts orders={orders} products={products} /> :
                                view === 'products' ? <ProductTable products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} /> :
                                view === 'users' ? <UserTable users={users} /> :
                                view === 'orders' ? <OrdersTable orders={orders} onAssign={handleAssignClick} /> :
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
    <button onClick={() => setView(viewId)} className={`flex items-center px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${activeView === viewId ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
        {React.cloneElement(icon, { className: "inline-block mr-2 h-4 w-4" })} {name}
    </button>
);

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
                        <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#ef4444" name="Orders" />
                        <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (₹)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
                 <h3 className="font-bold text-gray-700 mb-4">Product Categories Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
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
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                    <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0 h-12 w-12"><img className="h-12 w-12 rounded-md object-cover" src={product.image_url || 'https://placehold.co/100'} alt={product.name} /></div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{product.name}</div><div className="text-xs text-gray-500 max-w-xs truncate">{product.description}</div></div></div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{product.category}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.variants && product.variants.length > 0 ? (<ul className="space-y-1">{product.variants.map(v => (<li key={v.id} className="text-xs"><span className="font-semibold">{v.label}</span> - ₹{v.price}</li>))}</ul>) : (<span className="text-xs text-red-500">No variants</span>)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Addresses</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Joined</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <UserAvatar name={user.name} />
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                {user.addresses && user.addresses.length > 0 ? (
                                    <ul className="space-y-1">{user.addresses.map((addr, idx) => (
                                        <li key={idx}><strong>{addr.label}:</strong> {addr.value}</li>
                                    ))}</ul>
                                ) : <span className="text-slate-400 italic">No addresses</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const OrdersTable = ({ orders, onAssign }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full">
            <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order & Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount & Date</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {orders.map(order => <OrderRow key={order.id} order={order} onAssign={onAssign} />)}
            </tbody>
        </table>
    </div>
);

const OrderRow = ({ order, onAssign }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <tr className="hover:bg-slate-50">
                <td className="px-6 py-4" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="font-medium text-gray-800 cursor-pointer hover:text-red-600">{`Order #${order.id}`}</div>
                    <div className="text-xs text-gray-500">{order.customer_name}</div>
                </td>
                <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{order.delivery_status}</div>
                    <div className="text-xs text-gray-500">{order.partner_name ? `by ${order.partner_name}` : 'Unassigned'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="font-semibold text-gray-800">₹{Number(order.total_amount).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 text-center">
                    {order.delivery_status === 'Pending' && (
                        <button onClick={() => onAssign(order)} className="bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-blue-600 transition-colors">
                            Assign
                        </button>
                    )}
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-white">
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


// --- NEW: CouponTable Component ---
const CouponTable = ({ coupons, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Purchase</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map(coupon => (
                    <tr key={coupon.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{coupon.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-800">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</div>
                            <div className="text-xs text-gray-500">{coupon.discount_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{coupon.min_purchase_amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(coupon.expiry_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {coupon.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => onDelete(coupon.id, coupon.code)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
