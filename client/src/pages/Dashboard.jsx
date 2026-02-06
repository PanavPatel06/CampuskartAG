import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

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
                {/* Role Based Content Sections */}
                {user.role === 'user' && (
                    <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                        <h2 className="text-xl font-bold mb-4">My Orders</h2>
                        <p className="text-gray-500">You haven't placed any orders yet.</p>
                        {/* Future: List of orders */}
                        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Browse Products
                        </button>
                    </div>
                )}

                {user.role === 'vendor' && (
                    <>
                        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                            <h2 className="text-xl font-bold mb-4">Manage Products</h2>
                            <p className="text-gray-500">Add, edit, or remove your products.</p>
                            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                Add Product
                            </button>
                        </div>
                        <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
                            <h2 className="text-xl font-bold mb-4">Incoming Orders</h2>
                            <p className="text-gray-500">No new orders.</p>
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
