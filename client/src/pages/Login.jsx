import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative blurs */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-50/40 rounded-full blur-3xl pointer-events-none"></div>

            <Card className="w-full max-w-[460px] shadow-xl border-0 rounded-3xl bg-white relative z-10">
                <CardContent className="p-10 sm:p-12">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-white font-black text-xl tracking-tighter">CK</span>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Welcome back</h1>
                        <p className="text-base text-gray-500 font-medium">Sign in to your CampusKart account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 font-medium">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">Email address</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 px-4 rounded-xl border-gray-200 bg-gray-50/80 text-base font-medium focus-visible:ring-indigo-200 focus-visible:border-indigo-500 transition-all shadow-sm"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 px-4 rounded-xl border-gray-200 bg-gray-50/80 text-base font-medium focus-visible:ring-indigo-200 focus-visible:border-indigo-500 transition-all shadow-sm"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5 mt-2"
                        >
                            <LogIn className="w-5 h-5 mr-2" />
                            Sign in
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                                Create one
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
