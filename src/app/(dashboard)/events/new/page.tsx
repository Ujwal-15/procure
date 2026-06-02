"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useData } from "@/contexts/DataContext";
import { useCurrentUser } from "@/contexts/UserContext";
import { formatCurrency } from "@/lib/utils";

const LOCATIONS = ["Mumbai", "Bengaluru", "Delhi", "Goa", "Hyderabad", "Chennai", "Pune", "Other"];

export default function NewEventPage() {
  const router = useRouter();
  const { addEvent } = useData();
  const { currentUser } = useCurrentUser();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", location: "", eventDate: "", endDate: "", estimatedBudget: "",
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addEvent({
        name:             form.name,
        location:         form.location,
        eventDate:        form.eventDate,
        endDate:          form.endDate || undefined,
        estimatedBudget:  parseFloat(form.estimatedBudget) || 0,
        status:           "upcoming",
        createdBy:        currentUser.id,
      });
      router.push("/events");
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="anim-fade">
      <Header title="Create New Event" />
      <div className="p-6 max-w-xl mx-auto">
        <Link href="/events" className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-5 transition-colors" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={14} /> Back to events
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-1 mb-4">Event Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Event Name <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)} required placeholder="e.g. Spectra 2026" className="field" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-1 mb-1.5">Location <span style={{ color: "var(--danger)" }}>*</span></label>
                  <select value={form.location} onChange={e => update("location", e.target.value)} required className="field">
                    <option value="">Select location</option>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-1 mb-1.5">Estimated Budget (₹)</label>
                  <input type="number" value={form.estimatedBudget} onChange={e => update("estimatedBudget", e.target.value)} placeholder="0" className="field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-1 mb-1.5">Start Date <span style={{ color: "var(--danger)" }}>*</span></label>
                  <input type="date" value={form.eventDate} onChange={e => update("eventDate", e.target.value)} required className="field" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-1 mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => update("endDate", e.target.value)} min={form.eventDate} className="field" />
                </div>
              </div>
            </div>
          </div>

          {form.estimatedBudget && parseFloat(form.estimatedBudget) > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border anim-slide" style={{ backgroundColor: "var(--primary-light)", borderColor: "rgba(0,111,186,0.15)" }}>
              <p className="text-[13px] font-semibold" style={{ color: "var(--primary)" }}>
                Budget set to {formatCurrency(parseFloat(form.estimatedBudget))}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/events" className="btn-ghost flex-1 justify-center">Cancel</Link>
            <button type="submit" disabled={submitting || !form.name || !form.location || !form.eventDate} className="btn-primary flex-1 justify-center">
              {submitting ? "Creating…" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
