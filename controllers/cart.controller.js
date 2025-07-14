const Cart = require('../Models/cart.model');
const Product = require('../Models/product.model');
const AppError = require('../utils/app-error.util');

// exports.addToCart = async (req, res, next) => {
//   try {
//     const { productId, quantity = 1 } = req.body;
//     const userId = req.user?.id || req.sessionID;
// console.log(userId);
//     if (!productId) {
//       return next(new AppError('Product ID is required', 400));
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//       return next(new AppError('Product not found', 404));
//     }

//     if (product.stock < quantity) {
//       return next(new AppError(`Only ${product.stock} items available`, 400));
//     }

//     let cart = await Cart.findOne({ user: userId });
//     if (!cart) {
//       cart = new Cart({ user: userId, items: [] });
//     }

//     const existingItemIndex = cart.items.findIndex(
//       item => item.product.toString() === productId 
//     );

//     if (existingItemIndex >= 0) {
//       const newQuantity = cart.items[existingItemIndex].quantity + quantity;
//       if (product.stock < newQuantity) {
//         return next(new AppError(`Cannot add more than available stock (${product.stock})`, 400));
//       }
//       cart.items[existingItemIndex].quantity = newQuantity;
//     } else {
//       cart.items.push({
//         product: productId,
//         quantity,
//         priceAtAddition: product.price,
//       });
//     }

//     console.log('Add to cart request body:', req.body);
//     console.log('User ID:', userId);

//     await cart.save();

//     await cart.populate({
//       path: 'items.product',
//       select: 'name price images stock'
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         cart,
//         message: 'Item added to cart successfully'
//       }
//     });

//   } catch (error) {
//     console.error('Add to cart error:', error);
//     if (!(error instanceof AppError)) {
//       return next(new AppError('Failed to add item to cart', 500));
//     }
//     next(error);
//   }
// };
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return next(new AppError('Product ID required', 400));

    const product = await Product.findById(productId);
    if (!product) return next(new AppError('Product not found', 404));

    const userId = req.user?.id;
    const guestId = !userId ? req.sessionID : undefined;
    console.log(guestId)

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
      if (!cart) cart = new Cart({ user: userId, items: [] });
    } else {
      cart = await Cart.findOne({ guestId });
      if (!cart) cart = new Cart({ guestId, items: [] });
    }

    const item = cart.items.find(i => i.product.equals(productId));
    if (item) item.quantity += quantity;
    else cart.items.push({ product: productId, quantity, priceAtAddition: product.price });

// Save and return
    await cart.save();
    await cart.populate({ path: 'items.product', select: 'name price' });
    res.json({ status:'success', cart });
  } 
  catch(err) {
    console.error(err);
    next(new AppError(err.message, 500));
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { quantity } = req.body;
    const { itemId } = req.params;

    console.log('Updating item:', itemId, 'Quantity:', quantity, 'User:', userId);

    const cart = await Cart.findOne(userId ? { user: userId } : { guestId: req.sessionID });
    if (!cart) {
      console.log('Cart not found for user or session');
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      console.log('Item not found in cart:', itemId);
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    console.log('Quantity updated successfully');

    res.status(200).json({ message: 'Quantity updated' });
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    // Remove the item from cart
    const cart = await Cart.findOneAndUpdate(
      { 'items._id': itemId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    if (!cart) {
      return next(new AppError('Cart item not found', 404));
    }

    // Recalculate subtotal and itemCount
    cart.subTotal = cart.items.reduce((total, item) => total + item.priceAtAddition * item.quantity, 0);
    cart.itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

    // Save updated cart with new totals
    await cart.save();

    // Populate items.product with needed fields including nested category and brand
    await cart.populate({
      path: 'items.product',
      select: 'name price stock imageURL category brand desc',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'brand', select: 'name' }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(new AppError('Failed to remove item from cart', 500));
  }
};


exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const guestId = req.sessionID;

    let cart;

    if (userId) {
      cart = await Cart.findOne({ user: userId })
        .populate({
          path: 'items.product',
          select: 'name price stock imageURL category desc brand',
          populate: [
            { path: 'category', select: 'name' },
            { path: 'brand', select: 'name' }
          ]
        });
      if (!cart) {
        // Return empty cart for user
        cart = {
          items: [],
          subTotal: 0,
          itemCount: 0,
        };
      }
      return res.status(200).json({
        status: 'success',
        data: { cart,
              guestId: req.sessionID // always send it to fronten
         }
      });
    }

    // Guest user case
    cart = await Cart.findOne({ guestId })
      .populate({
        path: 'items.product',
        select: 'name price stock imageURL category desc',
      });

    if (!cart) {
      return res.status(200).json({
        status: 'success',
        data: {
          cart: {
            items: [],
            subTotal: 0,
            itemCount: 0,
          },
          guestId, // expose guestId so frontend can send it later for merging
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        cart,
        guestId // expose guestId for frontend use
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    next(new AppError('Failed to retrieve cart', 500));
  }
};

// Example: Update product price
// PUT /cart/:itemId/price
exports.updateCartItemPrice = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { priceAtAddition } = req.body;

    if (priceAtAddition == null) {
      return res.status(400).json({ message: 'priceAtAddition is required' });
    }

    const cart = await Cart.findOne(userId ? { user: userId } : { guestId: req.sessionID });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.priceAtAddition = priceAtAddition;
    item.priceChanged = false; // reset the flag

    await cart.save();

    res.status(200).json({ message: 'Price updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const guestId = req.sessionID;

    const query = userId ? { user: userId } : { guestId };

    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.subTotal = 0;
    cart.itemCount = 0;

    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared successfully',
      data: { cart },
    });
  } catch (err) {
    console.error('Error clearing cart:', err);
    next(new AppError('Failed to clear cart', 500));
  }
};

exports.mergeGuestCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const guestId = req.body.guestId;

    if (!guestId) {
      return next(new AppError('guestId is required to merge cart', 400));
    }

    const guestCart = await Cart.findOne({ guestId });
    if (!guestCart || guestCart.items.length === 0) {
      const userCart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'name price stock'
      });
      return res.status(200).json({ status: 'success', cart: userCart });
    }

    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) userCart = new Cart({ user: userId, items: [] });

    guestCart.items.forEach(guestItem => {
      const existingItem = userCart.items.find(
        userItem => userItem.product.equals(guestItem.product)
      );

      if (existingItem) {
        // ✅ Product exists in user cart — just update quantity
        existingItem.quantity += guestItem.quantity;
      } else {
        // ✅ Product doesn't exist — add as a new item
        userCart.items.push({
          product: guestItem.product,
          quantity: guestItem.quantity,
          priceAtAddition: guestItem.priceAtAddition,
          priceChanged: guestItem.priceChanged || false
        });
      }
    });

    await userCart.save();
    await Cart.deleteOne({ guestId }); // remove guest cart after merging

    await userCart.populate({
      path: 'items.product',
      select: 'name price stock'
    });

    console.log(`✅ Merged guest cart (${guestId}) into user cart (${userId})`);

    res.status(200).json({
      status: 'success',
      cart: userCart
    });
  } catch (err) {
    console.error('❌ Error merging guest cart:', err);
    next(new AppError('Failed to merge guest cart', 500));
  }
};

