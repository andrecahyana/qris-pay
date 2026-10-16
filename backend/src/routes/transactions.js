const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { Transaction } = require('../config/db');
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const { Op } = require('sequelize');

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

// Export CSV
router.get('/export',
  authenticate,
  query('status').optional().isIn(['pending','success','failed','refunded']),
  validate,
  async (req, res) => {
    try {
      const { status, merchantId, from, to } = req.query;
      const where = {};
      if (status) where.status = status;
      if (merchantId) where.merchantId = merchantId;
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt[Op.gte] = new Date(from);
        if (to) where.createdAt[Op.lte] = new Date(to);
      }

      const items = await Transaction.findAll({ where, order: [['createdAt','DESC']] });

      // Build CSV
      const header = ['id','qrisId','amount','status','merchantId','paymentMethod','createdAt','rawPayload'];
      const rows = items.map(tx => {
        const raw = tx.rawPayload ? JSON.stringify(tx.rawPayload).replace(/"/g, '""') : '';
        return [tx.id, tx.qrisId, tx.amount, tx.status, tx.merchantId || '', tx.paymentMethod || '', tx.createdAt.toISOString(), `"${raw}"`].join(',');
      });
      const csv = [header.join(','), ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transactions_${Date.now()}.csv"`);
      res.send(csv);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// List transactions with filters and pagination
router.get('/',
  authenticate,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['pending','success','failed','refunded']),
  validate,
  async (req, res) => {
    try {
      const { page = 1, limit = 25, status, merchantId, from, to, q } = req.query;
      const where = {};
      if (status) where.status = status;
      if (merchantId) where.merchantId = merchantId;
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt[Op.gte] = new Date(from);
        if (to) where.createdAt[Op.lte] = new Date(to);
      }
      if (q) {
        where[Op.or] = [
          { qrisId: { [Op.iLike]: `%${q}%` } },
          { merchantId: { [Op.iLike]: `%${q}%` } }
        ];
      }

      const offset = (page - 1) * limit;
      const { rows, count } = await Transaction.findAndCountAll({ where, limit: +limit, offset, order: [['createdAt','DESC']] });
      res.json({ data: rows, meta: { total: count, page: +page, limit: +limit } });
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
