import { z } from "zod";

// ── Basic Info ──────────────────────────────────────────────────────────────
export const basicInfoSchema = z.object({
  headline: z.string().max(200, "Max 200 characters").optional().or(z.literal("")),
  bio: z.string().max(1000, "Max 1000 characters").optional().or(z.literal("")),
  languages: z.array(z.string().max(50)).max(20, "Max 20 languages"),
});

// ── Skills ──────────────────────────────────────────────────────────────────
export const skillItemSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(100, "Max 100 characters").trim(),
  proficiency: z.enum(["Beginner", "Intermediate", "Expert"]).default("Intermediate"),
});

export const updateSkillsSchema = z.object({
  skills: z.array(skillItemSchema).max(50, "Max 50 skills"),
});

// ── Portfolio ────────────────────────────────────────────────────────────────
// Portfolio uses FormData (multipart) — only validate the metadata fields
export const portfolioItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Max 200 characters"),
  description: z.string().max(500, "Max 500 characters").optional().or(z.literal("")),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// ── Work Experience ──────────────────────────────────────────────────────────
export const workExperienceSchema = z.object({
  title: z.string().min(1, "Job title is required").max(150, "Max 150 characters"),
  company: z.string().max(150, "Max 150 characters").optional().or(z.literal("")),
  location: z.string().max(150, "Max 150 characters").optional().or(z.literal("")),
  from: z.string().optional().or(z.literal("")),
  to: z.string().optional().or(z.literal("")),
  current: z.boolean().default(false),
  description: z.string().max(500, "Max 500 characters").optional().or(z.literal("")),
}).refine(
  (d) => d.current || d.to || !d.from,
  { message: "End date is required unless this is your current role", path: ["to"] }
);

// ── Education ────────────────────────────────────────────────────────────────
export const educationSchema = z.object({
  school: z.string().min(1, "School name is required").max(200, "Max 200 characters"),
  degree: z.string().max(150, "Max 150 characters").optional().or(z.literal("")),
  fieldOfStudy: z.string().max(150, "Max 150 characters").optional().or(z.literal("")),
  from: z.string().optional().or(z.literal("")),
  to: z.string().optional().or(z.literal("")),
  current: z.boolean().default(false),
});

// ── Certifications ───────────────────────────────────────────────────────────
export const certificationSchema = z.object({
  name: z.string().min(1, "Certification name is required").max(200, "Max 200 characters"),
  issuer: z.string().max(200, "Max 200 characters").optional().or(z.literal("")),
  issuedDate: z.string().optional().or(z.literal("")),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// ── Availability ─────────────────────────────────────────────────────────────
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const availabilitySlotSchema = z.object({
  day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
  from: z.string().regex(timeRegex, "Must be HH:mm format"),
  to: z.string().regex(timeRegex, "Must be HH:mm format"),
}).refine((d) => d.from < d.to, { message: "End time must be after start time", path: ["to"] });

export const updateAvailabilitySchema = z.object({
  slots: z.array(availabilitySlotSchema).max(56, "Max 56 slots"),
});

// ── Pricing ──────────────────────────────────────────────────────────────────
export const milestonePackageSchema = z.object({
  name: z.string().min(1, "Package name is required").max(150, "Max 150 characters"),
  price: z.number().min(0, "Price must be 0 or greater"),
  deliverables: z.array(z.string().max(200)).max(20, "Max 20 deliverables").default([]),
  estimatedDays: z.number().min(1, "Minimum 1 day").optional(),
});

export const updatePricingSchema = z.object({
  hourlyRate: z.number().min(0, "Must be 0 or greater").optional(),
  milestonePackages: z.array(milestonePackageSchema).max(10, "Max 10 packages").default([]),
});

// Inferred types
export type BasicInfoInput = z.infer<typeof basicInfoSchema>;
export type SkillItemInput = z.infer<typeof skillItemSchema>;
export type UpdateSkillsInput = z.infer<typeof updateSkillsSchema>;
export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type MilestonePackageInput = z.infer<typeof milestonePackageSchema>;
export type UpdatePricingInput = z.infer<typeof updatePricingSchema>;