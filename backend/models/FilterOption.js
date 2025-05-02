const mongoose = require('mongoose');

const filterOptionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['organ', 'system','diseaseCategory'],
  },
  value: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

module.exports = mongoose.model('FilterOption', filterOptionSchema);
