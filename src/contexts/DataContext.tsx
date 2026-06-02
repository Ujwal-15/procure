"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type {
  ProcurementRequest, Invoice, Approval,
  Vendor, ProcurementEvent, Payment,
  Department, RequestStatus,
} from "@/types";

/* ── helper: map DB rows (snake_case) → TypeScript interfaces ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toRequest = (r: any): ProcurementRequest => ({
  id:              String(r.id),
  requestNumber:   String(r.request_number),
  requesterId:     String(r.requester_id),
  requesterName:   String(r.requester_name),
  eventName:       r.event_name ?? undefined,
  department:      r.department as Department,
  category:        r.category as "event" | "general" | "r_and_d",
  items:           r.items ?? [],
  estimatedTotal:  Number(r.estimated_total),
  advancePaid:     r.advance_paid ? Number(r.advance_paid) : undefined,
  notes:           r.notes ?? undefined,
  status:          r.status as RequestStatus,
  rejectionReason: r.rejection_reason ?? undefined,
  createdAt:       String(r.created_at).slice(0, 10),
  updatedAt:       String(r.updated_at).slice(0, 10),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toApproval = (r: any): Approval => ({
  id:             String(r.id),
  requestId:      String(r.request_id),
  requestNumber:  String(r.request_number),
  requesterName:  String(r.requester_name),
  department:     r.department as Department,
  eventName:      r.event_name ?? undefined,
  items:          r.items ?? [],
  estimatedTotal: Number(r.estimated_total),
  advancePaid:    r.advance_paid ? Number(r.advance_paid) : undefined,
  approverId:     r.approver_id ?? undefined,
  status:         r.status as "pending" | "approved" | "rejected",
  notes:          r.notes ?? undefined,
  createdAt:      String(r.created_at).slice(0, 10),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toVendor = (r: any): Vendor => ({
  id:            String(r.id),
  name:          String(r.name),
  contactName:   String(r.contact_name),
  phone:         String(r.phone),
  email:         r.email ?? undefined,
  category:      String(r.category),
  location:      String(r.location),
  bankName:      r.bank_name ?? undefined,
  accountNumber: r.account_number ?? undefined,
  ifscCode:      r.ifsc_code ?? undefined,
  upiId:         r.upi_id ?? undefined,
  notes:         r.notes ?? undefined,
  isActive:      Boolean(r.is_active),
  totalPaid:     Number(r.total_paid ?? 0),
  totalPending:  Number(r.total_pending ?? 0),
  createdAt:     String(r.created_at).slice(0, 10),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toEvent = (r: any): ProcurementEvent => ({
  id:               String(r.id),
  name:             String(r.name),
  location:         String(r.location),
  eventDate:        String(r.event_date),
  endDate:          r.end_date ?? undefined,
  estimatedBudget:  Number(r.estimated_budget ?? 0),
  status:           r.status as ProcurementEvent["status"],
  createdBy:        String(r.created_by),
  createdAt:        String(r.created_at).slice(0, 10),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toInvoice = (r: any): Invoice => ({
  id:             String(r.id),
  poId:           String(r.po_id ?? ""),
  poNumber:       String(r.po_number ?? ""),
  vendorId:       String(r.vendor_id),
  vendorName:     String(r.vendor_name),
  eventName:      r.event_name ?? undefined,
  department:     r.department as Department,
  invoiceNumber:  String(r.invoice_number),
  invoiceDate:    String(r.invoice_date),
  dueDate:        String(r.due_date),
  grossAmount:    Number(r.gross_amount),
  advancePaid:    Number(r.advance_paid ?? 0),
  balanceDue:     Number(r.balance_due),
  fileUrl:        r.file_url ?? undefined,
  status:         r.status as Invoice["status"],
  uploadedBy:     String(r.uploaded_by),
  createdAt:      String(r.created_at).slice(0, 10),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toPayment = (r: any): Payment => ({
  id:              String(r.id),
  invoiceId:       String(r.invoice_id),
  vendorName:      String(r.vendor_name),
  amount:          Number(r.amount),
  paymentDate:     String(r.payment_date),
  paymentMode:     r.payment_mode as Payment["paymentMode"],
  referenceNumber: String(r.reference_number),
  isAdvance:       Boolean(r.is_advance),
  paidBy:          String(r.paid_by),
  notes:           r.notes ?? undefined,
});

/* ── types ── */
interface NewRequestData {
  requesterId:    string;
  requesterName:  string;
  eventName?:     string;
  department:     Department;
  category:       "event" | "general" | "r_and_d";
  items:          ProcurementRequest["items"];
  estimatedTotal: number;
  advancePaid?:   number;
  notes?:         string;
}

type NewVendorData = Omit<Vendor, "id" | "createdAt" | "totalPaid" | "totalPending" | "isActive">;
type NewEventData  = Omit<ProcurementEvent, "id" | "createdAt">;

interface DataContextType {
  requests:  ProcurementRequest[];
  invoices:  Invoice[];
  approvals: Approval[];
  vendors:   Vendor[];
  events:    ProcurementEvent[];
  payments:  Payment[];
  loading:   boolean;
  refresh:   () => Promise<void>;

  addRequest:           (data: NewRequestData)       => Promise<void>;
  updateApprovalStatus: (approvalId: string, requestId: string, status: "approved" | "rejected") => Promise<void>;
  markInvoicePaid:      (invoiceId: string)          => Promise<void>;
  addVendor:            (data: NewVendorData)        => Promise<void>;
  addEvent:             (data: NewEventData)         => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

/* ── derive next request number ── */
function nextReqNumber(current: ProcurementRequest[]): string {
  const max = current.reduce((m, r) => {
    const n = parseInt(r.requestNumber.replace(/\D/g, "").slice(-4));
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  const year = new Date().getFullYear();
  return `PR-${year}-${String(max + 1).padStart(4, "0")}`;
}

/* ── provider ── */
export function DataProvider({ children }: { children: ReactNode }) {
  const [requests,  setRequests]  = useState<ProcurementRequest[]>([]);
  const [invoices,  setInvoices]  = useState<Invoice[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [vendors,   setVendors]   = useState<Vendor[]>([]);
  const [events,    setEvents]    = useState<ProcurementEvent[]>([]);
  const [payments,  setPayments]  = useState<Payment[]>([]);
  const [loading,   setLoading]   = useState(true);

  const loadAll = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    try {
      const [rq, ap, vn, ev, inv, pay] = await Promise.all([
        supabase.from("procurement_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("approvals").select("*").order("created_at", { ascending: false }),
        supabase.from("vendors").select("*").order("name"),
        supabase.from("events").select("*").order("event_date"),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        supabase.from("payments").select("*").order("created_at", { ascending: false }),
      ]);
      setRequests(rq.data?.map(toRequest) ?? []);
      setApprovals(ap.data?.map(toApproval) ?? []);
      setVendors(vn.data?.map(toVendor) ?? []);
      setEvents(ev.data?.map(toEvent) ?? []);
      setInvoices(inv.data?.map(toInvoice) ?? []);
      setPayments(pay.data?.map(toPayment) ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── mutations ── */

  const addRequest = async (data: NewRequestData) => {
    const id     = crypto.randomUUID();
    const now    = new Date().toISOString();
    const reqNum = nextReqNumber(requests);
    const status: RequestStatus = data.estimatedTotal > 15_000 ? "pending_approval" : "ordered";

    if (supabase) {
      const { error } = await supabase.from("procurement_requests").insert({
        id, request_number: reqNum,
        requester_id: data.requesterId, requester_name: data.requesterName,
        event_name: data.eventName ?? null, department: data.department,
        category: data.category, items: data.items,
        estimated_total: data.estimatedTotal, advance_paid: data.advancePaid ?? 0,
        notes: data.notes ?? null, status,
        created_at: now, updated_at: now,
      });
      if (error) throw error;
    }

    const newReq: ProcurementRequest = {
      ...data, id, requestNumber: reqNum,
      status, createdAt: now.slice(0, 10), updatedAt: now.slice(0, 10),
    };
    setRequests(prev => [newReq, ...prev]);

    if (data.estimatedTotal > 15_000) {
      const aprId = crypto.randomUUID();
      if (supabase) {
        await supabase.from("approvals").insert({
          id: aprId, request_id: id, request_number: reqNum,
          requester_name: data.requesterName, department: data.department,
          event_name: data.eventName ?? null, items: data.items,
          estimated_total: data.estimatedTotal, advance_paid: data.advancePaid ?? 0,
          status: "pending", created_at: now,
        });
      }
      setApprovals(prev => [{
        id: aprId, requestId: id, requestNumber: reqNum,
        requesterName: data.requesterName, department: data.department,
        eventName: data.eventName, items: data.items,
        estimatedTotal: data.estimatedTotal, advancePaid: data.advancePaid,
        status: "pending", createdAt: now.slice(0, 10),
      }, ...prev]);
    }
  };

  const updateApprovalStatus = async (
    approvalId: string, requestId: string,
    status: "approved" | "rejected",
  ) => {
    const now = new Date().toISOString();
    if (supabase) {
      await Promise.all([
        supabase.from("approvals").update({ status }).eq("id", approvalId),
        supabase.from("procurement_requests")
          .update({ status, updated_at: now }).eq("id", requestId),
      ]);
    }
    setApprovals(prev => prev.map(a => a.id === approvalId ? { ...a, status } : a));
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
  };

  const markInvoicePaid = async (invoiceId: string) => {
    if (supabase) {
      await supabase.from("invoices")
        .update({ status: "paid", balance_due: 0 })
        .eq("id", invoiceId);
    }
    setInvoices(prev => prev.map(i =>
      i.id === invoiceId ? { ...i, status: "paid" as const, balanceDue: 0 } : i
    ));
  };

  const addVendor = async (data: NewVendorData) => {
    const id  = crypto.randomUUID();
    const now = new Date().toISOString();
    if (supabase) {
      const { error } = await supabase.from("vendors").insert({
        id, name: data.name, contact_name: data.contactName,
        phone: data.phone, email: data.email ?? null,
        category: data.category, location: data.location,
        bank_name: data.bankName ?? null, account_number: data.accountNumber ?? null,
        ifsc_code: data.ifscCode ?? null, upi_id: data.upiId ?? null,
        notes: data.notes ?? null, is_active: true,
        total_paid: 0, total_pending: 0, created_at: now,
      });
      if (error) throw error;
    }
    setVendors(prev => [{
      ...data, id, isActive: true,
      totalPaid: 0, totalPending: 0, createdAt: now.slice(0, 10),
    }, ...prev]);
  };

  const addEvent = async (data: NewEventData) => {
    const id  = crypto.randomUUID();
    const now = new Date().toISOString();
    if (supabase) {
      const { error } = await supabase.from("events").insert({
        id, name: data.name, location: data.location,
        event_date: data.eventDate, end_date: data.endDate ?? null,
        estimated_budget: data.estimatedBudget,
        status: data.status, created_by: data.createdBy, created_at: now,
      });
      if (error) throw error;
    }
    setEvents(prev => [{ ...data, id, createdAt: now.slice(0, 10) }, ...prev]);
  };

  return (
    <DataContext.Provider value={{
      requests, invoices, approvals, vendors, events, payments,
      loading, refresh: loadAll,
      addRequest, updateApprovalStatus, markInvoicePaid, addVendor, addEvent,
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
