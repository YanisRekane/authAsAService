const request = require("supertest");
const app = require("../app"); 
const db = require("../config/db"); 
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
jest.setTimeout(10000)

// ✅ Reusable login helper
const getTokens = async () => {
  const username = "testuser";
  const email = 'yanisrekane@gmail.com';
  const password = 'StrongPass123!';

  // 1. Register the user
  await request(app).post('/auth/register').send({username, email, password });

  // 2. Manually verify the email (raw MySQL)
  await db.execute(
    'UPDATE users SET is_verified = ? WHERE email = ?',
    [1, email]
  );

  // 3. Login to get tokens
  const res = await request(app)
    .post('/auth/login')
    .send({ email, password });

  const accessToken = res.body.accessToken;
  const refreshTokenCookie = res.headers['set-cookie']?.find(cookie =>
    cookie.startsWith('refreshToken=')
  );

  return { accessToken, refreshTokenCookie };
};

beforeAll(async () => {
  // Clear DB before tests
  await db.query("DELETE FROM refresh_tokens");
  await db.query("DELETE FROM password_resets");
  await db.query("DELETE FROM users");
});

afterEach(async () => {
  await db.query("DELETE FROM refresh_tokens");
  await db.query("DELETE FROM password_resets");
  await db.query("DELETE FROM users");
});

afterAll(async () => {
  db.end();
});

describe("Auth Flow", () => {
  test("Register a user", async () => {
    const res = await request(app).post("/auth/register").send({
      username:"testname",
      email: "test@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/verification email sent/i);
  });

  test("Cannot login before email verification", async () => {
    await request(app).post("/auth/register").send({
      username: "testuser",
      email: "notverified@example.com",
      password: "password123",
    });

    const res = await request(app).post("/auth/login").send({
      email: "notverified@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/email not verified/i);
  });

  test("Login after verifying email", async () => {
    await request(app).post("/auth/register").send({
      username:"just test",
      email: "verified@example.com",
      password: "password123",
    });

    // Manually mark email as verified in DB
    await db.query("UPDATE users SET is_verified = 1 WHERE email = ?", ["verified@example.com"]);

    const res = await request(app).post("/auth/login").send({
      email: "verified@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });
  it("should logout user and clear refresh token", async () => {
    // 1. First, login to get a valid refresh token cookie
    const { refreshTokenCookie } = await getTokens(); // assuming this returns cookie

    // 2. Send request to logout with the refresh token cookie
    const res = await request(app)
      .post("/auth/logout")
      .set("Cookie", refreshTokenCookie) // set refresh token
      .expect(200);

    // 3. Check response
    expect(res.body.message).toBe("Logged out successfully");
  });
});


describe('Refresh Token', () => {
  it('should refresh access token with valid refresh token', async () => {
    const { refreshTokenCookie } = await getTokens();
    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', [refreshTokenCookie]);

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it("should reject refresh with invalid refresh token", async () => {
  const originalError = console.error;
  console.error = () => {};
  const res = await request(app)
    .post("/auth/refresh")
    .set("Cookie", ["refreshToken=invalidtoken"]);

  expect(res.statusCode).toBe(403); // or 400 depending on your logic
  console.error = originalError;
});
});

describe('Email Verification', () => {
  it('should verify user email with a valid token', async () => {
    //register a user
    const email = "test@example.com"
    const username = "tester"
    const password='yenais'

    const user = await request(app).post('/auth/register').send({username,email,password});

    const token = jwt.sign(
      {userId: user.body.id }, 
      process.env.EMAIL_SECRET,
      { expiresIn: '1d' }
    )

    const res = await request(app)
    .get(`/auth/verify-email?token=${token}`);

    //check response
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe("Email verified successfully")
  })
  it('should reject invalide users', async() => {
    //set invalid user
    const token = jwt.sign(
      {userId: 5},
      process.env.EMAIL_SECRET,
      {expiresIn: '1d'}
    )
    const res = await request(app).get(`/auth/verify-email?token=${token}`);

    //check response
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toBe('User not found')
  })
  it('should reject already verified users', async() => {
    //register a user
    const {accessToken} = await getTokens();

    //get the user information
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const userId = decoded.id;
    const token = jwt.sign(
      {userId: userId},
      process.env.EMAIL_SECRET,
      {expiresIn:'1d'}
    )

    const res = await request(app).get(`/auth/verify-email?token=${token}`)

    //check response
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Email already verified')
  })
  it('should reject invalid or expired tokens', async() => {
    //set false user information for testing
    const userId = 5
    const token = jwt.sign(
      {userId:userId},
      process.env.EMAIL_SECRET,
      {expiresIn:'1'}
    )

    //wait two sec for the token to expire then request
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    
    const res = await request(app).get(`/auth/verify-email?token=${token}`)

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('Invalid or expired token')
  })
})
describe('Password Reset', () => {
  it ('should send email password reset for registred emails', async () => {
    //register a user
    const {accessToken} = await getTokens();

    //get the user information
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const userId = decoded.id;
    const [emailRows] = await db.query("SELECT email FROM users where id = ?", [userId])
    const email = emailRows[0].email

    //send the request
    const res = await request(app).post('/auth/forgot-password').send({email})

    //check response
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Reset link sent');
  })
  it ('should reject unregistred emails', async () => {
    //invalide email
    const email = "invalidemail@gmail.com";

    //send request
    const res = await request(app).post('/auth/forgot-password').send({email})

    //check response
    expect(res.statusCode).toBe(404)
    expect(res.body.message).toBe('user not found')
  })
  it('should reset password for valid email and token', async () => {
    const {accessToken} = await getTokens();

    //get the user information
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const userId = decoded.id;
    const [emailRows] = await db.query("SELECT email FROM users where id = ?", [userId])
    const email = emailRows[0].email;
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    await db.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    );

    const newPassword = "newpasswordforreset"

    //send the request
    const res = await request(app).post('/auth/reset-password').send({token, email, newPassword})

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Password has been reset')
  })
  it('should reject ivalid emails', async() => {
    //invalide user information
    const email = 'invalide@example.com'
    const token = 'invalidetokenfortesting'
    const newPassword = 'anythingtotestwith'

    //send the request
    const res = await request(app).post('/auth/reset-password').send({token, email, newPassword})

    //check response
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('Invalid email')
  })
  it('should reject invalid token', async() => {
    //get valid user information
    const {accessToken} = await getTokens();
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const userId = decoded.id;
    const [emailRows] = await db.query("SELECT email FROM users where id = ?", [userId])
    const email = emailRows[0].email;

    //set in invalide token
    const token = crypto.randomBytes(32).toString('hex');

    const newPassword = "thisisjustfortesting"

    //sent the request
    const res = await request(app).post('/auth/reset-password').send({token, email, newPassword})

    //check response
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe('Invalid or expired token')
  })
})
