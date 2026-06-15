const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const { protect } = require('../middleware/auth');

// GET /api/workspaces - get all workspaces (user is member or creator)
router.get('/', protect, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    }).populate('createdBy', 'name email');
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/workspaces - create workspace
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Workspace name is required' });

    const workspace = await Workspace.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    const populated = await workspace.populate('createdBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/workspaces/:id - get single workspace
router.get('/:id', protect, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id).populate('createdBy', 'name email').populate('members', 'name email');
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/workspaces/:id - delete workspace
router.delete('/:id', protect, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    if (workspace.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await workspace.deleteOne();
    res.json({ message: 'Workspace deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
