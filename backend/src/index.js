require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('./config/db');
const authRoutes = require('./routes/auth');
const txRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', txRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.BACKEND_PORT || 4000;

async function startServer() {
  await sequelize.authenticate();
  console.log('DB connected');
  await sequelize.sync();
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

// Export app for testing and start when run directly
module.exports = app;
if (require.main === module) {
  startServer().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
