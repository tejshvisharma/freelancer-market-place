// User roles
const ROLES = {
  CLIENT: "client",
  FREELANCER: "freelancer",
  ADMIN: "admin",
};

const availableUserRoles = Object.values(ROLES);

// Gig statuses
const GIG_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Proposal statuses
const PROPOSAL_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
};

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: "pending",
  HELD_IN_ESCROW: "held_in_escrow",
  RELEASED: "released",
  REFUNDED: "refunded",
};

// Notification types
const NOTIFICATION_TYPES = {
  NEW_GIG: "new_gig",
  PROPOSAL_RECEIVED: "proposal_received",
  PROPOSAL_ACCEPTED: "proposal_accepted",
  PAYMENT_RECEIVED: "payment_received",
  REVIEW_ADDED: "review_added",
  MESSAGE_RECEIVED: "message_received",
};

export {
  ROLES,
  availableUserRoles,
  GIG_STATUS,
  PROPOSAL_STATUS,
  PAYMENT_STATUS,
  NOTIFICATION_TYPES,
};
