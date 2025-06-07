import express from 'express';
import checkJwt from '../middleware/checkJwt.js';
import User from '../models/User.js';

const router = express.Router();

// Route to save user after login
router.post('/save-user', checkJwt, async (req, res) => {
  console.log("🧪 Incoming user data:", req.body);
  const { email, name, picture, sub } = req.body;

  try {
    let user = await User.findOne({ auth0Id: sub });

    if (!user) {
      user = await User.create({
        auth0Id: sub,
        name,
        email,
        avatar: picture
      });
    }
    console.log("✅ Saved user:", user); // 👈 Add this
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Save user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
