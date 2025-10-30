const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const answerController = require('../controllers/answerController');
const { auth, adminOnly } = require('../middleware/auth');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// Question routes
router
  .route('/specimen/:specimenId/questions')
  .get(questionController.getQuestionsBySpecimen)
  .post(auth, questionController.createQuestion);

router
  .route('/questions/:id')
  .get(questionController.getQuestion)
  .patch(auth, questionController.updateQuestion)
  .delete(auth, questionController.deleteQuestion);

router
  .route('/questions/:id/toggle-pin')
  .patch(auth, adminOnly, questionController.togglePinQuestion);

router
  .route('/questions/:id/vote')
  .post(auth, questionController.voteQuestion);

// Answer routes
router
  .route('/questions/:questionId/answers')
  .get(answerController.getAnswers)
  .post(auth, answerController.createAnswer);

router
  .route('/answers/:id')
  .patch(auth, answerController.updateAnswer)
  .delete(auth, answerController.deleteAnswer);

router
  .route('/answers/:id/mark-best')
  .patch(auth, answerController.markBestAnswer);

router
  .route('/answers/:id/vote')
  .post(auth, answerController.voteAnswer);

// Get all unanswered questions (admin/teacher only)
router.get('/unanswered', auth, async (req, res) => {
  try {
    if (!['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Find all questions
    const allQuestions = await Question.find({})
      .sort('-createdAt')
      .populate('user', 'username email')
      .populate('specimen', 'title')
      .skip((page - 1) * limit)
      .limit(limit);

    // Filter for unanswered questions (no answers at all)
    const unansweredQuestions = [];
    for (const question of allQuestions) {
      const answerCount = await Answer.countDocuments({ question: question._id });
      if (answerCount === 0) {
        unansweredQuestions.push({
          ...question.toObject(),
          answerCount: 0
        });
      }
    }

    const totalUnanswered = await Question.countDocuments({});

    res.status(200).json({
      status: 'success',
      results: unansweredQuestions.length,
      total: totalUnanswered,
      currentPage: page,
      totalPages: Math.ceil(totalUnanswered / limit),
      data: {
        questions: unansweredQuestions
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get all questions (admin/teacher only)
router.get('/all', auth, async (req, res) => {
  try {
    if (!['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status; // 'answered', 'unanswered', or 'all'

    const questions = await Question.find({})
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'username email')
      .populate('specimen', 'title');

    // Add answer count to each question
    const questionsWithAnswerCount = await Promise.all(
      questions.map(async (question) => {
        const answerCount = await Answer.countDocuments({ question: question._id });
        return {
          ...question.toObject(),
          answerCount
        };
      })
    );

    // Filter based on status
    let filteredQuestions = questionsWithAnswerCount;
    if (status === 'unanswered') {
      filteredQuestions = questionsWithAnswerCount.filter(q => q.answerCount === 0);
    } else if (status === 'answered') {
      filteredQuestions = questionsWithAnswerCount.filter(q => q.answerCount > 0);
    }

    const total = await Question.countDocuments({});

    res.status(200).json({
      status: 'success',
      results: filteredQuestions.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: {
        questions: filteredQuestions
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
