import { useState, useEffect, useContext } from 'react';
import { getAllProducts } from '../services/api';
import { Link } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ShoppingCart, PackageSearch, ArrowLeft, ImageIcon, Sparkles } from 'lucide-react';

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

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-5">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                    <PackageSearch className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="text-gray-500 font-bold tracking-[0.15em] uppercase text-xs">Loading products...</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] uppercase tracking-[0.15em] mb-6 border border-indigo-100/60 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fresh from campus vendors</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Browse Products</h1>
                <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">Explore premium campus materials from our top-rated vendors.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <PackageSearch className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-bold text-xl mb-2">No products found</p>
                        <p className="text-gray-500 font-medium text-sm">Check back soon — vendors are adding new items daily.</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <Card key={product._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col border-0 rounded-3xl shadow-md bg-white">
                            {/* Product Image Placeholder */}
                            <div className="w-full h-52 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100 flex items-center justify-center overflow-hidden relative">
                                <ImageIcon className="w-12 h-12 text-gray-200 group-hover:scale-110 group-hover:text-indigo-200 transition-all duration-500" />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        {product.vendor?.storeName || 'Vendor'}
                                    </span>
                                </div>
                            </div>
                            
                            <CardContent className="p-6 flex flex-col flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    {product.name}
                                </h3>
                                
                                <p className="text-sm text-gray-500 mb-5 line-clamp-2 flex-1 font-medium leading-relaxed">
                                    {product.description}
                                </p>
                                
                                <div className="flex justify-between items-end mb-5 pt-4 border-t border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Price</span>
                                        <span className="text-2xl font-black text-gray-900 tracking-tight">₹{product.price}</span>
                                    </div>
                                </div>
                                
                                <Button
                                    onClick={() => handleAddToCart(product)}
                                    className="w-full h-12 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Add to Cart
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="mt-16 text-center">
                <Link to="/dashboard">
                    <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-bold px-6 h-12 rounded-2xl transition-all">
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default ProductList;
