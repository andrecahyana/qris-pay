require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./config/db');
const authRoutes = require('./routes/auth');
const txRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');
const webhookRoutes = require('./routes/webhook');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middlewares
app.use(helmet());
app.use(morgan(process.env.LOG_FORMAT || 'combined'));

// CORS configuration
const allowed = process.env.ALLOWED_ORIGINS || '*';
const corsOptions = allowed === '*' ? { origin: '*' } : { origin: allowed.split(',') };
app.use(cors(corsOptions));

// Body parsing with raw body capture for webhook signature verification
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api/webhook', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', txRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhook', webhookRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.BACKEND_PORT || 4000;

async function startServer() {
  await sequelize.authenticate();
  console.log('DB connected');
  // In production use migrations instead of sync()
  await sequelize.sync();
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
if (require.main === module) {
  startServer().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
