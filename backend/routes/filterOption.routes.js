const express = require('express');
const router = express.Router();
const FilterOption = require('../models/FilterOption');
const { auth, adminOnly } = require('../middleware/auth');

// Get all filter options (optionally by type)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.type ? { type: req.query.type } : {};
    const options = await FilterOption.find(filter).sort('value');
    res.json({ status: 'success', data: { options } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Add a new filter option (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { type, value } = req.body;
    const option = new FilterOption({ type, value });
    await option.save();
    res.status(201).json({ status: 'success', data: { option } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Delete a filter option (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const option = await FilterOption.findByIdAndDelete(req.params.id);
    if (!option) {
      return res.status(404).json({ status: 'error', message: 'Option not found' });
    }
    res.json({ status: 'success', message: 'Option deleted' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
