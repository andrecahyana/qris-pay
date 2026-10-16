const { sequelize, User, Transaction } = require('./config/db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('DB connected');

    // Create admin user if not exists
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'password';
    let admin = await User.findOne({ where: { email } });
    if (!admin) {
      const passwordHash = await bcrypt.hash(password, 10);
      admin = await User.create({ email, passwordHash, name: 'Admin' });
      console.log('Admin user created:', email);
    } else {
      console.log('Admin user already exists:', email);
    }

    // Create sample transactions
    const sample = [
      { qrisId: 'QRIS-001', amount: '150000.00', status: 'success', merchantId: 'M-100', paymentMethod: 'qris' },
      { qrisId: 'QRIS-002', amount: '75000.00', status: 'failed', merchantId: 'M-101', paymentMethod: 'qris' },
      { qrisId: 'QRIS-003', amount: '225000.00', status: 'success', merchantId: 'M-100', paymentMethod: 'qris' }
    ];

    for (const s of sample) {
      const exists = await Transaction.findOne({ where: { qrisId: s.qrisId } });
      if (!exists) {
        await Transaction.create({ ...s, userId: admin.id, rawPayload: s });
        console.log('Created sample tx', s.qrisId);
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

seed();
