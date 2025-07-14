const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  aboutText: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
