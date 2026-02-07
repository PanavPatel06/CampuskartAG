const Order = require('../models/Order');
const Vendor = require('../models/Vendor');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const {
        orderItems,
        vendorId,
        totalPrice,
    } = req.body;

    console.log('[addOrderItems] Request Body:', JSON.stringify(req.body, null, 2));

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        try {
            const order = new Order({
                customer: req.user._id,
                vendor: vendorId,
                items: orderItems,
                totalAmount: totalPrice,
                status: 'pending'
            });

            console.log('[addOrderItems] Attempting to save order:', order);
            const createdOrder = await order.save();
            console.log('[addOrderItems] Order saved successfully:', createdOrder._id);

            res.status(201).json(createdOrder);
        } catch (error) {
            console.error('[addOrderItems] Error saving order:', error);
            res.status(500).json({ message: 'Failed to create order: ' + error.message });
        }
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Get vendor orders
// @route   GET /api/orders/vendor
// @access  Private (Vendor/Admin)
const getVendorOrders = async (req, res) => {
    try {
        console.log(`[getVendorOrders] Fetching orders for User ID: ${req.user._id}`);

        // Find the Vendor document associated with the logged-in user
        const vendor = await Vendor.findOne({ user: req.user._id });

        if (!vendor) {
            console.log(`[getVendorOrders] No Vendor profile found for User ID: ${req.user._id}`);
            return res.status(404).json({ message: 'Vendor profile not found. Please register a new Vendor account.' });
        }

        console.log(`[getVendorOrders] Found Vendor Profile ID: ${vendor._id}`);

        const orders = await Order.find({ vendor: vendor._id })
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });

        console.log(`[getVendorOrders] Found ${orders.length} orders for Vendor ID: ${vendor._id}`);

        res.json(orders);
    } catch (error) {
        console.error('[getVendorOrders] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        // Authorization Check
        // If User/Agent:
        if (req.user.role === 'user' || req.user.role === 'agent') {
            // Case 1: Customer Cancelling Pending Order
            if (order.customer.toString() === req.user._id.toString()) {
                if (status !== 'cancelled' && order.status === 'pending') {
                    res.status(400);
                    throw new Error('Customers can only cancel pending orders');
                }
            }
            // Case 2: Delivery Agent Accepting Order
            else if (status === 'out_for_delivery') {
                // Agent is claiming the order
                order.deliveryAgent = req.user._id;
            }
            // Case 3: Delivery Agent Completing Order
            else if (status === 'delivered') {
                if (order.deliveryAgent && order.deliveryAgent.toString() !== req.user._id.toString()) {
                    res.status(401);
                    throw new Error('Not authorized to complete this delivery');
                }
            }
            else {
                res.status(401);
                throw new Error('Not authorized to update this order');
            }
        }
        // If Vendor: Can update to any status if they own the order
        else if (req.user.role === 'vendor') {
            const vendor = await Vendor.findOne({ user: req.user._id });
            if (!vendor || order.vendor.toString() !== vendor._id.toString()) {
                res.status(401);
                throw new Error('Not authorized to update this order');
            }
        }

        order.status = status;
        const updatedOrder = await order.save();

        // Socket.IO: Notify agents if order is marked ready/out_for_delivery
        if (status === 'out_for_delivery' || status === 'accepted') {
            try {
                const { getIO } = require('../socket');
                const io = getIO();

                // Populate vendor details for the notification
                const populatedOrder = await Order.findById(updatedOrder._id).populate('vendor', 'storeName location');

                if (!populatedOrder || !populatedOrder.vendor) {
                    console.error(`[Socket] Error: Vendor data missing for Order ${updatedOrder._id}`);
                } else {
                    // Emit to agents in the same location as the vendor
                    const locationRaw = populatedOrder.vendor.location || "";
                    const normalizedLocation = locationRaw.trim().toLowerCase().replace(/\s+/g, '_');
                    const targetRoom = `delivery_${normalizedLocation}`;

                    console.log(`[Socket] Vendor Location: '${locationRaw}' -> Room: '${targetRoom}'`);

                    // Emit ONLY to specific location room (Strict Mode)
                    io.to(targetRoom).emit('new_delivery_request', populatedOrder);

                    console.log(`[Socket] SUCCESS: Emitted event to ${targetRoom}`);
                }
            } catch (err) {
                console.error('[Socket] CRITICAL FAILURE:', err);
            }
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Get available orders for delivery agent
// @route   GET /api/orders/delivery/available
// @access  Private (Agent)
const getAvailableDeliveryOrders = async (req, res) => {
    try {
        const { location } = req.query;

        console.log(`[getAvailableDeliveryOrders] Agent ${req.user._id} requesting orders for location: '${location}'`);

        if (!location) {
            return res.status(400).json({ message: 'Location query parameter is required' });
        }

        // 1. Find Vendors in the requested location
        const Vendor = require('../models/Vendor');
        // Normalized location search (case-insensitive) - improved robustness
        // But for now, let's trust strict matching first as per our earlier fix
        const vendors = await Vendor.find({ location: location });

        if (vendors.length === 0) {
            console.log(`[getAvailableDeliveryOrders] No vendors found in location: ${location}`);
            return res.json([]);
        }

        const vendorIds = vendors.map(v => v._id);

        // 2. Find Orders from those vendors with status 'accepted' or 'out_for_delivery' (and no agent assigned yet)
        // Actually, 'out_for_delivery' implies agent assigned.
        // We want orders that represent a REQUEST.
        // If status is 'accepted' -> It means Vendor said YES, waiting for driver.
        // If status is 'out_for_delivery' AND deliveryAgent is NULL (edge case) or not this user?
        // Standard flow: Vendor 'Accepts' -> Emits Request. Agent 'Accepts' -> Status 'out_for_delivery'.
        // So we want orders with status 'accepted'.

        const orders = await Order.find({
            vendor: { $in: vendorIds },
            status: 'accepted', // Only show orders waiting for pickup
            deliveryAgent: { $exists: false } // ensure no one else took it (optional, depending on schema default)
        }).populate('vendor', 'storeName location')
            .sort({ createdAt: -1 });

        console.log(`[getAvailableDeliveryOrders] Found ${orders.length} active orders.`);
        res.json(orders);

    } catch (error) {
        console.error('[getAvailableDeliveryOrders] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addOrderItems,
    getMyOrders,
    getVendorOrders,
    updateOrderStatus,
    getAvailableDeliveryOrders
};
