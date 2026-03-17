import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, AlertCircle, ChevronDown, Store, MapPin } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        storeName: '',
        location: '',
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const inputClasses = "h-14 px-4 rounded-xl border-gray-200 bg-gray-50/80 text-base font-medium focus-visible:ring-indigo-200 focus-visible:border-indigo-500 transition-all shadow-sm";

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-purple-50/50 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-50/40 rounded-full blur-3xl pointer-events-none"></div>

            <Card className="w-full max-w-[500px] shadow-xl border-0 rounded-3xl bg-white relative z-10">
                <CardContent className="p-10 sm:p-12">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-white font-black text-xl tracking-tighter">CK</span>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Create an account</h1>
                        <p className="text-base text-gray-500 font-medium">Join CampusKart and start ordering today.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 font-medium">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">Full Name</label>
                            <Input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">Email address</label>
                            <Input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="you@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">Password</label>
                            <Input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClasses} placeholder="Create a strong password" required />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">Role</label>
                            <div className="relative">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="block w-full h-14 px-4 rounded-xl border border-gray-200 bg-gray-50/80 text-gray-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all text-base font-medium shadow-sm"
                                >
                                    <option value="user">User</option>
                                    <option value="agent">Delivery Agent</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {formData.role === 'vendor' && (
                            <div className="pt-2 pb-2 space-y-5 border-t border-dashed border-gray-200 mt-4">
                                <div className="flex items-center gap-2 pt-3">
                                    <Store className="w-4 h-4 text-indigo-500" />
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Vendor Details</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">Store Name</label>
                                    <Input type="text" name="storeName" value={formData.storeName} onChange={handleChange} className={inputClasses} placeholder="Your Store Name" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">Location</label>
                                    <Input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClasses} placeholder="Campus Location" required />
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5 mt-2"
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
