const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');
const { protect } = require('../middleware/auth');

// GET /api/channels?workspace=id - get channels in a workspace
router.get('/', protect, async (req, res) => {
  try {
    const { workspace } = req.query;
    const filter = workspace ? { workspace } : {};
    const channels = await Channel.find(filter).populate('createdBy', 'name email');
    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/channels - create channel
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, workspace } = req.body;
    if (!name || !workspace) {
      return res.status(400).json({ message: 'Channel name and workspace are required' });
    }

    const channel = await Channel.create({
      name,
      description,
      workspace,
      createdBy: req.user._id,
    });

    const populated = await channel.populate('createdBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/channels/:id - get single channel
router.get('/:id', protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate('createdBy', 'name email');
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    res.json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/channels/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    await channel.deleteOne();
    res.json({ message: 'Channel deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
