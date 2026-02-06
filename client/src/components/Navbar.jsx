import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold text-gray-800">
                        CampusKart
                    </Link>
                    <div className="flex space-x-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 flex items-center">
                                    Dashboard
                                </Link>
                                <Link to="/products" className="text-gray-600 hover:text-gray-800 flex items-center">
                                    Browse
                                </Link>
                                <Link to="/cart" className="text-gray-600 hover:text-gray-800 font-medium flex items-center">
                                    Cart ({cartItems.length})
                                </Link>
                                <Link to="/delivery" className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center">
                                    Delivery
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-600 hover:text-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-gray-800">
                                    Login
                                </Link>
                                <Link to="/register" className="text-gray-600 hover:text-gray-800">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
