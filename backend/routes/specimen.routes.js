const express = require('express');
const router = express.Router();
const { Specimen } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// Basic route for testing
router.get('/test', (req, res) => {
    res.json({ message: 'Specimen route is working' });
});

// Get all specimens with optional filtering
router.get('/', async (req, res) => {
  try {
    // Build filter object from query params
    const filter = {};
    if (req.query.diseaseCategory) filter.diseaseCategory = req.query.diseaseCategory;
    if (req.query.organ) filter.organ = req.query.organ;
    if (req.query.system) filter.system = req.query.system;

    const specimens = await Specimen.find(filter)
      .populate('createdBy', 'username')
      .sort('-createdAt');
    
    res.json({
      status: 'success',
      results: specimens.length,
      data: { specimens }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get specimen by ID
router.get('/:id', async (req, res) => {
  try {
    const specimen = await Specimen.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!specimen) {
      return res.status(404).json({
        status: 'error',
        message: 'Specimen not found'
      });
    }

    res.json({
      status: 'success',
      data: { specimen }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create new specimen (auth required)
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating specimen with body:', req.body);
    const specimen = await Specimen.create({
      ...req.body,
      createdBy: req.user._id
    });
    console.log('Created specimen:', specimen);

    res.status(201).json({
      status: 'success',
      data: { specimen }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update specimen (auth required)
router.patch('/:id', auth, async (req, res) => {
  try {
    const specimen = await Specimen.findById(req.params.id);
    
    if (!specimen) {
      return res.status(404).json({
        status: 'error',
        message: 'Specimen not found'
      });
    }

    // Check if user is admin or creator
    if (req.user.role !== 'admin' && specimen.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this specimen'
      });
    }

    console.log('Updating specimen', req.params.id, 'with body:', req.body);
    const updatedSpecimen = await Specimen.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');
    console.log('Updated specimen:', updatedSpecimen);

    res.json({
      status: 'success',
      data: { specimen: updatedSpecimen }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete specimen (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const specimen = await Specimen.findById(req.params.id);
    
    if (!specimen) {
      return res.status(404).json({
        status: 'error',
        message: 'Specimen not found'
      });
    }

    const specimenId = specimen._id;

    // Delete all questions related to this specimen (cascade delete)
    const Question = require('../models/Question');
    const Answer = require('../models/Answer');
    const Notification = require('../models/Notification');
    
    // Find all questions for this specimen
    const relatedQuestions = await Question.find({ 
      specimen: specimenId,
      specimenModel: 'Specimen'
    });

    // Delete all answers for these questions
    const questionIds = relatedQuestions.map(q => q._id);
    if (questionIds.length > 0) {
      await Answer.deleteMany({ question: { $in: questionIds } });
      // Delete all notifications related to these questions
      await Notification.deleteMany({ question: { $in: questionIds } });
    }

    // Delete all questions
    await Question.deleteMany({ 
      specimen: specimenId,
      specimenModel: 'Specimen'
    });

    // Delete all bookmarks related to this specimen
    const Bookmark = require('../models/Bookmark');
    await Bookmark.deleteMany({ specimenId: specimenId.toString(), type: 'specimen' });

    // Finally, delete the specimen itself
    await Specimen.findByIdAndDelete(specimenId);

    res.json({
      status: 'success',
      message: 'Specimen, related discussions, and bookmarks deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Search specimens
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const specimens = await Specimen.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { diseaseCategory: { $regex: searchQuery, $options: 'i' } },
        { organ: { $regex: searchQuery, $options: 'i' } }
      ]
    }).populate('createdBy', 'username');

    res.json({
      status: 'success',
      results: specimens.length,
      data: { specimens }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
