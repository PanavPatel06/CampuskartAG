import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile, createOrder, getVendors, getLocations, getMyWallet } from '../services/api'; 
import AuthContext from '../context/AuthContext'; 
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Printer, UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const PrintOrder = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // Get user
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const [vendors, setVendors] = useState([]);
    const [vendorId, setVendorId] = useState('');

    // New States
    const [locations, setLocations] = useState([]);
    const [deliveryLocation, setDeliveryLocation] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const vendorRes = await getVendors();
                setVendors(vendorRes.data);
                if (vendorRes.data.length > 0) {
                    setVendorId(vendorRes.data[0]._id);
                }

                const locRes = await getLocations();
                setLocations(locRes.data);

                if (user) {
                    const walletRes = await getMyWallet();
                    setWalletBalance(walletRes.data.balance);
                }
            } catch (error) {
                console.error('Failed to fetch initial data', error);
            }
        };
        fetchData();
    }, [user]);

    const [printOptions, setPrintOptions] = useState({
        color: 'bw',
        pages: 1,
        copies: 1,
    });

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const { data } = await uploadFile(formData);
            setFileUrl(data.fileUrl);
            setUploading(false);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Upload failed', error);
            setUploading(false);
            alert('Upload failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fileUrl) {
            alert('Please upload a file first');
            return;
        }
        if (!vendorId) {
            alert('Please select a vendor');
            return;
        }
        if (!deliveryLocation) {
            alert('Please select a delivery location');
            return;
        }

        // Calculate a dummy price
        const pricePerSheet = printOptions.color === 'color' ? 10 : 2;
        const totalPrice = pricePerSheet * printOptions.pages * printOptions.copies;

        if (walletBalance < totalPrice) {
            alert(`Insufficient Wallet Balance (₹${walletBalance}). Total Required: ₹${totalPrice}`);
            return;
        }

        const orderData = {
            orderItems: [{
                name: 'Print Job - ' + file.name,
                price: pricePerSheet,
                qty: printOptions.copies,
                fileUrl,
                printOptions
            }],
            totalPrice,
            vendorId: vendorId,
            deliveryLocation: deliveryLocation // Added
        };

        try {
            await createOrder(orderData);
            setOrderSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            console.error('Order creation failed', error);
            alert('Order failed: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 flex flex-col items-center">
            <div className="mb-12 text-center">
                <div className="w-20 h-20 bg-indigo-50/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Printer className="w-10 h-10 text-indigo-500" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl mb-4">Print Documents</h1>
                <p className="mt-3 text-lg font-medium text-gray-500 max-w-xl mx-auto leading-relaxed">Upload your PDFs and select your preferences. We'll handle the rest with premium quality.</p>
            </div>
            
            <Card className="w-full max-w-2xl rounded-3xl shadow-lg border-gray-100/80 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
                <CardContent className="p-8 sm:p-12">

                {orderSuccess ? (
                    <div className="text-center py-12 flex flex-col items-center">
                        <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6" />
                        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Order Placed!</h2>
                        <p className="text-lg font-medium text-gray-500">Redirecting to your dashboard...</p>
                    </div>
                ) : (
                    <form className="mt-4 space-y-8" onSubmit={handleSubmit}>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {/* Vendor Selection */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Select Vendor</label>
                                <select
                                    required
                                    value={vendorId}
                                    onChange={(e) => setVendorId(e.target.value)}
                                    className="block w-full bg-gray-50/80 border border-gray-200 text-gray-900 h-14 px-4 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-base shadow-sm"
                                >
                                    <option value="" disabled className="text-gray-400">Choose a vendor...</option>
                                    {vendors.map((vendor) => (
                                        <option key={vendor._id} value={vendor._id}>
                                            {vendor.storeName} ({vendor.location})
                                        </option>
                                    ))}
                                </select>
                                {vendors.length === 0 && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> No vendors available.</p>}
                            </div>

                            {/* Location Selection */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Delivery Location</label>
                                <select
                                    required
                                    value={deliveryLocation}
                                    onChange={(e) => setDeliveryLocation(e.target.value)}
                                    className="block w-full bg-gray-50/80 border border-gray-200 text-gray-900 h-14 px-4 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-base shadow-sm"
                                >
                                    <option value="" className="text-gray-400">Choose a location...</option>
                                    {locations.map((loc) => (
                                        <option key={loc._id} value={loc.name}>
                                            {loc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <hr className="border-gray-100/80 border-dashed my-8" />

                        {/* File Upload Section */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Upload Document</label>
                            <div className={`mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed rounded-3xl transition-all duration-300 ${fileUrl ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-indigo-300'}`}>
                                <div className="space-y-4 text-center">
                                    {fileUrl ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                            </div>
                                            <div className="flex text-lg font-bold text-gray-900 justify-center mb-1">
                                                <span>{file.name}</span>
                                            </div>
                                            <p className="text-sm text-emerald-600 font-bold uppercase tracking-widest">Ready to print</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                                                <UploadCloud className="w-8 h-8" />
                                            </div>
                                            <div className="flex text-base font-medium text-gray-600 justify-center mb-2">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-bold text-indigo-600 hover:text-indigo-700 focus-within:outline-none">
                                                    <span>Upload a PDF file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="application/pdf" onChange={handleFileChange} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">PDF up to 5MB</p>
                                            
                                            {file && !fileUrl && (
                                                <div className="mt-8 pt-8 border-t border-gray-200/60 w-full max-w-sm mx-auto">
                                                   <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <FileText className="w-8 h-8 text-indigo-400" />
                                                        <p className="text-sm font-bold text-gray-900 text-left line-clamp-1">{file.name}</p>
                                                   </div>
                                                   <Button
                                                        type="button"
                                                        onClick={handleUpload}
                                                        disabled={uploading}
                                                        className="w-full h-14 bg-indigo-600 text-white font-bold text-base rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all group hover:-translate-y-0.5"
                                                    >
                                                        {uploading ? (
                                                            <span className="flex items-center gap-2">
                                                                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                                                Uploading...
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <UploadCloud className="w-5 h-5 mr-2" />
                                                                Confirm Upload
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100/80 border-dashed my-8" />

                        {/* Print Options */}
                        <div className="bg-gray-50/80 p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest flex items-center gap-2">
                                <Printer className="w-4 h-4" /> Print Configuration
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Color Mode</label>
                                    <select
                                        value={printOptions.color}
                                        onChange={(e) => setPrintOptions({ ...printOptions, color: e.target.value })}
                                        className="block w-full bg-white border border-gray-200 text-gray-900 h-12 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-bold transition-shadow shadow-sm"
                                    >
                                        <option value="bw">Black & White</option>
                                        <option value="color">Color</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Pages</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={printOptions.pages}
                                        onChange={(e) => setPrintOptions({ ...printOptions, pages: parseInt(e.target.value) })}
                                        className="block w-full bg-white border border-gray-200 h-12 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Copies</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={printOptions.copies}
                                        onChange={(e) => setPrintOptions({ ...printOptions, copies: parseInt(e.target.value) })}
                                        className="block w-full bg-white border border-gray-200 h-12 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Wallet Info & Submit */}
                        <div className="pt-6 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 border-t border-gray-100">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Estimated Cost</span>
                                <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{(printOptions.color === 'color' ? 10 : 2) * printOptions.pages * printOptions.copies}</span>
                                <div className={`inline-flex items-center mt-2 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest border ${walletBalance < (printOptions.color === 'color' ? 10 : 2) * printOptions.pages * printOptions.copies ? 'text-red-700 bg-red-50 border-red-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100'}`}>
                                    Wallet: ₹{walletBalance}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={!fileUrl || walletBalance < (printOptions.color === 'color' ? 10 : 2) * printOptions.pages * printOptions.copies}
                                className={`w-full sm:w-auto min-w-[200px] h-14 text-lg font-bold rounded-2xl shadow-md transition-all ${
                                    !fileUrl || walletBalance < (printOptions.color === 'color' ? 10 : 2) * printOptions.pages * printOptions.copies 
                                    ? 'bg-gray-200 text-gray-400 shadow-none' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 focus:ring-4 focus:ring-indigo-100'
                                }`}
                            >
                                Place Print Order
                            </Button>
                        </div>
                    </form>
                )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PrintOrder;
