const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
  specimenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specimen',
    required: true
  },
  slideNumber: {
    type: String,
    required: [true, 'Slide number is required'],
    trim: true
  },
  stain: {
    type: String,
    required: [true, 'Stain type is required'],
    enum: ['H&E', 'PAS', 'Giemsa', 'AFB', 'Special Stains', 'IHC', 'Other']
  },
  magnification: {
    type: String,
    required: [true, 'Magnification is required'],
    enum: ['4x', '10x', '20x', '40x', '100x']
  },
  imageUrl: {
    type: String,
    required: [true, 'Slide image URL is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  findings: {
    type: String,
    required: [true, 'Microscopic findings are required']
  },
  annotations: [{
    type: {
      type: String,
      enum: ['Arrow', 'Circle', 'Rectangle', 'Text'],
      required: true
    },
    coordinates: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    text: String,
    color: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
slideSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Slide = mongoose.model('Slide', slideSchema);
module.exports = Slide;
