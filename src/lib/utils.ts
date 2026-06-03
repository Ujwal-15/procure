import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ProcurementStatus, PaymentStatus, UserRole } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function getDaysOverdue(dueDateStr: string): number {
  const due   = new Date(dueDateStr);
  const today = new Date();
  const diff  = today.getTime() - due.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/* ─── Role helpers ─────────────────────────────────────────────────────── */
export const ROLE_LABELS: Record<UserRole, string> = {
  developer:  "Developer",
  management: "Owner",
  finance:    "Accountant",
  requester:  "Procurement",
};

export function canApprove(role: UserRole)       { return role === "management" || role === "developer"; }
export function canUpdatePayment(role: UserRole) { return role === "finance"    || role === "developer"; }
export function canEditVendorFinance(role: UserRole) { return role === "finance" || role === "developer"; }
export function canCreateEntry(role: UserRole)   { return role === "requester"  || role === "developer"; }
export function canViewReports(role: UserRole)   { return role !== "requester"; }
export function isAdmin(role: UserRole)          { return role === "developer"; }

/* ─── Procurement status config ─────────────────────────────────────────── */
export const PROCUREMENT_STATUS_CONFIG: Record<ProcurementStatus, { label: string; color: string; bg: string }> = {
  draft:            { label: "Draft",            color: "#6B7280", bg: "rgba(156,163,175,0.12)" },
  pending_approval: { label: "Pending Approval",  color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  approved:         { label: "Approved",          color: "#00AE5E", bg: "rgba(0,174,94,0.12)"    },
  rejected:         { label: "Rejected",          color: "#F52F34", bg: "rgba(245,47,52,0.12)"   },
  in_progress:      { label: "In Progress",       color: "#006FBA", bg: "rgba(0,111,186,0.12)"   },
  completed:        { label: "Completed",         color: "#00BDCD", bg: "rgba(0,189,205,0.12)"   },
  cancelled:        { label: "Cancelled",         color: "#9CA3AF", bg: "rgba(156,163,175,0.10)" },
};

/* ─── Payment status config ─────────────────────────────────────────────── */
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  unpaid:          { label: "Unpaid",          color: "#F52F34", bg: "rgba(245,47,52,0.12)"   },
  advance_paid:    { label: "Advance Paid",    color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  partially_paid:  { label: "Partially Paid",  color: "#F97316", bg: "rgba(249,115,22,0.12)"  },
  fully_paid:      { label: "Fully Paid",      color: "#00AE5E", bg: "rgba(0,174,94,0.12)"    },
  on_hold:         { label: "On Hold",         color: "#9CA3AF", bg: "rgba(156,163,175,0.12)" },
};

/* ─── Procurement categories ─────────────────────────────────────────────── */
export const PROCUREMENT_CATEGORIES = [
  "Equipment",
  "Materials",
  "Labour",
  "Services",
  "Software",
  "Venue & Logistics",
  "AV & Tech",
  "Fabrication",
  "Marketing",
  "Other",
];

/* ─── Vendor categories ──────────────────────────────────────────────────── */
export const VENDOR_CATEGORIES = [
  "Equipment Supplier",
  "Venue",
  "Logistics",
  "Labour Contractor",
  "AV Tech",
  "Fabrication",
  "Software",
  "Other",
];

/* ─── Payment terms ──────────────────────────────────────────────────────── */
export const PAYMENT_TERMS = [
  "Full Advance",
  "50% Advance + 50% on Delivery",
  "On Delivery",
  "Net 7",
  "Net 15",
  "Net 30",
  "Custom",
];

export const PAYMENT_MODES = [
  { value: "neft",          label: "NEFT"          },
  { value: "imps",          label: "IMPS"          },
  { value: "upi",           label: "UPI"           },
  { value: "cash",          label: "Cash"          },
  { value: "cheque",        label: "Cheque"        },
  { value: "bank_transfer", label: "Bank Transfer" },
];
