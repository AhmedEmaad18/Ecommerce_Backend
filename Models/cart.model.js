const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  priceAtAddition: {
    type: Number,
    required: [true, 'Price at time of addition is required']
  },
  priceChanged: { type: Boolean, default: false }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // make optional, since guest carts won't have user
  },
  guestId: {
    type: String,
    required: false // guest carts identified by session ID or similar
  },
  items: [cartItemSchema],
  subTotal: {
    type: Number,
    default: 0
  },
  itemCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

cartSchema.pre('save', function(next) {
  this.subTotal = this.items.reduce((total, item) => {
    return total + (item.priceAtAddition * item.quantity);
  }, 0);
  this.itemCount = this.items.reduce((count, item) => count + item.quantity, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
