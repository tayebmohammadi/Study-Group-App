const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

// GET all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new group
router.post('/', async (req, res) => {
  const group = new Group({
    name: req.body.name,
    description: req.body.description,
    topic: req.body.topic,
    capacity: req.body.capacity || 10,
    mode: req.body.mode || 'collaborative'
  });

  try {
    const newGroup = await group.save();
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET single group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (group) {
      res.json(group);
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update group
router.put('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (group) {
      group.name = req.body.name || group.name;
      group.description = req.body.description || group.description;
      group.topic = req.body.topic || group.topic;
      group.capacity = req.body.capacity || group.capacity;
      group.mode = req.body.mode || group.mode;
      
      const updatedGroup = await group.save();
      res.json(updatedGroup);
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE group
router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (group) {
      await group.remove();
      res.json({ message: 'Group deleted' });
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add member to group
router.post('/:id/members', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (group) {
      if (group.members.length >= group.capacity) {
        return res.status(400).json({ message: 'Group is at full capacity' });
      }
      
      group.members.push({
        name: req.body.name,
        email: req.body.email
      });
      
      const updatedGroup = await group.save();
      res.json(updatedGroup);
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
