const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

router.get('/overview', authenticate, async (req, res) => {
  try {
    const [summary] = await sequelize.query(`
      SELECT
        COUNT(*)::int AS total_transactions,
        COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0)::int AS success_count,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0)::int AS failed_count,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0)::int AS pending_count,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount::numeric ELSE 0 END), 0)::text AS successful_amount
      FROM transactions
    `, { type: QueryTypes.SELECT });

    const rows = await sequelize.query(`
      SELECT date_trunc('day', "createdAt")::date AS day,
             COUNT(*)::int AS tx_count,
             COALESCE(SUM(amount::numeric), 0)::text AS total_amount,
             COALESCE(SUM(CASE WHEN status='success' THEN 1 ELSE 0 END), 0)::int AS success_count
      FROM transactions
      WHERE "createdAt" >= current_date - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day ASC
    `, { type: QueryTypes.SELECT });

    return res.json({
      summary,
      daily: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/summary/daily', authenticate, async (req, res) => {
  try {
    const days = Math.max(1, parseInt(req.query.days || '30', 10));
    const rows = await sequelize.query(
      `SELECT date_trunc('day', "createdAt")::date as day,
              COUNT(*)::int as tx_count,
              SUM(amount::numeric)::text as total_amount,
              SUM(CASE WHEN status='success' THEN 1 ELSE 0 END)::int as success_count
       FROM transactions
       WHERE "createdAt" >= current_date - (:days || ' days')::interval
       GROUP BY day
       ORDER BY day ASC`,
      { replacements: { days }, type: QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/top-merchants', authenticate, async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT merchantId, COUNT(*)::int as tx_count, SUM(amount::numeric)::text as total_amount
       FROM transactions
       GROUP BY merchantId
       ORDER BY SUM(amount::numeric) DESC
       LIMIT 10`,
      { type: QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
