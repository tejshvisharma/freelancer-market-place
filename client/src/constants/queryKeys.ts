export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  gigs: {
    all: ["gigs"] as const,
    list: (filters: Record<string, unknown>) =>
      ["gigs", "list", filters] as const,
    detail: (id: string) => ["gigs", id] as const,
  },
  proposals: {
    byGig: (gigId: string) => ["proposals", "gig", gigId] as const,
    mine: ["proposals", "mine"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
} as const;
