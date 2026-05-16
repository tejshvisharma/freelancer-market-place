import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  updateProfileValidation,
  updateSkillsValidation,
  addPortfolioItemValidation,
  deletePortfolioItemValidation,
  addWorkExperienceValidation,
  updateWorkExperienceValidation,
  deleteWorkExperienceValidation,
  addEducationValidation,
  updateEducationValidation,
  deleteEducationValidation,
  addCertificationValidation,
  updateCertificationValidation,
  deleteCertificationValidation,
  updateAvailabilityValidation,
  updatePricingValidation,
  getPublicProfileValidation,
  listProfilesValidation,
} from "../validators/freelancer.validators.js";
import {
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
} from "../controllers/freelancerController.js";
import {
  uploadPortfolioImage,
  uploadResume as uploadResumeFile,
  uploadErrorHandler,
} from "../middleware/upload.middleware.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// These are placed BEFORE the protect middleware

// List/search freelancers
router.get("/profiles", validate(listProfilesValidation), listProfiles);

// View public profile
router.get(
  "/public/:userId",
  validate(getPublicProfileValidation),
  getPublicProfile,
);

// ==================== PROTECTED ROUTES ====================
// All routes below require authentication + freelancer role

router.use(protect);
router.use(authorize("freelancer"));

// Profile CRUD
router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileValidation), updateProfile);
router.post("/profile/recalculate-score", recalculateProfileScore);

// Skills
router.put("/skills", validate(updateSkillsValidation), updateSkills);

// Portfolio (with Cloudinary upload via multer-storage-cloudinary)
router.post(
  "/portfolio",
  uploadPortfolioImage.single("image"),
  uploadErrorHandler,
  validate(addPortfolioItemValidation),
  addPortfolioItem,
);
router.delete(
  "/portfolio/:itemId",
  validate(deletePortfolioItemValidation),
  deletePortfolioItem,
);

// Work Experience
router.post(
  "/experience",
  validate(addWorkExperienceValidation),
  addWorkExperience,
);
router.put(
  "/experience/:expId",
  validate(updateWorkExperienceValidation),
  updateWorkExperience,
);
router.delete(
  "/experience/:expId",
  validate(deleteWorkExperienceValidation),
  deleteWorkExperience,
);

// Education
router.post("/education", validate(addEducationValidation), addEducation);
router.put(
  "/education/:eduId",
  validate(updateEducationValidation),
  updateEducation,
);
router.delete(
  "/education/:eduId",
  validate(deleteEducationValidation),
  deleteEducation,
);

// Certifications
router.post(
  "/certifications",
  validate(addCertificationValidation),
  addCertification,
);
router.put(
  "/certifications/:certId",
  validate(updateCertificationValidation),
  updateCertification,
);
router.delete(
  "/certifications/:certId",
  validate(deleteCertificationValidation),
  deleteCertification,
);

// Availability
router.put(
  "/availability",
  validate(updateAvailabilityValidation),
  updateAvailability,
);

// Pricing
router.put("/pricing", validate(updatePricingValidation), updatePricing);

// Resume (with Cloudinary upload via multer-storage-cloudinary)
router.post(
  "/resume",
  uploadResumeFile.single("resume"),
  uploadErrorHandler,
  uploadResume,
);

export default router;
