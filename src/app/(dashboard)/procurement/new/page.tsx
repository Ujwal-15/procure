"use client";
import { useState } from "react";
import { Plus, Trash2, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { formatCurrency, DEPARTMENT_LABELS } from "@/lib/utils";
import { useCurrentUser } from "@/contexts/UserContext";
import { useData } from "@/contexts/DataContext";
import type { Department } from "@/types";

interface Item { name: string; qty: number; unit: string; estimatedUnitPrice: number; }

export default function NewRequestPage() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { addRequest } = useData();

  const [department,  setDepartment]  = useState<Department>("event");
  const [forEvent,    setForEvent]    = useState(false);
  const [eventName,   setEventName]   = useState("");
  const [notes,       setNotes]       = useState("");
  const [advancePaid, setAdvancePaid] = useState(0);
  const [items, setItems] = useState<Item[]>([{ name: "", qty: 1, unit: "units", estimatedUnitPrice: 0 }]);

  const total          = items.reduce((s, i) => s + i.qty * i.estimatedUnitPrice, 0);
  const balancePending = Math.max(0, total - advancePaid);
  const needsApproval  = total > 15_000;

  const addItem    = () => setItems(p => [...p, { name: "", qty: 1, unit: "units", estimatedUnitPrice: 0 }]);
  const removeItem = (idx: number) => setItems(p => p.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof Item, value: string | number) =>
    setItems(p => p.map((item, i) => i === idx ? { ...item, [field]: value } : item));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRequest({
      requesterId:   currentUser.id,
      requesterName: currentUser.name,
      department,
      category:      department === "event" ? "event" : department === "r_and_d" ? "r_and_d" : "general",
      eventName:     forEvent && eventName.trim() ? eventName.trim() : undefined,
      items,
      estimatedTotal: total,
      advancePaid:   advancePaid > 0 ? advancePaid : undefined,
      notes:         notes.trim() || undefined,
    });
    router.push("/procurement");
  };

  const depts: Department[] = ["embedded", "r_and_d", "software", "event", "general_office"];

  if (currentUser.role !== "requester") {
    return (
      <div className="anim-fade">
        <Header title="New Request" />
        <div className="p-6 max-w-2xl mx-auto">
          <div className="card p-8 flex flex-col items-center text-center gap-3">
            <p className="text-[15px] font-semibold text-1">Access restricted</p>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
              Only operations staff (Prem, Yashwanth, Vikram) can raise procurement requests.
            </p>
            <Link href="/procurement" className="btn-ghost mt-2">Back to list</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="anim-fade">
      <Header title="New Procurement Request" />
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/procurement" className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-5 transition-colors" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={14} /> Back to requests
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-1 mb-4">Request Details</h2>
            <div>
              <label className="block text-[12px] font-medium text-1 mb-1.5">Department <span style={{ color: "var(--danger)" }}>*</span></label>
              <select value={department} onChange={e => setDepartment(e.target.value as Department)} className="field">
                {depts.map(d => <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>)}
              </select>
            </div>

            {/* Event toggle */}
            <div className="mt-4">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  className="relative w-9 h-5 rounded-full transition-colors shrink-0 cursor-pointer"
                  style={{ backgroundColor: forEvent ? "var(--primary)" : "var(--border)" }}
                  onClick={() => { setForEvent(v => !v); if (forEvent) setEventName(""); }}
                >
                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{ transform: `translateX(${forEvent ? 16 : 2}px)` }} />
                </div>
                <span className="text-[13px] font-medium text-1">This is for an event</span>
              </label>
              {forEvent && (
                <input
                  type="text"
                  placeholder="e.g. Spectra, PWC Event, Paulo Alto…"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  className="field mt-3"
                  autoFocus
                />
              )}
            </div>

            <div className="mt-4">
              <label className="block text-[12px] font-medium text-1 mb-1.5">
                Notes <span className="font-normal" style={{ color: "var(--text-3)" }}>(optional)</span>
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Vendor preference, specs, or any other context…" rows={2} className="field resize-none" />
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-1">Items Required</h2>
              <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--primary)" }}>
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[2fr_80px_100px_120px_36px] gap-2">
                {["Item Name", "Qty", "Unit", "Unit Price (₹)", ""].map(h => (
                  <span key={h} className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>{h}</span>
                ))}
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[2fr_80px_100px_120px_36px] gap-2 items-center">
                  <input type="text" placeholder="Item description" value={item.name} onChange={e => updateItem(idx, "name", e.target.value)} className="field" />
                  <input type="number" min="1" value={item.qty} onChange={e => updateItem(idx, "qty", parseInt(e.target.value) || 1)} className="field text-center" />
                  <input type="text" placeholder="units" value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} className="field" />
                  <input type="number" min="0" placeholder="0" value={item.estimatedUnitPrice || ""} onChange={e => updateItem(idx, "estimatedUnitPrice", parseFloat(e.target.value) || 0)} className="field" />
                  <button type="button" onClick={() => removeItem(idx)} disabled={items.length === 1} className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none" style={{ color: "var(--text-3)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium" style={{ color: "var(--text-3)" }}>Estimated Total</span>
                <span className="text-[22px] font-bold gradient-text">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <label className="text-[13px] font-medium shrink-0" style={{ color: "var(--text-2)" }}>Advance Paid (₹)</label>
                <input type="number" min="0" max={total} placeholder="0" value={advancePaid || ""} onChange={e => setAdvancePaid(Math.min(total, parseFloat(e.target.value) || 0))} className="field w-40 text-right" />
              </div>
              {advancePaid > 0 && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--surface-2)" }}>
                  <span className="text-[13px] font-medium" style={{ color: "var(--text-2)" }}>Balance Pending</span>
                  <span className="text-[17px] font-bold" style={{ color: balancePending === 0 ? "var(--success)" : "var(--text-1)" }}>
                    {formatCurrency(balancePending)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {needsApproval && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border" style={{ backgroundColor: "var(--warning-bg)", borderColor: "rgba(245,158,11,0.2)" }}>
              <Info size={15} className="mt-0.5 shrink-0" style={{ color: "var(--warning)" }} />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--warning)" }}>Approval required</p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--warning)", opacity: 0.8 }}>
                  Above ₹15,000 — goes to Jigar (Finance) then Alok / Sanjeev for final sign-off.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/procurement" className="btn-ghost flex-1 justify-center">Cancel</Link>
            <button
              type="submit"
              disabled={items.some(i => !i.name.trim()) || total === 0 || (forEvent && !eventName.trim())}
              className="btn-primary flex-1 justify-center"
            >
              {needsApproval ? "Submit for Approval" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
