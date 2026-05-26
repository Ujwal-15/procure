"use client";
import { useState } from "react";
import { Plus, Trash2, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { EVENTS } from "@/lib/mock-data";
import { DEPARTMENT_LABELS } from "@/lib/utils";
import type { Department, Urgency } from "@/types";

interface Item { name: string; qty: number; unit: string; estimatedUnitPrice: number; }

export default function NewRequestPage() {
  const router = useRouter();
  const [department, setDepartment] = useState<Department>("event");
  const [eventId, setEventId] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([{ name: "", qty: 1, unit: "units", estimatedUnitPrice: 0 }]);

  const total = items.reduce((s, i) => s + i.qty * i.estimatedUnitPrice, 0);
  const needsApproval = total > 15000;

  const addItem = () => setItems([...items, { name: "", qty: 1, unit: "units", estimatedUnitPrice: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof Item, value: string | number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/procurement");
  };

  const depts: Department[] = ["embedded", "r_and_d", "software", "event", "general_office"];
  const urgencies: Urgency[] = ["low", "medium", "high", "critical"];

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title="New Procurement Request" />
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/procurement" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#636366] hover:text-[#1D1D1F] mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to requests
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department & Event */}
          <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-[14px] font-semibold text-[#1D1D1F] mb-4">Request Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Department <span className="text-[#FF3B30]">*</span></label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value as Department)}
                  className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                >
                  {depts.map(d => <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Urgency <span className="text-[#FF3B30]">*</span></label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as Urgency)}
                  className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                >
                  {urgencies.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Link to Event / Project <span className="text-[#8E8E93] font-normal">(optional)</span></label>
              <select
                value={eventId}
                onChange={e => setEventId(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
              >
                <option value="">No event — General purchase</option>
                {EVENTS.filter(e => e.status !== "completed").map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Notes <span className="text-[#8E8E93] font-normal">(optional)</span></label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any context, vendor preference, or specifications..."
                rows={2}
                className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2] resize-none"
              />
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-[#1D1D1F]">Items Required</h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#0071E3] hover:text-[#0077ED] transition-colors"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {/* Column headers */}
              <div className="grid grid-cols-[2fr_80px_100px_120px_40px] gap-2">
                {["Item Name", "Qty", "Unit", "Unit Price (₹)", ""].map(h => (
                  <span key={h} className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wide">{h}</span>
                ))}
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[2fr_80px_100px_120px_40px] gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.name}
                    onChange={e => updateItem(idx, "name", e.target.value)}
                    className="px-3 py-2 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2]"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={e => updateItem(idx, "qty", parseInt(e.target.value) || 1)}
                    className="px-3 py-2 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] text-center"
                  />
                  <input
                    type="text"
                    placeholder="units"
                    value={item.unit}
                    onChange={e => updateItem(idx, "unit", e.target.value)}
                    className="px-3 py-2 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2]"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={item.estimatedUnitPrice || ""}
                    onChange={e => updateItem(idx, "estimatedUnitPrice", parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2]"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-[#AEAEB2] hover:text-[#FF3B30] hover:bg-[#FFF2F1] transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-[#F5F5F7] flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#636366]">Estimated Total</span>
              <span className="text-[20px] font-semibold text-[#1D1D1F]">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Approval notice */}
          {needsApproval && (
            <div className="flex items-start gap-3 px-4 py-3 bg-[#FFF8EC] border border-[#FF9F0A]/20 rounded-xl animate-[slideUp_0.2s_ease-out]">
              <Info size={15} className="text-[#FF9F0A] mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-[#FF9F0A]">Management approval required</p>
                <p className="text-[12px] text-[#FF9F0A]/80 mt-0.5">
                  This request exceeds ₹15,000. It will be sent to management for approval before procurement proceeds.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/procurement"
              className="flex-1 py-3 text-[13px] font-medium text-center text-[#636366] border border-[#E8E8ED] rounded-xl hover:bg-[#F5F5F7] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={items.some(i => !i.name) || total === 0}
              className="flex-1 py-3 text-[13px] font-semibold text-white bg-[#1D1D1F] rounded-xl hover:bg-[#3A3A3C] transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {needsApproval ? "Submit for Approval" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
