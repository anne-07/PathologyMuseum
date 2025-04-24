const mongoose = require('mongoose');

const filterOptionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['category', 'organ', 'system', 'diagnosis'],
  },
  value: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

module.exports = mongoose.model('FilterOption', filterOptionSchema);
