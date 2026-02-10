import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { getMyOrders, getVendorOrders, updateOrderStatus, getAllOrders, getMyDeliveries, getLocations, addLocation, deleteLocation } from '../services/api';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]); // User purchases or Vendor/Admin orders
    const [deliveries, setDeliveries] = useState([]); // User/Agent delivery tasks
    const [locations, setLocations] = useState([]); // State for admin locations
    const [error, setError] = useState(null);

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
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
                <p className="text-gray-600">
                    Role: <span className="font-semibold uppercase">{user.role}</span>
                </p>
                <p className="text-gray-600">
                    Email: {user.email}
                </p>
                <div className="mt-2 p-2 bg-gray-100 text-xs rounded hidden">
                    Debug: Orders Count = {orders.length} | Role = {user.role}
                </div>
                {user.role === 'user' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded">
                        <p className="text-lg font-medium text-blue-800">Wallet Balance: ₹{user.walletBalance || 0}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {error && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {/* Role Based Content Sections */}
                {user.role === 'user' && (
                    <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500 col-span-1 md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">My Orders</h2>
                        {orders.length === 0 ? (
                            <p className="text-gray-500">You haven't placed any orders yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order._id} className="border p-4 rounded bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold">Order #{order._id.slice(-6)}</p>
                                                <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                <p className="text-sm">Total: ₹{order.totalAmount}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded text-xs block mb-1 ${order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : order.status === 'cancelled' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                                                    {order.status}
                                                </span>
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                        className="text-xs text-red-600 hover:text-red-800 underline"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* OTP Display for User */}
                                        {order.status === 'out_for_delivery' && (
                                            <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-200 text-center">
                                                <p className="text-sm text-blue-800 font-bold">Share this OTP with Delivery Agent:</p>
                                                <p className="text-2xl font-mono tracking-widest text-blue-900">{order.deliveryOtp || '----'}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-4 flex space-x-4">
                            <a href="/products" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Browse Products
                            </a>
                            <a href="/print-order" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                New Print Order
                            </a>
                        </div>
                    </div>
                )}

                {user.role === 'vendor' && (
                    <>
                        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                            <h2 className="text-xl font-bold mb-4">Manage Products</h2>
                            <p className="text-gray-500">Add, edit, or remove your products.</p>
                            <a href="/add-product" className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                Add Product
                            </a>
                        </div>
                        <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500 col-span-1 md:col-span-2">
                            <h2 className="text-xl font-bold mb-4">Incoming Orders</h2>
                            {orders.length === 0 ? (
                                <p className="text-gray-500">No new orders.</p>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div key={order._id} className="border p-4 rounded bg-gray-50">
                                            {/* (Existing Vendor Header) */}
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold">Order #{order._id.slice(-6)}</p>
                                                    <p className="text-sm text-gray-600">Customer: {order.customer?.name || 'Unknown'}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs ${order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                                                    {order.status}
                                                </span>
                                            </div>

                                            {/* Instructions Visibility */}
                                            {order.instructions && (
                                                <div className="mt-2 mb-2 p-2 bg-yellow-50 text-xs text-gray-700 border border-yellow-200 rounded">
                                                    <strong>Note:</strong> {order.instructions}
                                                </div>
                                            )}

                                            {/* Order Items Details */}
                                            <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="text-sm text-gray-700 mb-1">
                                                        <p className="font-medium">{item.name}</p>
                                                        {item.printOptions && (
                                                            <p className="text-xs text-gray-500">
                                                                {item.printOptions.color === 'color' ? 'Color' : 'B&W'} | {item.printOptions.pages} Pages | {item.printOptions.copies} Copies
                                                            </p>
                                                        )}
                                                        {item.fileUrl && (
                                                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-xs block mt-1">
                                                                View PDF
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-right">
                                                <p className="font-bold text-gray-800">Total: ₹{order.totalAmount}</p>
                                            </div>

                                            {/* Vendor Actions */}
                                            <div className="mt-4 flex space-x-2 pt-4 border-t border-gray-200">
                                                {order.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'accepted')}
                                                            className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                            className="flex-1 bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {/* Handshake: Vendor Approves Agent Request */}
                                                {(order.status === 'accepted' || order.status === 'agent_requested') && (
                                                    <div className="flex-1">
                                                        {order.status === 'agent_requested' ? (
                                                            <div className="flex flex-col space-y-1">
                                                                <p className="text-xs text-blue-600 font-bold">Request from Agent!</p>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(order._id, 'out_for_delivery')}
                                                                    className="bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700 w-full animate-pulse"
                                                                >
                                                                    Approve Agent
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-xs text-gray-500 italic">
                                                                Waiting for delivery agent...
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}



                {user.role === 'admin' && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-6">
                        {/* Location Management Section */}
                        <div className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
                            <h2 className="text-xl font-bold mb-4">Manage Delivery Locations</h2>
                            <div className="flex space-x-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Enter new location (e.g. Hostel A)"
                                    className="border p-2 rounded flex-1"
                                    id="newLocationInput"
                                />
                                <button
                                    onClick={async () => {
                                        const input = document.getElementById('newLocationInput');
                                        if (!input.value) return;
                                        try {
                                            await addLocation(input.value);
                                            input.value = '';
                                            fetchLocations(); // defined below or need to be moved up
                                        } catch (e) { alert(e.message); }
                                    }}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                                >
                                    Add Location
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {locations.map(loc => (
                                    <div key={loc._id} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                                        <span>{loc.name}</span>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Delete location?')) {
                                                    try { await deleteLocation(loc._id); fetchLocations(); }
                                                    catch (e) { alert(e.message); }
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-800 font-bold"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* System Overview */}
                        <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
                            <h2 className="text-xl font-bold mb-4">System Overview (Admin)</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendor</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Loc</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Agent</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id}>
                                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order._id.slice(-6)}</td>
                                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order.user?.name || 'User'}</td>
                                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order.vendor?.storeName}</td>
                                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order.deliveryLocation || '-'}</td>
                                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order.deliveryAgent?.name || '-'}</td>
                                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">₹{order.totalAmount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
