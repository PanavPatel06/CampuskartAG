import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile, createOrder, getVendors } from '../services/api';

const PrintOrder = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const [vendors, setVendors] = useState([]);
    const [vendorId, setVendorId] = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const { data } = await getVendors();
                setVendors(data);
                if (data.length > 0) {
                    setVendorId(data[0]._id);
                }
            } catch (error) {
                console.error('Failed to fetch vendors', error);
            }
        };
        fetchVendors();
    }, []);

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

        // Calculate a dummy price
        const pricePerSheet = printOptions.color === 'color' ? 10 : 2;
        const totalPrice = pricePerSheet * printOptions.pages * printOptions.copies;

        const orderData = {
            orderItems: [{
                name: 'Print Job - ' + file.name,
                price: pricePerSheet,
                qty: printOptions.copies,
                fileUrl,
                printOptions
            }],
            totalPrice,
            vendorId: vendorId
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        New Print Order
                    </h2>
                </div>

                {orderSuccess ? (
                    <div className="text-center text-green-600 font-bold text-xl">
                        Order Placed Successfully! Redirecting...
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

                        {/* Vendor Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Vendor</label>
                            <select
                                required
                                value={vendorId}
                                onChange={(e) => setVendorId(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            >
                                <option value="" disabled>Select a Vendor</option>
                                {vendors.map((vendor) => (
                                    <option key={vendor._id} value={vendor._id}>
                                        {vendor.storeName} ({vendor.location})
                                    </option>
                                ))}
                            </select>
                            {vendors.length === 0 && <p className="text-xs text-red-500 mt-1">No vendors available. Please register a vendor user first.</p>}
                        </div>

                        {/* File Upload Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Upload PDF</label>
                            <div className="mt-1 flex items-center space-x-4">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">Max 5MB. PDF only.</p>
                                <button
                                    type="button"
                                    onClick={handleUpload}
                                    disabled={!file || uploading || fileUrl}
                                    className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${(!file || uploading || fileUrl) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {uploading ? 'Uploading...' : (fileUrl ? 'Uploaded' : 'Upload')}
                                </button>
                            </div>
                            {fileUrl && <p className="text-xs text-green-600 mt-1">File ready: {file.name}</p>}
                        </div>

                        {/* Print Options */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Color</label>
                                <select
                                    value={printOptions.color}
                                    onChange={(e) => setPrintOptions({ ...printOptions, color: e.target.value })}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="bw">Black & White</option>
                                    <option value="color">Color</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pages</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={printOptions.pages}
                                    onChange={(e) => setPrintOptions({ ...printOptions, pages: parseInt(e.target.value) })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Copies</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={printOptions.copies}
                                    onChange={(e) => setPrintOptions({ ...printOptions, copies: parseInt(e.target.value) })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!fileUrl}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!fileUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Place Order
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PrintOrder;
