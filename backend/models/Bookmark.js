const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specimenId: {
    type: mongoose.Schema.Types.Mixed, // Could be string or number
    required: true
  },
  type: {
    type: String,
    enum: ['specimen', 'slide'],
    required: true
  },
  name: String,
  description: String,
  imageUrl: String,
  notes: String,
  folder: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);
