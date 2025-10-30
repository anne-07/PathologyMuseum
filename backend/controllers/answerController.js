const Answer = require('../models/Answer');
const Question = require('../models/Question');
const { createNotification } = require('./notificationController');
const { sendQuestionAnsweredEmail } = require('../utils/emailService');

// @desc    Get answers for a question
// @route   GET /api/v1/discussions/questions/:questionId/answers
// @access  Public
exports.getAnswers = async (req, res) => {
  try {
    const { questionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'No question found with that ID'
      });
    }

    const answers = await Answer.find({ question: questionId })
      .sort({ isBestAnswer: -1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'username email');

    const total = await Answer.countDocuments({ question: questionId });

    res.status(200).json({
      status: 'success',
      results: answers.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: {
        answers
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create a new answer (Admin only)
// @route   POST /api/v1/discussions/questions/:questionId/answers
// @access  Private/Admin
exports.createAnswer = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;
    const { questionId } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Only administrators can post replies'
      });
    }

    // Check if question exists and is not closed
    const question = await Question.findOne({
      _id: questionId,
      isClosed: { $ne: true }
    });

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found or is closed for answers'
      });
    }

    const answer = await Answer.create({
      content,
      question: questionId,
      user: req.user.id,
      isAnonymous: isAnonymous || false
    });

    // Populate user data for the response
    await answer.populate('user', 'username email');

    // Add answer to question's answers array
    question.answers.push(answer._id);
    await question.save();

    // Populate question to get the user who asked it and specimen info
    await question.populate('user', '_id username email');
    await question.populate('specimen', 'title _id');
    
    // Create notification AND send email for the question asker (if not answering own question)
    if (question.user._id.toString() !== req.user.id) {
      // Create in-app notification
      await createNotification({
        recipient: question.user._id,
        sender: req.user.id,
        type: 'answer_posted',
        question: questionId,
        specimen: question.specimen._id,
        answer: answer._id,
        message: `Your question "${question.title}" has been answered`
      });

      // Send email notification (non-blocking - won't fail if email fails)
      if (question.user.email) {
        const answeredBy = req.user.username || req.user.email || 'An instructor';
        sendQuestionAnsweredEmail(question.user.email, {
          questionTitle: question.title,
          answerContent: content,
          answeredBy: answeredBy,
          specimenTitle: question.specimen.title,
          specimenId: question.specimen._id
        }).catch(err => {
          console.error(`Failed to send answer email to ${question.user.email}:`, err.message);
        });
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        answer
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update an answer
// @route   PATCH /api/v1/discussions/answers/:id
// @access  Private
exports.updateAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'No answer found with that ID'
      });
    }

    // Check if user is the owner or an admin/teacher
    if (answer.user.toString() !== req.user.id && 
        !['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this answer'
      });
    }

    answer.content = content || answer.content;
    answer.editedAt = Date.now();
    const updatedAnswer = await answer.save();

    res.status(200).json({
      status: 'success',
      data: {
        answer: updatedAnswer
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete an answer
// @route   DELETE /api/v1/discussions/answers/:id
// @access  Private
exports.deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'No answer found with that ID'
      });
    }

    // Check if user is the owner or an admin/teacher
    if (answer.user.toString() !== req.user.id && 
        !['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this answer'
      });
    }

    // If this was marked as the best answer, unset it from the question
    if (answer.isBestAnswer) {
      await Question.findByIdAndUpdate(
        answer.question,
        { $unset: { bestAnswer: 1 } }
      );
    }

    await answer.remove();

    // Remove answer from question's answers array
    await Question.findByIdAndUpdate(
      answer.question,
      { $pull: { answers: answer._id } }
    );

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Mark an answer as best answer (question owner or admin/teacher only)
// @route   PATCH /api/v1/discussions/answers/:id/mark-best
// @access  Private
exports.markBestAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('question', 'user');

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'No answer found with that ID'
      });
    }

    // Check if user is the question owner or an admin/teacher
    const isQuestionOwner = answer.question.user.toString() === req.user.id;
    const isAdminOrTeacher = ['admin', 'teacher'].includes(req.user.role);
    
    if (!isQuestionOwner && !isAdminOrTeacher) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to mark this as best answer'
      });
    }

    // If this answer is already the best answer, unmark it
    if (answer.isBestAnswer) {
      answer.isBestAnswer = false;
      await answer.save();
      
      await Question.findByIdAndUpdate(
        answer.question._id,
        { $unset: { bestAnswer: 1 } }
      );

      return res.status(200).json({
        status: 'success',
        message: 'Answer unmarked as best answer',
        data: { answer }
      });
    }

    // First, unmark any existing best answer for this question
    await Answer.updateMany(
      { 
        question: answer.question._id,
        isBestAnswer: true 
      },
      { $set: { isBestAnswer: false } }
    );

    // Mark this answer as the best answer
    answer.isBestAnswer = true;
    await answer.save();

    // Update the question with the best answer reference
    await Question.findByIdAndUpdate(
      answer.question._id,
      { bestAnswer: answer._id }
    );

    res.status(200).json({
      status: 'success',
      message: 'Answer marked as best answer',
      data: { answer }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Vote on an answer
// @route   POST /api/v1/discussions/answers/:id/vote
// @access  Private
exports.voteAnswer = async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        status: 'error',
        message: 'No answer found with that ID'
      });
    }

    const userId = req.user._id;
    const upvoted = answer.upvotes.includes(userId);
    const downvoted = answer.downvotes.includes(userId);

    // Remove existing votes
    answer.upvotes = answer.upvotes.filter(id => !id.equals(userId));
    answer.downvotes = answer.downvotes.filter(id => !id.equals(userId));

    // Apply new vote if different from current
    if (vote === 'up' && !upvoted) {
      answer.upvotes.push(userId);
    } else if (vote === 'down' && !downvoted) {
      answer.downvotes.push(userId);
    }

    await answer.save();

    res.status(200).json({
      status: 'success',
      data: {
        upvotes: answer.upvotes.length,
        downvotes: answer.downvotes.length,
        userVote: vote === 'up' ? 'up' : vote === 'down' ? 'down' : null
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
