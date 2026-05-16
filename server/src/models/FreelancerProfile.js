import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  proficiency: {
    type: String,
    enum: ["Beginner", "Intermediate", "Expert"],
    default: "Intermediate",
  },
});

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  imageUrl: { type: String, required: true }, // Cloudinary URL
  link: String, // optional live project link
});

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  from: Date,
  to: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  fieldOfStudy: String,
  from: Date,
  to: Date,
  current: { type: Boolean, default: false },
});

const certificationSchema = new mongoose.Schema({
  name: String,
  issuer: String,
  issuedDate: Date,
  url: String,
});

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    required: true,
  },
  from: { type: String, required: true }, // '09:00'
  to: { type: String, required: true }, // '17:00'
});

const pricingSchema = new mongoose.Schema({
  hourlyRate: { type: Number, min: 0 },
  milestonePackages: [
    {
      name: String,
      price: Number,
      deliverables: [String],
      estimatedDays: Number,
    },
  ],
});

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── Professional identity ─────────────────────────────────────────────
    headline: { type: String, maxlength: 200, trim: true },
    // e.g. "Full Stack React Developer with 5 years experience"

    bio: { type: String, maxlength: 1000, trim: true },
    // professional summary — separate from the generic bio on User model

    languages: [{ type: String, trim: true }],
    // e.g. ["English", "Hindi"] — useful for hyperlocal matching

    // ── Core profile sections ─────────────────────────────────────────────
    skills: [skillSchema],
    portfolio: [portfolioItemSchema],
    workExperience: [experienceSchema],
    education: [educationSchema],
    certifications: [certificationSchema],

    // ── Files ─────────────────────────────────────────────────────────────
    resumeUrl: { type: String }, // Cloudinary secure_url

    // ── Scheduling & pricing ──────────────────────────────────────────────
    availability: [availabilitySlotSchema],
    pricing: pricingSchema,

    // ── Platform stats (denormalized for performance) ─────────────────────
    // Updated when a gig completes or a review is submitted
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },

    // ── Verification & badges ─────────────────────────────────────────────
    isVerified: { type: Boolean, default: false }, // admin-verified identity
    badges: [
      {
        type: String,
        enum: ["Top Rated", "Rising Talent", "Expert Verified"],
      },
    ],
    // badges assigned by admin or auto-awarded based on platform stats

    // ── Profile health ────────────────────────────────────────────────────
    profileCompletionScore: { type: Number, default: 0, min: 0, max: 100 },
    // computed and stored on every profile update — drives "complete profile" nudge
  },
  { timestamps: true },
);

export default mongoose.model("FreelancerProfile", freelancerProfileSchema);
