const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    deliveryAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            qty: { type: Number, required: true },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
