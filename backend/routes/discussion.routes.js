const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const answerController = require('../controllers/answerController');
const { auth, adminOnly } = require('../middleware/auth');

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

module.exports = router;
