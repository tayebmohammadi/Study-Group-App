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
    mode: req.body.mode || 'collaborative',
    privacy: req.body.privacy || 'public',
    owner: req.body.ownerId || null,
    members: req.body.ownerId ? [{ userId: req.body.ownerId, name: req.body.ownerName, email: req.body.ownerEmail }] : []
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

// PUT update a group
router.put('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the owner
    if (group.owner && group.owner.toString() !== req.body.ownerId) {
      return res.status(403).json({ message: 'Only the group owner can edit this group' });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'topic', 'capacity', 'mode', 'privacy'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        group[field] = req.body[field];
      }
    });

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a group
router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Allow deletion without owner check for now
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST join a group (handles both public and private)
router.post('/:id/join', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { userId, name, email } = req.body;

    // Check if user is already a member
    const isMember = group.members.some(member => member.userId.toString() === userId);
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Check if user is already on waitlist
    const isOnWaitlist = group.waitlist.some(waitlistUser => waitlistUser.userId.toString() === userId);
    if (isOnWaitlist) {
      return res.status(400).json({ message: 'You are already on the waitlist for this group' });
    }

    // Check if user has a pending request (for private groups)
    const hasPendingRequest = group.pendingMembers.some(pending => pending.userId.toString() === userId);
    if (hasPendingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this group' });
    }

    // Check if group is full
    const isFull = group.members.length >= group.capacity;

    if (group.privacy === 'public') {
      if (isFull) {
        // Add to waitlist if group is full
        group.waitlist.push({ userId, name, email });
        await group.save();
        res.json({ group, message: 'Group is full. You have been added to the waitlist!' });
      } else {
        // Join directly if there's space
        group.members.push({ userId, name, email });
        await group.save();
        res.json({ group, message: 'Successfully joined the group!' });
      }
    } else {
      // Private group: add to pending requests
      group.pendingMembers.push({ userId, name, email });
      await group.save();
      res.json({ group, message: 'Join request sent! Waiting for approval.' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST leave a group
router.post('/:id/leave', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { userId } = req.body;

    // Check if user is a member
    const memberIndex = group.members.findIndex(member => member.userId.toString() === userId);
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }

    // Check if this is the owner leaving
    const isOwnerLeaving = group.owner && group.owner.toString() === userId;

    // Remove user from members
    group.members.splice(memberIndex, 1);

    // Handle ownership transfer if owner is leaving
    if (isOwnerLeaving) {
      if (group.members.length > 0) {
        // Transfer ownership to the first remaining member
        const newOwner = group.members[0];
        group.owner = newOwner.userId;
        console.log('Ownership transfer:', {
          oldOwner: userId,
          newOwner: newOwner.userId,
          newOwnerName: newOwner.name,
          remainingMembers: group.members.length
        });
        await group.save();
        
        // Auto-promote first person from waitlist if available
        if (group.waitlist.length > 0) {
          const promotedUser = group.waitlist.shift();
          group.members.push(promotedUser);
          await group.save();
          res.json({ 
            group, 
            message: 'Successfully left the group! Ownership transferred to ' + newOwner.name,
            promotedUser: promotedUser.name
          });
        } else {
          res.json({ 
            group, 
            message: 'Successfully left the group! Ownership transferred to ' + newOwner.name
          });
        }
      } else {
        // No members left, delete the group
        await Group.findByIdAndDelete(req.params.id);
        res.json({ 
          message: 'Group deleted (no members remaining)',
          groupDeleted: true
        });
      }
    } else {
      // Regular member leaving
      // Auto-promote first person from waitlist if available
      if (group.waitlist.length > 0) {
        const promotedUser = group.waitlist.shift();
        group.members.push(promotedUser);
        await group.save();
        res.json({ 
          group, 
          message: 'Successfully left the group!',
          promotedUser: promotedUser.name
        });
      } else {
        await group.save();
        res.json({ group, message: 'Successfully left the group!' });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST approve join request (for private groups)
router.post('/:id/approve/:userId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { userId } = req.params;
    const pendingIndex = group.pendingMembers.findIndex(pending => pending.userId.toString() === userId);
    
    if (pendingIndex === -1) {
      return res.status(400).json({ message: 'No pending request found for this user' });
    }

    const userToApprove = group.pendingMembers[pendingIndex];
    
    // Check if group is full
    if (group.members.length >= group.capacity) {
      // Add to waitlist if group is full
      group.waitlist.push(userToApprove);
      group.pendingMembers.splice(pendingIndex, 1);
      await group.save();
      res.json({ group, message: 'User added to waitlist (group is full)' });
    } else {
      // Add to members if there's space
      group.members.push(userToApprove);
      group.pendingMembers.splice(pendingIndex, 1);
      await group.save();
      res.json({ group, message: 'User approved and added to group!' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST deny join request (for private groups)
router.post('/:id/deny/:userId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { userId } = req.params;
    const pendingIndex = group.pendingMembers.findIndex(pending => pending.userId.toString() === userId);
    
    if (pendingIndex === -1) {
      return res.status(400).json({ message: 'No pending request found for this user' });
    }

    group.pendingMembers.splice(pendingIndex, 1);
    await group.save();
    res.json({ group, message: 'Request denied' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST add member to group (legacy route - keeping for compatibility)
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

// POST favorite a group
router.post('/:id/favorite', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { userId } = req.body;
    
    // Check if already favorited
    const isFavorited = group.favorites.includes(userId);
    
    if (isFavorited) {
      // Remove from favorites
      group.favorites = group.favorites.filter(id => id.toString() !== userId);
      await group.save();
      res.json({ group, message: 'Removed from favorites' });
    } else {
      // Add to favorites
      group.favorites.push(userId);
      await group.save();
      res.json({ group, message: 'Added to favorites' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET groups with user's membership status
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching groups for user:', userId);
    const groups = await Group.find({});
    
    const groupsWithStatus = groups.map(group => {
      const isMember = group.members.some(member => member.userId.toString() === userId);
      const isOwner = group.owner ? group.owner.toString() === userId : false;
      const hasRequested = group.pendingMembers.some(pending => pending.userId.toString() === userId);
      const isWaitlisted = group.waitlist.some(waitlist => waitlist.userId.toString() === userId);
      const isFavorited = group.favorites.includes(userId);

      const userStatus = { isMember, isOwner, hasRequested, isWaitlisted, isFavorited };
      console.log(`Group ${group.name}:`, userStatus);
      return { ...group.toObject(), userStatus };
    });
    
    console.log(`Returning ${groupsWithStatus.length} groups with user status`);
    res.json(groupsWithStatus);
  } catch (error) {
    console.error('Error in user groups route:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
