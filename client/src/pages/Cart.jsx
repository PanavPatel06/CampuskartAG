import { useContext } from 'react';
import CartContext from '../context/CartContext';
import { createOrder } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart, cartTotal } = useContext(CartContext);
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        // Filter out items with invalid/missing vendor data (prevents crash)
        const validItems = cartItems.filter(item => item.vendor && (item.vendor._id || typeof item.vendor === 'string'));

        if (validItems.length === 0) {
            alert('Critial Error: All items in cart have invalid vendor data. Clearing cart.');
            clearCart();
            return;
        }

        if (validItems.length < cartItems.length) {
            alert('Notice: Some items were removed due to invalid vendor data.');
        }

        // Group items by Vendor to create separate orders per vendor
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
                        product: item._id, // Include product ref
                        name: item.name,
                        qty: item.qty,
                        price: item.price
                    })),
                    vendorId: vendorId, // Use the vendor ID from the group
                    totalPrice: vendorTotal
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
