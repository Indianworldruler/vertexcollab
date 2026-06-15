const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { protect } = require('../middleware/auth');

// GET /api/documents?workspace=id
router.get('/', protect, async (req, res) => {
  try {
    const { workspace } = req.query;
    const filter = workspace ? { workspace } : {};
    const documents = await Document.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/documents - add document metadata
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, fileType, fileSize, workspace } = req.body;
    if (!title || !workspace) {
      return res.status(400).json({ message: 'Title and workspace are required' });
    }

    const document = await Document.create({
      title,
      description,
      fileType: fileType || 'unknown',
      fileSize: fileSize || '0 KB',
      uploadedBy: req.user._id,
      workspace,
    });

    const populated = await document.populate('uploadedBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await document.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
