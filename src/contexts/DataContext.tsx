"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type {
  ProcurementRequest, ProcurementStatus, PaymentStatus, PaymentMode,
  PaymentLog, AuditLog, Vendor,
} from "@/types";

/* ── DB → TS mappers ───────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toReq = (r: any): ProcurementRequest => ({
  id:               String(r.id),
  requestNumber:    String(r.request_number),
  title:            String(r.title ?? r.request_number),
  category:         String(r.category ?? "Other"),
  vendorId:         r.vendor_id ?? undefined,
  vendorName:       r.vendor_name ?? undefined,
  projectName:      r.project_name ?? undefined,
  description:      r.description ?? undefined,
  quantity:         r.quantity ? Number(r.quantity) : undefined,
  totalAmount:      Number(r.total_amount ?? r.estimated_total ?? 0),
  paymentTerms:     r.payment_terms ?? undefined,
  paymentDueDate:   r.payment_due_date ?? undefined,
  expectedDelivery: r.expected_delivery ?? undefined,
  attachmentUrl:    r.attachment_url ?? undefined,
  notes:            r.notes ?? undefined,
  status:           (r.status ?? "draft") as ProcurementStatus,
  paymentStatus:    (r.payment_status ?? "unpaid") as PaymentStatus,
  amountPaid:       Number(r.amount_paid ?? 0),
  rejectionReason:  r.rejection_reason ?? undefined,
  requesterId:      String(r.requester_id),
  requesterName:    String(r.requester_name),
  createdAt:        String(r.created_at).slice(0, 10),
  updatedAt:        String(r.updated_at ?? r.created_at).slice(0, 10),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toVendor = (r: any): Vendor => ({
  id:                   String(r.id),
  name:                 String(r.name),
  category:             String(r.category ?? "Other"),
  contactName:          String(r.contact_name ?? ""),
  phone:                String(r.phone ?? ""),
  email:                r.email ?? undefined,
  address:              r.address ?? undefined,
  notes:                r.notes ?? undefined,
  bankName:             r.bank_name ?? undefined,
  accountHolderName:    r.account_holder_name ?? undefined,
  accountNumber:        r.account_number ?? undefined,
  ifscCode:             r.ifsc_code ?? undefined,
  accountType:          r.account_type ?? undefined,
  upiId:                r.upi_id ?? undefined,
  gstin:                r.gstin ?? undefined,
  gstRegistrationName:  r.gst_registration_name ?? undefined,
  gstType:              r.gst_type ?? undefined,
  isActive:             Boolean(r.is_active ?? true),
  totalSpend:           Number(r.total_spend ?? r.total_paid ?? 0),
  lastActivityAt:       r.last_activity_at ?? undefined,
  createdAt:            String(r.created_at).slice(0, 10),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toPayLog = (r: any): PaymentLog => ({
  id:              String(r.id),
  procurementId:   String(r.procurement_id),
  paymentStatus:   r.payment_status as PaymentStatus,
  amountPaid:      Number(r.amount_paid),
  paymentDate:     String(r.payment_date),
  paymentMode:     r.payment_mode as PaymentMode ?? undefined,
  transactionRef:  r.transaction_ref ?? undefined,
  proofUrl:        r.proof_url ?? undefined,
  notes:           r.notes ?? undefined,
  loggedById:      String(r.logged_by_id),
  loggedByName:    String(r.logged_by_name),
  createdAt:       String(r.created_at).slice(0, 16),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toAudit = (r: any): AuditLog => ({
  id:             String(r.id),
  procurementId:  r.procurement_id ?? undefined,
  userId:         String(r.user_id),
  userName:       String(r.user_name),
  action:         String(r.action),
  details:        r.details ?? undefined,
  createdAt:      String(r.created_at).slice(0, 16),
});

/* ── New procurement input ─────────────────────────────────────────────── */
export interface NewProcurementData {
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
  requesterId: string;
  requesterName: string;
}

export interface NewVendorData {
  name: string;
  category: string;
  contactName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

/* ── Context type ──────────────────────────────────────────────────────── */
interface DataContextType {
  requests:    ProcurementRequest[];
  vendors:     Vendor[];
  paymentLogs: PaymentLog[];
  auditLogs:   AuditLog[];
  loading:     boolean;
  refresh:     () => Promise<void>;

  addProcurement:         (data: NewProcurementData, asDraft?: boolean)     => Promise<ProcurementRequest>;
  submitForApproval:      (id: string)                                      => Promise<void>;
  approveProcurement:     (id: string, approverName: string, approverId: string) => Promise<void>;
  rejectProcurement:      (id: string, reason: string, approverName: string, approverId: string) => Promise<void>;
  cancelProcurement:      (id: string, userName: string, userId: string)    => Promise<void>;
  updatePayment:          (opts: UpdatePaymentOpts)                          => Promise<void>;
  addVendor:              (data: NewVendorData)                              => Promise<Vendor>;
  updateVendor:           (id: string, data: Partial<Vendor>)               => Promise<void>;
}

export interface UpdatePaymentOpts {
  procurementId: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  paymentDate: string;
  paymentMode?: string;
  transactionRef?: string;
  proofUrl?: string;
  notes?: string;
  loggedById: string;
  loggedByName: string;
}

const DataContext = createContext<DataContextType | null>(null);

/* ─── audit helper ──────────────────────────────────────────────────────── */
async function writeAudit(opts: {
  procurementId?: string; userId: string; userName: string;
  action: string; details?: Record<string, unknown>;
}) {
  if (!supabase) return;
  await supabase.from("audit_log").insert({
    id:               crypto.randomUUID(),
    procurement_id:   opts.procurementId ?? null,
    user_id:          opts.userId,
    user_name:        opts.userName,
    action:           opts.action,
    details:          opts.details ?? null,
    created_at:       new Date().toISOString(),
  });
}

/* ─── request-number helper ─────────────────────────────────────────────── */
function nextNum(current: ProcurementRequest[]): string {
  const max = current.reduce((m, r) => {
    const n = parseInt(r.requestNumber.replace(/\D/g, "").slice(-4));
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `PR-${new Date().getFullYear()}-${String(max + 1).padStart(4, "0")}`;
}

/* ─── Provider ──────────────────────────────────────────────────────────── */
export function DataProvider({ children }: { children: ReactNode }) {
  const [requests,    setRequests]    = useState<ProcurementRequest[]>([]);
  const [vendors,     setVendors]     = useState<Vendor[]>([]);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [auditLogs,   setAuditLogs]   = useState<AuditLog[]>([]);
  const [loading,     setLoading]     = useState(true);

  const loadAll = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    try {
      const [rq, vn, pl, al] = await Promise.all([
        supabase.from("procurement_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("vendors").select("*").order("name"),
        supabase.from("payment_logs").select("*").order("created_at", { ascending: false }),
        supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(200),
      ]);
      setRequests(rq.data?.map(toReq) ?? []);
      setVendors(vn.data?.map(toVendor) ?? []);
      setPaymentLogs(pl.data?.map(toPayLog) ?? []);
      setAuditLogs(al.data?.map(toAudit) ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── add procurement ─────────────────────────────────────────────────── */
  const addProcurement = async (data: NewProcurementData, asDraft = true): Promise<ProcurementRequest> => {
    const id   = crypto.randomUUID();
    const now  = new Date().toISOString();
    const rNum = nextNum(requests);
    const status: ProcurementStatus = asDraft ? "draft" : "pending_approval";

    if (supabase) {
      await supabase.from("procurement_requests").insert({
        id, request_number: rNum, title: data.title,
        category: data.category, vendor_id: data.vendorId ?? null,
        vendor_name: data.vendorName ?? null, project_name: data.projectName ?? null,
        description: data.description ?? null, quantity: data.quantity ?? null,
        total_amount: data.totalAmount, payment_terms: data.paymentTerms ?? null,
        payment_due_date: data.paymentDueDate ?? null, expected_delivery: data.expectedDelivery ?? null,
        attachment_url: data.attachmentUrl ?? null, notes: data.notes ?? null,
        status, payment_status: "unpaid", amount_paid: 0,
        requester_id: data.requesterId, requester_name: data.requesterName,
        created_at: now, updated_at: now,
      });
    }

    const newReq: ProcurementRequest = {
      ...data, id, requestNumber: rNum, status,
      paymentStatus: "unpaid", amountPaid: 0,
      createdAt: now.slice(0, 10), updatedAt: now.slice(0, 10),
    };
    setRequests(prev => [newReq, ...prev]);
    await writeAudit({ procurementId: id, userId: data.requesterId, userName: data.requesterName, action: "Created procurement" });
    return newReq;
  };

  /* ── submit for approval ─────────────────────────────────────────────── */
  const submitForApproval = async (id: string) => {
    if (supabase) {
      await supabase.from("procurement_requests")
        .update({ status: "pending_approval", updated_at: new Date().toISOString() })
        .eq("id", id);
    }
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "pending_approval" } : r));
    const req = requests.find(r => r.id === id);
    if (req) await writeAudit({ procurementId: id, userId: req.requesterId, userName: req.requesterName, action: "Submitted for approval" });
  };

  /* ── approve ─────────────────────────────────────────────────────────── */
  const approveProcurement = async (id: string, approverName: string, approverId: string) => {
    const now = new Date().toISOString();
    if (supabase) {
      await supabase.from("procurement_requests")
        .update({ status: "approved", updated_at: now }).eq("id", id);
    }
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
    await writeAudit({ procurementId: id, userId: approverId, userName: approverName, action: `Approved`, details: { approvedAt: now } });
  };

  /* ── reject ──────────────────────────────────────────────────────────── */
  const rejectProcurement = async (id: string, reason: string, approverName: string, approverId: string) => {
    const now = new Date().toISOString();
    if (supabase) {
      await supabase.from("procurement_requests")
        .update({ status: "rejected", rejection_reason: reason, updated_at: now }).eq("id", id);
    }
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected", rejectionReason: reason } : r));
    await writeAudit({ procurementId: id, userId: approverId, userName: approverName, action: `Rejected`, details: { reason } });
  };

  /* ── cancel ──────────────────────────────────────────────────────────── */
  const cancelProcurement = async (id: string, userName: string, userId: string) => {
    if (supabase) {
      await supabase.from("procurement_requests")
        .update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", id);
    }
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "cancelled" } : r));
    await writeAudit({ procurementId: id, userId, userName, action: "Cancelled" });
  };

  /* ── update payment ──────────────────────────────────────────────────── */
  const updatePayment = async (opts: UpdatePaymentOpts) => {
    const logId = crypto.randomUUID();
    const now   = new Date().toISOString();

    if (supabase) {
      await Promise.all([
        supabase.from("procurement_requests").update({
          payment_status: opts.paymentStatus,
          amount_paid:    opts.amountPaid,
          updated_at:     now,
        }).eq("id", opts.procurementId),

        supabase.from("payment_logs").insert({
          id:              logId,
          procurement_id:  opts.procurementId,
          payment_status:  opts.paymentStatus,
          amount_paid:     opts.amountPaid,
          payment_date:    opts.paymentDate,
          payment_mode:    opts.paymentMode ?? null,
          transaction_ref: opts.transactionRef ?? null,
          proof_url:       opts.proofUrl ?? null,
          notes:           opts.notes ?? null,
          logged_by_id:    opts.loggedById,
          logged_by_name:  opts.loggedByName,
          created_at:      now,
        }),
      ]);
    }

    setRequests(prev => prev.map(r =>
      r.id === opts.procurementId
        ? { ...r, paymentStatus: opts.paymentStatus, amountPaid: opts.amountPaid }
        : r
    ));
    setPaymentLogs(prev => [{
      id: logId, procurementId: opts.procurementId,
      paymentStatus: opts.paymentStatus, amountPaid: opts.amountPaid,
      paymentDate: opts.paymentDate, paymentMode: opts.paymentMode as PaymentMode | undefined,
      transactionRef: opts.transactionRef, proofUrl: opts.proofUrl,
      notes: opts.notes, loggedById: opts.loggedById, loggedByName: opts.loggedByName,
      createdAt: now.slice(0, 16),
    }, ...prev]);
    await writeAudit({
      procurementId: opts.procurementId, userId: opts.loggedById, userName: opts.loggedByName,
      action: `Payment updated to ${opts.paymentStatus}`,
      details: { amountPaid: opts.amountPaid, paymentMode: opts.paymentMode, transactionRef: opts.transactionRef },
    });
  };

  /* ── vendor CRUD ─────────────────────────────────────────────────────── */
  const addVendor = async (data: NewVendorData): Promise<Vendor> => {
    const id  = crypto.randomUUID();
    const now = new Date().toISOString();
    if (supabase) {
      await supabase.from("vendors").insert({
        id, name: data.name, category: data.category,
        contact_name: data.contactName, phone: data.phone,
        email: data.email ?? null, address: data.address ?? null,
        notes: data.notes ?? null, is_active: true,
        total_spend: 0, created_at: now,
      });
    }
    const v: Vendor = { ...data, id, isActive: true, totalSpend: 0, createdAt: now.slice(0, 10) };
    setVendors(prev => [v, ...prev]);
    return v;
  };

  const updateVendor = async (id: string, data: Partial<Vendor>) => {
    if (supabase) {
      const dbRow: Record<string, unknown> = {};
      if (data.name              != null) dbRow.name                = data.name;
      if (data.category          != null) dbRow.category             = data.category;
      if (data.contactName       != null) dbRow.contact_name         = data.contactName;
      if (data.phone             != null) dbRow.phone                = data.phone;
      if (data.email             != null) dbRow.email                = data.email;
      if (data.address           != null) dbRow.address              = data.address;
      if (data.notes             != null) dbRow.notes                = data.notes;
      if (data.bankName          != null) dbRow.bank_name            = data.bankName;
      if (data.accountHolderName != null) dbRow.account_holder_name  = data.accountHolderName;
      if (data.accountNumber     != null) dbRow.account_number       = data.accountNumber;
      if (data.ifscCode          != null) dbRow.ifsc_code            = data.ifscCode;
      if (data.accountType       != null) dbRow.account_type         = data.accountType;
      if (data.upiId             != null) dbRow.upi_id               = data.upiId;
      if (data.gstin             != null) dbRow.gstin                = data.gstin;
      if (data.gstRegistrationName != null) dbRow.gst_registration_name = data.gstRegistrationName;
      if (data.gstType           != null) dbRow.gst_type             = data.gstType;
      await supabase.from("vendors").update(dbRow).eq("id", id);
    }
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  };

  return (
    <DataContext.Provider value={{
      requests, vendors, paymentLogs, auditLogs, loading, refresh: loadAll,
      addProcurement, submitForApproval, approveProcurement, rejectProcurement,
      cancelProcurement, updatePayment, addVendor, updateVendor,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
