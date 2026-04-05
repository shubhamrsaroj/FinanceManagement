import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import FinancialRecord from '../src/models/FinancialRecord.js';

let accessToken;
let recordId;

const ADMIN_USER = {
  name: 'Record Test Admin',
  email: 'recordadmin@example.com',
  password: 'Admin1234!',
  role: 'admin'
};

const SAMPLE_RECORD = {
  amount: 2500,
  type: 'income',
  category: 'Salary',
  description: 'Monthly salary',
  date: new Date().toISOString()
};

beforeAll(async () => {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  // Clean up
  await User.deleteOne({ email: ADMIN_USER.email });

  // Register admin
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send(ADMIN_USER);
  accessToken = regRes.body.data.accessToken;
});

afterAll(async () => {
  await FinancialRecord.deleteMany({ description: 'Monthly salary' });
  await User.deleteOne({ email: ADMIN_USER.email });
  await mongoose.disconnect();
});

// ─── CREATE RECORD ───────────────────────────────────────────────────────────

describe('POST /api/v1/records', () => {
  it('should create a financial record (admin)', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(SAMPLE_RECORD);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.amount).toBe(SAMPLE_RECORD.amount);
    expect(res.body.data.type).toBe(SAMPLE_RECORD.type);

    recordId = res.body.data._id;
  });

  it('should return 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .send(SAMPLE_RECORD);

    expect(res.statusCode).toBe(401);
  });

  it('should return 400 with missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 100 }); // missing type, category, date

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 with invalid type', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...SAMPLE_RECORD, type: 'invalid_type' });

    expect(res.statusCode).toBe(400);
  });

  it('should return 400 with negative amount', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...SAMPLE_RECORD, amount: -50 });

    expect(res.statusCode).toBe(400);
  });
});

// ─── GET RECORDS ─────────────────────────────────────────────────────────────

describe('GET /api/v1/records', () => {
  it('should return a list of records', async () => {
    const res = await request(app)
      .get('/api/v1/records')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should support filtering by type=income', async () => {
    const res = await request(app)
      .get('/api/v1/records?type=income')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    res.body.data.forEach(r => expect(r.type).toBe('income'));
  });

  it('should support pagination (page & limit)', async () => {
    const res = await request(app)
      .get('/api/v1/records?page=1&limit=5')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/records');
    expect(res.statusCode).toBe(401);
  });
});

// ─── GET SINGLE RECORD ───────────────────────────────────────────────────────

describe('GET /api/v1/records/:id', () => {
  it('should return a single record by id', async () => {
    const res = await request(app)
      .get(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(recordId);
  });

  it('should return 400 for invalid ObjectId format', async () => {
    const res = await request(app)
      .get('/api/v1/records/not-a-valid-id')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
  });

  it('should return 404 for non-existent record', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/v1/records/${fakeId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
  });
});

// ─── UPDATE RECORD ───────────────────────────────────────────────────────────

describe('PATCH /api/v1/records/:id', () => {
  it('should update a record', async () => {
    const res = await request(app)
      .patch(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 3000, description: 'Updated salary' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(3000);
  });

  it('should return 400 for invalid amount', async () => {
    const res = await request(app)
      .patch(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 0 });

    expect(res.statusCode).toBe(400);
  });

  it('should return 400 for invalid ObjectId', async () => {
    const res = await request(app)
      .patch('/api/v1/records/badid')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 100 });

    expect(res.statusCode).toBe(400);
  });
});

// ─── GET CATEGORIES ──────────────────────────────────────────────────────────

describe('GET /api/v1/records/categories', () => {
  it('should return income and expense categories', async () => {
    const res = await request(app)
      .get('/api/v1/records/categories')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('income');
    expect(res.body.data).toHaveProperty('expense');
    expect(Array.isArray(res.body.data.income)).toBe(true);
  });
});

// ─── DELETE RECORD ───────────────────────────────────────────────────────────

describe('DELETE /api/v1/records/:id', () => {
  it('should soft-delete a record', async () => {
    const res = await request(app)
      .delete(`/api/v1/records/${recordId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should not return the deleted record in list', async () => {
    const res = await request(app)
      .get('/api/v1/records')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    const found = res.body.data.find(r => r._id === recordId);
    expect(found).toBeUndefined();
  });

  it('should return 400 for invalid ObjectId on delete', async () => {
    const res = await request(app)
      .delete('/api/v1/records/badid')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
  });
});
