import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { emailPaymentOverdue } from "@/lib/email";
import { USERS } from "@/lib/mock-data";

/* Vercel Cron calls GET /api/cron/overdue daily at 02:30 UTC (08:00 IST)
   Protect with CRON_SECRET if desired. */
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const today = new Date().toISOString().split("T")[0];

  /* Find procurements where:
     - payment_due_date has passed
     - payment_status is still unpaid or partially_paid
     - status is not draft/rejected/cancelled */
  const { data: overdue, error } = await supabase
    .from("procurement_requests")
    .select("id, title, vendor_name, total_amount, amount_paid, payment_due_date, requester_id")
    .lt("payment_due_date", today)
    .in("payment_status", ["unpaid", "partially_paid"])
    .not("status", "in", '("draft","rejected","cancelled")');

  if (error) {
    console.error("[cron/overdue] DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!overdue || overdue.length === 0) {
    return NextResponse.json({ sent: 0, message: "No overdue payments" });
  }

  /* Build recipients: Owners + Finance (Jigar) */
  const recipients = USERS
    .filter(u => u.role === "management" || u.role === "finance")
    .map(u => ({ email: u.email, name: u.name }));

  let sent = 0;
  for (const row of overdue) {
    const dueDate    = new Date(row.payment_due_date);
    const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / 86_400_000);

    /* Only send if: first day overdue OR every 3 days */
    if (daysOverdue !== 1 && daysOverdue % 3 !== 0) continue;

    await emailPaymentOverdue({
      id:          row.id,
      title:       row.title,
      vendorName:  row.vendor_name ?? undefined,
      totalAmount: Number(row.total_amount),
      amountPaid:  Number(row.amount_paid ?? 0),
      dueDate:     row.payment_due_date,
      daysOverdue,
      recipients,
    });
    sent++;
  }

  return NextResponse.json({ sent, total: overdue.length });
}
