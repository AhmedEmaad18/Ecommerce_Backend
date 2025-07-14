const Cart = require('../Models/cart.model');
const Order = require('../Models/order.model');

exports.getUnorderedCartItems = async (req, res) => {
  try {
    const carts = await Cart.find({ 'items.0': { $exists: true } })
      .populate('items.product', 'name price imageURL stock')
      .populate('user', 'name email');

    console.log('Total carts found:', carts.length);

    const orderedItems = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product' } }
    ]);

    const orderedProductIds = orderedItems.map(item => item._id.toString());
    console.log('Ordered product IDs:', orderedProductIds);

    const unorderedItems = [];

    for (const cart of carts) {
      const unorderedCartItems = cart.items.filter(item =>
        !orderedProductIds.includes(item.product._id.toString())
      );

      if (unorderedCartItems.length > 0) {
        unorderedItems.push({
          cartId: cart._id,
          user: cart.user || { name: 'Guest', email: 'N/A' },
          guestId: cart.guestId,
          items: unorderedCartItems,
          subTotal: cart.subTotal,
          itemCount: cart.itemCount,
        });
      }
    }

    if (unorderedItems.length === 0) {
      console.log('No unordered cart items found. Returning all carts with items for debug.');

      return res.status(200).json({
        status: 'success',
        message: 'No unordered items found; returning all carts with items for debugging',
        data: carts.map(cart => ({
          cartId: cart._id,
          user: cart.user || { name: 'Guest', email: 'N/A' },
          guestId: cart.guestId,
          items: cart.items,
          subTotal: cart.subTotal,
          itemCount: cart.itemCount,
        })),
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Unordered cart items fetched successfully',
      data: unorderedItems,
    });

  } catch (err) {
    console.error('Error fetching unordered cart items:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch unordered cart items',
      error: err.message,
    });
  }
};
