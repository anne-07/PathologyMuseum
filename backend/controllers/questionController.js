const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Slide = require('../models/Slide');
const Specimen = require('../models/Specimen');

// @desc    Get all questions for a specimen
// @route   GET /api/v1/discussions/specimen/:specimenId/questions
// @access  Public
exports.getQuestionsBySpecimen = async (req, res) => {
  try {
    const { specimenId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!specimenId || !specimenId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ status: 'error', message: 'Invalid specimen ID' });
    }

    // Check if specimen exists (Specimen only)
    const specimenDoc = await Specimen.findById(specimenId);
    if (!specimenDoc) {
      return res.status(404).json({
        status: 'error',
        message: 'No specimen found with that ID'
      });
    }

    const questions = await Question.findBySpecimen(specimenId, page, limit);
    const total = await Question.countDocuments({ specimen: specimenId });

    res.status(200).json({
      status: 'success',
      results: questions.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: {
        questions
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get a single question with answers
// @route   GET /api/v1/discussions/questions/:id
// @access  Public
exports.getQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    if (!questionId || !questionId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ status: 'error', message: 'Invalid question ID' });
    }

    const question = await Question.findById(questionId)
      .populate('user', 'name email avatar')
      .populate('specimen', 'title');

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'No question found with that ID'
      });
    }

    // Load answers explicitly (since Question schema does not store answers array)
    const answers = await Answer.find({ question: questionId })
      .sort({ isBestAnswer: -1, createdAt: 1 })
      .populate('user', 'name email avatar');

    const questionJson = question.toObject({ virtuals: true });
    questionJson.answers = answers;

    res.status(200).json({
      status: 'success',
      data: {
        question: questionJson
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create a new question
// @route   POST /api/v1/discussions/questions
// @access  Private
exports.createQuestion = async (req, res) => {
  try {
    const { title, content, specimenId, isAnonymous, tags } = req.body;

    if (!specimenId || !specimenId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ status: 'error', message: 'Invalid specimen ID' });
    }

    // Check if specimen exists (Specimen only)
    const specimen = await Specimen.findById(specimenId);
    if (!specimen) {
      return res.status(404).json({
        status: 'error',
        message: 'No specimen found with that ID'
      });
    }

    const question = await Question.create({
      title,
      content,
      specimen: specimenId,
      specimenModel: 'Specimen',
      user: req.user.id,
      isAnonymous: isAnonymous || false,
      tags: tags || []
    });

    res.status(201).json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update a question
// @route   PATCH /api/v1/discussions/questions/:id
// @access  Private
exports.updateQuestion = async (req, res) => {
  try {
    const { title, content, tags, isClosed } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'No question found with that ID'
      });
    }

    // Check if user is the owner or an admin/teacher
    if (question.user.toString() !== req.user.id && 
        !['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this question'
      });
    }

    question.title = title || question.title;
    question.content = content || question.content;
    question.tags = tags || question.tags;
    
    if (typeof isClosed === 'boolean') {
      // Only admin/teacher can close or reopen; and to close, require at least one admin/teacher answer
      if (!['admin', 'teacher'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Only admins/teachers can change close status'
        });
      }

      if (isClosed === true) {
        // Ensure at least one answer exists from an admin/teacher before closing
        const answers = await Answer.find({ question: question._id }).populate('user', 'role');
        const hasAdminAnswer = answers.some(a => a.user && ['admin', 'teacher'].includes(a.user.role));
        if (!hasAdminAnswer) {
          return res.status(400).json({
            status: 'error',
            message: 'Question can be closed only after an admin/teacher replies'
          });
        }
      }

      question.isClosed = isClosed;
    }
    
    question.editedAt = Date.now();
    await question.save();

    res.status(200).json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete a question
// @route   DELETE /api/v1/discussions/questions/:id
// @access  Private
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'No question found with that ID'
      });
    }

    // Check if user is the owner or an admin/teacher
    if (question.user.toString() !== req.user.id && 
        !['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this question'
      });
    }

    // Delete all answers associated with this question
    await Answer.deleteMany({ question: question._id });
    
    // Remove question from the database
    await question.remove();

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

// @desc    Toggle pin status of a question (admin/teacher only)
// @route   PATCH /api/v1/discussions/questions/:id/toggle-pin
// @access  Private (admin/teacher)
exports.togglePinQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'No question found with that ID'
      });
    }

    // Check if user is an admin or teacher
    if (!['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to pin/unpin questions'
      });
    }

    question.isPinned = !question.isPinned;
    await question.save();

    res.status(200).json({
      status: 'success',
      data: {
        question
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Vote on a question
// @route   POST /api/v1/discussions/questions/:id/vote
// @access  Private
exports.voteQuestion = async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'No question found with that ID'
      });
    }

    const userId = req.user._id;
    const upvoted = question.upvotes.includes(userId);
    const downvoted = question.downvotes.includes(userId);

    // Remove existing votes
    question.upvotes = question.upvotes.filter(id => !id.equals(userId));
    question.downvotes = question.downvotes.filter(id => !id.equals(userId));

    // Apply new vote if different from current
    if (vote === 'up' && !upvoted) {
      question.upvotes.push(userId);
    } else if (vote === 'down' && !downvoted) {
      question.downvotes.push(userId);
    }

    await question.save();

    res.status(200).json({
      status: 'success',
      data: {
        upvotes: question.upvotes.length,
        downvotes: question.downvotes.length,
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
