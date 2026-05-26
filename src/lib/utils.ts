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
  embedded: { bg: "#F5EEFA", text: "#AF52DE" },
  r_and_d: { bg: "#E8F1FB", text: "#0071E3" },
  software: { bg: "#F0FAF3", text: "#34C759" },
  event: { bg: "#FFF8EC", text: "#FF9F0A" },
  general_office: { bg: "#F5F5F7", text: "#636366" },
};

export const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#636366", bg: "#F5F5F7" },
  pending_approval: { label: "Pending Approval", color: "#FF9F0A", bg: "#FFF8EC" },
  approved: { label: "Approved", color: "#34C759", bg: "#F0FAF3" },
  rejected: { label: "Rejected", color: "#FF3B30", bg: "#FFF2F1" },
  ordered: { label: "Ordered", color: "#0071E3", bg: "#E8F1FB" },
  advance_paid: { label: "Advance Paid", color: "#AF52DE", bg: "#F5EEFA" },
  received: { label: "Received", color: "#34C759", bg: "#F0FAF3" },
  invoice_uploaded: { label: "Invoice Uploaded", color: "#FF9F0A", bg: "#FFF8EC" },
  partially_paid: { label: "Partially Paid", color: "#FF9F0A", bg: "#FFF8EC" },
  closed: { label: "Closed", color: "#636366", bg: "#F5F5F7" },
};

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#0071E3", bg: "#E8F1FB" },
  partially_paid: { label: "Partial", color: "#FF9F0A", bg: "#FFF8EC" },
  paid: { label: "Paid", color: "#34C759", bg: "#F0FAF3" },
  overdue: { label: "Overdue", color: "#FF3B30", bg: "#FFF2F1" },
};

export const URGENCY_CONFIG: Record<Urgency, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "#636366", bg: "#F5F5F7" },
  medium: { label: "Medium", color: "#0071E3", bg: "#E8F1FB" },
  high: { label: "High", color: "#FF9F0A", bg: "#FFF8EC" },
  critical: { label: "Critical", color: "#FF3B30", bg: "#FFF2F1" },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  requester: "Requester",
  procurement: "Procurement",
  finance: "Finance",
  management: "Management",
  admin: "Admin",
};
