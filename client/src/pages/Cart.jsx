import { useContext, useState, useEffect } from 'react';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { createOrder, getLocations, getMyWallet } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, CreditCard, ChevronDown } from 'lucide-react';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart, cartTotal } = useContext(CartContext);
    const navigate = useNavigate();

    const [instructions, setInstructions] = useState("");
    const [locations, setLocations] = useState([]);
    const [deliveryLocation, setDeliveryLocation] = useState("");
    const { user } = useContext(AuthContext);
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        getLocations().then(({ data }) => setLocations(data)).catch(console.error);
        if (user) {
            getMyWallet().then(({ data }) => setWalletBalance(data.balance)).catch(console.error);
        }
    }, [user]);

    // Group items by Vendor first to avoid multiple loops
    const validItems = cartItems.filter(item => item.vendor && (item.vendor._id || typeof item.vendor === 'string'));

    const handleCheckout = async () => {
        if (validItems.length === 0) return;
        if (!deliveryLocation) {
            alert('Please select a delivery location.');
            return;
        }

        if (walletBalance < cartTotal) {
            alert(`Insufficient Wallet Balance (₹${walletBalance}). Total Required: ₹${cartTotal}. Please report to Admin for recharge.`);
            return;
        }

        if (validItems.length < cartItems.length) {
            alert('Notice: Some items were removed due to invalid vendor data.');
        }

        const itemsByVendor = validItems.reduce((acc, item) => {
            const vId = item.vendor?._id || item.vendor;
            if (!acc[vId]) acc[vId] = [];
            acc[vId].push(item);
            return acc;
        }, {});

        try {
            for (const vendorId of Object.keys(itemsByVendor)) {
                const vendorItems = itemsByVendor[vendorId];
                const vendorTotal = vendorItems.reduce((acc, item) => acc + item.qty * item.price, 0);

                const orderData = {
                    orderItems: vendorItems.map(item => ({
                        product: item._id,
                        name: item.name,
                        qty: item.qty,
                        price: item.price
                    })),
                    vendorId: vendorId,
                    totalPrice: vendorTotal,
                    instructions: instructions,
                    deliveryLocation: deliveryLocation
                };

                await createOrder(orderData);
            }

            clearCart();
            alert('Order Placed Successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Checkout failed: ' + (error.response?.data?.message || error.message));
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="bg-white p-16 rounded-3xl shadow-md border-0 flex flex-col items-center max-w-2xl mx-auto">
                    <div className="w-28 h-28 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8">
                        <ShoppingBag className="w-12 h-12 text-indigo-300" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Your cart is empty</h2>
                    <p className="text-lg text-gray-500 mb-10 max-w-md font-medium leading-relaxed">Looks like you haven't added anything yet. Discover our campus products and start shopping.</p>
                    <Link to="/products">
                        <Button size="lg" className="h-14 px-10 font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5">
                            Start Shopping <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-10">
                <ShoppingBag className="w-7 h-7 text-indigo-600" />
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{cartItems.length} items</span>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
                
                {/* Cart Items List */}
                <div className="w-full lg:w-2/3 space-y-4 shadow-md border-0 rounded-3xl bg-white overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                        {cartItems.map((item) => (
                            <li key={item.product} className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 hover:bg-gray-50/50 transition-colors group">
                                <div className="w-full h-48 sm:w-40 sm:h-40 bg-gray-50/80 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-gray-100">
                                     <ShoppingBag className="w-10 h-10 text-gray-300 group-hover:scale-110 group-hover:text-indigo-200 transition-all duration-300" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 pr-4">{item.name}</h3>
                                            <p className="text-2xl font-black text-gray-900">₹{item.price * item.qty}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest bg-gray-100 inline-block px-2.5 py-1 rounded-md">₹{item.price} each</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            <span className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-r border-gray-200">Qty</span>
                                            <span className="px-5 py-2 text-base font-black text-gray-900">{item.qty}</span>
                                        </div>
                                        <Button 
                                            variant="ghost"
                                            onClick={() => removeFromCart(item.product)} 
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold px-4 py-2 h-10 rounded-xl transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Checkout Summary Panel */}
                <div className="w-full lg:w-1/3">
                    <Card className="rounded-3xl shadow-md border-0 sticky top-28">
                        <CardHeader className="pb-6 border-b border-gray-100">
                            <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between text-base">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="font-bold text-gray-900">₹{cartTotal}</span>
                                </div>
                                <div className="flex items-center justify-between text-base">
                                    <span className="text-gray-500 font-medium flex items-center gap-1">Service Fee <ShieldCheck className="w-3 h-3 text-indigo-400"/></span>
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-sm uppercase tracking-wider">Free</span>
                                </div>
                                <div className="pt-6 border-t border-gray-100 border-dashed mt-2">
                                    <div className="flex items-end justify-between">
                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Amount</span>
                                        <span className="text-4xl font-black text-indigo-600 tracking-tighter">₹{cartTotal}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-5 rounded-2xl mb-8 border shadow-inner ${walletBalance < cartTotal ? 'bg-red-50/80 border-red-200 text-red-900' : 'bg-gray-50/80 border-gray-200 text-gray-900'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className={`w-5 h-5 ${walletBalance < cartTotal ? 'text-red-500' : 'text-gray-500'}`} />
                                    <span className="font-bold text-xs uppercase tracking-widest text-gray-600">Wallet Balance</span>
                                </div>
                                <p className={`text-2xl font-black ${walletBalance < cartTotal ? 'text-red-700' : 'text-gray-900'}`}>₹{walletBalance}</p>
                                {walletBalance < cartTotal && (
                                    <p className="text-xs mt-2 font-bold text-red-500 flex items-center bg-white/60 p-2 rounded-lg border border-red-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                                        Insufficient funds for this order.
                                    </p>
                                )}
                            </div>

                            {/* Location Selection */}
                            <div className="mb-6">
                                <label htmlFor="location" className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                                    Delivery Location <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="location"
                                        value={deliveryLocation}
                                        onChange={(e) => setDeliveryLocation(e.target.value)}
                                        className="appearance-none block w-full bg-gray-50/80 border border-gray-200 text-gray-900 h-14 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-base cursor-pointer shadow-sm"
                                    >
                                        <option value="" className="text-gray-400">Choose a location...</option>
                                        {locations.map(loc => (
                                            <option key={loc._id} value={loc.name} className="font-medium text-gray-900">{loc.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Instructions Input */}
                            <div className="mb-8">
                                <label htmlFor="instructions" className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2 flex justify-between">
                                    <span>Delivery Instructions</span>
                                    <span className="text-gray-400 font-medium">Optional</span>
                                </label>
                                <textarea
                                    id="instructions"
                                    rows="2"
                                    className="block w-full bg-gray-50/80 border border-gray-200 text-gray-900 py-3 px-4 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none font-medium shadow-sm"
                                    placeholder="e.g., Leave at front desk..."
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleCheckout}
                                disabled={walletBalance < cartTotal}
                                className={`w-full h-14 text-lg font-bold rounded-xl shadow-md transition-all relative overflow-hidden group ${
                                    walletBalance < cartTotal || !deliveryLocation 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200 shadow-none' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5'
                                }`}
                            >
                                {walletBalance < cartTotal ? 'Insufficient Balance' : 'Complete Purchase'}
                                {walletBalance >= cartTotal && !!deliveryLocation && (
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Cart;
