const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  specimen: {
    type: Schema.Types.ObjectId,
    refPath: 'specimenModel',
    required: [true, 'Specimen reference is required']
  },
  specimenModel: {
    type: String,
    required: true,
    enum: ['Slide', 'Specimen']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  answers: [{
    type: Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for answer count
questionSchema.virtual('answerCount', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question',
  count: true
});

// Indexes for better query performance
questionSchema.index({ specimen: 1, createdAt: -1 });
questionSchema.index({ user: 1, createdAt: -1 });
questionSchema.index({ title: 'text', content: 'text' });

// Pre-save hook to update lastActivity
questionSchema.pre('save', function(next) {
  this.lastActivity = Date.now();
  next();
});

// Static method to get questions by specimen with pagination
questionSchema.statics.findBySpecimen = function(specimenId, page = 1, limit = 10) {
  return this.find({ specimen: specimenId })
    .sort({ isPinned: -1, lastActivity: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'username email')
    .populate('answerCount');
};

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
