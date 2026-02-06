import { useState, useEffect, useContext } from 'react';
import { getAllProducts } from '../services/api';
import { Link } from 'react-router-dom';
import CartContext from '../context/CartContext';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useContext(CartContext);

    const handleAddToCart = (product) => {
        addToCart(product);
        alert('Added to Cart!');
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await getAllProducts();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch products', error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <div className="text-center mt-10">Loading products...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">Browse Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center">No products found.</p>
                ) : (
                    products.map((product) => (
                        <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                                <p className="text-gray-600 mb-2 truncate">{product.description}</p>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-green-600 font-bold text-lg">₹{product.price}</span>
                                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                                        {product.vendor?.storeName || 'Unknown Vendor'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-8 text-center">
                <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    &larr; Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default ProductList;
