import { apiClient } from "@/lib/axios";
import type {
  UpdateBasicInfoInput,
  UpdateSkillsInput,
  AddExperienceInput,
  AddEducationInput,
  AddCertificationInput,
  UpdateAvailabilityInput,
  UpdatePricingInput,
  FreelancerSearchFilters,
} from "../types/freelancer.types";

const BASE = "/freelancer";

export const freelancerApi = {
  // ── Profile ───────────────────────────────────────────────────────────────
  getProfile: () =>
    apiClient.get(`${BASE}/profile`),

  updateProfile: (data: UpdateBasicInfoInput) =>
    apiClient.put(`${BASE}/profile`, data),

  recalculateScore: () =>
    apiClient.post(`${BASE}/profile/recalculate-score`),

  // ── Skills ────────────────────────────────────────────────────────────────
  updateSkills: (data: UpdateSkillsInput) =>
    apiClient.put(`${BASE}/skills`, data),

  // ── Portfolio ─────────────────────────────────────────────────────────────
  // FormData — axios sets Content-Type: multipart/form-data automatically
  addPortfolioItem: (formData: FormData) =>
    apiClient.post(`${BASE}/portfolio`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deletePortfolioItem: (itemId: string) =>
    apiClient.delete(`${BASE}/portfolio/${itemId}`),

  // ── Work Experience ───────────────────────────────────────────────────────
  addExperience: (data: AddExperienceInput) =>
    apiClient.post(`${BASE}/experience`, data),

  updateExperience: (expId: string, data: Partial<AddExperienceInput>) =>
    apiClient.put(`${BASE}/experience/${expId}`, data),

  deleteExperience: (expId: string) =>
    apiClient.delete(`${BASE}/experience/${expId}`),

  // ── Education ─────────────────────────────────────────────────────────────
  addEducation: (data: AddEducationInput) =>
    apiClient.post(`${BASE}/education`, data),

  updateEducation: (eduId: string, data: Partial<AddEducationInput>) =>
    apiClient.put(`${BASE}/education/${eduId}`, data),

  deleteEducation: (eduId: string) =>
    apiClient.delete(`${BASE}/education/${eduId}`),

  // ── Certifications ────────────────────────────────────────────────────────
  addCertification: (data: AddCertificationInput) =>
    apiClient.post(`${BASE}/certifications`, data),

  updateCertification: (certId: string, data: Partial<AddCertificationInput>) =>
    apiClient.put(`${BASE}/certifications/${certId}`, data),

  deleteCertification: (certId: string) =>
    apiClient.delete(`${BASE}/certifications/${certId}`),

  // ── Availability ──────────────────────────────────────────────────────────
  updateAvailability: (data: UpdateAvailabilityInput) =>
    apiClient.put(`${BASE}/availability`, data),

  // ── Pricing ───────────────────────────────────────────────────────────────
  updatePricing: (data: UpdatePricingInput) =>
    apiClient.put(`${BASE}/pricing`, data),

  // ── Resume ────────────────────────────────────────────────────────────────
  uploadResume: (formData: FormData) =>
    apiClient.post(`${BASE}/resume`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // ── Public ────────────────────────────────────────────────────────────────
  getPublicProfile: (userId: string) =>
    apiClient.get(`${BASE}/public/${userId}`),

  // userId is the User._id (not profile._id) per API docs
  searchFreelancers: (filters: FreelancerSearchFilters) =>
    apiClient.get(`${BASE}/profiles`, { params: filters }),
};