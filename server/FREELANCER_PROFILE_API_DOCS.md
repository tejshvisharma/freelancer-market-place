# Freelancer Profile Frontend API Documentation

> **Base URL:** `/api/v1/freelancer`  
> **Auth:** JWT Bearer token or httpOnly cookies  
> **Format:** JSON unless otherwise noted

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Response Formats](#response-formats)
3. [Authentication](#authentication)
4. [Profile Endpoints](#profile-endpoints)
5. [Skills Endpoints](#skills-endpoints)
6. [Portfolio Endpoints](#portfolio-endpoints)
7. [Work Experience Endpoints](#work-experience-endpoints)
8. [Education Endpoints](#education-endpoints)
9. [Certification Endpoints](#certification-endpoints)
10. [Availability Endpoints](#availability-endpoints)
11. [Pricing Endpoints](#pricing-endpoints)
12. [Resume Endpoints](#resume-endpoints)
13. [Public Endpoints](#public-endpoints)
14. [Error Reference](#error-reference)
15. [Frontend Implementation Guide](#frontend-implementation-guide)

## Quick Reference

| Method   | Endpoint                     | Auth       | Description                        |
| -------- | ---------------------------- | ---------- | ---------------------------------- |
| `GET`    | `/profile`                   | Freelancer | Get own full profile               |
| `PUT`    | `/profile`                   | Freelancer | Update headline, bio, languages    |
| `POST`   | `/profile/recalculate-score` | Freelancer | Force recalculate completion score |
| `PUT`    | `/skills`                    | Freelancer | Replace entire skills array        |
| `POST`   | `/portfolio`                 | Freelancer | Add portfolio item (multipart)     |
| `DELETE` | `/portfolio/:itemId`         | Freelancer | Remove portfolio item              |
| `POST`   | `/experience`                | Freelancer | Add work experience                |
| `PUT`    | `/experience/:expId`         | Freelancer | Update work experience             |
| `DELETE` | `/experience/:expId`         | Freelancer | Delete work experience             |
| `POST`   | `/education`                 | Freelancer | Add education                      |
| `PUT`    | `/education/:eduId`          | Freelancer | Update education                   |
| `DELETE` | `/education/:eduId`          | Freelancer | Delete education                   |
| `POST`   | `/certifications`            | Freelancer | Add certification                  |
| `PUT`    | `/certifications/:certId`    | Freelancer | Update certification               |
| `DELETE` | `/certifications/:certId`    | Freelancer | Delete certification               |
| `PUT`    | `/availability`              | Freelancer | Update weekly availability         |
| `PUT`    | `/pricing`                   | Freelancer | Update hourly rate and packages    |
| `POST`   | `/resume`                    | Freelancer | Upload resume (multipart)          |
| `GET`    | `/public/:userId`            | None       | View public profile                |
| `GET`    | `/profiles`                  | None       | List/search freelancers            |

## Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "profile": {}
  }
}
```

### Created Response (201)

```json
{
  "success": true,
  "message": "Portfolio item added",
  "data": {
    "portfolio": []
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Profiles retrieved",
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalItems": 45,
      "totalPages": 4,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "headline",
      "message": "Headline must be under 200 characters"
    }
  ],
  "data": null
}
```

## Authentication

All freelancer profile endpoints except `GET /public/:userId` and `GET /profiles` require:

- A valid JWT access token in the `Authorization: Bearer <token>` header, or
- A valid httpOnly cookie
- The authenticated user role must be `freelancer`

### 401 Response

```json
{
  "success": false,
  "message": "Not authorized, no token provided",
  "errors": [],
  "data": null
}
```

### 403 Response

```json
{
  "success": false,
  "message": "Role 'client' is not authorized to access this route",
  "errors": [],
  "data": null
}
```

## Profile Endpoints

### GET /profile - Get Own Profile

Returns the authenticated freelancer's full profile. If no profile exists yet, one is auto-created and returned.

**Headers**

```text
Authorization: Bearer <accessToken>
```

### PUT /profile - Update Basic Info

Update headline, professional bio, and languages.

**Headers**

```text
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body**

```json
{
  "headline": "Senior Full Stack Developer | React & Node.js Expert",
  "bio": "10+ years experience building scalable web applications. Specialized in React ecosystem and Node.js microservices.",
  "languages": ["English", "Hindi", "Spanish"]
}
```

| Field     | Type             | Required | Max Length              | Notes                           |
| --------- | ---------------- | -------- | ----------------------- | ------------------------------- |
| headline  | string           | No       | 200 chars               | Professional one-liner          |
| bio       | string           | No       | 1000 chars              | Professional summary            |
| languages | array of strings | No       | 20 items, each 50 chars | Example: `['English', 'Hindi']` |

### POST /profile/recalculate-score - Recalculate Completion Score

Manually trigger profile completion score recalculation.

**Headers**

```text
Authorization: Bearer <accessToken>
```

**Success Response**

```json
{
  "success": true,
  "message": "Score recalculated",
  "data": {
    "profileCompletionScore": 85
  }
}
```

## Skills Endpoints

### PUT /skills - Update Skills

Replaces the entire skills array. Send the complete array you want to keep.

**Headers**

```text
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body**

```json
{
  "skills": [
    { "name": "React", "proficiency": "Expert" },
    { "name": "Node.js", "proficiency": "Expert" },
    { "name": "TypeScript", "proficiency": "Advanced" },
    { "name": "Python", "proficiency": "Intermediate" }
  ]
}
```

| Field                | Type   | Required | Notes                                       |
| -------------------- | ------ | -------- | ------------------------------------------- |
| skills               | array  | Yes      | Max 50 items                                |
| skills[].name        | string | Yes      | Max 100 chars, trimmed                      |
| skills[].proficiency | string | No       | One of `Beginner`, `Intermediate`, `Expert` |

## Portfolio Endpoints

### POST /portfolio - Add Portfolio Item

Upload a portfolio image with metadata. Multipart form data.

**Headers**

```text
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Form Fields**

| Field       | Type   | Required | Notes                                       |
| ----------- | ------ | -------- | ------------------------------------------- |
| image       | File   | Yes      | Image file (jpeg/png/webp/gif/svg), max 5MB |
| title       | String | Yes      | Max 200 chars                               |
| description | String | No       | Max 500 chars                               |
| link        | String | No       | Valid URL to live project                   |

**Example**

```javascript
const formData = new FormData();
formData.append("image", fileObject);
formData.append("title", "E-commerce Platform");
formData.append(
  "description",
  "Full-stack e-commerce solution built with MERN",
);
formData.append("link", "https://project-demo.com");
```

### DELETE /portfolio/:itemId - Remove Portfolio Item

**Headers**

```text
Authorization: Bearer <accessToken>
```

## Work Experience Endpoints

### POST /experience - Add Work Experience

**Headers**

```text
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body**

```json
{
  "title": "Senior Full Stack Developer",
  "company": "TechCorp Inc.",
  "location": "San Francisco, CA",
  "from": "2020-03-15",
  "to": "2024-01-31",
  "current": false,
  "description": "Led development of microservices architecture serving 1M+ users."
}
```

| Field       | Type          | Required | Notes                               |
| ----------- | ------------- | -------- | ----------------------------------- |
| title       | string        | Yes      | Max 150 chars                       |
| company     | string        | No       | Max 150 chars                       |
| location    | string        | No       | Max 150 chars                       |
| from        | ISO 8601 date | No       | Start date                          |
| to          | ISO 8601 date | No       | End date, ignored if `current=true` |
| current     | boolean       | No       | Currently working here              |
| description | string        | No       | Max 500 chars                       |

### PUT /experience/:expId - Update Work Experience

**Headers**

```text
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body**

```json
{
  "title": "Lead Full Stack Developer",
  "current": true,
  "to": null
}
```

### DELETE /experience/:expId - Delete Work Experience

**Headers**

```text
Authorization: Bearer <accessToken>
```

## Education Endpoints

The education endpoints follow the same CRUD pattern as work experience.

### POST /education - Add Education

**Request Body**

```json
{
  "school": "Massachusetts Institute of Technology",
  "degree": "Bachelor of Science",
  "fieldOfStudy": "Computer Science",
  "from": "2014-09-01",
  "to": "2018-06-15",
  "current": false
}
```

| Field        | Type     | Required | Max Length |
| ------------ | -------- | -------- | ---------- |
| school       | string   | Yes      | 200 chars  |
| degree       | string   | No       | 150 chars  |
| fieldOfStudy | string   | No       | 150 chars  |
| from         | ISO date | No       | -          |
| to           | ISO date | No       | -          |
| current      | boolean  | No       | -          |

### PUT /education/:eduId - Update Education

### DELETE /education/:eduId - Delete Education

## Certification Endpoints

### POST /certifications - Add Certification

**Request Body**

```json
{
  "name": "AWS Solutions Architect Professional",
  "issuer": "Amazon Web Services",
  "issuedDate": "2023-06-15",
  "url": "https://aws.amazon.com/verify/cert123"
}
```

| Field      | Type         | Required | Max Length |
| ---------- | ------------ | -------- | ---------- |
| name       | string       | Yes      | 200 chars  |
| issuer     | string       | No       | 200 chars  |
| issuedDate | ISO date     | No       | -          |
| url        | string (URL) | No       | Valid URL  |

### PUT /certifications/:certId - Update Certification

### DELETE /certifications/:certId - Delete Certification

## Availability Endpoints

### PUT /availability - Update Weekly Schedule

Replaces the entire availability slots array.

**Headers**

```text
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body**

```json
{
  "slots": [
    { "day": "Mon", "from": "09:00", "to": "17:00" },
    { "day": "Tue", "from": "09:00", "to": "17:00" },
    { "day": "Wed", "from": "10:00", "to": "16:00" },
    { "day": "Thu", "from": "09:00", "to": "17:00" },
    { "day": "Fri", "from": "09:00", "to": "15:00" }
  ]
}
```

| Field        | Type   | Required | Format                                                 |
| ------------ | ------ | -------- | ------------------------------------------------------ |
| slots        | array  | Yes      | Max 56 slots (8 per day x 7 days)                      |
| slots[].day  | string | Yes      | One of `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun` |
| slots[].from | string | Yes      | `HH:mm` format (00:00 - 23:59)                         |
| slots[].to   | string | Yes      | `HH:mm` format (00:00 - 23:59)                         |

## Pricing Endpoints

### PUT /pricing - Update Pricing

**Headers**

```text
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body**

```json
{
  "hourlyRate": 85,
  "milestonePackages": [
    {
      "name": "Basic Website",
      "price": 2500,
      "deliverables": ["5 page design", "Responsive layout", "Contact form"],
      "estimatedDays": 14
    },
    {
      "name": "E-commerce Platform",
      "price": 8000,
      "deliverables": [
        "Custom design",
        "Payment integration",
        "Admin panel",
        "Analytics"
      ],
      "estimatedDays": 45
    }
  ]
}
```

| Field                             | Type             | Required | Notes                        |
| --------------------------------- | ---------------- | -------- | ---------------------------- |
| hourlyRate                        | number           | No       | Min 0                        |
| milestonePackages                 | array            | No       | Max 10 packages              |
| milestonePackages[].name          | string           | Yes      | Max 150 chars                |
| milestonePackages[].price         | number           | Yes      | Min 0                        |
| milestonePackages[].deliverables  | array of strings | No       | Max 20 items, each 200 chars |
| milestonePackages[].estimatedDays | number           | No       | Min 1                        |

## Resume Endpoints

### POST /resume - Upload Resume

Multipart form data.

**Headers**

```text
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Form Fields**

| Field  | Type | Required | Notes                     |
| ------ | ---- | -------- | ------------------------- |
| resume | File | Yes      | PDF or DOC/DOCX, max 10MB |

## Public Endpoints

### GET /public/:userId - View Public Profile

No authentication required. Returns sanitized profile for public viewing.

**Parameters**

| Param  | Type             | Required                          |
| ------ | ---------------- | --------------------------------- |
| userId | MongoDB ObjectId | Yes (User.\_id, not profile.\_id) |

### GET /profiles - List/Search Freelancers

Paginated, filterable list of verified freelancers.

**Query Parameters**

| Param     | Type   | Default | Notes                                                  |
| --------- | ------ | ------- | ------------------------------------------------------ |
| page      | number | 1       | Page number                                            |
| limit     | number | 12      | Items per page (max 50)                                |
| skills    | string | -       | Comma-separated skills, for example `React,Node.js`    |
| minRating | number | -       | Minimum avg rating (0-5), for example `4.5`            |
| languages | string | -       | Comma-separated languages, for example `English,Hindi` |
| search    | string | -       | Search in headline                                     |

**Example Request**

```text
GET /api/v1/freelancer/profiles?page=1&limit=12&skills=React,TypeScript&minRating=4.0&languages=English
```

## Error Reference

| Code | Meaning           | When                                     |
| ---- | ----------------- | ---------------------------------------- |
| 200  | Success           | GET, PUT, DELETE operations              |
| 201  | Created           | POST operations (new items)              |
| 400  | Bad Request       | Invalid input or file issues             |
| 401  | Unauthorized      | Missing or invalid token                 |
| 403  | Forbidden         | Wrong role or suspended account          |
| 404  | Not Found         | Profile or item not found                |
| 409  | Conflict          | Duplicate data (not used in profile yet) |
| 422  | Validation Error  | Field validation failures                |
| 429  | Too Many Requests | Rate limit exceeded                      |
| 500  | Server Error      | Unexpected server issue                  |

### Common Error Scenarios

#### File Upload Errors

```json
{
  "success": false,
  "message": "Only image files are allowed for portfolio (jpeg/png/webp/gif/svg)",
  "errors": [],
  "data": null
}
```

```json
{
  "success": false,
  "message": "File size exceeds the 5MB limit",
  "errors": [
    {
      "field": "image",
      "message": "Maximum file size is 5MB"
    }
  ],
  "data": null
}
```

#### Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "skills[0].name", "message": "Skill name is required" },
    { "field": "skills[0].proficiency", "message": "Invalid proficiency level" }
  ],
  "data": null
}
```

#### Not Found Errors

```json
{
  "success": false,
  "message": "Freelancer profile not found",
  "errors": [],
  "data": null
}
```

```json
{
  "success": false,
  "message": "Experience entry not found",
  "errors": [],
  "data": null
}
```

## Frontend Implementation Guide

### Recommended Component Structure

```text
src/features/freelancer/
├── api/
│   └── freelancer.api.ts
├── hooks/
│   ├── useProfile.ts
│   ├── useUpdateProfile.ts
│   ├── useUpdateSkills.ts
│   ├── usePortfolio.ts
│   ├── useWorkExperience.ts
│   ├── useEducation.ts
│   ├── useCertifications.ts
│   ├── useAvailability.ts
│   ├── usePricing.ts
│   ├── useUploadResume.ts
│   └── usePublicProfiles.ts
├── schemas/
│   └── freelancer.schema.ts
├── types/
│   └── freelancer.types.ts
└── components/
    ├── ProfileEditor.tsx
    ├── ProfileHeader.tsx
    ├── SkillsEditor.tsx
    ├── PortfolioUploader.tsx
    ├── PortfolioGrid.tsx
    ├── ExperienceTimeline.tsx
    ├── EducationList.tsx
    ├── CertificationList.tsx
    ├── AvailabilityCalendar.tsx
    ├── PricingEditor.tsx
    ├── ResumeUploader.tsx
    ├── PublicProfilePage.tsx
    └── FreelancerCard.tsx
```

### TanStack Query Key Pattern

```typescript
export const queryKeys = {
  freelancer: {
    profile: ["freelancer-profile"] as const,
    publicProfile: (userId: string) => ["freelancer-public", userId] as const,
    list: (filters: Record<string, unknown>) =>
      ["freelancer-profiles", filters] as const,
  },
};
```

### API Client Functions

```typescript
export const freelancerApi = {
  getProfile: () => api.get("/freelancer/profile"),
  updateProfile: (data) => api.put("/freelancer/profile", data),
  updateSkills: (skills) => api.put("/freelancer/skills", { skills }),
  addPortfolioItem: (formData) =>
    api.post("/freelancer/portfolio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deletePortfolioItem: (itemId) =>
    api.delete(`/freelancer/portfolio/${itemId}`),
};
```

### Mutation Pattern - useUpdateSkills

```typescript
export const useUpdateSkills = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: freelancerApi.updateSkills,
    onSuccess: (res) => {
      queryClient.setQueryData(queryKeys.freelancer.profile, (old) => {
        if (!old) return old;

        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              profile: {
                ...old.data.data.profile,
                skills: res.data.data.skills,
              },
            },
          },
        };
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.freelancer.profile });
      toast.success("Skills updated");
    },
    onError: (error) => {
      const fieldErrors = error?.response?.data?.errors;

      if (fieldErrors) {
        fieldErrors.forEach(({ field, message }) => {
          // setError(field, { message });
        });
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to update skills",
        );
      }
    },
  });
};
```

### Profile Completion Score Display

```typescript
const ProfileCompletionBar = ({ score }: { score: number }) => {
  const getColor = (value: number) => {
    if (value < 40) return 'bg-red-500';
    if (value < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Profile Completion</span>
        <span className="font-medium">{score}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {score < 100 && (
        <p className="text-xs text-muted-foreground">
          Complete your profile to appear higher in search results
        </p>
      )}
    </div>
  );
};
```

### Date Formatting Convention

```typescript
import { format, parseISO } from "date-fns";

format(parseISO(exp.from), "MMM yyyy");
format(parseISO(exp.from), "MMMM yyyy");
exp.current ? "Present" : format(parseISO(exp.to), "MMM yyyy");
format(parseISO(exp.from), "yyyy-MM-dd");
```

### File Upload Pattern

```typescript
const handlePortfolioUpload = async (file, title) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", title);

  if (description) formData.append("description", description);
  if (link) formData.append("link", link);

  addPortfolioItem.mutate(formData);
};
```

### Empty States

- Skills: `Add your skills to appear in relevant searches` with an `Add Skills` button
- Portfolio: Empty grid with `Showcase your best work` and upload button
- Experience: `Add your work history to build credibility`
- Education: `Add your educational background`
- Certifications: `List your professional certifications`
- Availability: `Set your working hours so clients know when to reach you`
- Pricing: `Define your rates to receive relevant project invitations`

### Optimistic Updates

```typescript
onMutate: async (newSkills) => {
  await queryClient.cancelQueries({ queryKey: queryKeys.freelancer.profile });

  const previous = queryClient.getQueryData(queryKeys.freelancer.profile);

  queryClient.setQueryData(queryKeys.freelancer.profile, (old) => ({
    ...old,
    data: {
      ...old.data,
      data: {
        ...old.data.data,
        profile: {
          ...old.data.data.profile,
          skills: newSkills,
        },
      },
    },
  }));

  return { previous };
},
onError: (err, newSkills, context) => {
  queryClient.setQueryData(queryKeys.freelancer.profile, context?.previous);
  toast.error('Failed to update skills');
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.freelancer.profile });
},
```

## Testing Checklist

- Profile auto-creates on first GET
- All CRUD operations work for each section
- File uploads accept correct types and reject wrong types
- File size limits are enforced
- Validation errors return field-level messages
- `401` is returned when no token is provided
- `403` is returned when a non-freelancer role tries to access the route
- `404` is returned for non-existent items
- Public profile is accessible without auth
- Profile search/filter works
- Pagination returns correct meta
- Profile completion score updates after section changes
- Badges are auto-awarded based on stats

**Last Updated:** May 2024  
**Maintainer:** Backend Team  
**Contact:** api-docs@skillsphere.com
