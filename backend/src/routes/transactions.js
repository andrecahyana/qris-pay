const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { Transaction } = require('../config/db');
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validate');

// Create transaction (authenticated)
router.post('/',
  authenticate,
  body('qrisId').notEmpty().withMessage('qrisId is required'),
  body('amount').isNumeric().withMessage('amount must be numeric'),
  validate,
  async (req, res) => {
    try {
      const payload = req.body;
      const tx = await Transaction.create({ ...payload, userId: req.user.id, rawPayload: payload });
      res.status(201).json(tx);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// List transactions
router.get('/',
  authenticate,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['pending','success','failed','refunded']),
  validate,
  async (req, res) => {
    try {
      const { page = 1, limit = 25, status } = req.query;
      const where = {};
      if (status) where.status = status;
      const offset = (page - 1) * limit;
      const items = await Transaction.findAll({ where, limit: +limit, offset, order: [['createdAt','DESC']] });
      res.json({ data: items });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get single transaction
router.get('/:id', authenticate, async (req, res) => {
  try {
    const tx = await Transaction.findByPk(req.params.id);
    if (!tx) return res.status(404).json({ error: 'Not found' });
    res.json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
