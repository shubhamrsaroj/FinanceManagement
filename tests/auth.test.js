import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';

const MONGO_URI = process.env.MONGODB_URI;

const TEST_USER = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'Password123!',
  role: 'admin'
};

let accessToken;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(MONGO_URI);
  await User.deleteOne({ email: TEST_USER.email });
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: [TEST_USER.email, 'deactivated@example.com'] } });
  await mongoose.disconnect();
});

// ─── REGISTER ────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  it('should register a new user and return 201', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(TEST_USER);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user).toHaveProperty('_id');
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(res.body.data.user.role).toBe('admin');
  });

  it('should return 400 when registering with duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(TEST_USER);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'incomplete@example.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bad Email', email: 'notanemail', password: 'Password123!' });

    expect(res.statusCode).toBe(400);
  });

  it('should return 400 for password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Short Pass', email: 'shortpass@example.com', password: 'abc' });

    expect(res.statusCode).toBe(400);
  });

  it('should return 400 for name shorter than 2 characters', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'A', email: 'shortname@example.com', password: 'Password123!' });

    expect(res.statusCode).toBe(400);
  });

  it('should default role to viewer when role is not provided', async () => {
    const tempEmail = 'norole@example.com';
    await User.deleteOne({ email: tempEmail });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'No Role', email: tempEmail, password: 'Password123!' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.role).toBe('viewer');

    await User.deleteOne({ email: tempEmail });
  });

  it('should return 400 for invalid role value', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bad Role', email: 'badrole@example.com', password: 'Password123!', role: 'superadmin' });

    expect(res.statusCode).toBe(400);
  });
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  it('should login with valid credentials and return token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    expect(res.body.data.user).not.toHaveProperty('password');

    accessToken = res.body.data.accessToken;
  });

  it('should return 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPassword!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 with non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'SomePass123!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when body is empty', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});

    expect(res.statusCode).toBe(400);
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'Password123!' });

    expect(res.statusCode).toBe(400);
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email });

    expect(res.statusCode).toBe(400);
  });

  it('should return 401 for deactivated account', async () => {
    // Create and deactivate a user
    await User.deleteOne({ email: 'deactivated@example.com' });
    const deactivatedUser = await User.create({
      name: 'Deactivated User',
      email: 'deactivated@example.com',
      password: 'Password123!',
      isActive: false
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'deactivated@example.com', password: 'Password123!' });

    expect(res.statusCode).toBe(401);
    await User.deleteOne({ _id: deactivatedUser._id });
  });
});

// ─── GET ME ──────────────────────────────────────────────────────────────────

describe('GET /api/v1/auth/me', () => {
  it('should return current user when authenticated', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(TEST_USER.email);
    expect(res.body.data).not.toHaveProperty('password');
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data).toHaveProperty('role');
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalidtoken.fake.payload');

    expect(res.statusCode).toBe(401);
  });

  it('should return 401 with malformed Authorization header', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'NotBearer sometoken');

    expect(res.statusCode).toBe(401);
  });
});

// ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────

describe('POST /api/v1/auth/change-password', () => {
  const newPassword = 'NewPassword456!';

  it('should change password successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: TEST_USER.password, newPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('should be able to login with the new password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: newPassword });

    expect(res.statusCode).toBe(200);
    accessToken = res.body.data.accessToken; // refresh token
  });

  it('should return 401 with wrong current password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'WrongOldPass!', newPassword: 'SomethingNew9!' });

    expect(res.statusCode).toBe(401);
  });

  it('should return 400 when newPassword is too short', async () => {
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: newPassword, newPassword: 'abc' });

    expect(res.statusCode).toBe(400);
  });

  it('should return 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: newPassword });

    expect(res.statusCode).toBe(400);
  });

  it('should return 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .send({ currentPassword: newPassword, newPassword: 'AnotherPass1!' });

    expect(res.statusCode).toBe(401);
  });
});

// ─── LOGOUT ──────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  it('should logout successfully when authenticated', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/logged out/i);
  });

  it('should return 401 when logging out without token', async () => {
    const res = await request(app).post('/api/v1/auth/logout');

    expect(res.statusCode).toBe(401);
  });
});
