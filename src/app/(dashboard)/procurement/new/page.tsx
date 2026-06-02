"use client";
import { useState } from "react";
import { Plus, Trash2, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { EVENTS } from "@/lib/mock-data";
import { DEPARTMENT_LABELS, formatCurrency } from "@/lib/utils";
import type { Department, Urgency } from "@/types";

interface Item { name: string; qty: number; unit: string; estimatedUnitPrice: number; }

export default function NewRequestPage() {
  const router = useRouter();
  const [department, setDepartment] = useState<Department>("event");
  const [eventId, setEventId] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [notes, setNotes] = useState("");
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [items, setItems] = useState<Item[]>([{ name: "", qty: 1, unit: "units", estimatedUnitPrice: 0 }]);

  const total = items.reduce((s, i) => s + i.qty * i.estimatedUnitPrice, 0);
  const balancePending = Math.max(0, total - advancePaid);
  const needsApproval = total > 15000;

  const addItem = () => setItems([...items, { name: "", qty: 1, unit: "units", estimatedUnitPrice: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof Item, value: string | number) =>
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/procurement");
  };

  const depts: Department[] = ["embedded", "r_and_d", "software", "event", "general_office"];
  const urgencies: Urgency[] = ["low", "medium", "high", "critical"];

  return (
    <div className="anim-fade">
      <Header title="New Procurement Request" />
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/procurement" className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-5 transition-colors" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={14} /> Back to requests
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Request details */}
          <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-1 mb-4">Request Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Department <span style={{ color: "var(--danger)" }}>*</span></label>
                <select value={department} onChange={e => setDepartment(e.target.value as Department)} className="field">
                  {depts.map(d => <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Urgency <span style={{ color: "var(--danger)" }}>*</span></label>
                <select value={urgency} onChange={e => setUrgency(e.target.value as Urgency)} className="field">
                  {urgencies.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-[12px] font-medium text-1 mb-1.5">
                Link to Event <span className="font-normal" style={{ color: "var(--text-3)" }}>(optional)</span>
              </label>
              <select value={eventId} onChange={e => setEventId(e.target.value)} className="field">
                <option value="">No event — General purchase</option>
                {EVENTS.filter(e => e.status !== "completed").map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-[12px] font-medium text-1 mb-1.5">
                Notes <span className="font-normal" style={{ color: "var(--text-3)" }}>(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Vendor preference, specifications, or any other context..."
                rows={2}
                className="field resize-none"
              />
            </div>
          </div>

          {/* Items */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-1">Items Required</h2>
              <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-[12.5px] font-semibold transition-colors" style={{ color: "var(--primary)" }}>
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
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.name}
                    onChange={e => updateItem(idx, "name", e.target.value)}
                    className="field"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={e => updateItem(idx, "qty", parseInt(e.target.value) || 1)}
                    className="field text-center"
                  />
                  <input
                    type="text"
                    placeholder="units"
                    value={item.unit}
                    onChange={e => updateItem(idx, "unit", e.target.value)}
                    className="field"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={item.estimatedUnitPrice || ""}
                    onChange={e => updateItem(idx, "estimatedUnitPrice", parseFloat(e.target.value) || 0)}
                    className="field"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    style={{ color: "var(--text-3)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Totals section */}
            <div className="mt-5 pt-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
              {/* Total row */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium" style={{ color: "var(--text-3)" }}>Estimated Total</span>
                <span className="text-[22px] font-bold gradient-text">₹{total.toLocaleString("en-IN")}</span>
              </div>

              {/* Advance paid */}
              <div className="flex items-center justify-between gap-4">
                <label className="text-[13px] font-medium shrink-0" style={{ color: "var(--text-2)" }}>
                  Advance Paid (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  max={total}
                  placeholder="0"
                  value={advancePaid || ""}
                  onChange={e => setAdvancePaid(Math.min(total, parseFloat(e.target.value) || 0))}
                  className="field w-40 text-right"
                />
              </div>

              {/* Balance pending — show when advance > 0 */}
              {advancePaid > 0 && (
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "var(--surface-2)" }}
                >
                  <span className="text-[13px] font-medium" style={{ color: "var(--text-2)" }}>Balance Pending</span>
                  <span className="text-[17px] font-bold" style={{ color: balancePending === 0 ? "var(--success)" : "var(--text-1)" }}>
                    {formatCurrency(balancePending)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Approval notice */}
          {needsApproval && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl border anim-slide" style={{ backgroundColor: "var(--warning-bg)", borderColor: "rgba(245,158,11,0.2)" }}>
              <Info size={15} className="mt-0.5 shrink-0" style={{ color: "var(--warning)" }} />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--warning)" }}>Approval required</p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--warning)", opacity: 0.8 }}>
                  Requests above ₹15,000 go to Finance (Jigar) then Alok or Sanjeev for final sign-off.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/procurement" className="btn-ghost flex-1 justify-center">Cancel</Link>
            <button
              type="submit"
              disabled={items.some(i => !i.name) || total === 0}
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
