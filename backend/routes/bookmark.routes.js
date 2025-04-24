const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const { auth } = require('../middleware/auth');

// Get all bookmarks for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id });
    res.json({ status: 'success', data: bookmarks });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Add or update a bookmark
router.post('/', auth, async (req, res) => {
  try {
    const { specimenId, type, name, description, imageUrl, notes, folder } = req.body;
    let bookmark = await Bookmark.findOne({ user: req.user._id, specimenId, type });
    if (bookmark) {
      bookmark.notes = notes;
      bookmark.folder = folder;
      bookmark.name = name;
      bookmark.description = description;
      bookmark.imageUrl = imageUrl;
      await bookmark.save();
    } else {
      bookmark = new Bookmark({
        user: req.user._id,
        specimenId,
        type,
        name,
        description,
        imageUrl,
        notes,
        folder
      });
      await bookmark.save();
    }
    res.json({ status: 'success', data: bookmark });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Delete a bookmark
router.delete('/:id', auth, async (req, res) => {
  try {
    await Bookmark.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
