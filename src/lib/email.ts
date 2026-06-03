import { Resend } from "resend";
import { supabase } from "./supabase";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM   = "4Brains Procure <noreply@4brains.in>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://procure.4brains.in";

/* ─── base HTML template ─────────────────────────────────────────────── */
function base(content: string, ctaHref?: string, ctaLabel?: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#EDF5FB;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EDF5FB;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,111,186,0.10);">
        <!-- header -->
        <tr>
          <td style="background:linear-gradient(135deg,#006FBA,#00BDCD);padding:28px 36px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:20px;font-weight:700;">P</span>
              </div>
              <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">4Brains Procure</span>
            </div>
          </td>
        </tr>
        <!-- body -->
        <tr><td style="padding:36px;">
          ${content}
          ${ctaHref ? `
          <div style="margin-top:28px;">
            <a href="${ctaHref}" style="display:inline-block;background:linear-gradient(135deg,#006FBA,#00BDCD);color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">${ctaLabel ?? "View Entry"}</a>
          </div>` : ""}
        </td></tr>
        <!-- footer -->
        <tr><td style="padding:20px 36px;border-top:1px solid #C4DCEC;">
          <p style="color:#6899B5;font-size:12px;margin:0;">This is an automated message from 4Brains Procurement System. Do not reply to this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#6899B5;font-size:13px;width:160px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;color:#0A2540;font-size:13px;font-weight:500;">${value}</td>
  </tr>`;
}

function section(title: string, rows: string): string {
  return `
  <h2 style="color:#0A2540;font-size:17px;font-weight:700;margin:0 0 16px 0;">${title}</h2>
  <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">${rows}</table>`;
}

/* ─── log email to Supabase ─────────────────────────────────────────────── */
async function logEmail(opts: {
  recipientEmail: string; recipientName: string;
  subject: string; emailType: string;
  procurementId?: string; sentBy?: string;
}) {
  if (!supabase) return;
  await supabase.from("email_log").insert({
    id:               crypto.randomUUID(),
    recipient_email:  opts.recipientEmail,
    recipient_name:   opts.recipientName,
    subject:          opts.subject,
    email_type:       opts.emailType,
    procurement_id:   opts.procurementId ?? null,
    sent_at:          new Date().toISOString(),
    sent_by:          opts.sentBy ?? null,
  });
}

/* ─── send helper ───────────────────────────────────────────────────────── */
async function send(opts: {
  to: { email: string; name: string }[];
  subject: string;
  html: string;
  emailType: string;
  procurementId?: string;
  sentBy?: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — email not sent:", opts.subject);
    return;
  }
  try {
    await resend.emails.send({
      from:    FROM,
      to:      opts.to.map(t => `${t.name} <${t.email}>`),
      subject: opts.subject,
      html:    opts.html,
    });
    for (const t of opts.to) {
      await logEmail({ ...opts, recipientEmail: t.email, recipientName: t.name });
    }
  } catch (err) {
    console.error("[email] send error:", err);
  }
}

/* ─── Trigger 1 — Submitted for Approval ─────────────────────────────── */
export async function emailSubmittedForApproval(p: {
  id: string; title: string; vendorName?: string;
  totalAmount: number; category: string; projectName?: string;
  submittedBy: string; owners: { email: string; name: string }[];
}) {
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const subject = `[Approval Needed] ${p.title} — ${fmt(p.totalAmount)}`;
  const html = base(
    section("New Procurement Submitted",
      row("Submitted by", p.submittedBy) +
      row("Title", p.title) +
      row("Vendor", p.vendorName ?? "—") +
      row("Category", p.category) +
      row("Total Amount", fmt(p.totalAmount)) +
      (p.projectName ? row("Project / Event", p.projectName) : "")
    ) +
    `<p style="color:#6899B5;font-size:13px;margin:0;">Click below to review and approve or reject this procurement request.</p>`,
    `${APP_URL}/procurement/${p.id}`,
    "Review & Approve"
  );
  await send({ to: p.owners, subject, html, emailType: "submitted_for_approval", procurementId: p.id });
}

/* ─── Trigger 2 — Approved ──────────────────────────────────────────── */
export async function emailApproved(p: {
  id: string; title: string; approvedBy: string;
  requester: { email: string; name: string };
}) {
  const subject = `[Approved] ${p.title}`;
  const html = base(
    section("Procurement Approved ✓",
      row("Title", p.title) +
      row("Approved by", p.approvedBy) +
      row("Date", new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }))
    ) +
    `<p style="color:#6899B5;font-size:13px;margin:0;">Your procurement request has been approved. You can now proceed.</p>`,
    `${APP_URL}/procurement/${p.id}`
  );
  await send({ to: [p.requester], subject, html, emailType: "approved", procurementId: p.id });
}

/* ─── Trigger 3 — Rejected ──────────────────────────────────────────── */
export async function emailRejected(p: {
  id: string; title: string; rejectedBy: string; reason: string;
  requester: { email: string; name: string };
}) {
  const subject = `[Rejected] ${p.title} — Action Required`;
  const html = base(
    section("Procurement Rejected",
      row("Title", p.title) +
      row("Rejected by", p.rejectedBy) +
      row("Reason", p.reason)
    ) +
    `<p style="color:#6899B5;font-size:13px;margin:0;">Please review the rejection reason above and create a new request if needed.</p>`,
    `${APP_URL}/procurement/${p.id}`,
    "View Entry"
  );
  await send({ to: [p.requester], subject, html, emailType: "rejected", procurementId: p.id });
}

/* ─── Trigger 4 — Payment Overdue Reminder ──────────────────────────── */
export async function emailPaymentOverdue(p: {
  id: string; title: string; vendorName?: string;
  totalAmount: number; amountPaid: number; dueDate: string; daysOverdue: number;
  recipients: { email: string; name: string }[];
}) {
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const outstanding = p.totalAmount - p.amountPaid;
  const subject = `[Payment Overdue] ${p.title} — ${p.daysOverdue} days past due`;
  const html = base(
    `<div style="background:#FEF0F0;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
      <p style="color:#F52F34;font-weight:700;font-size:15px;margin:0;">⚠ Payment Overdue — ${p.daysOverdue} day${p.daysOverdue !== 1 ? "s" : ""}</p>
    </div>` +
    section("Overdue Payment Details",
      row("Title", p.title) +
      row("Vendor", p.vendorName ?? "—") +
      row("Total Amount", fmt(p.totalAmount)) +
      row("Amount Paid", fmt(p.amountPaid)) +
      row("Outstanding", fmt(outstanding)) +
      row("Due Date", new Date(p.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })) +
      row("Days Overdue", String(p.daysOverdue))
    ),
    `${APP_URL}/procurement/${p.id}`,
    "Update Payment"
  );
  await send({ to: p.recipients, subject, html, emailType: "payment_overdue", procurementId: p.id });
}

/* ─── Trigger 5 — Payment Fully Recorded ────────────────────────────── */
export async function emailPaymentComplete(p: {
  id: string; title: string; totalAmount: number;
  paymentDate: string; paymentMode?: string; transactionRef?: string;
  recipients: { email: string; name: string }[];
}) {
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  const subject = `[Payment Complete] ${p.title}`;
  const html = base(
    `<div style="background:#E4F8EE;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
      <p style="color:#00AE5E;font-weight:700;font-size:15px;margin:0;">✓ Payment Fully Recorded</p>
    </div>` +
    section("Payment Details",
      row("Title", p.title) +
      row("Total Amount", fmt(p.totalAmount)) +
      row("Payment Date", new Date(p.paymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })) +
      row("Mode", p.paymentMode ?? "—") +
      row("Reference", p.transactionRef ?? "—")
    ),
    `${APP_URL}/procurement/${p.id}`
  );
  await send({ to: p.recipients, subject, html, emailType: "payment_complete", procurementId: p.id });
}
