import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../services/api';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Package } from 'lucide-react';

const AddProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addProduct(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product');
        }
    };

    const inputClasses = "h-14 px-4 rounded-xl border-gray-200 bg-gray-50/80 text-base font-medium focus-visible:ring-indigo-200 focus-visible:border-indigo-500 transition-all shadow-sm";

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-indigo-50/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-emerald-50/30 rounded-full blur-3xl pointer-events-none"></div>

            <Card className="w-full max-w-[520px] shadow-xl border-0 rounded-3xl bg-white relative z-10">
                <CardContent className="p-10 sm:p-12">
                    {/* Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Add New Product</h1>
                        <p className="text-base text-gray-500 font-medium">Enter the details of your new item to list it on CampusKart.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 font-medium">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">Product Name</label>
                            <Input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="Awesome Product" required />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">Price (₹)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-gray-400 font-bold text-base">₹</span>
                                </div>
                                <Input type="number" name="price" value={formData.price} onChange={handleChange} className={`${inputClasses} pl-9`} placeholder="0.00" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="flex w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50/80 text-base font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:border-indigo-500 transition-all min-h-[120px] resize-none shadow-sm"
                                placeholder="Tell customers about this product..."
                                rows="4"
                            ></textarea>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all hover:-translate-y-0.5 mt-2"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Product
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddProduct;
