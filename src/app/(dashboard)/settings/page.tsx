"use client";
import Header from "@/components/layout/Header";
import { useCurrentUser } from "@/contexts/UserContext";

export default function SettingsPage() {
  const { currentUser } = useCurrentUser();

  if (currentUser.role !== "developer") {
    return (
      <div className="anim-fade p-6">
        <div className="card p-10 flex flex-col items-center text-center gap-3 max-w-md mx-auto">
          <p className="text-[15px] font-semibold text-1">Access restricted</p>
          <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Settings are available to the developer only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="anim-fade">
      <Header title="Settings" subtitle="Developer access" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">

        {/* App info */}
        <div className="card p-5">
          <h2 className="text-[14px] font-semibold text-1 mb-4">App Configuration</h2>
          <div className="space-y-3">
            {[
              { label: "APP_PASSWORD",              desc: "Shared team login password"     },
              { label: "NEXT_PUBLIC_SUPABASE_URL",  desc: "Supabase project URL"           },
              { label: "NEXT_PUBLIC_SUPABASE_ANON_KEY", desc: "Supabase anon key"          },
              { label: "RESEND_API_KEY",            desc: "Resend email API key"           },
              { label: "NEXT_PUBLIC_APP_URL",       desc: "Deployed URL (for email links)" },
            ].map(v => (
              <div key={v.label} className="flex items-start justify-between gap-4 py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="text-[13px] font-mono font-semibold text-1">{v.label}</p>
                  <p className="text-[12px]" style={{ color: "var(--text-3)" }}>{v.desc}</p>
                </div>
                <span className="text-[11px] font-medium px-2 py-1 rounded-lg shrink-0" style={{ backgroundColor: "var(--surface-2)", color: "var(--text-3)" }}>
                  Vercel env var
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cron */}
        <div className="card p-5">
          <h2 className="text-[14px] font-semibold text-1 mb-2">Overdue Payment Cron</h2>
          <p className="text-[13px] mb-4" style={{ color: "var(--text-3)" }}>
            A Vercel Cron job runs daily at 08:00 IST and sends overdue payment reminders to Jigar, Alok, and Sanjeev.
            Configured in <code className="font-mono text-[12px]">vercel.json</code>.
          </p>
          <div className="px-4 py-3 rounded-xl font-mono text-[12px]" style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)" }}>
            GET /api/cron/overdue → runs daily at 02:30 UTC (08:00 IST)
          </div>
        </div>

        {/* DB schema */}
        <div className="card p-5">
          <h2 className="text-[14px] font-semibold text-1 mb-2">Database Schema</h2>
          <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
            Run <code className="font-mono text-[12px]">supabase/migration.sql</code> in Supabase SQL Editor to apply
            all schema changes. Run <code className="font-mono text-[12px]">supabase/schema.sql</code> for a fresh installation.
          </p>
        </div>
      </div>
    </div>
  );
}
