const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// GET /api/messages?channel=id - get messages in a channel
router.get('/', protect, async (req, res) => {
  try {
    const { channel } = req.query;
    if (!channel) return res.status(400).json({ message: 'Channel ID is required' });

    const messages = await Message.find({ channel })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/messages - send a message
router.post('/', protect, async (req, res) => {
  try {
    const { content, channel } = req.body;
    if (!content || !channel) {
      return res.status(400).json({ message: 'Content and channel are required' });
    }

    const message = await Message.create({
      content,
      channel,
      sender: req.user._id,
    });

    const populated = await message.populate('sender', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
