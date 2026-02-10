import { useContext, useState } from 'react';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { createOrder, getLocations } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart, cartTotal } = useContext(CartContext);
    const navigate = useNavigate();

    const [instructions, setInstructions] = useState("");
    const [locations, setLocations] = useState([]);
    const [deliveryLocation, setDeliveryLocation] = useState("");
    const { user } = useContext(AuthContext);

    useEffect(() => {
        getLocations().then(({ data }) => setLocations(data)).catch(console.error);
    }, []);

    // Group items by Vendor first to avoid multiple loops
    const validItems = cartItems.filter(item => item.vendor && (item.vendor._id || typeof item.vendor === 'string'));

    const handleCheckout = async () => {
        if (validItems.length === 0) return;
        if (!deliveryLocation) {
            alert('Please select a delivery location.');
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
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
                <p className="text-gray-500 mb-4">Your cart is empty.</p>
                <a href="/products" className="text-indigo-600 hover:text-indigo-800">Browse Products</a>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cartItems.map((item) => (
                            <tr key={item.product}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.qty}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price * item.qty}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => removeFromCart(item.product)} className="text-red-600 hover:text-red-900">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Instructions Input */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Instructions (Optional)
                    </label>
                    <textarea
                        id="instructions"
                        rows="3"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                        placeholder="e.g., Leave at front desk, call upon arrival..."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>

                {/* Location Selection */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Location (Required)
                    </label>
                    <select
                        id="location"
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="">Select a location</option>
                        {locations.map(loc => (
                            <option key={loc._id} value={loc.name}>{loc.name}</option>
                        ))}
                    </select>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end items-center">
                    <div className="text-xl font-bold mr-6">Total: ₹{cartTotal}</div>
                    <button
                        onClick={handleCheckout}
                        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
