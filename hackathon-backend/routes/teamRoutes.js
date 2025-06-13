import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import checkJwt from '../middleware/checkJwt.js';

const router = express.Router();

// Create a new team
router.post('/create', checkJwt, async (req, res) => {
  try {
    const { name, description, maxMembers } = req.body;
    
    // Get user from database using auth0Id from JWT
    const user = await User.findOne({ auth0Id: req.auth.sub });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already in a team
    const existingTeam = await Team.findOne({
      'members.user': user._id,
      isActive: true
    });

    if (existingTeam) {
      return res.status(400).json({ error: 'You are already in a team' });
    }

    // Create new team
    const team = new Team({
      name,
      description,
      leader: user._id,
      maxMembers: maxMembers || 4
    });

    await team.save();
    
    // Populate the team with user details
    await team.populate('leader', 'name email avatar');
    await team.populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team
    });

  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Invite a user to team
router.post('/invite', checkJwt, async (req, res) => {
  try {
    const { teamId, email } = req.body;
    
    // Get current user
    const user = await User.findOne({ auth0Id: req.auth.sub });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find team and check if user is leader
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.leader.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Only team leader can invite members' });
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ error: 'Team is full' });
    }

    // Check if email is already invited
    const existingInvitation = team.invitations.find(
      inv => inv.email === email && inv.status === 'pending'
    );

    if (existingInvitation) {
      return res.status(400).json({ error: 'User already invited' });
    }

    // Check if user with email is already in team
    const invitedUser = await User.findOne({ email });
    if (invitedUser) {
      const isAlreadyMember = team.members.some(
        member => member.user.toString() === invitedUser._id.toString()
      );
      
      if (isAlreadyMember) {
        return res.status(400).json({ error: 'User is already a team member' });
      }
    }

    // Add invitation
    team.invitations.push({
      email,
      invitedBy: user._id,
      status: 'pending'
    });

    await team.save();

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully'
    });

  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get team members and details
router.get('/members/:teamId', checkJwt, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Get current user
    const user = await User.findOne({ auth0Id: req.auth.sub });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find team
    const team = await Team.findById(teamId)
      .populate('leader', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('invitations.invitedBy', 'name email');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is part of the team
    const isMember = team.members.some(
      member => member.user._id.toString() === user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      team
    });

  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's current team
router.get('/my-team', checkJwt, async (req, res) => {
  try {
    // Get current user
    const user = await User.findOne({ auth0Id: req.auth.sub });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find user's team
    const team = await Team.findOne({
      'members.user': user._id,
      isActive: true
    })
    .populate('leader', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('invitations.invitedBy', 'name email');

    if (!team) {
      return res.status(404).json({ error: 'No team found' });
    }

    res.status(200).json({
      success: true,
      team
    });

  } catch (error) {
    console.error('Get my team error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept team invitation
router.post('/accept-invitation', checkJwt, async (req, res) => {
  try {
    const { teamId } = req.body;
    
    // Get current user
    const user = await User.findOne({ auth0Id: req.auth.sub });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find team and invitation
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const invitation = team.invitations.find(
      inv => inv.email === user.email && inv.status === 'pending'
    );

    if (!invitation) {
      return res.status(404).json({ error: 'No pending invitation found' });
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ error: 'Team is full' });
    }

    // Add user to team members
    team.members.push({
      user: user._id,
      role: 'member'
    });

    // Update invitation status
    invitation.status = 'accepted';

    await team.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined the team'
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave team
router.post('/leave', checkJwt, async (req, res) => {
  try {
    const { teamId } = req.body;
    
    // Get current user
    const user = await User.findOne({ auth0Id: req.auth.sub });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is team leader
    if (team.leader.toString() === user._id.toString()) {
      return res.status(400).json({ 
        error: 'Team leader cannot leave. Transfer leadership first.' 
      });
    }

    // Remove user from team
    team.members = team.members.filter(
      member => member.user.toString() !== user._id.toString()
    );

    await team.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left the team'
    });

  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;