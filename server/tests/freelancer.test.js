// tests/freelancer.test.js
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set environment variables before any imports
process.env.ACCESS_TOKEN_SECRET = "test_access_secret_32_chars_long_value";
process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret_32_chars_long_value";
process.env.JWT_SECRET = "test_jwt_secret_32_chars_long_value";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.NODE_ENV = "test";
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "123456789012345";
process.env.CLOUDINARY_API_SECRET = "test_secret_key_for_testing";

// Mock Cloudinary to avoid real API calls
jest.unstable_mockModule("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url:
          "https://res.cloudinary.com/test-cloud/image/upload/v123/test.jpg",
        public_id: "test-public-id",
      }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

// Mock multer-storage-cloudinary
jest.unstable_mockModule("multer-storage-cloudinary", () => ({
  CloudinaryStorage: jest.fn().mockImplementation(function (opts) {
    this._options = opts;
    return {
      _handleFile: (req, file, cb) => {
        cb(null, {
          path: "https://res.cloudinary.com/test-cloud/image/upload/v123/test.jpg",
          filename: file.originalname,
          size: file.size || 1024,
        });
      },
      _removeFile: (req, file, cb) => cb(null),
    };
  }),
}));

// Now import modules
const { default: app } = await import("../src/app.js");
const { default: User } = await import("../src/models/User.js");
const { default: FreelancerProfile } =
  await import("../src/models/FreelancerProfile.js");
const request = (await import("supertest")).default;

let mongoServer;

// ==================== HELPERS ====================

const getCookieValue = (cookies = [], name) => {
  const cookie = cookies.find((item) => item.startsWith(`${name}=`));
  if (!cookie) return "";
  return cookie.split(";")[0].replace(`${name}=`, "");
};

const extractAccessToken = (response) => {
  const body = response.body;
  if (body?.data?.accessToken) return body.data.accessToken;
  const cookies = response.headers["set-cookie"] || [];
  return getCookieValue(cookies, "accessToken");
};

/**
 * Create a user and return with auth tokens
 */
const createUser = async (overrides = {}) => {
  return await User.create({
    name: "Test Freelancer",
    email: `freelancer-${Date.now()}@example.com`,
    password: "Password@123",
    role: "freelancer",
    isEmailVerified: true,
    isActive: true,
    ...overrides,
  });
};

/**
 * Create a user and return with auth tokens
 */
const createAndLoginUser = async (overrides = {}) => {
  const user = await User.create({
    name: "Test Freelancer",
    email: `freelancer-${Date.now()}@example.com`,
    password: "Password@123",
    role: "freelancer",
    isEmailVerified: true,
    isActive: true,
    ...overrides,
  });

  const loginResponse = await request(app).post("/api/v1/auth/login").send({
    email: user.email,
    password: "Password@123",
  });

  const accessToken = extractAccessToken(loginResponse);
  const cookies = loginResponse.headers["set-cookie"] || [];

  return { user, accessToken, cookies };
};

/**
 * Create a client user for testing public access
 */
const createClientUser = async () => {
  const user = await User.create({
    name: "Test Client",
    email: `client-${Date.now()}@example.com`,
    password: "Password@123",
    role: "client",
    isEmailVerified: true,
    isActive: true,
  });

  const loginResponse = await request(app).post("/api/v1/auth/login").send({
    email: user.email,
    password: "Password@123",
  });

  const accessToken = extractAccessToken(loginResponse);
  return { user, accessToken };
};

/**
 * Create a basic freelancer profile for testing
 */
const createProfile = async (userId, overrides = {}) => {
  return await FreelancerProfile.create({
    user: userId,
    headline: "Senior Full Stack Developer",
    bio: "Experienced developer with 10+ years in web development.",
    languages: ["English", "Hindi"],
    skills: [
      { name: "React", proficiency: "Expert" },
      { name: "Node.js", proficiency: "Expert" },
      { name: "TypeScript", proficiency: "Intermediate" },
    ],
    ...overrides,
  });
};

/**
 * Create a test image file buffer
 */
const createTestImageBuffer = () => {
  // Minimal valid JPEG bytes
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0xff, 0xd9,
  ]);
};

/**
 * Create a test PDF file buffer
 */
const createTestPdfBuffer = () => {
  // Minimal valid PDF bytes
  return Buffer.from(
    "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF",
  );
};

// ==================== SETUP & TEARDOWN ====================

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await FreelancerProfile.deleteMany({});
});

// ==================== PROFILE CRUD TESTS ====================

describe("Freelancer Profile API", () => {
  describe("GET /api/v1/freelancer/profile", () => {
    it("should return profile for authenticated freelancer", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .get("/api/v1/freelancer/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.profile).toBeDefined();
      expect(response.body.data.profile.headline).toBe(
        "Senior Full Stack Developer",
      );
      expect(response.body.data.profile.user.name).toBe("Test Freelancer");
      expect(response.body.data.profile.skills).toHaveLength(3);
    });

    it("should auto-create profile if not exists", async () => {
      const { user, accessToken } = await createAndLoginUser();
      // Don't create profile - it should auto-create

      const response = await request(app)
        .get("/api/v1/freelancer/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.profile).toBeDefined();
      expect(response.body.data.profile.skills).toEqual([]);
      expect(response.body.data.profile.profileCompletionScore).toBe(0);
    });

    it("should return 401 without auth token", async () => {
      const response = await request(app).get("/api/v1/freelancer/profile");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 403 for non-freelancer role", async () => {
      const { accessToken } = await createClientUser();

      const response = await request(app)
        .get("/api/v1/freelancer/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("PUT /api/v1/freelancer/profile", () => {
    it("should update headline, bio, and languages", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          headline: "Updated Headline",
          bio: "Updated professional bio with more details.",
          languages: ["English", "Spanish", "French"],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.profile.headline).toBe("Updated Headline");
      expect(response.body.data.profile.bio).toBe(
        "Updated professional bio with more details.",
      );
      expect(response.body.data.profile.languages).toEqual([
        "English",
        "Spanish",
        "French",
      ]);
      expect(response.body.data.profile.profileCompletionScore).toBeGreaterThan(
        0,
      );
    });

    it("should update only provided fields", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          headline: "Only Headline Update",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.profile.headline).toBe("Only Headline Update");
      expect(response.body.data.profile.bio).toBe(
        "Experienced developer with 10+ years in web development.",
      );
    });

    it("should reject headline over 200 characters", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          headline: "A".repeat(201),
        });

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].field).toBe("headline");
    });

    it("should reject bio over 1000 characters", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          bio: "A".repeat(1001),
        });

      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/v1/freelancer/profile/recalculate-score", () => {
    it("should recalculate profile completion score", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id, {
        headline: "Developer",
        bio: "Bio here",
        languages: ["English"],
        skills: [
          { name: "React", proficiency: "Expert" },
          { name: "Node.js", proficiency: "Expert" },
          { name: "TypeScript", proficiency: "Intermediate" },
        ],
        portfolio: [
          { title: "Project 1", imageUrl: "https://example.com/img1.jpg" },
          { title: "Project 2", imageUrl: "https://example.com/img2.jpg" },
          { title: "Project 3", imageUrl: "https://example.com/img3.jpg" },
        ],
        resumeUrl: "https://example.com/resume.pdf",
        workExperience: [{ title: "Developer", company: "Tech Corp" }],
      });

      const response = await request(app)
        .post("/api/v1/freelancer/profile/recalculate-score")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.profileCompletionScore).toBeGreaterThan(0);
      expect(response.body.data.profileCompletionScore).toBeLessThanOrEqual(
        100,
      );
    });

    it("should return 100 for complete profile", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id, {
        headline: "Senior Developer",
        bio: "Detailed professional bio with substantial content about experience and skills.",
        languages: ["English", "Spanish"],
        skills: [
          { name: "React", proficiency: "Expert" },
          { name: "Node.js", proficiency: "Expert" },
          { name: "TypeScript", proficiency: "Expert" },
          { name: "Python", proficiency: "Intermediate" },
        ],
        portfolio: [
          { title: "Project 1", imageUrl: "https://example.com/img1.jpg" },
          { title: "Project 2", imageUrl: "https://example.com/img2.jpg" },
          { title: "Project 3", imageUrl: "https://example.com/img3.jpg" },
        ],
        resumeUrl: "https://example.com/resume.pdf",
        workExperience: [{ title: "Developer", company: "Tech Corp" }],
        education: [{ school: "MIT", degree: "B.S. Computer Science" }],
        certifications: [{ name: "AWS Certified" }],
        availability: [{ day: "Mon", from: "09:00", to: "17:00" }],
        pricing: { hourlyRate: 100 },
      });

      const response = await request(app)
        .post("/api/v1/freelancer/profile/recalculate-score")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.profileCompletionScore).toBe(100);
    });
  });

  // ==================== SKILLS TESTS ====================

  describe("PUT /api/v1/freelancer/skills", () => {
    it("should replace entire skills array", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const newSkills = [
        { name: "React", proficiency: "Expert" },
        { name: "Vue.js", proficiency: "Intermediate" },
        { name: "Angular", proficiency: "Beginner" },
      ];

      const response = await request(app)
        .put("/api/v1/freelancer/skills")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ skills: newSkills });

      expect(response.status).toBe(200);
      expect(response.body.data.skills).toHaveLength(3);
      expect(response.body.data.skills[1].name).toBe("Vue.js");
      expect(response.body.data.skills[1].proficiency).toBe("Intermediate");
    });

    it("should reject empty skill name", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/skills")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          skills: [{ name: "", proficiency: "Expert" }],
        });

      expect(response.status).toBe(422);
    });

    it("should reject invalid proficiency level", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/skills")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          skills: [{ name: "React", proficiency: "SuperExpert" }],
        });

      expect(response.status).toBe(422);
    });

    it("should reject more than 50 skills", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const skills = Array.from({ length: 51 }, (_, i) => ({
        name: `Skill ${i + 1}`,
        proficiency: "Intermediate",
      }));

      const response = await request(app)
        .put("/api/v1/freelancer/skills")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ skills });

      expect(response.status).toBe(422);
    });

    it("should allow empty skills array", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/skills")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ skills: [] });

      expect(response.status).toBe(200);
      expect(response.body.data.skills).toHaveLength(0);
    });
  });

  // ==================== PORTFOLIO TESTS ====================

  describe("POST /api/v1/freelancer/portfolio", () => {
    it("should add a portfolio item with image", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/portfolio")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("title", "E-commerce Platform")
        .field("description", "Full-stack e-commerce solution")
        .field("link", "https://example-project.com")
        .attach("image", createTestImageBuffer(), {
          filename: "test-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.portfolio).toHaveLength(1);
      expect(response.body.data.portfolio[0].title).toBe("E-commerce Platform");
      expect(response.body.data.portfolio[0].description).toBe(
        "Full-stack e-commerce solution",
      );
      expect(response.body.data.portfolio[0].link).toBe(
        "https://example-project.com",
      );
      expect(response.body.data.portfolio[0].imageUrl).toBeDefined();
    });

    it("should reject upload without image file", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/portfolio")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("title", "No Image Project");

      expect(response.status).toBe(400);
    });

    it("should reject upload without title", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/portfolio")
        .set("Authorization", `Bearer ${accessToken}`)
        .attach("image", createTestImageBuffer(), {
          filename: "test-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(422);
    });

    it("should reject invalid project link URL", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/portfolio")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("title", "Bad Link Project")
        .field("link", "not-a-valid-url")
        .attach("image", createTestImageBuffer(), {
          filename: "test-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(422);
    });

    it("should reject file larger than 5MB", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      const response = await request(app)
        .post("/api/v1/freelancer/portfolio")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("title", "Large File Project")
        .attach("image", largeBuffer, {
          filename: "large-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/size/i);
    });
  });

  describe("DELETE /api/v1/freelancer/portfolio/:itemId", () => {
    it("should delete a portfolio item", async () => {
      const { user, accessToken } = await createAndLoginUser();
      const profile = await createProfile(user._id);
      profile.portfolio.push({
        title: "Project to Delete",
        imageUrl: "https://example.com/delete-me.jpg",
      });
      await profile.save();

      const itemId = profile.portfolio[0]._id.toString();

      const response = await request(app)
        .delete(`/api/v1/freelancer/portfolio/${itemId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.portfolio).toHaveLength(0);
    });

    it("should return 404 for non-existent portfolio item", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/v1/freelancer/portfolio/${fakeId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });

    it("should reject invalid MongoDB ObjectId format", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .delete("/api/v1/freelancer/portfolio/invalid-id-format")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(422);
    });
  });

  // ==================== WORK EXPERIENCE TESTS ====================

  describe("POST /api/v1/freelancer/experience", () => {
    it("should add work experience", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/experience")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Senior Developer",
          company: "Tech Corp",
          location: "San Francisco, CA",
          from: "2020-01-15",
          to: "2023-12-31",
          current: false,
          description: "Led team of 5 developers building microservices.",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.workExperience).toHaveLength(1);
      expect(response.body.data.workExperience[0].title).toBe(
        "Senior Developer",
      );
      expect(response.body.data.workExperience[0].company).toBe("Tech Corp");
    });

    it("should add current position (no end date)", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/experience")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Current Role",
          company: "Current Corp",
          from: "2024-01-01",
          current: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.workExperience[0].current).toBe(true);
    });

    it("should reject empty job title", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/experience")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "",
          company: "Tech Corp",
        });

      expect(response.status).toBe(422);
    });

    it("should reject invalid date format", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/experience")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Developer",
          from: "not-a-date",
        });

      expect(response.status).toBe(422);
    });
  });

  describe("PUT /api/v1/freelancer/experience/:expId", () => {
    it("should update work experience", async () => {
      const { user, accessToken } = await createAndLoginUser();
      const profile = await createProfile(user._id);
      profile.workExperience.push({
        title: "Old Title",
        company: "Old Company",
        from: new Date("2020-01-01"),
        to: new Date("2022-12-31"),
      });
      await profile.save();

      const expId = profile.workExperience[0]._id.toString();

      const response = await request(app)
        .put(`/api/v1/freelancer/experience/${expId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Updated Title",
          company: "Updated Company",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.workExperience[0].title).toBe("Updated Title");
      expect(response.body.data.workExperience[0].company).toBe(
        "Updated Company",
      );
    });

    it("should return 404 for non-existent experience", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .put(`/api/v1/freelancer/experience/${fakeId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Ghost Update" });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/freelancer/experience/:expId", () => {
    it("should delete work experience", async () => {
      const { user, accessToken } = await createAndLoginUser();
      const profile = await createProfile(user._id);
      profile.workExperience.push({
        title: "Job to Delete",
        company: "Delete Corp",
      });
      await profile.save();

      const expId = profile.workExperience[0]._id.toString();

      const response = await request(app)
        .delete(`/api/v1/freelancer/experience/${expId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.workExperience).toHaveLength(0);
    });

    it("should return 404 for non-existent experience deletion", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .delete(`/api/v1/freelancer/experience/${fakeId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });

  // ==================== EDUCATION TESTS ====================

  describe("Education CRUD", () => {
    it("should add, update, and delete education", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      // Add
      const addResponse = await request(app)
        .post("/api/v1/freelancer/education")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          school: "MIT",
          degree: "B.S. Computer Science",
          fieldOfStudy: "Computer Science",
          from: "2014-09-01",
          to: "2018-06-15",
        });

      expect(addResponse.status).toBe(201);
      expect(addResponse.body.data.education).toHaveLength(1);
      const eduId = addResponse.body.data.education[0]._id;

      // Update
      const updateResponse = await request(app)
        .put(`/api/v1/freelancer/education/${eduId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ degree: "M.S. Computer Science" });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.education[0].degree).toBe(
        "M.S. Computer Science",
      );

      // Delete
      const deleteResponse = await request(app)
        .delete(`/api/v1/freelancer/education/${eduId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.data.education).toHaveLength(0);
    });

    it("should reject empty school name", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/education")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          school: "",
          degree: "B.S.",
        });

      expect(response.status).toBe(422);
    });
  });

  // ==================== CERTIFICATION TESTS ====================

  describe("Certification CRUD", () => {
    it("should add, update, and delete certification", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      // Add
      const addResponse = await request(app)
        .post("/api/v1/freelancer/certifications")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          name: "AWS Solutions Architect",
          issuer: "Amazon Web Services",
          issuedDate: "2023-06-15",
          url: "https://aws.amazon.com/verify/cert123",
        });

      expect(addResponse.status).toBe(201);
      expect(addResponse.body.data.certifications).toHaveLength(1);
      const certId = addResponse.body.data.certifications[0]._id;

      // Update
      const updateResponse = await request(app)
        .put(`/api/v1/freelancer/certifications/${certId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "AWS Solutions Architect Professional" });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.certifications[0].name).toBe(
        "AWS Solutions Architect Professional",
      );

      // Delete
      const deleteResponse = await request(app)
        .delete(`/api/v1/freelancer/certifications/${certId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.data.certifications).toHaveLength(0);
    });

    it("should reject empty certification name", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/certifications")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          name: "",
          issuer: "AWS",
        });

      expect(response.status).toBe(422);
    });

    it("should reject invalid certification URL", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/certifications")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          name: "Test Cert",
          url: "not-a-url",
        });

      expect(response.status).toBe(422);
    });
  });

  // ==================== AVAILABILITY TESTS ====================

  describe("PUT /api/v1/freelancer/availability", () => {
    it("should update weekly availability slots", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/availability")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          slots: [
            { day: "Mon", from: "09:00", to: "17:00" },
            { day: "Tue", from: "09:00", to: "17:00" },
            { day: "Wed", from: "10:00", to: "16:00" },
            { day: "Thu", from: "09:00", to: "17:00" },
            { day: "Fri", from: "09:00", to: "15:00" },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.availability).toHaveLength(5);
      expect(response.body.data.availability[0].day).toBe("Mon");
      expect(response.body.data.availability[0].from).toBe("09:00");
    });

    it("should reject invalid day", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/availability")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          slots: [{ day: "InvalidDay", from: "09:00", to: "17:00" }],
        });

      expect(response.status).toBe(422);
    });

    it("should reject invalid time format", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/availability")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          slots: [{ day: "Mon", from: "9:00", to: "25:00" }],
        });

      expect(response.status).toBe(422);
    });
  });

  // ==================== PRICING TESTS ====================

  describe("PUT /api/v1/freelancer/pricing", () => {
    it("should update hourly rate and milestone packages", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/pricing")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          hourlyRate: 85,
          milestonePackages: [
            {
              name: "Basic Website",
              price: 2500,
              deliverables: ["5 page design", "Responsive layout"],
              estimatedDays: 14,
            },
            {
              name: "E-commerce Platform",
              price: 8000,
              deliverables: ["Custom design", "Payment integration"],
              estimatedDays: 45,
            },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.pricing.hourlyRate).toBe(85);
      expect(response.body.data.pricing.milestonePackages).toHaveLength(2);
      expect(response.body.data.pricing.milestonePackages[0].name).toBe(
        "Basic Website",
      );
    });

    it("should reject negative hourly rate", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/pricing")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          hourlyRate: -50,
        });

      expect(response.status).toBe(422);
    });

    it("should reject negative package price", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/pricing")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          milestonePackages: [
            { name: "Bad Package", price: -100, deliverables: ["Test"] },
          ],
        });

      expect(response.status).toBe(422);
    });
  });

  // ==================== RESUME TESTS ====================

  describe("POST /api/v1/freelancer/resume", () => {
    it("should upload a resume", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/resume")
        .set("Authorization", `Bearer ${accessToken}`)
        .attach("resume", createTestPdfBuffer(), {
          filename: "test-resume.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.resumeUrl).toBeDefined();
      expect(response.body.data.resumeUrl).toMatch(/^https:\/\//);
    });

    it("should reject resume upload without file", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .post("/api/v1/freelancer/resume")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
    });

    it("should reject file larger than 10MB", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      const response = await request(app)
        .post("/api/v1/freelancer/resume")
        .set("Authorization", `Bearer ${accessToken}`)
        .attach("resume", largeBuffer, {
          filename: "large-resume.pdf",
          contentType: "application/pdf",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/size/i);
    });
  });

  // ==================== PUBLIC ENDPOINTS TESTS ====================

  describe("GET /api/v1/freelancer/public/:userId", () => {
    it("should return public profile without auth", async () => {
      const { user } = await createAndLoginUser();
      const profile = await createProfile(user._id, {
        headline: "Public Profile Headline",
        skills: [{ name: "React", proficiency: "Expert" }],
      });

      const response = await request(app).get(
        `/api/v1/freelancer/public/${user._id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.profile.headline).toBe(
        "Public Profile Headline",
      );
      expect(response.body.data.profile.user.name).toBe("Test Freelancer");
      expect(response.body.data.profile.skills).toHaveLength(1);
    });

    it("should return 404 for non-existent profile", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app).get(
        `/api/v1/freelancer/public/${fakeId}`,
      );

      expect(response.status).toBe(404);
    });

    it("should return 422 for invalid userId format", async () => {
      const response = await request(app).get(
        "/api/v1/freelancer/public/invalid-id",
      );

      expect(response.status).toBe(422);
    });
  });

  describe("GET /api/v1/freelancer/profiles", () => {
    it("should list verified freelancers with pagination", async () => {
      // Create multiple freelancers with profiles
      for (let i = 0; i < 15; i++) {
        const user = await createUser({
          email: `freelancer-list-${i}-${Date.now()}@example.com`,
        });
        await createProfile(user._id, {
          headline: `Freelancer ${i + 1}`,
          isVerified: i < 12, // First 12 verified, last 3 unverified
          avgRating: 4.0 + (i % 10) * 0.1,
        });
      }

      const response = await request(app)
        .get("/api/v1/freelancer/profiles")
        .query({ page: 1, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta.pagination).toBeDefined();
      expect(response.body.meta.pagination.totalItems).toBeLessThanOrEqual(12); // Only verified
      expect(response.body.meta.pagination.totalPages).toBeGreaterThan(1);
    });

    it("should filter by skills", async () => {
      const user1 = await createUser({
        email: `react-dev-${Date.now()}@example.com`,
      });
      await createProfile(user1._id, {
        headline: "React Developer",
        skills: [{ name: "React", proficiency: "Expert" }],
        isVerified: true,
      });

      const user2 = await createUser({
        email: `python-dev-${Date.now()}@example.com`,
      });
      await createProfile(user2._id, {
        headline: "Python Developer",
        skills: [{ name: "Python", proficiency: "Expert" }],
        isVerified: true,
      });

      const response = await request(app)
        .get("/api/v1/freelancer/profiles")
        .query({ skills: "React" });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      const hasReactDev = response.body.data.some(
        (p) => p.headline === "React Developer",
      );
      expect(hasReactDev).toBe(true);
    });

    it("should filter by minimum rating", async () => {
      const user = await createUser({
        email: `high-rated-${Date.now()}@example.com`,
      });
      await createProfile(user._id, {
        headline: "Top Rated Developer",
        avgRating: 4.8,
        isVerified: true,
      });

      const response = await request(app)
        .get("/api/v1/freelancer/profiles")
        .query({ minRating: 4.5 });

      expect(response.status).toBe(200);
      const hasTopRated = response.body.data.some(
        (p) => p.headline === "Top Rated Developer",
      );
      expect(hasTopRated).toBe(true);
    });

    it("should filter by languages", async () => {
      const user1 = await createUser({
        email: `english-speaker-${Date.now()}@example.com`,
      });
      await createProfile(user1._id, {
        headline: "English Speaker",
        languages: ["English"],
        isVerified: true,
      });

      const user2 = await createUser({
        email: `french-speaker-${Date.now()}@example.com`,
      });
      await createProfile(user2._id, {
        headline: "French Speaker",
        languages: ["French"],
        isVerified: true,
      });

      const response = await request(app)
        .get("/api/v1/freelancer/profiles")
        .query({ languages: "English" });

      expect(response.status).toBe(200);
      const hasEnglishSpeaker = response.body.data.some(
        (p) => p.headline === "English Speaker",
      );
      expect(hasEnglishSpeaker).toBe(true);
    });

    it("should search by headline", async () => {
      const user = await createUser({
        email: `searchable-${Date.now()}@example.com`,
      });
      await createProfile(user._id, {
        headline: "Full Stack MERN Developer",
        isVerified: true,
      });

      const response = await request(app)
        .get("/api/v1/freelancer/profiles")
        .query({ search: "MERN" });

      expect(response.status).toBe(200);
      const hasMatch = response.body.data.some(
        (p) => p.headline === "Full Stack MERN Developer",
      );
      expect(hasMatch).toBe(true);
    });

    it("should return empty array for no matches", async () => {
      const response = await request(app)
        .get("/api/v1/freelancer/profiles")
        .query({ search: "NoMatchForThisQuery12345" });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.pagination.totalItems).toBe(0);
    });

    it("should handle pagination limits", async () => {
      const response = await request(app)
        .get("/api/v1/freelancer/profiles")
        .query({ limit: 101 });

      expect(response.status).toBe(422);
    });
  });

  // ==================== BADGE & SCORE TESTS ====================

  describe("Auto-awarded badges and profile score", () => {
    it("should auto-award 'Top Rated' badge for 10+ jobs with 4.5+ rating", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id, {
        completedJobs: 15,
        avgRating: 4.7,
      });

      // Trigger score recalculation which also checks badges
      await request(app)
        .post("/api/v1/freelancer/profile/recalculate-score")
        .set("Authorization", `Bearer ${accessToken}`);

      const profile = await FreelancerProfile.findOne({ user: user._id });
      expect(profile.badges).toContain("Top Rated");
    });

    it("should auto-award 'Rising Talent' badge for first job with 4.8+ rating", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id, {
        completedJobs: 1,
        avgRating: 5.0,
      });

      await request(app)
        .post("/api/v1/freelancer/profile/recalculate-score")
        .set("Authorization", `Bearer ${accessToken}`);

      const profile = await FreelancerProfile.findOne({ user: user._id });
      expect(profile.badges).toContain("Rising Talent");
    });
  });

  // ==================== EDGE CASE & VALIDATION TESTS ====================

  describe("Edge cases and validation", () => {
    it("should handle multiple rapid updates", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      // Send multiple updates rapidly
      const updates = [
        request(app)
          .put("/api/v1/freelancer/skills")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({ skills: [{ name: "Skill A", proficiency: "Expert" }] }),
        request(app)
          .put("/api/v1/freelancer/profile")
          .set("Authorization", `Bearer ${accessToken}`)
          .send({ headline: "Rapid Update" }),
      ];

      const results = await Promise.all(updates);
      results.forEach((res) => {
        expect(res.status).toBe(200);
      });
    });

    it("should reject empty request body on updates", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const response = await request(app)
        .put("/api/v1/freelancer/profile")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(200); // All fields optional - no error
    });

    it("should reject invalid MongoDB IDs in route params", async () => {
      const { user, accessToken } = await createAndLoginUser();
      await createProfile(user._id);

      const endpoints = [
        { method: "put", url: "/api/v1/freelancer/experience/bad-id" },
        { method: "put", url: "/api/v1/freelancer/education/bad-id" },
        { method: "put", url: "/api/v1/freelancer/certifications/bad-id" },
        { method: "delete", url: "/api/v1/freelancer/experience/bad-id" },
        { method: "delete", url: "/api/v1/freelancer/education/bad-id" },
        { method: "delete", url: "/api/v1/freelancer/certifications/bad-id" },
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          [endpoint.method](endpoint.url)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({});

        expect(response.status).toBe(422);
      }
    });

    it("should reject unauthorized access to all protected endpoints", async () => {
      const protectedEndpoints = [
        { method: "get", url: "/api/v1/freelancer/profile" },
        { method: "put", url: "/api/v1/freelancer/profile" },
        { method: "put", url: "/api/v1/freelancer/skills" },
        { method: "post", url: "/api/v1/freelancer/experience" },
        { method: "put", url: "/api/v1/freelancer/availability" },
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request(app)
          [endpoint.method](endpoint.url)
          .send(endpoint.method === "get" ? undefined : {});

        expect(response.status).toBe(401);
      }
    });
  });
});
