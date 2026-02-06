const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getVendorOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/vendor').get(protect, authorize('vendor', 'admin'), getVendorOrders);
router.route('/:id/status').put(protect, updateOrderStatus);

module.exports = router;
