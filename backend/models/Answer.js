const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question reference is required']
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
  isBestAnswer: {
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
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
answerSchema.index({ question: 1, createdAt: 1 });
answerSchema.index({ user: 1, createdAt: -1 });

// Pre-save hook to update question's lastActivity
answerSchema.pre('save', async function(next) {
  try {
    const Question = mongoose.model('Question');
    await Question.findByIdAndUpdate(this.question, { lastActivity: Date.now() });
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-remove hook to handle answer deletion
answerSchema.pre('remove', async function(next) {
  try {
    const Question = mongoose.model('Question');
    // If this was the best answer, unset it from the question
    await Question.updateOne(
      { _id: this.question, bestAnswer: this._id },
      { $unset: { bestAnswer: 1 } }
    );
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get answers for a question with pagination
answerSchema.statics.findByQuestion = function(questionId, page = 1, limit = 10) {
  return this.find({ question: questionId })
    .sort({ isBestAnswer: -1, createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'username email')
    .lean();
};

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
