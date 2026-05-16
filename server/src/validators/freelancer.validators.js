import { body, param, query } from "express-validator";

// Reusable skill validation
const skillValidation = {
  name: body("skills.*.name")
    .trim()
    .notEmpty()
    .withMessage("Skill name is required")
    .isLength({ max: 100 })
    .withMessage("Skill name too long"),
  proficiency: body("skills.*.proficiency")
    .optional()
    .isIn(["Beginner", "Intermediate", "Expert"])
    .withMessage("Proficiency must be Beginner, Intermediate, or Expert"),
};

// Update headline and professional summary
export const updateProfileValidation = [
  body("headline")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Headline must be under 200 characters"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Bio must be under 1000 characters"),
  body("languages")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Languages must be an array"),
  body("languages.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each language must be 1-50 characters"),
];

// Skills array validation
export const updateSkillsValidation = [
  body("skills")
    .isArray({ min: 0, max: 50 })
    .withMessage("Skills must be an array (max 50)"),
  body("skills.*.name")
    .trim()
    .notEmpty()
    .withMessage("Skill name is required")
    .isLength({ max: 100 })
    .withMessage("Skill name too long"),
  body("skills.*.proficiency")
    .optional()
    .isIn(["Beginner", "Intermediate", "Expert", "Advanced"])
    .withMessage("Invalid proficiency level"),
];

// Portfolio item validation
export const addPortfolioItemValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Portfolio title is required")
    .isLength({ max: 200 })
    .withMessage("Title too long"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description too long"),
  body("link")
    .optional()
    .trim()
    .isURL()
    .withMessage("Invalid project link URL"),
];

export const deletePortfolioItemValidation = [
  param("itemId").isMongoId().withMessage("Invalid portfolio item ID"),
];

// Work experience validation
export const addWorkExperienceValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required")
    .isLength({ max: 150 })
    .withMessage("Title too long"),
  body("company")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Company name too long"),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Location too long"),
  body("from").optional().isISO8601().withMessage("Invalid start date"),
  body("to").optional().isISO8601().withMessage("Invalid end date"),
  body("current")
    .optional()
    .isBoolean()
    .withMessage("Current must be true/false"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description too long"),
];

export const updateWorkExperienceValidation = [
  param("expId").isMongoId().withMessage("Invalid experience ID"),
  body("title").optional().trim().isLength({ max: 150 }),
  body("company").optional().trim().isLength({ max: 150 }),
  body("location").optional().trim().isLength({ max: 150 }),
  body("from").optional().isISO8601(),
  body("to").optional().isISO8601(),
  body("current").optional().isBoolean(),
  body("description").optional().trim().isLength({ max: 500 }),
];

export const deleteWorkExperienceValidation = [
  param("expId").isMongoId().withMessage("Invalid experience ID"),
];

// Education validation
export const addEducationValidation = [
  body("school")
    .trim()
    .notEmpty()
    .withMessage("School name is required")
    .isLength({ max: 200 })
    .withMessage("School name too long"),
  body("degree")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Degree too long"),
  body("fieldOfStudy")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Field of study too long"),
  body("from").optional().isISO8601().withMessage("Invalid start date"),
  body("to").optional().isISO8601().withMessage("Invalid end date"),
  body("current").optional().isBoolean(),
];

export const updateEducationValidation = [
  param("eduId").isMongoId().withMessage("Invalid education ID"),
  body("school").optional().trim().isLength({ max: 200 }),
  body("degree").optional().trim().isLength({ max: 150 }),
  body("fieldOfStudy").optional().trim().isLength({ max: 150 }),
  body("from").optional().isISO8601(),
  body("to").optional().isISO8601(),
  body("current").optional().isBoolean(),
];

export const deleteEducationValidation = [
  param("eduId").isMongoId().withMessage("Invalid education ID"),
];

// Certification validation
export const addCertificationValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Certification name is required")
    .isLength({ max: 200 })
    .withMessage("Name too long"),
  body("issuer")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Issuer name too long"),
  body("issuedDate").optional().isISO8601().withMessage("Invalid issue date"),
  body("url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Invalid certification URL"),
];

export const updateCertificationValidation = [
  param("certId").isMongoId().withMessage("Invalid certification ID"),
  body("name").optional().trim().isLength({ max: 200 }),
  body("issuer").optional().trim().isLength({ max: 200 }),
  body("issuedDate").optional().isISO8601(),
  body("url").optional().trim().isURL(),
];

export const deleteCertificationValidation = [
  param("certId").isMongoId().withMessage("Invalid certification ID"),
];

// Availability validation
export const updateAvailabilityValidation = [
  body("slots")
    .isArray({ min: 0, max: 56 })
    .withMessage("Availability must be an array (max 56 slots)"),
  body("slots.*.day")
    .isIn(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
    .withMessage("Invalid day"),
  body("slots.*.from")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Invalid start time (HH:mm format)"),
  body("slots.*.to")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Invalid end time (HH:mm format)"),
];

// Pricing validation
export const updatePricingValidation = [
  body("hourlyRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Hourly rate must be a positive number"),
  body("milestonePackages")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Max 10 milestone packages"),
  body("milestonePackages.*.name")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Package name too long"),
  body("milestonePackages.*.price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("milestonePackages.*.deliverables").optional().isArray({ max: 20 }),
  body("milestonePackages.*.deliverables.*")
    .optional()
    .trim()
    .isLength({ max: 200 }),
  body("milestonePackages.*.estimatedDays")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Estimated days must be at least 1"),
];

// Resume upload validation
export const uploadResumeValidation = [
  // File validation handled by multer middleware
];

// Query params for public profiles
export const getPublicProfileValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID"),
];

// Pagination for public profiles listing
export const listProfilesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("skills").optional().trim(),
  query("minRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be 0-5"),
  query("languages").optional().trim(),
  query("search").optional().trim().isLength({ max: 200 }),
];

// Profile completion score calculation validation (just validate the ID)
export const recalculateProfileScoreValidation = [
  // No body needed - just ensure authenticated freelancer
];
