const express = require('express');
const router = express.Router();
const { Slide, Specimen } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// Basic route for testing
router.get('/test', (req, res) => {
    res.json({ message: 'Slide route is working' });
});

// Get all slides for a specimen
router.get('/specimen/:specimenId', async (req, res) => {
  try {
    const slides = await Slide.find({ specimenId: req.params.specimenId })
      .populate('createdBy', 'username')
      .populate('specimenId', 'title accessionNumber')
      .sort('-createdAt');
    
    res.json({
      status: 'success',
      results: slides.length,
      data: { slides }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get slide by ID
router.get('/:id', async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('specimenId', 'title accessionNumber');
    
    if (!slide) {
      return res.status(404).json({
        status: 'error',
        message: 'Slide not found'
      });
    }

    res.json({
      status: 'success',
      data: { slide }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create new slide (auth required)
router.post('/', auth, async (req, res) => {
  try {
    // Check if specimen exists
    const specimen = await Specimen.findById(req.body.specimenId);
    if (!specimen) {
      return res.status(404).json({
        status: 'error',
        message: 'Specimen not found'
      });
    }

    const slide = await Slide.create({
      ...req.body,
      createdBy: req.user._id
    });

    await slide.populate('createdBy', 'username');
    await slide.populate('specimenId', 'title accessionNumber');

    res.status(201).json({
      status: 'success',
      data: { slide }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update slide (auth required)
router.patch('/:id', auth, async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    
    if (!slide) {
      return res.status(404).json({
        status: 'error',
        message: 'Slide not found'
      });
    }

    // Check if user is admin or creator
    if (req.user.role !== 'admin' && slide.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this slide'
      });
    }

    const updatedSlide = await Slide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'username')
      .populate('specimenId', 'title accessionNumber');

    res.json({
      status: 'success',
      data: { slide: updatedSlide }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete slide (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const slide = await Slide.findByIdAndDelete(req.params.id);
    
    if (!slide) {
      return res.status(404).json({
        status: 'error',
        message: 'Slide not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Slide deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update slide annotations
router.patch('/:id/annotations', auth, async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    
    if (!slide) {
      return res.status(404).json({
        status: 'error',
        message: 'Slide not found'
      });
    }

    // Check if user is admin or creator
    if (req.user.role !== 'admin' && slide.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update annotations'
      });
    }

    slide.annotations = req.body.annotations;
    await slide.save();

    await slide.populate('createdBy', 'username');
    await slide.populate('specimenId', 'title accessionNumber');

    res.json({
      status: 'success',
      data: { slide }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
