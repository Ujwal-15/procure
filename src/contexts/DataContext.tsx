"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  REQUESTS  as INIT_REQUESTS,
  INVOICES  as INIT_INVOICES,
  APPROVALS as INIT_APPROVALS,
  VENDORS   as INIT_VENDORS,
  EVENTS    as INIT_EVENTS,
  PAYMENTS  as INIT_PAYMENTS,
} from "@/lib/mock-data";
import type {
  ProcurementRequest, Invoice, Approval,
  Vendor, ProcurementEvent, Payment, Department, RequestStatus,
} from "@/types";

/* ── types ── */
interface NewRequestData {
  requesterId:   string;
  requesterName: string;
  eventName?:    string;
  department:    Department;
  category:      "event" | "general" | "r_and_d";
  items:         ProcurementRequest["items"];
  estimatedTotal: number;
  advancePaid?:  number;
  notes?:        string;
}

interface DataContextType {
  requests:  ProcurementRequest[];
  invoices:  Invoice[];
  approvals: Approval[];
  vendors:   Vendor[];
  events:    ProcurementEvent[];
  payments:  Payment[];

  addRequest:           (data: NewRequestData) => void;
  updateApprovalStatus: (approvalId: string, requestId: string, status: "approved" | "rejected") => void;
  markInvoicePaid:      (invoiceId: string) => void;
  addVendor:            (v: Vendor) => void;
  addEvent:             (e: ProcurementEvent) => void;
}

const DataContext = createContext<DataContextType | null>(null);

/* ── provider ── */
export function DataProvider({ children }: { children: ReactNode }) {
  const [requests,  setRequests]  = useState<ProcurementRequest[]>(INIT_REQUESTS);
  const [invoices,  setInvoices]  = useState<Invoice[]>(INIT_INVOICES);
  const [approvals, setApprovals] = useState<Approval[]>(INIT_APPROVALS);
  const [vendors,   setVendors]   = useState<Vendor[]>(INIT_VENDORS);
  const [events,    setEvents]    = useState<ProcurementEvent[]>(INIT_EVENTS);
  const [payments,  setPayments]  = useState<Payment[]>(INIT_PAYMENTS);

  /* derive next sequential request number */
  const nextRequestNumber = (currentRequests: ProcurementRequest[]) => {
    const max = currentRequests.reduce((m, r) => {
      const n = parseInt(r.requestNumber.replace(/\D/g, "").slice(-4));
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    return `PR-2026-${String(max + 1).padStart(4, "0")}`;
  };

  const addRequest = (data: NewRequestData) => {
    const now = new Date().toISOString().split("T")[0];
    const id  = `r_new_${Date.now()}`;

    setRequests(prev => {
      const requestNumber = nextRequestNumber(prev);
      const status: RequestStatus = data.estimatedTotal > 15_000
        ? "pending_approval"
        : "ordered";

      const newReq: ProcurementRequest = {
        ...data,
        id,
        requestNumber,
        status,
        createdAt: now,
        updatedAt: now,
      };

      /* if above threshold → also push to approvals */
      if (data.estimatedTotal > 15_000) {
        const newApproval: Approval = {
          id:            `apr_new_${Date.now()}`,
          requestId:     id,
          requestNumber,
          requesterName: data.requesterName,
          department:    data.department,
          eventName:     data.eventName,
          items:         data.items,
          estimatedTotal: data.estimatedTotal,
          advancePaid:   data.advancePaid,
          status:        "pending",
          createdAt:     now,
        };
        setApprovals(ap => [newApproval, ...ap]);
      }

      return [newReq, ...prev];
    });
  };

  /* approve / reject: update both approval record AND linked request */
  const updateApprovalStatus = (
    approvalId: string,
    requestId:  string,
    status:     "approved" | "rejected",
  ) => {
    setApprovals(prev =>
      prev.map(a => a.id === approvalId ? { ...a, status } : a)
    );
    setRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: status === "approved" ? "approved" : "rejected" }
          : r
      )
    );
  };

  /* mark an invoice as paid */
  const markInvoicePaid = (invoiceId: string) => {
    setInvoices(prev =>
      prev.map(i =>
        i.id === invoiceId
          ? { ...i, status: "paid", balanceDue: 0 }
          : i
      )
    );
  };

  const addVendor = (v: Vendor) => setVendors(prev => [v, ...prev]);
  const addEvent  = (e: ProcurementEvent) => setEvents(prev => [e, ...prev]);

  return (
    <DataContext.Provider value={{
      requests, invoices, approvals, vendors, events, payments,
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
