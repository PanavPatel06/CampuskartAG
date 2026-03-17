import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ShoppingBag, Zap, ShieldCheck, MapPin, Star, Sparkles } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="flex flex-col bg-white">
            {/* Hero Section */}
            <section className="relative pt-20 pb-28 md:pt-32 md:pb-40 overflow-hidden">
                {/* Decorative blurs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-indigo-100/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                <div className="absolute top-32 -right-20 w-[350px] h-[350px] bg-purple-100/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 -left-20 w-[250px] h-[250px] bg-emerald-50/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] uppercase tracking-[0.15em] mb-10 border border-indigo-100/60 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>The #1 Campus Marketplace</span>
                    </div>
                    
                    <h1 className="text-5xl sm:text-6xl md:text-[5.5rem] font-black text-gray-900 tracking-tighter mb-8 max-w-4xl mx-auto leading-[1.05]">
                        Everything you need,{' '}
                        <br className="hidden md:block" />
                        delivered{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-violet-600">anywhere</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-14 leading-relaxed">
                        Shop groceries, snacks, stationery, and print documents from trusted campus vendors — delivered to your door by fellow students.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to={user ? "/products" : "/register"} className="w-full sm:w-auto">
                            <Button size="lg" className="flex items-center justify-center rounded-2xl px-10 h-14 font-bold text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full">
                                {user ? 'Start Shopping' : 'Get Started'} <ArrowRight className="w-5 h-5 ml-2.5" />
                            </Button>
                        </Link>
                        <Link to="/products" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="flex items-center justify-center rounded-2xl px-10 h-14 font-bold text-base bg-white hover:bg-gray-50 text-gray-900 border-gray-200 shadow-sm w-full transition-all duration-300 hover:-translate-y-0.5">
                                Browse Products <ShoppingBag className="w-5 h-5 ml-2.5 text-gray-400" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 md:py-32 bg-gray-50/80 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-4">Why CampusKart</p>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-5">Built for students, by students</h2>
                        <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto">Everything about CampusKart is designed around the student lifestyle.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Lightning Delivery', desc: 'Get your orders delivered directly to your door by fellow students in record time.', color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
                            { icon: ShieldCheck, title: 'Trusted Vendors', desc: 'Shop from verified campus stores and canteens that you already know and love.', color: 'bg-blue-50', iconColor: 'text-blue-500' },
                            { icon: MapPin, title: 'Pinpoint Location', desc: 'Our system maps precisely to your campus buildings for accurate drop-offs.', color: 'bg-purple-50', iconColor: 'text-purple-500' },
                        ].map((f, i) => (
                            <Card key={i} className="border-none shadow-md bg-white rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <CardContent className="p-10 md:p-12 text-center">
                                    <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mx-auto mb-7 group-hover:scale-105 transition-transform duration-300`}>
                                        <f.icon className={`w-8 h-8 ${f.iconColor}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{f.title}</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-24 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
                        <div>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-3">Explore</p>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">Popular Categories</h2>
                            <p className="text-lg text-gray-500 font-medium">Find exactly what you are looking for.</p>
                        </div>
                        <Link to="/products" className="hidden sm:flex items-center text-indigo-600 font-bold hover:text-indigo-700 transition-colors group">
                            View All <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Snacks & Drinks', color: 'bg-orange-50 hover:bg-orange-100/70', emoji: '🍔' },
                            { title: 'Stationery', color: 'bg-blue-50 hover:bg-blue-100/70', emoji: '📓' },
                            { title: 'Print Orders', color: 'bg-indigo-50 hover:bg-indigo-100/70', emoji: '🖨️' },
                            { title: 'Essentials', color: 'bg-emerald-50 hover:bg-emerald-100/70', emoji: '🧴' }
                        ].map((cat, i) => (
                            <Link key={i} to="/products" className="group">
                                <div className={`aspect-square ${cat.color} rounded-3xl flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1`}>
                                    <span className="text-6xl md:text-7xl mb-5 transform group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
                                    <h3 className="text-base md:text-lg font-bold text-gray-900 tracking-tight">{cat.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                    
                    <div className="mt-8 text-center sm:hidden">
                        <Link to="/products">
                            <Button variant="outline" className="w-full h-12 rounded-xl font-bold">View All Categories</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-20 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-5">Ready to get started?</h2>
                    <p className="text-indigo-200 text-lg font-medium mb-10 max-w-lg mx-auto">Join thousands of students already using CampusKart for everyday campus needs.</p>
                    <Link to={user ? "/dashboard" : "/register"}>
                        <Button size="lg" className="rounded-2xl px-10 h-14 font-bold text-base bg-white text-indigo-700 hover:bg-gray-100 shadow-xl hover:-translate-y-1 transition-all duration-300">
                            {user ? 'Go to Dashboard' : 'Create Free Account'} <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-14 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-white font-black text-sm tracking-tighter leading-none">CK</span>
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tight">CampusKart</span>
                    </div>
                    
                    <div className="flex gap-8 text-sm font-bold text-gray-500">
                        <Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
                        <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                        <Link to="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link>
                        <Link to="/register" className="hover:text-indigo-600 transition-colors">Create Account</Link>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-400">
                        &copy; {new Date().getFullYear()} CampusKart. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
