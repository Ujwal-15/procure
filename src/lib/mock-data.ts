import type { User } from "@/types";

/* ── Team (static — these don't live in Supabase) ── */
export const USERS: User[] = [
  { id: "u1", name: "Alok",      email: "alok@eventtech.in",      role: "management", location: "mumbai",    avatar: "AL" },
  { id: "u2", name: "Sanjeev",   email: "sanjeev@eventtech.in",   role: "management", location: "bengaluru", avatar: "SA" },
  { id: "u3", name: "Jigar",     email: "jigar@eventtech.in",     role: "finance",    location: "mumbai",    avatar: "JI" },
  { id: "u4", name: "Prem",      email: "prem@eventtech.in",      role: "requester",  location: "mumbai",    avatar: "PR" },
  { id: "u5", name: "Yashwanth", email: "yashwanth@eventtech.in", role: "requester",  location: "bengaluru", avatar: "YA" },
  { id: "u6", name: "Vikram",    email: "vikram@eventtech.in",    role: "requester",  location: "delhi",     avatar: "VI" },
];

export const CURRENT_USER: User = USERS[3]; // Prem — overridden by UserContext

/* Analytics helper exports — kept for backward compat, computed live in pages */
export const TOP_VENDORS: { name: string; amount: number; invoices: number }[] = [];
