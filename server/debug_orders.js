const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Vendor = require('./src/models/Vendor');
const User = require('./src/models/User');
require('dotenv').config();

const check = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(5).populate('vendor');

    console.log("--- Recent Orders ---");
    for (const o of orders) {
        console.log(`Order ID: ${o._id}`);
        console.log(`  Created At: ${o.createdAt}`);
        console.log(`  Vendor Ref: ${o.vendor?._id}`);
        if (o.vendor) {
            console.log(`  Vendor Name: ${o.vendor.storeName}`);
            console.log(`  Vendor User ID: ${o.vendor.user}`);
        } else {
            console.log(`  Vendor Field (Raw):`, o.vendor); // Might be an ID that failed to populate
        }
        console.log('----------------');
    }
    process.exit(0);
};
check();
