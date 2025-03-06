const mongoose = require('mongoose');

const specimenSchema = new mongoose.Schema({
  accessionNumber: {
    type: String,
    required: [true, 'Accession number is required'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  organ: {
    type: String,
    required: [true, 'Organ system is required'],
    trim: true
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  clinicalHistory: {
    type: String,
    required: [true, 'Clinical history is required']
  },
  grossFeatures: {
    type: String,
    required: [true, 'Gross features are required']
  },
  microscopicFeatures: {
    type: String,
    required: [true, 'Microscopic features are required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Neoplastic', 'Non-neoplastic', 'Inflammatory', 'Developmental', 'Other']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    type: {
      type: String,
      enum: ['Gross', 'Microscopic'],
      required: true
    }
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
specimenSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Specimen = mongoose.model('Specimen', specimenSchema);
module.exports = Specimen;
