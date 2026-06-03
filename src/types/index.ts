/* ─── Roles ──────────────────────────────────────────────────────────────── */
export type UserRole = "developer" | "management" | "finance" | "requester";
// developer  = Ujwal       — full access
// management = Alok/Sanjeev — approve/reject, view all
// finance    = Jigar        — payments, invoices, export
// requester  = everyone else — create & edit own entries

/* ─── Procurement ───────────────────────────────────────────────────────── */
export type ProcurementStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "advance_paid"
  | "partially_paid"
  | "fully_paid"
  | "on_hold";

export type PaymentMode = "neft" | "imps" | "upi" | "cash" | "cheque" | "bank_transfer";

export interface ProcurementRequest {
  id: string;
  requestNumber: string;
  title: string;
  category: string;
  vendorId?: string;
  vendorName?: string;
  projectName?: string;
  description?: string;
  quantity?: number;
  totalAmount: number;
  paymentTerms?: string;
  paymentDueDate?: string;
  expectedDelivery?: string;
  attachmentUrl?: string;
  notes?: string;
  status: ProcurementStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  rejectionReason?: string;
  requesterId: string;
  requesterName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLog {
  id: string;
  procurementId: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  paymentDate: string;
  paymentMode?: PaymentMode;
  transactionRef?: string;
  proofUrl?: string;
  notes?: string;
  loggedById: string;
  loggedByName: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  procurementId?: string;
  userId: string;
  userName: string;
  action: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  emailType: string;
  procurementId?: string;
  sentAt: string;
  sentBy?: string;
}

/* ─── Vendor ────────────────────────────────────────────────────────────── */
export type VendorCategory =
  | "Equipment Supplier"
  | "Venue"
  | "Logistics"
  | "Labour Contractor"
  | "AV Tech"
  | "Fabrication"
  | "Software"
  | "Other";

export type GstType = "Regular" | "Composition" | "Unregistered";
export type AccountType = "Current" | "Savings";

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  /* Banking — accountant/developer only */
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: AccountType;
  upiId?: string;
  /* GST — accountant/developer only */
  gstin?: string;
  gstRegistrationName?: string;
  gstType?: GstType;
  /* Meta */
  isActive: boolean;
  totalSpend: number;
  lastActivityAt?: string;
  createdAt: string;
}

/* ─── User ──────────────────────────────────────────────────────────────── */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  location?: string;
  avatar?: string;
}
