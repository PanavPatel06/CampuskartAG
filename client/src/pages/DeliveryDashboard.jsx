import { useState, useEffect, useContext } from 'react';
import { io } from "socket.io-client";
import AuthContext from '../context/AuthContext';
import { updateOrderStatus, getAvailableOrders } from '../services/api';

// Initialize socket outside component to prevent multiple connections
const socket = io("http://localhost:5001");

const DeliveryDashboard = () => {
    const { user } = useContext(AuthContext);
    const [isOnline, setIsOnline] = useState(false);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('Hostel A');
    const [isConnected, setIsConnected] = useState(socket.connected);

    // Available locations on campus
    const LOCATIONS = ['Hostel A', 'Hostel B', 'Main Building', 'Library', 'Canteen'];

    useEffect(() => {
        // Socket Connection Monitoring
        socket.on("connect", () => {
            console.log("Socket Connected:", socket.id);
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("Socket Disconnected");
            setIsConnected(false);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket Connection Error:", err);
            setIsConnected(false);
        });

        if (isOnline && user) {
            socket.emit("join_delivery", { userId: user._id, location: selectedLocation });
            console.log(`[Client] Emitting join_delivery for ${selectedLocation}`);

            // Fetch existing available orders
            const fetchExisting = async () => {
                try {
                    console.log(`[Client] Fetching existing orders for ${selectedLocation}...`);
                    const res = await getAvailableOrders(selectedLocation);
                    console.log(`[Client] API Response:`, res.data);
                    console.log(`[Client] Found ${res.data.length} existing orders.`);
                    setAvailableOrders(prev => {
                        // Merge without duplicates
                        const newOrders = res.data.filter(newO => !prev.find(p => p._id === newO._id));
                        return [...prev, ...newOrders];
                    });
                } catch (err) {
                    console.error("Failed to fetch existing orders:", err);
                    alert("Debug: Failed to fetch orders. See console.");
                }
            };
            fetchExisting();
        }

        socket.on("new_delivery_request", (order) => {
            console.log("New order received:", order);
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3');
            audio.play().catch(e => console.log("Audio play failed", e));

            setAvailableOrders(prev => {
                if (prev.find(o => o._id === order._id)) return prev;
                return [order, ...prev];
            });
        });

        return () => {
            socket.off("new_delivery_request");
            socket.off("connect");
            socket.off("connect_error");
        };
    }, [isOnline, user, selectedLocation]);

    const handleAcceptOrder = async (orderId) => {
        try {
            await updateOrderStatus(orderId, 'out_for_delivery'); // Or a specific 'accepted_by_agent' status logic
            alert("Order Accepted! Please pick it up from the vendor.");
            setAvailableOrders(prev => prev.filter(o => o._id !== orderId));
        } catch (error) {
            console.error("Failed to accept order:", error);
            alert("Failed to accept order.");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Delivery Dashboard
                    {/* Connection Status Indicator */}
                    <span className={`ml-4 text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isConnected ? '● Connected' : '○ Disconnected'}
                    </span>
                </h1>
                <div className="flex items-center space-x-4">
                    {!isOnline && (
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:border-indigo-500"
                        >
                            {LOCATIONS.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    )}

                    <span className={`text-sm font-bold ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                        {isOnline ? `ONLINE (${selectedLocation})` : 'OFFLINE'}
                    </span>
                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className={`px-4 py-2 rounded-full font-bold text-white transition-colors ${isOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        {isOnline ? 'Go Offline' : 'Go Online'}
                    </button>
                </div>
            </div>

            {!isOnline && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                You are currently offline. Go online to receive delivery requests.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* DEBUG SECTION */}
            <div className="mb-4 p-2 bg-gray-100 text-xs text-gray-600 rounded">
                DEBUG: Location={selectedLocation} | Online={isOnline.toString()} | Orders={availableOrders.length}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableOrders.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500 text-lg">No active delivery requests in <span className="font-bold text-gray-700">{selectedLocation}</span>.</p>
                        <p className="text-gray-400 text-sm mt-2">Waiting for new orders from vendors in this area...</p>
                    </div>
                ) : (
                    availableOrders.map(order => (
                        <div key={order._id} className="bg-white border-l-4 border-indigo-500 rounded-lg shadow-md p-6 animate-pulse">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">New Order Request!</h3>
                                    <p className="text-sm text-gray-500">Order #{order._id.slice(-6)}</p>
                                </div>
                                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                    ₹{order.totalAmount}
                                </span>
                            </div>

                            <div className="mb-4">
                                <h4 className="font-semibold text-sm text-gray-700">Pickup From:</h4>
                                <p className="text-gray-600">{order.vendor?.storeName || 'Vendor'}</p>
                                <p className="text-xs text-gray-500">{order.vendor?.location || 'Unknown Location'}</p>
                            </div>

                            <button
                                onClick={() => handleAcceptOrder(order._id)}
                                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors font-bold"
                            >
                                Accept Delivery
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeliveryDashboard;
