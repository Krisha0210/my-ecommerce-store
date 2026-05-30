const { v4: uuidv4 } = require('uuid');
const dbDriver = require('../config/db');

const VALID_COUPONS = {
  'WELCOME10': 10,  // 10% off
  'VELOCE20': 20,   // 20% off
  'SUPER50': 50     // 50% off
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }
    const discountPercent = VALID_COUPONS[code.toUpperCase()];
    if (discountPercent === undefined) {
      return res.status(400).json({ valid: false, message: 'Invalid or expired coupon code.' });
    }
    res.json({ valid: true, discountPercent });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Server error validating coupon.' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, couponCode, paymentMethod, paymentDetails } = req.body;

    if (!items || !items.length || !shippingAddress) {
      return res.status(400).json({ message: 'Invalid order request. Items and shipping address are required.' });
    }

    // Verify stock and compute price totals on server to protect against client-side tampering
    let total = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await dbDriver.products.getById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}.` });
      }

      total += product.price * item.quantity;
      verifiedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity
      });
    }

    // Verify and apply coupon discount
    let discount = 0;
    let discountPercent = 0;
    if (couponCode) {
      const pct = VALID_COUPONS[couponCode.toUpperCase()];
      if (pct !== undefined) {
        discountPercent = pct;
        discount = parseFloat((total * (pct / 100)).toFixed(2));
        total = total - discount;
      } else {
        return res.status(400).json({ message: 'Invalid or expired coupon code.' });
      }
    }

    let dbPaymentMethod = paymentMethod || 'Card';
    let dbPaymentStatus = 'paid';

    if (paymentMethod === 'cash_on_delivery' || paymentMethod === 'COD' || paymentMethod === 'Cash on Delivery') {
      dbPaymentStatus = 'pending';
      dbPaymentMethod = 'Cash on Delivery';
    } else if (paymentMethod === 'card' || paymentMethod === 'Card') {
      dbPaymentStatus = 'paid';
      dbPaymentMethod = 'Card';
    } else if (paymentMethod === 'online' || paymentMethod === 'UPI') {
      dbPaymentStatus = 'paid';
      dbPaymentMethod = 'UPI';
    }

    const order = {
      id: uuidv4(),
      userId: req.user.id,
      total: parseFloat(total.toFixed(2)),
      discount,
      discountPercent,
      couponCode: couponCode ? couponCode.toUpperCase() : null,
      items: verifiedItems,
      shippingAddress,
      paymentMethod: dbPaymentMethod,
      paymentStatus: dbPaymentStatus,
      createdAt: new Date().toISOString()
    };

    // Save order (this will trigger driver-level stock updates)
    await dbDriver.orders.create(order);

    // Empty user's cart on completion
    await dbDriver.carts.update(req.user.id, []);

    res.status(201).json(order);
  } catch (error) {
    console.error('Order error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error processing order.' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await dbDriver.orders.getByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error('Fetch user orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};
