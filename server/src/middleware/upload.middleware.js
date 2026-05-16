import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { BadRequestError } from "../utils/api-error.js";

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_PORTFOLIO_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const ALLOWED_RESUME_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// ── Portfolio storage (Cloudinary) ────────────────────────────────────────────
const portfolioStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const base = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension

    return {
      folder: "skillsphere/portfolio",
      resource_type: "image",
      public_id: `portfolio-${Date.now()}-${base}`,
      transformation: [
        { width: 1200, height: 800, crop: "limit", quality: "auto" },
      ],
    };
  },
});

// ── Resume storage (Cloudinary) ───────────────────────────────────────────────
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const base = file.originalname;

    // Determine resource type based on mime
    let resourceType = "raw";
    if (file.mimetype === "application/pdf") {
      resourceType = "image"; // PDFs can be image type for preview
    }

    return {
      folder: "skillsphere/resumes",
      resource_type: resourceType,
      public_id: `resume-${Date.now()}-${base}`,
    };
  },
});

// ── File filters ──────────────────────────────────────────────────────────────
function portfolioFileFilter(_req, file, cb) {
  if (ALLOWED_PORTFOLIO_MIME.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new BadRequestError(
      "Only image files are allowed for portfolio (jpeg/png/webp/gif/svg)",
    ),
    false,
  );
}

function resumeFileFilter(_req, file, cb) {
  if (ALLOWED_RESUME_MIME.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new BadRequestError(
      "Only PDF and Word documents are allowed for resume (pdf/doc/docx)",
    ),
    false,
  );
}

// ── Exported multer instances ─────────────────────────────────────────────────
export const uploadPortfolioImage = multer({
  storage: portfolioStorage,
  fileFilter: portfolioFileFilter,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: {
    files: 1,
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// ── Error handler for multer errors ───────────────────────────────────────────
export const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      throw new BadRequestError(
        `File size exceeds the ${err.field === "resume" ? "10MB" : "5MB"} limit`,
        [
          {
            field: err.field,
            message: `Maximum file size is ${err.field === "resume" ? "10MB" : "5MB"}`,
          },
        ],
      );
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      throw new BadRequestError("Too many files uploaded", [
        {
          field: err.field,
          message: "Only 1 file allowed at a time",
        },
      ]);
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      throw new BadRequestError(`Unexpected file field: ${err.field}`, [
        {
          field: err.field,
          message: `Unexpected field: ${err.field}`,
        },
      ]);
    }
  }

  // For custom file filter errors
  if (err instanceof BadRequestError) {
    throw err;
  }

  next(err);
};

// ── Default export for backward compatibility ─────────────────────────────────
// If you had routes importing default, they'll still work
export default {
  portfolio: uploadPortfolioImage,
  resume: uploadResume,
};
