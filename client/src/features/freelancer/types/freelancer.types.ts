export type Proficiency = "Beginner" | "Intermediate" | "Expert" | "Advanced";
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type BadgeType = "Top Rated" | "Rising Talent" | "Expert Verified";

export interface Skill {
  _id: string;
  name: string;
  proficiency: Proficiency;
}

export interface PortfolioItem {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
}

export interface WorkExperience {
  _id: string;
  title: string;
  company?: string;
  location?: string;
  from?: string;       // ISO date string
  to?: string;         // ISO date string — null/undefined if current=true
  current: boolean;
  description?: string;
}

export interface Education {
  _id: string;
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  from?: string;
  to?: string;
  current?: boolean;
}

export interface Certification {
  _id: string;
  name: string;
  issuer?: string;
  issuedDate?: string;
  url?: string;
}

export interface AvailabilitySlot {
  _id?: string;
  day: DayOfWeek;
  from: string;   // "HH:mm"
  to: string;     // "HH:mm"
}

export interface MilestonePackage {
  _id?: string;
  name: string;
  price: number;
  deliverables: string[];
  estimatedDays?: number;
}

export interface Pricing {
  hourlyRate?: number;
  milestonePackages: MilestonePackage[];
}

export interface FreelancerProfile {
  _id: string;
  user: string;
  headline?: string;
  bio?: string;
  languages: string[];
  skills: Skill[];
  portfolio: PortfolioItem[];
  resumeUrl?: string;
  workExperience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  availability: AvailabilitySlot[];
  pricing?: Pricing;
  isVerified: boolean;
  badges: BadgeType[];
  avgRating: number;
  totalReviews: number;
  completedJobs: number;
  totalEarnings: number;
  profileCompletionScore: number;
  createdAt: string;
  updatedAt: string;
}

// Input types for mutations
export interface UpdateBasicInfoInput {
  headline?: string;
  bio?: string;
  languages?: string[];
}

export interface UpdateSkillsInput {
  skills: Array<{ name: string; proficiency?: Proficiency }>;
}

export interface AddExperienceInput {
  title: string;
  company?: string;
  location?: string;
  from?: string;
  to?: string;
  current?: boolean;
  description?: string;
}

export interface AddEducationInput {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  from?: string;
  to?: string;
  current?: boolean;
}

export interface AddCertificationInput {
  name: string;
  issuer?: string;
  issuedDate?: string;
  url?: string;
}

export interface UpdateAvailabilityInput {
  slots: Array<{ day: DayOfWeek; from: string; to: string }>;
}

export interface UpdatePricingInput {
  hourlyRate?: number;
  milestonePackages?: Array<{
    name: string;
    price: number;
    deliverables?: string[];
    estimatedDays?: number;
  }>;
}

// Pagination meta
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Public profile search filters
export interface FreelancerSearchFilters {
  page?: number;
  limit?: number;
  skills?: string;      // comma-separated: "React,Node.js"
  minRating?: number;
  languages?: string;   // comma-separated: "English,Hindi"
  search?: string;      // searches in headline
}