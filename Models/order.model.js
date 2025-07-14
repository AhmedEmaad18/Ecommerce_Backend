const mongoose=require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  shippingAddress: {
    type: String,required:true
  },
  status: { 
    type: String, 
    enum: ['placed', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'placed'
  },
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  deliveredDate: { type: Date ,default:null},
  cancelledDate: { type: Date ,default:null}
});
module.exports=mongoose.model('Order',orderSchema)