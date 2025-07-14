const mongoose = require('mongoose');
const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      isActive: { type: Boolean, default: true } 

    
});
module.exports= mongoose.model('Subcategory', subcategorySchema);   