import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import FinancialRecord from '../src/models/FinancialRecord.js';

let adminToken;
let viewerToken;

const ANALYST_USER = {
  name: 'Analytics Analyst',
  email: 'analyst@example.com',
  password: 'Analyst1234!',
  role: 'analyst'
};

const VIEWER_USER = {
  name: 'Analytics Viewer',
  email: 'viewer@example.com',
  password: 'Viewer1234!',
  role: 'viewer'
};

// Seed a few records for analytics to work on
const seedRecords = async (userId) => {
  const records = [
    { user: userId, amount: 5000, type: 'income', category: 'Salary', date: new Date() },
    { user: userId, amount: 1200, type: 'expense', category: 'Food', date: new Date() },
    { user: userId, amount: 300, type: 'expense', category: 'Transport', date: new Date() },
    { user: userId, amount: 2000, type: 'income', category: 'Freelance', date: new Date() }
  ];
  await FinancialRecord.insertMany(records);
};

beforeAll(async () => {
  const uri = process.env.MONGODB_URI;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  await User.deleteMany({ email: { $in: [ANALYST_USER.email, VIEWER_USER.email] } });

  // Register analyst (gets analyst role)
  const aRes = await request(app).post('/api/v1/auth/register').send(ANALYST_USER);
  adminToken = aRes.body.data.accessToken;
  const analystId = aRes.body.data.user._id;
  await seedRecords(analystId);

  // Register viewer
  const vRes = await request(app).post('/api/v1/auth/register').send(VIEWER_USER);
  viewerToken = vRes.body.data.accessToken;
}, 30000);

afterAll(async () => {
  await User.deleteMany({ email: { $in: [ANALYST_USER.email, VIEWER_USER.email] } });
  await mongoose.disconnect();
});

// ─── DASHBOARD SUMMARY ───────────────────────────────────────────────────────

describe('GET /api/v1/analytics/dashboard', () => {
  it('should return dashboard summary for authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/analytics/dashboard');
    expect(res.statusCode).toBe(401);
  });
});

// ─── SPENDING INSIGHTS (analyst/admin only) ──────────────────────────────────

describe('GET /api/v1/analytics/insights', () => {
  it('should return insights for analyst role', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/insights')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 403 for viewer role', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/insights')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/analytics/insights');
    expect(res.statusCode).toBe(401);
  });
});

// ─── COMPARATIVE ANALYSIS (analyst/admin only) ───────────────────────────────

describe('GET /api/v1/analytics/comparison', () => {
  it('should return comparison data for analyst role', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/comparison')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 403 for viewer role', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/comparison')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.statusCode).toBe(403);
  });
});
