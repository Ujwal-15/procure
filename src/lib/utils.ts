import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Department, RequestStatus, InvoiceStatus, Urgency, UserRole } from "@/types";

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
  embedded:      { bg: "rgba(124,58,237,0.12)",  text: "#7C3AED" },
  r_and_d:       { bg: "rgba(79,70,229,0.12)",   text: "#4F46E5" },
  software:      { bg: "rgba(16,185,129,0.12)",  text: "#10B981" },
  event:         { bg: "rgba(245,158,11,0.12)",  text: "#F59E0B" },
  general_office:{ bg: "rgba(156,163,175,0.15)", text: "#6B7280" },
};

export const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  draft:            { label: "Draft",           color: "#6B7280", bg: "rgba(156,163,175,0.12)" },
  pending_approval: { label: "Pending Approval",color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  approved:         { label: "Approved",        color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
  rejected:         { label: "Rejected",        color: "#EF4444", bg: "rgba(239,68,68,0.12)"   },
  ordered:          { label: "Ordered",         color: "#4F46E5", bg: "rgba(79,70,229,0.12)"   },
  advance_paid:     { label: "Advance Paid",    color: "#7C3AED", bg: "rgba(124,58,237,0.12)"  },
  received:         { label: "Received",        color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
  invoice_uploaded: { label: "Invoice Uploaded",color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  partially_paid:   { label: "Partially Paid",  color: "#F97316", bg: "rgba(249,115,22,0.12)"  },
  closed:           { label: "Closed",          color: "#6B7280", bg: "rgba(156,163,175,0.12)" },
};

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  pending:       { label: "Pending",        color: "#4F46E5", bg: "rgba(79,70,229,0.12)"   },
  partially_paid:{ label: "Partial",        color: "#F97316", bg: "rgba(249,115,22,0.12)"  },
  paid:          { label: "Paid",           color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
  overdue:       { label: "Overdue",        color: "#EF4444", bg: "rgba(239,68,68,0.12)"   },
};

export const URGENCY_CONFIG: Record<Urgency, { label: string; color: string; bg: string }> = {
  low:      { label: "Low",      color: "#6B7280", bg: "rgba(156,163,175,0.12)" },
  medium:   { label: "Medium",   color: "#4F46E5", bg: "rgba(79,70,229,0.12)"  },
  high:     { label: "High",     color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  critical: { label: "Critical", color: "#EF4444", bg: "rgba(239,68,68,0.12)"  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  requester: "Operations",
  finance:   "Finance",
  management:"Approver",
};
