import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut, PackageSearch, LayoutDashboard, Truck, UserCircle, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/products', label: 'Browse', icon: PackageSearch },
        { path: '/delivery', label: 'Delivery', icon: Truck },
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 transition-all shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                                <span className="text-white font-black text-lg leading-none tracking-tighter">CK</span>
                            </div>
                            <span className="text-2xl font-black text-gray-900 tracking-tight hidden sm:block">
                                CampusKart
                            </span>
                        </Link>
                    </div>
                    
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1.5">
                        {user ? (
                            <>
                                {navLinks.map(link => (
                                    <Button
                                        key={link.path}
                                        variant={isActive(link.path) ? 'secondary' : 'ghost'}
                                        asChild
                                        className={`rounded-xl px-4 h-11 font-medium text-sm transition-all ${isActive(link.path) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                                    >
                                        <Link to={link.path}>
                                            <link.icon className={`w-4 h-4 mr-2 ${isActive(link.path) ? 'text-indigo-500' : 'text-gray-400'}`} />
                                            {link.label}
                                        </Link>
                                    </Button>
                                ))}

                                {/* Cart */}
                                <Button
                                    variant={isActive('/cart') ? 'secondary' : 'ghost'}
                                    asChild
                                    className={`rounded-xl px-4 h-11 font-medium text-sm transition-all ${isActive('/cart') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                                >
                                    <Link to="/cart">
                                        <div className="relative mr-2">
                                            <ShoppingCart className={`w-4 h-4 ${isActive('/cart') ? 'text-indigo-500' : 'text-gray-400'}`} />
                                            {cartItems?.length > 0 && (
                                                <span className="absolute -top-2 -right-2.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-indigo-600 rounded-full ring-2 ring-white">
                                                    {cartItems.length}
                                                </span>
                                            )}
                                        </div>
                                        Cart
                                    </Link>
                                </Button>

                                <div className="w-px h-8 bg-gray-200 mx-3"></div>

                                {/* User Info */}
                                <div className="flex items-center gap-2.5">
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                                        <UserCircle className="w-4.5 h-4.5 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-700">{user.name?.split(' ')[0] || 'User'}</span>
                                    </div>
                                    <Button variant="outline" onClick={handleLogout} className="rounded-xl px-4 h-11 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-medium text-sm border-gray-200 transition-all">
                                        <LogOut className="w-4 h-4 mr-2 text-gray-400" />
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" asChild className="rounded-xl px-5 h-11 font-medium text-sm text-gray-600 hover:text-gray-900">
                                    <Link to="/products">Browse</Link>
                                </Button>
                                <Button variant="ghost" asChild className="rounded-xl px-5 h-11 font-medium text-sm text-gray-600 hover:text-gray-900">
                                    <Link to="/login">Log in</Link>
                                </Button>
                                <Button asChild className="rounded-xl px-6 h-11 font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all hover:-translate-y-0.5">
                                    <Link to="/register">Get Started</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-xl">
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
                        {user ? (
                            <>
                                {navLinks.map(link => (
                                    <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${isActive(link.path) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                        <link.icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                ))}
                                <Link to="/cart" onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${isActive('/cart') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <ShoppingCart className="w-4 h-4" />
                                    Cart {cartItems?.length > 0 && <span className="ml-auto bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartItems.length}</span>}
                                </Link>
                                <div className="border-t border-gray-100 pt-3 mt-3">
                                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50 w-full transition-all">
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-50">
                                    <PackageSearch className="w-4 h-4" /> Browse
                                </Link>
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-50">
                                    <UserCircle className="w-4 h-4" /> Log in
                                </Link>
                                <div className="px-4 pt-2">
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full h-12 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
