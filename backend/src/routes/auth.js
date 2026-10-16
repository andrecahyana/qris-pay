const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../config/db');
const { sign } = require('../utils/jwt');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

router.post('/register',
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ error: 'Email already registered' });
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ email, passwordHash, name });
      return res.json({ token: sign(user), user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.post('/login',
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await user.validatePassword(password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      return res.json({ token: sign(user), user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
