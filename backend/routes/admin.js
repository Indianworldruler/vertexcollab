const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const Task = require('../models/Task');
const Document = require('../models/Document');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/admin/stats - admin dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [users, workspaces, channels, messages, tasks, documents] = await Promise.all([
      User.countDocuments(),
      Workspace.countDocuments(),
      Channel.countDocuments(),
      Message.countDocuments(),
      Task.countDocuments(),
      Document.countDocuments(),
    ]);

    res.json({ users, workspaces, channels, messages, tasks, documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users - list all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id - delete a user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
