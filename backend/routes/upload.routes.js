// backend/routes/upload.routes.js
const express = require('express');
const router = express.Router();
const parser = require('../multer');
const cloudinary = require('../cloudinaryConfig');

// Single file upload (image, 3d model, or audio)
router.post('/', parser.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    url: req.file.path, // Cloudinary URL
    public_id: req.file.filename,
    resource_type: req.file.mimetype,
  });
});

// Delete file from Cloudinary
router.delete('/', async (req, res) => {
  const { public_id } = req.body;
  console.log('Requested deletion for public_id:', public_id);
  if (!public_id) return res.status(400).json({ error: 'public_id required' });
  try {
    const result = await cloudinary.uploader.destroy(public_id, { resource_type: 'auto' });
    console.log('Cloudinary destroy result:', result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Cloudinary deletion error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
