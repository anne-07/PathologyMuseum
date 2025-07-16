const mongoose = require('mongoose');

const specimenSchema = new mongoose.Schema({
  accessionNumber: {
    type: String,
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
  system: {
    type: String,
    required: [true, 'System is required'],
    trim: true
  },
  diseaseCategory: {
    type: String,
    required: [true, 'Disease Category is required'],
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: false
    },
    caption: String,
    type: {
      type: String,
      required: false
    }
  }],
  audio: [{
    url: {
      type: String,
      required: false
    },
    caption: String
  }],
  models3d: [{
    url: {
      type: String
    },
    caption: String
  }],
  pathogenesisVideos: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
},{
  timestamps:true,
});

// Update the updatedAt timestamp before saving
specimenSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Specimen = mongoose.model('Specimen', specimenSchema);
module.exports = Specimen;
