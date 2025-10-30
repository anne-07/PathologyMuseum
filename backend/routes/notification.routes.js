const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// All notification routes require authentication
router.use(auth);

router
  .route('/')
  .get(notificationController.getNotifications);

router
  .route('/unread-count')
  .get(notificationController.getUnreadCount);

router
  .route('/mark-all-read')
  .patch(notificationController.markAllAsRead);

router
  .route('/:id/read')
  .patch(notificationController.markAsRead);

router
  .route('/:id')
  .delete(notificationController.deleteNotification);

module.exports = router;

