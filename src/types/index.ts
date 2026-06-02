export type UserRole = "requester" | "finance" | "management";

export type Department = "embedded" | "r_and_d" | "software" | "event" | "general_office";

export type RequestStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "ordered"
  | "advance_paid"
  | "received"
  | "invoice_uploaded"
  | "partially_paid"
  | "closed";

export type InvoiceStatus = "pending" | "partially_paid" | "paid" | "overdue";

export type DeliveryStatus = "pending" | "partial" | "received" | "rejected";

export type PaymentMode = "neft" | "imps" | "upi" | "cash" | "cheque";

export type Location = string; /* open string — team spans multiple cities */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  location?: Location;
  avatar?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email?: string;
  category: string;
  location: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  notes?: string;
  isActive: boolean;
  totalPaid: number;
  totalPending: number;
  createdAt: string;
}

export interface ProcurementEvent {
  id: string;
  name: string;
  location: string;
  eventDate: string;
  endDate?: string;
  estimatedBudget: number;
  status: "upcoming" | "active" | "completed" | "cancelled";
  createdBy: string;
  createdAt: string;
}

export interface RequestItem {
  name: string;
  qty: number;
  unit: string;
  estimatedUnitPrice: number;
}

export interface ProcurementRequest {
  id: string;
  requestNumber: string;
  requesterId: string;
  requesterName: string;
  eventName?: string;
  department: Department;
  category: "event" | "general" | "r_and_d";
  items: RequestItem[];
  estimatedTotal: number;
  advancePaid?: number;
  notes?: string;
  status: RequestStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  requestId: string;
  requestNumber: string;
  vendorId: string;
  vendorName: string;
  department: Department;
  eventName?: string;
  items: RequestItem[];
  totalAmount: number;
  advanceRequired: boolean;
  advanceAmount: number;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  deliveryStatus: DeliveryStatus;
  status: "active" | "closed" | "cancelled";
}

export interface Invoice {
  id: string;
  poId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  eventName?: string;
  department: Department;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  grossAmount: number;
  advancePaid: number;
  balanceDue: number;
  fileUrl?: string;
  status: InvoiceStatus;
  uploadedBy: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  vendorName: string;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  referenceNumber: string;
  isAdvance: boolean;
  paidBy: string;
  notes?: string;
}

export interface Approval {
  id: string;
  requestId: string;
  requestNumber: string;
  requesterName: string;
  department: Department;
  eventName?: string;
  items: RequestItem[];
  estimatedTotal: number;
  advancePaid?: number;
  approverId?: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
}
