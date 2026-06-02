import type {
  User, Vendor, ProcurementEvent, ProcurementRequest,
  Invoice, Payment, Approval
} from "@/types";

/* ── Team ── */

export const CURRENT_USER: User = {
  id: "u4",
  name: "Prem",
  email: "prem@eventtech.in",
  role: "requester",
  location: "mumbai",
  avatar: "PR",
};

export const USERS: User[] = [
  { id: "u1", name: "Alok",      email: "alok@eventtech.in",      role: "management", location: "mumbai",    avatar: "AL" },
  { id: "u2", name: "Sanjeev",   email: "sanjeev@eventtech.in",   role: "management", location: "bengaluru", avatar: "SA" },
  { id: "u3", name: "Jigar",     email: "jigar@eventtech.in",     role: "finance",    location: "mumbai",    avatar: "JI" },
  { id: "u4", name: "Prem",      email: "prem@eventtech.in",      role: "requester",  location: "mumbai",    avatar: "PR" },
  { id: "u5", name: "Yashwanth", email: "yashwanth@eventtech.in", role: "requester",  location: "bengaluru", avatar: "YA" },
  { id: "u6", name: "Vikram",    email: "vikram@eventtech.in",    role: "requester",  location: "delhi",     avatar: "VI" },
];

/* ── Data (start empty — created at runtime) ── */

export const VENDORS: Vendor[] = [];
export const EVENTS: ProcurementEvent[] = [];
export const REQUESTS: ProcurementRequest[] = [];
export const INVOICES: Invoice[] = [];
export const PAYMENTS: Payment[] = [];
export const APPROVALS: Approval[] = [];

/* ── Analytics aggregates (computed from real data in production) ── */

export const SPEND_BY_MONTH: { month: string; amount: number }[] = [];
export const SPEND_BY_DEPARTMENT: { department: string; amount: number; color: string }[] = [];
export const SPEND_BY_EVENT: { event: string; amount: number; color: string }[] = [];
export const TOP_VENDORS: { name: string; amount: number; invoices: number }[] = [];
