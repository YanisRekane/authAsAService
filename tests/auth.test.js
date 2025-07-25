const request = require("supertest");
const app = require("../app"); 
const db = require("../config/db"); 

beforeAll(async () => {
  // Clear DB before tests
  await db.query("DELETE FROM users");
});

afterEach(async () => {
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
      username:"testuser",
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
});
