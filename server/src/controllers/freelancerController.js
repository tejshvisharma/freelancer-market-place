import { asyncHandler } from "../utils/async-handler.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/api-error.js";
import {
  successResponse,
  createdResponse,
  paginatedResponse,
} from "../utils/api-response.js";
import {
  parsePaginationParams,
  createPaginationMeta,
} from "../utils/pagination.js";
import FreelancerProfile from "../models/FreelancerProfile.js";
import cloudinary from "../config/cloudinary.js";

// ==================== HELPERS ====================

/**
 * Get freelancer profile or throw 404
 */
const getProfileOrFail = async (userId) => {
  const profile = await FreelancerProfile.findOne({ user: userId });
  if (!profile) {
    throw new NotFoundError("Freelancer profile not found");
  }
  return profile;
};

/**
 * Calculate profile completion score (0-100)
 */
const calculateProfileScore = (profile) => {
  let score = 0;

  // Basic info (25 points)
  if (profile.headline) score += 8;
  if (profile.bio) score += 10;
  if (profile.languages && profile.languages.length > 0) score += 7;

  // Skills (20 points)
  if (profile.skills && profile.skills.length >= 3) score += 20;
  else if (profile.skills && profile.skills.length > 0) score += 10;

  // Portfolio (15 points)
  if (profile.portfolio && profile.portfolio.length >= 3) score += 15;
  else if (profile.portfolio && profile.portfolio.length > 0) score += 8;

  // Resume (10 points)
  if (profile.resumeUrl) score += 10;

  // Work experience (10 points)
  if (profile.workExperience && profile.workExperience.length > 0) score += 10;

  // Education (5 points)
  if (profile.education && profile.education.length > 0) score += 5;

  // Certifications (5 points)
  if (profile.certifications && profile.certifications.length > 0) score += 5;

  // Availability (5 points)
  if (profile.availability && profile.availability.length > 0) score += 5;

  // Pricing (5 points)
  if (profile.pricing?.hourlyRate > 0) score += 5;

  return Math.min(100, score);
};

/**
 * Update profile score and auto-award badges
 */
const updateProfileScore = async (profile) => {
  const score = calculateProfileScore(profile);
  profile.profileCompletionScore = score;

  // Auto-award badges based on stats
  if (profile.completedJobs >= 10 && profile.avgRating >= 4.5) {
    if (!profile.badges.includes("Top Rated")) {
      profile.badges.push("Top Rated");
    }
  }

  if (profile.completedJobs >= 1 && profile.avgRating >= 4.8) {
    if (!profile.badges.includes("Rising Talent")) {
      profile.badges.push("Rising Talent");
    }
  }

  await profile.save({ validateBeforeSave: false });
  return profile;
};

// ==================== PROFILE CRUD ====================

/**
 * @desc    Get current freelancer's profile
 * @route   GET /api/v1/freelancer/profile
 * @access  Private (freelancer)
 */
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  let profile = await FreelancerProfile.findOne({ user: userId }).populate(
    "user",
    "name email avatar phone location bio",
  );

  // Auto-create profile if it doesn't exist
  if (!profile) {
    profile = await FreelancerProfile.create({ user: userId });
    profile = await FreelancerProfile.findOne({ user: userId }).populate(
      "user",
      "name email avatar phone location bio",
    );
  }

  return successResponse(res, "Profile retrieved successfully", {
    profile,
  });
});

/**
 * @desc    Update profile headline, bio, languages
 * @route   PUT /api/v1/freelancer/profile
 * @access  Private (freelancer)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const { headline, bio, languages } = req.body;

  if (headline !== undefined) profile.headline = headline;
  if (bio !== undefined) profile.bio = bio;
  if (languages !== undefined) profile.languages = languages;

  await updateProfileScore(profile);

  const updatedProfile = await FreelancerProfile.findOne({
    user: userId,
  }).populate("user", "name email avatar phone location bio");

  return successResponse(res, "Profile updated successfully", {
    profile: updatedProfile,
  });
});

/**
 * @desc    Update skills array
 * @route   PUT /api/v1/freelancer/skills
 * @access  Private (freelancer)
 */
const updateSkills = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const { skills } = req.body;
  profile.skills = skills;

  await updateProfileScore(profile);

  return successResponse(res, "Skills updated successfully", {
    skills: profile.skills,
  });
});

// ==================== PORTFOLIO ====================

/**
 * @desc    Add portfolio item with image upload
 * @route   POST /api/v1/freelancer/portfolio
 * @access  Private (freelancer)
 */
const addPortfolioItem = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);
  
  if (!req.file) {
    throw new BadRequestError("Portfolio image is required");
  }
  
  // With multer-storage-cloudinary, file is already uploaded to Cloudinary
  // req.file contains the Cloudinary response
  const { title, description, link } = req.body;
  
  profile.portfolio.push({
    title,
    description,
    imageUrl: req.file.path, // Cloudinary secure_url
    link,
  });
  
  await updateProfileScore(profile);
  
  return createdResponse(res, "Portfolio item added", {
    portfolio: profile.portfolio,
  });
});

/**
 * @desc    Delete portfolio item
 * @route   DELETE /api/v1/freelancer/portfolio/:itemId
 * @access  Private (freelancer)
 */
const deletePortfolioItem = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const itemId = req.params.itemId;
  const item = profile.portfolio.id(itemId);

  if (!item) {
    throw new NotFoundError("Portfolio item not found");
  }

  // Delete from Cloudinary
  if (item.imageUrl) {
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = item.imageUrl.split("/");
      const uploadIndex = urlParts.indexOf("upload");
      if (uploadIndex !== -1) {
        // Get everything after /upload/ including the folder
        const publicIdWithVersion = urlParts.slice(uploadIndex + 2).join("/");
        const publicId = publicIdWithVersion.replace(/\.[^/.]+$/, ""); // Remove extension
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      // Log but don't fail if Cloudinary delete fails
      console.error("Cloudinary delete failed:", error.message);
    }
  }

  profile.portfolio.pull({ _id: itemId });
  await updateProfileScore(profile);

  return successResponse(res, "Portfolio item removed", {
    portfolio: profile.portfolio,
  });
});

// ==================== WORK EXPERIENCE ====================

/**
 * @desc    Add work experience
 * @route   POST /api/v1/freelancer/experience
 * @access  Private (freelancer)
 */
const addWorkExperience = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  profile.workExperience.push(req.body);
  await updateProfileScore(profile);

  return createdResponse(res, "Experience added", {
    workExperience: profile.workExperience,
  });
});

/**
 * @desc    Update work experience
 * @route   PUT /api/v1/freelancer/experience/:expId
 * @access  Private (freelancer)
 */
const updateWorkExperience = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const exp = profile.workExperience.id(req.params.expId);
  if (!exp) {
    throw new NotFoundError("Experience entry not found");
  }

  // Update only provided fields
  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      exp[key] = req.body[key];
    }
  });

  await updateProfileScore(profile);

  return successResponse(res, "Experience updated", {
    workExperience: profile.workExperience,
  });
});

/**
 * @desc    Delete work experience
 * @route   DELETE /api/v1/freelancer/experience/:expId
 * @access  Private (freelancer)
 */
const deleteWorkExperience = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const exp = profile.workExperience.id(req.params.expId);
  if (!exp) {
    throw new NotFoundError("Experience entry not found");
  }

  profile.workExperience.pull({ _id: req.params.expId });
  await updateProfileScore(profile);

  return successResponse(res, "Experience removed", {
    workExperience: profile.workExperience,
  });
});

// ==================== EDUCATION ====================

/**
 * @desc    Add education
 * @route   POST /api/v1/freelancer/education
 * @access  Private (freelancer)
 */
const addEducation = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  profile.education.push(req.body);
  await updateProfileScore(profile);

  return createdResponse(res, "Education added", {
    education: profile.education,
  });
});

/**
 * @desc    Update education
 * @route   PUT /api/v1/freelancer/education/:eduId
 * @access  Private (freelancer)
 */
const updateEducation = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const edu = profile.education.id(req.params.eduId);
  if (!edu) {
    throw new NotFoundError("Education entry not found");
  }

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      edu[key] = req.body[key];
    }
  });

  await updateProfileScore(profile);

  return successResponse(res, "Education updated", {
    education: profile.education,
  });
});

/**
 * @desc    Delete education
 * @route   DELETE /api/v1/freelancer/education/:eduId
 * @access  Private (freelancer)
 */
const deleteEducation = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const edu = profile.education.id(req.params.eduId);
  if (!edu) {
    throw new NotFoundError("Education entry not found");
  }

  profile.education.pull({ _id: req.params.eduId });
  await updateProfileScore(profile);

  return successResponse(res, "Education removed", {
    education: profile.education,
  });
});

// ==================== CERTIFICATIONS ====================

/**
 * @desc    Add certification
 * @route   POST /api/v1/freelancer/certifications
 * @access  Private (freelancer)
 */
const addCertification = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  profile.certifications.push(req.body);
  await updateProfileScore(profile);

  return createdResponse(res, "Certification added", {
    certifications: profile.certifications,
  });
});

/**
 * @desc    Update certification
 * @route   PUT /api/v1/freelancer/certifications/:certId
 * @access  Private (freelancer)
 */
const updateCertification = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const cert = profile.certifications.id(req.params.certId);
  if (!cert) {
    throw new NotFoundError("Certification not found");
  }

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      cert[key] = req.body[key];
    }
  });

  await updateProfileScore(profile);

  return successResponse(res, "Certification updated", {
    certifications: profile.certifications,
  });
});

/**
 * @desc    Delete certification
 * @route   DELETE /api/v1/freelancer/certifications/:certId
 * @access  Private (freelancer)
 */
const deleteCertification = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const cert = profile.certifications.id(req.params.certId);
  if (!cert) {
    throw new NotFoundError("Certification not found");
  }

  profile.certifications.pull({ _id: req.params.certId });
  await updateProfileScore(profile);

  return successResponse(res, "Certification removed", {
    certifications: profile.certifications,
  });
});

// ==================== AVAILABILITY & PRICING ====================

/**
 * @desc    Update availability slots
 * @route   PUT /api/v1/freelancer/availability
 * @access  Private (freelancer)
 */
const updateAvailability = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const { slots } = req.body;
  profile.availability = slots;

  await updateProfileScore(profile);

  return successResponse(res, "Availability updated", {
    availability: profile.availability,
  });
});

/**
 * @desc    Update pricing
 * @route   PUT /api/v1/freelancer/pricing
 * @access  Private (freelancer)
 */
const updatePricing = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const { hourlyRate, milestonePackages } = req.body;

  if (hourlyRate !== undefined) {
    profile.pricing.hourlyRate = hourlyRate;
  }

  if (milestonePackages !== undefined) {
    profile.pricing.milestonePackages = milestonePackages;
  }

  await updateProfileScore(profile);

  return successResponse(res, "Pricing updated", {
    pricing: profile.pricing,
  });
});

// ==================== RESUME UPLOAD ====================

/**
 * @desc    Upload resume
 * @route   POST /api/v1/freelancer/resume
 * @access  Private (freelancer)
 */
const uploadResume = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);
  
  if (!req.file) {
    throw new BadRequestError("Resume file is required");
  }
  
  // With multer-storage-cloudinary, file is already uploaded to Cloudinary
  // req.file.path contains the Cloudinary secure_url
  profile.resumeUrl = req.file.path;
  await updateProfileScore(profile);
  
  return successResponse(res, "Resume uploaded successfully", {
    resumeUrl: profile.resumeUrl,
  });
});

// ==================== PUBLIC ENDPOINTS ====================

/**
 * @desc    Get public freelancer profile
 * @route   GET /api/v1/freelancer/public/:userId
 * @access  Public
 */
const getPublicProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const profile = await FreelancerProfile.findOne({ user: userId }).populate(
    "user",
    "name email avatar location",
  );

  if (!profile) {
    throw new NotFoundError("Freelancer profile not found");
  }

  // Sanitize - don't expose resume URL if not needed publicly
  // (keep resumeUrl but you might want to restrict in production)

  return successResponse(res, "Profile retrieved", {
    profile,
  });
});

/**
 * @desc    List public freelancer profiles with filters
 * @route   GET /api/v1/freelancer/profiles
 * @access  Public
 */
const listProfiles = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaginationParams(req.query, 12, 50);

  const filter = { isVerified: true }; // Only show verified profiles publicly

  // Skill filter
  if (req.query.skills) {
    const skills = req.query.skills.split(",").map((s) => s.trim());
    filter["skills.name"] = { $in: skills };
  }

  // Rating filter
  if (req.query.minRating) {
    filter.avgRating = { $gte: parseFloat(req.query.minRating) };
  }

  // Language filter
  if (req.query.languages) {
    const languages = req.query.languages.split(",").map((l) => l.trim());
    filter.languages = { $in: languages };
  }

  // Search by name or headline
  if (req.query.search) {
    filter.$or = [{ headline: { $regex: req.query.search, $options: "i" } }];
  }

  const [profiles, total] = await Promise.all([
    FreelancerProfile.find(filter)
      .populate("user", "name email avatar location")
      .sort({ avgRating: -1, completedJobs: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FreelancerProfile.countDocuments(filter),
  ]);

  const pagination = createPaginationMeta(page, limit, total);

  return paginatedResponse(res, "Profiles retrieved", profiles, pagination);
});

/**
 * @desc    Recalculate and return profile completion score
 * @route   POST /api/v1/freelancer/profile/recalculate-score
 * @access  Private (freelancer)
 */
const recalculateProfileScore = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const profile = await getProfileOrFail(userId);

  const score = calculateProfileScore(profile);
  profile.profileCompletionScore = score;
  await profile.save({ validateBeforeSave: false });

  return successResponse(res, "Score recalculated", {
    profileCompletionScore: score,
  });
});

export {
  getProfile,
  updateProfile,
  updateSkills,
  addPortfolioItem,
  deletePortfolioItem,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addCertification,
  updateCertification,
  deleteCertification,
  updateAvailability,
  updatePricing,
  uploadResume,
  getPublicProfile,
  listProfiles,
  recalculateProfileScore,
};
