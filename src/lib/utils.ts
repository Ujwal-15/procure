import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Department, RequestStatus, InvoiceStatus, UserRole } from "@/types";

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
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function getDaysOverdue(dueDateStr: string): number {
  const due = new Date(dueDateStr);
  const today = new Date();
  const diff = today.getTime() - due.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getDaysUntilDue(dueDateStr: string): number {
  const due = new Date(dueDateStr);
  const today = new Date();
  const diff = due.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  embedded: "Embedded",
  r_and_d: "R&D",
  software: "Software",
  event: "Event",
  general_office: "General Office",
};

export const DEPARTMENT_COLORS: Record<Department, { bg: string; text: string }> = {
  embedded:      { bg: "rgba(0,189,205,0.12)",  text: "#00BDCD" },  /* brand secondary teal */
  r_and_d:       { bg: "rgba(0,111,186,0.12)",  text: "#006FBA" },  /* brand primary blue */
  software:      { bg: "rgba(0,174,94,0.12)",   text: "#00AE5E" },  /* brand success green */
  event:         { bg: "rgba(245,158,11,0.12)", text: "#F59E0B" },  /* amber — events */
  general_office:{ bg: "rgba(156,163,175,0.15)",text: "#6B7280" },  /* neutral grey */
};

export const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  draft:            { label: "Draft",            color: "#6B7280", bg: "rgba(156,163,175,0.12)" },
  pending_approval: { label: "Pending Approval", color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  approved:         { label: "Approved",         color: "#00AE5E", bg: "rgba(0,174,94,0.12)"    },
  rejected:         { label: "Rejected",         color: "#F52F34", bg: "rgba(245,47,52,0.12)"   },
  ordered:          { label: "Ordered",          color: "#006FBA", bg: "rgba(0,111,186,0.12)"   },
  advance_paid:     { label: "Advance Paid",     color: "#00BDCD", bg: "rgba(0,189,205,0.12)"   },
  received:         { label: "Received",         color: "#00AE5E", bg: "rgba(0,174,94,0.12)"    },
  invoice_uploaded: { label: "Invoice Uploaded", color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  partially_paid:   { label: "Partially Paid",   color: "#F97316", bg: "rgba(249,115,22,0.12)"  },
  closed:           { label: "Closed",           color: "#6B7280", bg: "rgba(156,163,175,0.12)" },
};

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  pending:       { label: "Pending",  color: "#006FBA", bg: "rgba(0,111,186,0.12)"  },
  partially_paid:{ label: "Partial",  color: "#F97316", bg: "rgba(249,115,22,0.12)" },
  paid:          { label: "Paid",     color: "#00AE5E", bg: "rgba(0,174,94,0.12)"   },
  overdue:       { label: "Overdue",  color: "#F52F34", bg: "rgba(245,47,52,0.12)"  },
};


export const ROLE_LABELS: Record<UserRole, string> = {
  requester: "Operations",
  finance:   "Finance",
  management:"Approver",
};
