const mongoose = require('mongoose');
const Order = require('../Models/order.model'); // Adjust the path as necessary
const Product = require('../Models/product.model'); // Adjust the path as necessary
const logger = require('../utils/logger.util'); // Adjust the path as necessary
const Cart = require('../Models/cart.model'); // Adjust path as needed

exports.createOrder = async (req, res) => {
    try {
        const {  items, shippingAddress } = req.body;
              const user = req.user._id; // get from authenticated user

        // Validate the incoming data
        if (!user || !items || items.length === 0 || !shippingAddress) {
            return res.status(400).json({
                message: 'User , items, and shipping address are required.'
            });
        }

        // Calculate total amount and validate product availability
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    message: `Product with ID ${item.product} not found.`
                });
            }
            totalAmount += product.price * item.quantity; // Assuming price is stored in the product model
            item.price = product.price; // Store the price in the order item
        }

        // Create the order
        const newOrder = new Order({
            user,
            items,
            shippingAddress,
            totalAmount
        });

        // Save the order to the database
        await newOrder.save();
// Remove cart after order

        logger.info(`Order created with ID ${newOrder._id}`);
        return res.status(201).json({
            message: 'Order created successfully!',
            // order: newOrder
        });
    } catch (err) {
        logger.error(`Error creating order: ${err.message}`);
        return res.status(500).json({
            message: 'Failed to create order',
            error: err.message
        });
    }
};
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    // Check if order can be canceled
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ message: 'Order cannot be canceled after shipment.' });
    }
    order.status = 'cancelled';
    order.cancelledDate = new Date();
    await order.save();
    logger.info(`Order with ID ${orderId} has been canceled.`);
    return res.status(200).json({ message: 'Order canceled successfully.', order });
  } catch (err) {
    logger.error(`Error canceling order: ${err.message}`);
    return res.status(500).json({ message: 'Failed to cancel order', error: err.message });
  }
};


exports.editOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID.' });
    }

    const { items: updatedItems, shippingAddress } = req.body;

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ message: 'Order cannot be edited after shipment.' });
    }

    let totalAmount = 0;

    if (updatedItems) {
      for (const updatedItem of updatedItems) {
        const existingItemIndex = order.items.findIndex(item =>
          item._id.equals(updatedItem._id) ||
          item.product._id.equals(updatedItem.product)
        );

        if (existingItemIndex >= 0) {
          const product = await Product.findById(updatedItem.product || order.items[existingItemIndex].product);
          if (!product) {
            return res.status(404).json({ message: `Product with ID ${updatedItem.product} not found.` });
          }

          // Update existing Mongoose subdocument fields
          const existingItem = order.items[existingItemIndex];
          existingItem.product = updatedItem.product || existingItem.product;
          existingItem.price = product.price;
          existingItem.quantity = updatedItem.quantity || existingItem.quantity;
        }
      }

      // Recalculate totalAmount
      for (const item of order.items) {
        totalAmount += item.price * item.quantity;
      }
      order.totalAmount = totalAmount;
    }

    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
    }

    await order.save();

    return res.status(200).json({
      message: 'Order updated successfully.',
      order
    });

  } catch (err) {
    console.error(`Error editing order: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to edit order',
      error: err.message
    });
  }
};


exports.getUserOrders = async (req, res) => {
  try {
    console.log('User from req:', req.user); // Add this

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID missing' });
    }

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name price imageURL')
      .sort({ orderDate: -1 });

    res.status(200).json({
      message: 'Orders fetched successfully',
      orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID.' });
    }

    const order = await Order.findOne({ _id: orderId, user: userId }).populate('items.product', 'name price imageURL');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch order.', error: err.message });
  }
};
exports.getAllOrders = async (req, res) => {
  try {
   const statusFilter = req.query.status; // e.g. ?status=shipped
let query = {};
if (statusFilter) {
  query.status = statusFilter;
}

const orders = await Order.find(query)
  .populate('user', 'name email')
  .populate('items.product', 'name price imageURL')
  .sort({ orderDate: -1 });

    return res.status(200).json({ message: 'All orders fetched', orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};
exports.editOrderbyadmin = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID.' });
    }

    // Destructure fields from request body
    const { items: updatedItems, shippingAddress, status } = req.body;

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Prevent edits after shipment or delivery (optional, adjust as needed)
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ message: 'Order cannot be edited after shipment.' });
    }

    // --- Update Items & Shipping Address (your existing logic) ---
    let totalAmount = 0;

    if (updatedItems) {
      for (const updatedItem of updatedItems) {
        const existingItemIndex = order.items.findIndex(item =>
          item._id.equals(updatedItem._id) ||
          item.product._id.equals(updatedItem.product)
        );

        if (existingItemIndex >= 0) {
          const product = await Product.findById(updatedItem.product || order.items[existingItemIndex].product);
          if (!product) {
            return res.status(404).json({ message: `Product with ID ${updatedItem.product} not found.` });
          }

          const existingItem = order.items[existingItemIndex];
          existingItem.product = updatedItem.product || existingItem.product;
          existingItem.price = product.price;
          existingItem.quantity = updatedItem.quantity || existingItem.quantity;
        }
      }

      for (const item of order.items) {
        totalAmount += item.price * item.quantity;
      }
      order.totalAmount = totalAmount;
    }

    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
    }

    // --- NEW: Update status ---
    if (status) {
      // Validate status against enum
      const validStatuses = ['placed', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid order status.' });
      }

      order.status = status;

      // Optionally update deliveredDate or cancelledDate based on status
      if (status === 'delivered') {
        order.deliveredDate = new Date();
      } else if (status === 'cancelled') {
        order.cancelledDate = new Date();
      } else {
        order.deliveredDate = null;
        order.cancelledDate = null;
      }
    }

    await order.save();

    return res.status(200).json({
      message: 'Order updated successfully.',
      order
    });

  } catch (err) {
    console.error(`Error editing order: ${err.message}`);
    return res.status(500).json({
      message: 'Failed to edit order',
      error: err.message
    });
  }
};
