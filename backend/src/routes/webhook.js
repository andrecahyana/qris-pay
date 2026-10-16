const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Transaction } = require('../config/db');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'webhook_secret';
const SIG_HEADER = 'x-qris-signature';

// Simulated QRIS webhook receiver (illustration only)
// Expects JSON payload and a header 'x-qris-signature' = HMAC_SHA256(JSON(payload), WEBHOOK_SECRET)
router.post('/notify', async (req, res) => {
  try {
    const payload = req.body;
    const signature = (req.headers[SIG_HEADER] || '').toString();

    if (!signature) {
      return res.status(400).json({ error: 'Missing signature header' });
    }

    const computed = crypto.createHmac('sha256', WEBHOOK_SECRET).update(JSON.stringify(payload)).digest('hex');

    const sigBuf = Buffer.from(signature, 'utf8');
    const compBuf = Buffer.from(computed, 'utf8');
    if (sigBuf.length !== compBuf.length || !crypto.timingSafeEqual(sigBuf, compBuf)) {
      console.warn('Invalid webhook signature', { received: signature, computed });
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Basic validation of payload (illustrative)
    const { qrisId, amount, status, merchantId, paymentMethod } = payload;
    if (!qrisId || !amount || !status) {
      return res.status(422).json({ error: 'Missing required fields (qrisId, amount, status)' });
    }

    // Find existing transaction by qrisId or create new
    let tx = await Transaction.findOne({ where: { qrisId } });
    if (tx) {
      tx.amount = amount;
      tx.status = status;
      tx.merchantId = merchantId || tx.merchantId;
      tx.paymentMethod = paymentMethod || tx.paymentMethod;
      tx.rawPayload = payload;
      await tx.save();
      console.log('Updated transaction from webhook:', qrisId, 'status=', status);
    } else {
      tx = await Transaction.create({ qrisId, amount, status, merchantId, paymentMethod, rawPayload: payload });
      console.log('Created transaction from webhook:', qrisId);
    }

    return res.json({ ok: true, transaction: tx });
  } catch (err) {
    console.error('Webhook handling failed', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
