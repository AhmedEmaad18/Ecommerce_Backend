const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answer: { type: String ,default:true }, 
  createdAt: { type: Date, default: Date.now },
  answeredAt: { type: Date }
});

module.exports = mongoose.model('FAQ', faqSchema);
