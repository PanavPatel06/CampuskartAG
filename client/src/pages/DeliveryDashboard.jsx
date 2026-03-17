import { useState, useEffect, useContext } from 'react';
import { io } from "socket.io-client";
import AuthContext from '../context/AuthContext';
import { updateOrderStatus, getAvailableOrders, getLocations } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, User, Navigation, CheckCircle2, Package, Signal, SignalZero, BellRing } from 'lucide-react';

// Initialize socket outside component to prevent multiple connections
const socket = io("http://localhost:5001");

const DeliveryDashboard = () => {
    const { user } = useContext(AuthContext);
    const [isOnline, setIsOnline] = useState(false);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [locations, setLocations] = useState([]); // Dynamic locations
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        getLocations().then(({ data }) => {
            setLocations(data);
            if (data.length > 0 && !selectedLocation) setSelectedLocation(data[0].name);
        }).catch(console.error);
    }, []);

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

        if (isOnline && user && selectedLocation) {
            socket.emit("join_delivery", { userId: user._id, location: selectedLocation });
            console.log(`[Client] Emitting join_delivery for ${selectedLocation}`);

            // Clear previous orders to avoid ghost data
            setAvailableOrders([]);

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

            // STRICT CLIENT-SIDE CHECK
            // Use optional chaining and default to empty string to prevent crashes
            const orderLocation = order.vendor?.location || "";
            // Compare normalized locations
            if (orderLocation.trim().toLowerCase() !== selectedLocation.trim().toLowerCase()) {
                console.log(`[Client] Ignoring order from '${orderLocation}' (Current: '${selectedLocation}')`);
                return;
            }

            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3');
            audio.play().catch(e => console.log("Audio play failed", e));

            setAvailableOrders(prev => {
                if (prev.find(o => o._id === order._id)) return prev;
                return [order, ...prev];
            });
        });

        return () => {
            // CLEANUP: Leave the room when unwounting or changing location
            if (user) {
                console.log(`[Client] Leaving room for ${selectedLocation}`);
                socket.emit("leave_delivery", { userId: user._id, location: selectedLocation });
            }
            socket.off("new_delivery_request");
            socket.off("connect");
            socket.off("connect_error");
        };
    }, [isOnline, user, selectedLocation]);

    const handleAcceptOrder = async (orderId) => {
        try {
            await updateOrderStatus(orderId, 'agent_requested');
            alert("Request sent to Vendor! Please wait for approval in your main Dashboard.");
            setAvailableOrders(prev => prev.filter(o => o._id !== orderId));
        } catch (error) {
            console.error("Failed to accept order:", error);
            alert("Failed to accept order.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Delivery Hub</h1>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {isConnected ? (
                                <>
                                    <Signal className="w-3.5 h-3.5" />
                                    Connected
                                </>
                            ) : (
                                <>
                                    <SignalZero className="w-3.5 h-3.5" />
                                    Disconnected
                                </>
                            )}
                        </span>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">Manage incoming delivery requests from your assigned location.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] relative z-10">
                    {!isOnline && (
                        <div className="w-full sm:w-auto">
                            <label htmlFor="location-select" className="sr-only">Select Location</label>
                            <select
                                id="location-select"
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="block w-full sm:w-48 pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg bg-white shadow-sm transition-colors"
                            >
                                <option value="" disabled>Select location...</option>
                                {locations.map(loc => (
                                    <option key={loc._id} value={loc.name}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className={`text-xs font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-600' : 'text-gray-500'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                            {isOnline && <span className="text-xs text-gray-500">{selectedLocation}</span>}
                        </div>
                        
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={`relative inline-flex flex-shrink-0 h-8 w-14 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            role="switch"
                            aria-checked={isOnline}
                        >
                            <span className="sr-only">Toggle Online Status</span>
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-7 w-7 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${isOnline ? 'translate-x-6' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {!isOnline && (
                <div className="bg-amber-50 rounded-xl p-4 mb-8 border border-amber-200 flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">You are currently offline</h3>
                        <div className="mt-1 text-sm text-amber-700">
                            <p>Go online to start receiving and accepting delivery requests in your location.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden DEBUG SECTION to keep UI clean, can be re-enabled if needed */}
            <div className="hidden mb-4 p-2 bg-gray-100 text-xs text-gray-600 rounded">
                DEBUG: Location={selectedLocation} | Online={isOnline.toString()} | Orders={availableOrders.length}
            </div>

            <div className="flex items-center gap-3 mb-8">
                <Navigation className="w-8 h-8 text-indigo-600" />
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Requests</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {availableOrders.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-indigo-50/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-indigo-300" />
                        </div>
                        <p className="text-gray-900 font-extrabold text-2xl mb-2 tracking-tight">No active requests</p>
                        <p className="text-gray-500 font-medium text-base max-w-sm mx-auto leading-relaxed">
                            {!isOnline 
                                ? "Go online to start receiving requests in your area." 
                                : `Waiting for new delivery orders from vendors in ${selectedLocation || 'your area'}...`}
                        </p>
                    </div>
                ) : (
                    availableOrders.map(order => (
                        <Card key={order._id} className="relative overflow-hidden group hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col rounded-3xl border-gray-100/80">
                            {/* Decorative accent */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>
                            
                            <CardHeader className="pb-4 pt-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 mb-3 animate-pulse border border-red-100">
                                            <BellRing className="w-3 h-3 mr-1.5" />
                                            New Request
                                        </span>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order #{order._id.slice(-6)}</p>
                                    </div>
                                    <span className="bg-gray-50 border border-gray-100/80 text-gray-900 font-black text-xl px-4 py-2 rounded-xl shadow-sm">
                                        ₹{order.totalAmount}
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col space-y-6">
                                <div className="flex items-start bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                                    <div className="flex-shrink-0 mt-0.5 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                        <MapPin className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup From</h4>
                                        <p className="text-base font-bold text-gray-900 tracking-tight">{order.vendor?.storeName || 'Vendor'}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">{order.vendor?.location || 'Unknown Location'}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start bg-gray-50/50 p-4 rounded-2xl border border-gray-50 mb-4">
                                    <div className="flex-shrink-0 mt-0.5 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                        <User className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Deliver To</h4>
                                        <p className="text-base font-bold text-gray-900 tracking-tight">{order.deliveryLocation || 'Customer Location'}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">Customer ID: <span className="font-mono bg-gray-100 px-1 rounded">{order.user?.slice(-4) || 'Unknown'}</span></p>
                                    </div>
                                </div>
                                
                                <div className="pt-2 mt-auto">
                                    <Button
                                        onClick={() => handleAcceptOrder(order._id)}
                                        className="w-full h-14 bg-indigo-600 text-white font-bold text-base rounded-xl hover:bg-indigo-700 transition-all shadow-md focus:ring-4 focus:ring-indigo-100 group-hover:-translate-y-0.5"
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Accept Delivery
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeliveryDashboard;
