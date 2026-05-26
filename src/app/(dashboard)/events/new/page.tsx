"use client";
import { useState } from "react";
import { ArrowLeft, Calendar, MapPin, IndianRupee } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";

const LOCATIONS = ["Mumbai", "Bengaluru", "Delhi", "Goa", "Hyderabad", "Chennai", "Pune", "Other"];

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    location: "",
    eventDate: "",
    endDate: "",
    estimatedBudget: "",
    notes: "",
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/events");
  };

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title="Create New Event" />
      <div className="p-6 max-w-xl mx-auto">
        <Link href="/events" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#636366] hover:text-[#1D1D1F] mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to events
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-[14px] font-semibold text-[#1D1D1F] mb-4">Event Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">
                  Event Name <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                  required
                  placeholder="e.g. Sunburn Goa 2026"
                  className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">
                    Location <span className="text-[#FF3B30]">*</span>
                  </label>
                  <select
                    value={form.location}
                    onChange={e => update("location", e.target.value)}
                    required
                    className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">
                    Estimated Budget (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AEAEB2] text-[13px]">₹</span>
                    <input
                      type="number"
                      value={form.estimatedBudget}
                      onChange={e => update("estimatedBudget", e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">
                    Event Start Date <span className="text-[#FF3B30]">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={e => update("eventDate", e.target.value)}
                    required
                    className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">
                    Event End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => update("endDate", e.target.value)}
                    min={form.eventDate}
                    className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => update("notes", e.target.value)}
                  placeholder="Venue details, key contacts, special procurement needs..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Budget preview */}
          {form.estimatedBudget && (
            <div className="flex items-center gap-3 px-4 py-3 bg-[#E8F1FB] border border-[#0071E3]/15 rounded-xl animate-[slideUp_0.2s_ease-out]">
              <IndianRupee size={15} className="text-[#0071E3] shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-[#0071E3]">
                  Budget set to ₹{parseInt(form.estimatedBudget).toLocaleString("en-IN")}
                </p>
                <p className="text-[12px] text-[#0071E3]/70 mt-0.5">
                  All procurement for this event will track against this budget.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/events" className="flex-1 py-3 text-[13px] font-medium text-center text-[#636366] border border-[#E8E8ED] rounded-xl hover:bg-[#F5F5F7] transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!form.name || !form.location || !form.eventDate}
              className="flex-1 py-3 text-[13px] font-semibold text-white bg-[#1D1D1F] rounded-xl hover:bg-[#3A3A3C] transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
