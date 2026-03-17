import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { getMyOrders, getVendorOrders, updateOrderStatus, getAllOrders, getMyDeliveries, getLocations, addLocation, deleteLocation, addFunds, searchUsers, getSystemEarnings, getCommissionRates, updateCommissionRates, getMyWallet } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]); // User purchases or Vendor/Admin orders
    const [deliveries, setDeliveries] = useState([]); // User/Agent delivery tasks
    const [locations, setLocations] = useState([]); // State for admin locations
    const [error, setError] = useState(null);

    // Admin Wallet States
    const [walletSearch, setWalletSearch] = useState('');
    const [walletUsers, setWalletUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [fundAmount, setFundAmount] = useState('');
    const [systemEarnings, setSystemEarnings] = useState(null);
    const [commissionRates, setCommissionRates] = useState({ companyRate: 5, deliveryRate: 5 });

    // User Wallet State
    const [userWalletBalance, setUserWalletBalance] = useState(0);

    const fetchLocations = async () => {
        try {
            const { data } = await getLocations();
            setLocations(data);
        } catch (e) { console.error(e); }
    };

    const fetchOrders = async () => {
        if (user) {
            console.log('[Dashboard] Fetching data for user:', user.email, user.role);
            try {
                let orderData = [];
                let deliveryData = [];

                if (user.role === 'vendor') {
                    const response = await getVendorOrders();
                    console.log('[Dashboard] Vendor Orders Response:', response.data);
                    orderData = response.data;
                } else if (user.role === 'user') {
                    // Fetch Purchases
                    const orderRes = await getMyOrders();
                    console.log('[Dashboard] User Orders Response:', orderRes.data);
                    orderData = orderRes.data;

                    // Fetch Live Wallet Balance
                    try {
                        const { data } = await getMyWallet();
                        setUserWalletBalance(data.balance);
                    } catch (err) {
                        console.error('Failed to fetch wallet balance', err);
                    }

                    // Fetch Deliveries (User acting as Agent)
                    try {
                        const deliveryRes = await getMyDeliveries();
                        console.log('[Dashboard] User Deliveries Response:', deliveryRes.data);
                        deliveryData = deliveryRes.data;
                    } catch (err) {
                        console.log('No deliveries found or error fetching deliveries (normal if not an agent yet)');
                    }

                } else if (user.role === 'admin') {
                    const response = await getAllOrders();
                    console.log('[Dashboard] Admin Orders Response:', response.data);
                    orderData = response.data;
                    fetchLocations(); // Fetch locations only for admin
                    fetchAdminWalletData();
                } else if (user.role === 'agent') {
                    const response = await getMyDeliveries();
                    console.log('[Dashboard] Agent Deliveries Response:', response.data);
                    deliveryData = response.data; // Agents mainly see deliveries
                }

                console.log('[Dashboard] Setting orders state:', orderData.length);
                setOrders(orderData);
                console.log('[Dashboard] Setting deliveries state:', deliveryData.length);
                setDeliveries(deliveryData);

            } catch (error) {
                console.error('Failed to fetch data', error);
                setError('Failed to load data. ' + (error.response?.data?.message || 'Server error.'));
            }
        }
    };

    const fetchAdminWalletData = async () => {
        try {
            const earningsRes = await getSystemEarnings();
            setSystemEarnings(earningsRes.data);
            const commRes = await getCommissionRates();
            setCommissionRates(commRes.data);
        } catch (e) {
            console.error('Failed to fetch admin wallet data', e);
        }
    };

    const handleUserSearch = async (e) => {
        e.preventDefault();
        try {
            const { data } = await searchUsers(walletSearch);
            setWalletUsers(data);
        } catch (e) { alert(e.message); }
    };

    const handleAddFunds = async () => {
        if (!selectedUser || !fundAmount) return;
        try {
            await addFunds(selectedUser._id, fundAmount);
            alert('Funds added successfully');
            setFundAmount('');
            setSelectedUser(null);
            setWalletUsers([]); // Clear search
            setWalletSearch('');
            fetchAdminWalletData(); // Refresh earnings potentially? No, but maybe referesh if we showed user balance
        } catch (e) { alert(e.response?.data?.message || e.message); }
    };

    const handleUpdateCommission = async () => {
        try {
            await updateCommissionRates(commissionRates);
            alert('Commission rates updated');
        } catch (e) { alert(e.message); }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const handleStatusUpdate = async (orderId, newStatus, otp = null) => {
        try {
            await updateOrderStatus(orderId, newStatus, otp);
            // Refresh orders after update
            fetchOrders();
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Failed to update status: ' + (error.response?.data?.message || error.message));
        }
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <Card className="overflow-hidden border-gray-200/60 shadow-md rounded-2xl">
                <CardContent className="p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Welcome back, {user.name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <span className="font-bold uppercase text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-md text-xs tracking-wider border border-indigo-100">{user.role}</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {user.email}
                            </span>
                        </div>
                    </div>
                    {user.role === 'user' && (
                        <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-6 md:min-w-[240px] shadow-sm flex flex-col justify-center">
                            <p className="text-sm font-semibold text-indigo-800 mb-1 uppercase tracking-wide">Wallet Balance</p>
                            <p className="text-4xl font-extrabold text-indigo-900 tracking-tight">₹{userWalletBalance !== undefined ? userWalletBalance : (user.walletBalance || 0)}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {error && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {/* Role Based Content Sections */}
                {user.role === 'user' && (
                    <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-md border-gray-200/60 rounded-2xl">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 gap-4">
                            <CardTitle className="text-2xl font-extrabold tracking-tight text-gray-900">Recent Orders</CardTitle>
                            <div className="flex space-x-3">
                                <Button asChild variant="outline" className="rounded-xl border-gray-300 font-semibold shadow-sm">
                                    <a href="/products">Browse Products</a>
                                </Button>
                                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5 font-bold">
                                    <a href="/print-order">New Print Order</a>
                                </Button>
                            </div>
                        </CardHeader>
                        
                        <CardContent>
                            {orders.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50/80 rounded-2xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 font-semibold text-lg">You haven't placed any orders yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {orders.map(order => (
                                        <Card key={order._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col border-gray-200 rounded-2xl group">
                                            <div className="p-6 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center group-hover:bg-indigo-50/30 transition-colors">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Order #{order._id.slice(-6)}</p>
                                                    <p className="text-sm font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                                </div>
                                                <span className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide uppercase ${
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            
                                            <div className="p-6 flex-1 flex flex-col justify-end">
                                                <div className="flex justify-between items-end mb-4">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Total Amount</p>
                                                        <p className="text-3xl font-extrabold text-gray-900">₹{order.totalAmount}</p>
                                                    </div>
                                                    
                                                    {order.status === 'pending' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 font-semibold rounded-lg"
                                                        >
                                                            Cancel Order
                                                        </Button>
                                                    )}
                                                </div>

                                                {/* OTP Display for User */}
                                                {order.status === 'out_for_delivery' && (
                                                    <div className="p-5 bg-indigo-50/80 rounded-xl border border-indigo-100 text-center mt-4">
                                                        <p className="text-xs text-indigo-700 font-bold uppercase tracking-widest mb-2">Delivery OTP</p>
                                                        <p className="text-4xl font-mono tracking-widest text-indigo-900 font-extrabold">{order.deliveryOtp || '----'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {user.role === 'vendor' && (
                    <>
                        <Card className="col-span-1 border-l-4 border-l-emerald-500 shadow-md border-gray-200/60 rounded-2xl flex flex-col justify-between">
                            <CardContent className="p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Manage Products</h2>
                                <p className="text-gray-500 text-sm mb-6">Add, edit, or remove your products from the marketplace.</p>
                                <Button asChild className="w-full bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 border border-emerald-200 shadow-none">
                                    <a href="/add-product">Add New Product</a>
                                </Button>
                            </CardContent>
                        </Card>
                        
                        <Card className="col-span-1 md:col-span-2 lg:col-span-2 shadow-md border-gray-200/60 rounded-2xl">
                            <CardHeader className="pb-4 border-b border-gray-100">
                                <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">Incoming Orders</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {orders.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50/80 rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500 font-semibold text-lg">No new orders arrived.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map(order => (
                                            <Card key={order._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col border-gray-200 rounded-2xl group">
                                                <div className="p-6 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center group-hover:bg-emerald-50/30 transition-colors">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Order #{order._id.slice(-6)}</p>
                                                        <p className="text-sm font-semibold text-gray-900">Customer: {order.customer?.name || 'Unknown'}</p>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide uppercase ${
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>

                                                <div className="p-6">
                                                    {order.instructions && (
                                                        <div className="mb-5 p-4 bg-amber-50/80 rounded-xl border border-amber-100">
                                                            <p className="text-xs text-amber-800 flex flex-col gap-1">
                                                                <strong className="font-bold uppercase tracking-wider text-[10px]">Note from customer</strong>
                                                                <span className="font-medium text-sm">{order.instructions}</span>
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="space-y-4 mb-6">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 last:border-0 last:pb-0">
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                                    {item.printOptions && (
                                                                        <p className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-2">
                                                                            <span className="bg-gray-100 px-2 py-0.5 rounded-sm">{item.printOptions.color === 'color' ? 'Color' : 'B&W'}</span>
                                                                            <span className="bg-gray-100 px-2 py-0.5 rounded-sm">{item.printOptions.pages} Pages</span>
                                                                            <span className="bg-gray-100 px-2 py-0.5 rounded-sm">{item.printOptions.copies} Copies</span>
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {item.fileUrl && (
                                                                    <Button asChild variant="outline" size="sm" className="mt-3 sm:mt-0 font-semibold text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800">
                                                                        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                            View PDF
                                                                        </a>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center font-bold text-gray-900 mb-6 border-t border-gray-100 pt-5">
                                                        <span className="text-sm uppercase tracking-wider text-gray-500">Total Revenue</span>
                                                        <span className="text-2xl">₹{order.totalAmount}</span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        {order.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    onClick={() => handleStatusUpdate(order._id, 'accepted')}
                                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold py-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                                                                >
                                                                    Accept Order
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-bold py-6 rounded-xl shadow-sm transition-all"
                                                                >
                                                                    Reject Order
                                                                </Button>
                                                            </>
                                                        )}
                                                        {(order.status === 'accepted' || order.status === 'agent_requested') && (
                                                            <div className="col-span-2">
                                                                {order.status === 'agent_requested' ? (
                                                                    <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-xl text-center space-y-4 shadow-inner">
                                                                        <p className="text-sm text-blue-800 font-bold uppercase tracking-wider flex items-center justify-center gap-3">
                                                                            <span className="relative flex h-3 w-3">
                                                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                                              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                                                            </span>
                                                                            Agent waiting for approval
                                                                        </p>
                                                                        <Button
                                                                            onClick={() => handleStatusUpdate(order._id, 'out_for_delivery')}
                                                                            className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                                                                        >
                                                                            Approve Pickup Delivery
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-5 bg-gray-50/80 border border-gray-200 rounded-xl flex items-center justify-center shadow-inner">
                                                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-3">
                                                                            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                            </svg>
                                                                            Waiting for an agent...
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}



                {user.role === 'admin' && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-8">
                        {/* Location Management Section */}
                        <Card className="shadow-md border-gray-200/60 rounded-2xl">
                            <CardHeader className="pb-4 border-b border-gray-100">
                                <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">Manage Delivery Locations</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                    <Input
                                        type="text"
                                        placeholder="Enter new location (e.g. Hostel A)"
                                        className="h-12 text-base rounded-xl"
                                        id="newLocationInput"
                                    />
                                    <Button
                                        onClick={async () => {
                                            const input = document.getElementById('newLocationInput');
                                            if (!input.value) return;
                                            try {
                                                await addLocation(input.value);
                                                input.value = '';
                                                fetchLocations();
                                            } catch (e) { alert(e.message); }
                                        }}
                                        className="h-12 bg-indigo-600 hover:bg-indigo-700 px-6 font-bold rounded-xl shadow-sm whitespace-nowrap transition-all"
                                    >
                                        Add Location
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {locations.map(loc => (
                                        <div key={loc._id} className="flex justify-between items-center bg-gray-50/80 p-5 rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all">
                                            <span className="font-semibold text-gray-900">{loc.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={async () => {
                                                    if (window.confirm('Delete location?')) {
                                                        try { await deleteLocation(loc._id); fetchLocations(); }
                                                        catch (e) { alert(e.message); }
                                                    }
                                                }}
                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Wallet & Commission Management */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Wallet Manager */}
                            <Card className="shadow-md border-gray-200/60 rounded-2xl flex flex-col">
                                <CardHeader className="pb-4 border-b border-gray-100">
                                    <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">Fund User Wallets</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 flex-1 flex flex-col">
                                    <form onSubmit={handleUserSearch} className="flex gap-3 mb-6">
                                        <Input
                                            type="text"
                                            placeholder="Search by name or email"
                                            value={walletSearch}
                                            onChange={(e) => setWalletSearch(e.target.value)}
                                            className="h-12 text-base rounded-xl flex-1"
                                        />
                                        <Button type="submit" className="h-12 px-6 bg-gray-900 hover:bg-gray-800 font-bold rounded-xl shadow-sm transition-all">Search</Button>
                                    </form>
                                    
                                    {walletUsers.length > 0 && (
                                        <ul className="mb-8 border border-gray-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-100 shadow-inner">
                                            {walletUsers.map(u => (
                                                <li key={u._id}
                                                    onClick={() => setSelectedUser(u)}
                                                    className={`p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center transition-colors ${selectedUser?._id === u._id ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{u.name}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{u.email}</p>
                                                    </div>
                                                    <span className="font-bold text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm shadow-sm">₹{u.walletBalance}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    
                                    {selectedUser && (
                                        <div className="flex gap-3 mt-auto">
                                            <div className="relative flex-1">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 font-medium">₹</span>
                                                </div>
                                                <Input
                                                    type="number"
                                                    placeholder="Amount"
                                                    value={fundAmount}
                                                    onChange={(e) => setFundAmount(e.target.value)}
                                                    className="h-12 pl-8 text-base rounded-xl w-full"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleAddFunds}
                                                className="h-12 bg-emerald-600 hover:bg-emerald-700 px-6 font-bold rounded-xl shadow-sm whitespace-nowrap transition-all"
                                            >
                                                Add Funds
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* System Earnings & Commission */}
                            <Card className="shadow-md border-gray-200/60 rounded-2xl flex flex-col">
                                <CardHeader className="pb-4 border-b border-gray-100">
                                    <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">Earnings & Commission</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {systemEarnings && (
                                        <div className="grid grid-cols-2 gap-5 mb-8">
                                            <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-100">
                                                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-2">Company</p>
                                                <p className="text-2xl font-extrabold text-emerald-900">₹{systemEarnings.totalCompanyEarnings.toFixed(2)}</p>
                                            </div>
                                            <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-100">
                                                <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Payouts</p>
                                                <p className="text-2xl font-extrabold text-blue-900">₹{systemEarnings.totalDeliveryEarnings.toFixed(2)}</p>
                                            </div>
                                            <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-100">
                                                <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-2">Vendors</p>
                                                <p className="text-2xl font-extrabold text-amber-900">₹{systemEarnings.totalVendorEarnings.toFixed(2)}</p>
                                            </div>
                                            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200 shadow-inner">
                                                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Gross Sales</p>
                                                <p className="text-2xl font-extrabold text-gray-900">₹{systemEarnings.totalSales.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <h3 className="font-bold text-gray-900 mb-4 tracking-tight">Commission Rates (%)</h3>
                                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                                            <div className="w-full sm:w-auto">
                                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Company %</label>
                                                <Input
                                                    type="number"
                                                    value={commissionRates.companyRate}
                                                    onChange={(e) => setCommissionRates({ ...commissionRates, companyRate: Number(e.target.value) })}
                                                    className="h-12 w-full text-center text-lg font-bold rounded-xl"
                                                />
                                            </div>
                                            <div className="w-full sm:w-auto">
                                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Delivery %</label>
                                                <Input
                                                    type="number"
                                                    value={commissionRates.deliveryRate}
                                                    onChange={(e) => setCommissionRates({ ...commissionRates, deliveryRate: Number(e.target.value) })}
                                                    className="h-12 w-full text-center text-lg font-bold rounded-xl"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleUpdateCommission}
                                                className="h-12 bg-indigo-600 hover:bg-indigo-700 px-6 font-bold rounded-xl shadow-sm w-full sm:w-auto transition-all"
                                            >
                                                Save Rates
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* System Overview */}
                        <Card className="shadow-md border-gray-200/60 rounded-2xl overflow-hidden">
                            <CardHeader className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <CardTitle className="text-xl font-bold text-gray-900 tracking-tight">System Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Order ID</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Vendor</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Location</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Agent</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {orders.map(order => (
                                                <tr key={order._id} className="hover:bg-indigo-50/30 transition-colors">
                                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">#{order._id.slice(-6)}</td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">{order.user?.name || 'User'}</td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">{order.vendor?.storeName || 'N/A'}</td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">{order.deliveryLocation || '-'}</td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">{order.deliveryAgent?.name || '-'}</td>
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold tracking-wide uppercase rounded-md border ${
                                                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 font-extrabold">₹{order.totalAmount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Dashboard;
