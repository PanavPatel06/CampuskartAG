import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { getMyOrders, getVendorOrders, updateOrderStatus } from '../services/api';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        if (user) {
            try {
                let data;
                if (user.role === 'vendor') {
                    const response = await getVendorOrders();
                    data = response.data;
                } else if (user.role === 'user') {
                    const response = await getMyOrders();
                    data = response.data;
                }
                if (data) setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders', error);
                setError('Failed to load orders. ' + (error.response?.data?.message || 'Server error.'));
            }
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
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
                                    <div key={order._id} className="border p-4 rounded bg-gray-50 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">Order #{order._id.slice(-6)}</p>
                                            <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            <p className="text-sm">Total: ₹{order.totalAmount}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded text-xs ${order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : order.status === 'cancelled' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
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
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold">Order #{order._id.slice(-6)}</p>
                                                    <p className="text-sm text-gray-600">Customer: {order.customer?.name || 'Unknown'}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs ${order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                                                    {order.status}
                                                </span>
                                            </div>

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
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {user.role === 'agent' && (
                    <div className="bg-white p-6 rounded shadow border-l-4 border-orange-500">
                        <h2 className="text-xl font-bold mb-4">Delivery Tasks</h2>
                        <p className="text-gray-500">No pending deliveries.</p>
                    </div>
                )}

                {user.role === 'admin' && (
                    <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
                        <h2 className="text-xl font-bold mb-4">System Overview</h2>
                        <p className="text-gray-500">Manage users and platform settings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
