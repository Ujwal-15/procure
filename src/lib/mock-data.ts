import type {
  User, Vendor, ProcurementEvent, ProcurementRequest,
  Invoice, Payment, Approval
} from "@/types";

/* ── Team ── */

export const USERS: User[] = [
  { id: "u1", name: "Alok",      email: "alok@eventtech.in",      role: "management", location: "mumbai",    avatar: "AL" },
  { id: "u2", name: "Sanjeev",   email: "sanjeev@eventtech.in",   role: "management", location: "bengaluru", avatar: "SA" },
  { id: "u3", name: "Jigar",     email: "jigar@eventtech.in",     role: "finance",    location: "mumbai",    avatar: "JI" },
  { id: "u4", name: "Prem",      email: "prem@eventtech.in",      role: "requester",  location: "mumbai",    avatar: "PR" },
  { id: "u5", name: "Yashwanth", email: "yashwanth@eventtech.in", role: "requester",  location: "bengaluru", avatar: "YA" },
  { id: "u6", name: "Vikram",    email: "vikram@eventtech.in",    role: "requester",  location: "delhi",     avatar: "VI" },
];

/* Default current user — overridden by UserContext at runtime */
export const CURRENT_USER: User = USERS[3]; // Prem

/* ── Vendors ── */
export const VENDORS: Vendor[] = [
  {
    id: "v1", name: "LightCraft Productions", contactName: "Meena Gupta",
    phone: "+91 98765 43210", email: "meena@lightcraft.com",
    category: "LED & AV Production", location: "Mumbai",
    upiId: "lightcraft@icici", isActive: true,
    totalPaid: 59_000, totalPending: 1_28_000, createdAt: "2026-01-01",
  },
  {
    id: "v2", name: "EmbedTech Supplies", contactName: "Vikrant Shah",
    phone: "+91 87654 32109", email: "vikrant@embedtech.in",
    category: "Electronics & PCB", location: "Bengaluru",
    upiId: "embedtech@hdfc", isActive: true,
    totalPaid: 48_800, totalPending: 0, createdAt: "2026-01-01",
  },
  {
    id: "v3", name: "SketchBot Labs", contactName: "Aarav Nair",
    phone: "+91 76543 21098", email: "aarav@sketchbotlabs.com",
    category: "Robotics & Automation", location: "Mumbai",
    isActive: true, totalPaid: 57_000, totalPending: 0, createdAt: "2026-01-01",
  },
  {
    id: "v4", name: "Office Essentials", contactName: "Rekha Patel",
    phone: "+91 65432 10987",
    category: "Office Supplies", location: "Mumbai",
    isActive: true, totalPaid: 16_200, totalPending: 0, createdAt: "2026-01-01",
  },
  {
    id: "v5", name: "PC Rentals India", contactName: "Amit Desai",
    phone: "+91 54321 09876", email: "amit@pcrentals.in",
    category: "Equipment Rental", location: "Delhi",
    isActive: true, totalPaid: 42_000, totalPending: 0, createdAt: "2026-01-01",
  },
  {
    id: "v6", name: "Glambot Studios", contactName: "Riya Menon",
    phone: "+91 91234 56789", email: "riya@glambotstudios.com",
    category: "Event Tech & Production", location: "Bengaluru",
    upiId: "glambot@axis", isActive: true,
    totalPaid: 0, totalPending: 50_000, createdAt: "2026-04-01",
  },
];

/* ── Events ── */
export const EVENTS: ProcurementEvent[] = [
  { id: "e1", name: "PWC Event",       location: "mumbai",    eventDate: "2026-05-15", estimatedBudget: 2_00_000, status: "completed", createdBy: "u4", createdAt: "2026-04-20" },
  { id: "e2", name: "Paulo Alto",      location: "bengaluru", eventDate: "2026-05-22", estimatedBudget: 3_50_000, status: "active",    createdBy: "u4", createdAt: "2026-04-25" },
  { id: "e3", name: "Spectra",         location: "delhi",     eventDate: "2026-06-10", estimatedBudget: 5_00_000, status: "upcoming",  createdBy: "u5", createdAt: "2026-04-15" },
  { id: "e4", name: "Verve Tiles R&D", location: "mumbai",    eventDate: "2026-07-01", estimatedBudget: 1_50_000, status: "upcoming",  createdBy: "u4", createdAt: "2026-04-01" },
];

/* ── Procurement Requests ─────────────────────────────────────────────────── */
export const REQUESTS: ProcurementRequest[] = [
  /* ─── January 2026 ─── */
  {
    id: "r1", requestNumber: "PR-2026-0001",
    requesterId: "u6", requesterName: "Vikram",
    department: "embedded", category: "general",
    items: [{ name: "Soldering Station (Hakko FX-951)", qty: 1, unit: "unit", estimatedUnitPrice: 8_500 }],
    estimatedTotal: 8_500,
    status: "closed", createdAt: "2026-01-05", updatedAt: "2026-01-10",
  },
  {
    id: "r2", requestNumber: "PR-2026-0002",
    requesterId: "u4", requesterName: "Prem",
    department: "general_office", category: "general",
    items: [{ name: "Office Stationery & Printing Supplies", qty: 1, unit: "lot", estimatedUnitPrice: 4_200 }],
    estimatedTotal: 4_200,
    status: "closed", createdAt: "2026-01-08", updatedAt: "2026-01-12",
  },
  {
    id: "r3", requestNumber: "PR-2026-0003",
    requesterId: "u5", requesterName: "Yashwanth",
    department: "event", category: "event",
    items: [{ name: "LED Stage Panels", qty: 6, unit: "panels", estimatedUnitPrice: 4_000 }],
    estimatedTotal: 24_000,
    status: "closed", createdAt: "2026-01-12", updatedAt: "2026-01-22",
  },
  {
    id: "r4", requestNumber: "PR-2026-0004",
    requesterId: "u4", requesterName: "Prem",
    department: "r_and_d", category: "r_and_d",
    items: [{ name: "MacBook Pro Rental (2 weeks)", qty: 1, unit: "unit", estimatedUnitPrice: 18_000 }],
    estimatedTotal: 18_000,
    status: "closed", createdAt: "2026-01-20", updatedAt: "2026-01-28",
  },

  /* ─── February 2026 ─── */
  {
    id: "r5", requestNumber: "PR-2026-0005",
    requesterId: "u6", requesterName: "Vikram",
    department: "embedded", category: "general",
    items: [{ name: "Arduino Mega Board", qty: 5, unit: "units", estimatedUnitPrice: 1_300 }],
    estimatedTotal: 6_500,
    status: "closed", createdAt: "2026-02-03", updatedAt: "2026-02-08",
  },
  {
    id: "r6", requestNumber: "PR-2026-0006",
    requesterId: "u5", requesterName: "Yashwanth",
    department: "embedded", category: "general",
    items: [{ name: "LED Strip 12V 5m Roll", qty: 4, unit: "rolls", estimatedUnitPrice: 2_450 }],
    estimatedTotal: 9_800,
    status: "closed", createdAt: "2026-02-08", updatedAt: "2026-02-14",
  },
  {
    id: "r7", requestNumber: "PR-2026-0007",
    requesterId: "u4", requesterName: "Prem",
    department: "r_and_d", category: "r_and_d",
    items: [{ name: "Sketchbot Kit v2", qty: 1, unit: "kit", estimatedUnitPrice: 35_000 }],
    estimatedTotal: 35_000,
    status: "closed", createdAt: "2026-02-14", updatedAt: "2026-02-26",
  },
  {
    id: "r8", requestNumber: "PR-2026-0008",
    requesterId: "u6", requesterName: "Vikram",
    department: "embedded", category: "general",
    items: [{ name: "PCB Fabrication Batch (Gerber files)", qty: 1, unit: "batch", estimatedUnitPrice: 12_000 }],
    estimatedTotal: 12_000,
    status: "closed", createdAt: "2026-02-20", updatedAt: "2026-02-28",
  },

  /* ─── March 2026 ─── */
  {
    id: "r9", requestNumber: "PR-2026-0009",
    requesterId: "u4", requesterName: "Prem",
    department: "software", category: "general",
    items: [{ name: "HP Laptop Rental (1 month)", qty: 1, unit: "unit", estimatedUnitPrice: 15_000 }],
    estimatedTotal: 15_000,
    status: "closed", createdAt: "2026-03-04", updatedAt: "2026-03-10",
  },
  {
    id: "r10", requestNumber: "PR-2026-0010",
    requesterId: "u5", requesterName: "Yashwanth",
    department: "embedded", category: "general",
    items: [{ name: "LED Driver Controller", qty: 4, unit: "units", estimatedUnitPrice: 1_800 }],
    estimatedTotal: 7_200,
    status: "closed", createdAt: "2026-03-08", updatedAt: "2026-03-14",
  },
  {
    id: "r11", requestNumber: "PR-2026-0011",
    requesterId: "u6", requesterName: "Vikram",
    department: "embedded", category: "general",
    items: [{ name: "Weller WE1010 Soldering Station", qty: 1, unit: "unit", estimatedUnitPrice: 3_800 }],
    estimatedTotal: 3_800,
    status: "closed", createdAt: "2026-03-12", updatedAt: "2026-03-18",
  },
  {
    id: "r12", requestNumber: "PR-2026-0012",
    requesterId: "u4", requesterName: "Prem",
    department: "general_office", category: "general",
    items: [{ name: "Office Groceries & Snacks", qty: 1, unit: "lot", estimatedUnitPrice: 5_500 }],
    estimatedTotal: 5_500,
    status: "closed", createdAt: "2026-03-15", updatedAt: "2026-03-18",
  },
  {
    id: "r13", requestNumber: "PR-2026-0013",
    requesterId: "u5", requesterName: "Yashwanth",
    department: "event", category: "event",
    items: [{ name: "DSLR Camera Rental (for production)", qty: 1, unit: "unit", estimatedUnitPrice: 12_000 }],
    estimatedTotal: 12_000,
    status: "closed", createdAt: "2026-03-20", updatedAt: "2026-03-28",
  },

  /* ─── April 2026 ─── */
  {
    id: "r14", requestNumber: "PR-2026-0014",
    requesterId: "u4", requesterName: "Prem",
    department: "r_and_d", category: "r_and_d",
    items: [{ name: "Sketchbot Sensor Pack v3", qty: 1, unit: "kit", estimatedUnitPrice: 22_000 }],
    estimatedTotal: 22_000,
    status: "approved", createdAt: "2026-04-02", updatedAt: "2026-04-05",
  },
  {
    id: "r15", requestNumber: "PR-2026-0015",
    requesterId: "u6", requesterName: "Vikram",
    department: "embedded", category: "general",
    items: [{ name: "ESP32 Microcontroller", qty: 10, unit: "units", estimatedUnitPrice: 450 }],
    estimatedTotal: 4_500,
    status: "closed", createdAt: "2026-04-07", updatedAt: "2026-04-12",
  },
  {
    id: "r16", requestNumber: "PR-2026-0016",
    requesterId: "u5", requesterName: "Yashwanth",
    department: "event", category: "event",
    items: [{ name: "LED Wall Panel Array (Stage)", qty: 1, unit: "set", estimatedUnitPrice: 68_000 }],
    estimatedTotal: 68_000,
    advancePaid: 25_000,
    status: "invoice_uploaded", createdAt: "2026-04-12", updatedAt: "2026-04-25",
  },
  {
    id: "r17", requestNumber: "PR-2026-0017",
    requesterId: "u4", requesterName: "Prem",
    department: "event", category: "event",
    items: [{ name: "MacBook Air Rental (for event)", qty: 1, unit: "unit", estimatedUnitPrice: 9_000 }],
    estimatedTotal: 9_000,
    status: "closed", createdAt: "2026-04-18", updatedAt: "2026-04-25",
  },
  {
    id: "r18", requestNumber: "PR-2026-0018",
    requesterId: "u6", requesterName: "Vikram",
    department: "embedded", category: "general",
    items: [{ name: "Wire & Connector Kit", qty: 1, unit: "kit", estimatedUnitPrice: 2_800 }],
    estimatedTotal: 2_800,
    status: "closed", createdAt: "2026-04-22", updatedAt: "2026-04-26",
  },

  /* ─── May 2026 ─── */
  {
    id: "r19", requestNumber: "PR-2026-0019",
    requesterId: "u4", requesterName: "Prem",
    department: "r_and_d", category: "r_and_d",
    eventName: "Verve Tiles",
    items: [{ name: "Acrylic Sheets (10mm, A3)", qty: 20, unit: "sheets", estimatedUnitPrice: 1_400 }],
    estimatedTotal: 28_000,
    status: "pending_approval", createdAt: "2026-05-05", updatedAt: "2026-05-05",
  },
  {
    id: "r20", requestNumber: "PR-2026-0020",
    requesterId: "u4", requesterName: "Prem",
    department: "event", category: "event",
    eventName: "PWC Event",
    items: [{ name: "Branded Tote Bags (200 pcs)", qty: 200, unit: "pcs", estimatedUnitPrice: 160 }],
    estimatedTotal: 32_000,
    status: "pending_approval", createdAt: "2026-05-08", updatedAt: "2026-05-08",
  },
  {
    id: "r21", requestNumber: "PR-2026-0021",
    requesterId: "u4", requesterName: "Prem",
    department: "event", category: "event",
    eventName: "Paulo Alto",
    items: [{ name: "Bilimbe (Glambot unit)", qty: 1, unit: "unit", estimatedUnitPrice: 50_000 }],
    estimatedTotal: 50_000,
    advancePaid: 20_000,
    status: "approved", createdAt: "2026-05-12", updatedAt: "2026-05-14",
  },
  {
    id: "r22", requestNumber: "PR-2026-0022",
    requesterId: "u5", requesterName: "Yashwanth",
    department: "event", category: "event",
    eventName: "Spectra",
    items: [{ name: "LED Strips RGBW 15m", qty: 10, unit: "rolls", estimatedUnitPrice: 13_500 }],
    estimatedTotal: 1_35_000,
    advancePaid: 50_000,
    status: "ordered", createdAt: "2026-05-15", updatedAt: "2026-05-18",
  },
  {
    id: "r23", requestNumber: "PR-2026-0023",
    requesterId: "u4", requesterName: "Prem",
    department: "general_office", category: "general",
    items: [{ name: "Office Groceries & Pantry", qty: 1, unit: "lot", estimatedUnitPrice: 6_500 }],
    estimatedTotal: 6_500,
    status: "closed", createdAt: "2026-05-18", updatedAt: "2026-05-20",
  },
  {
    id: "r24", requestNumber: "PR-2026-0024",
    requesterId: "u6", requesterName: "Vikram",
    department: "embedded", category: "general",
    items: [{ name: "PCB Motor Controller v2", qty: 1, unit: "unit", estimatedUnitPrice: 3_500 }],
    estimatedTotal: 3_500,
    status: "closed", createdAt: "2026-05-20", updatedAt: "2026-05-22",
  },
];

/* ── Invoices ── */
export const INVOICES: Invoice[] = [
  {
    id: "inv1", poId: "po1", poNumber: "PO-2026-003",
    vendorId: "v1", vendorName: "LightCraft Productions",
    department: "event",
    invoiceNumber: "LC-0101", invoiceDate: "2026-01-20", dueDate: "2026-02-05",
    grossAmount: 24_000, advancePaid: 0, balanceDue: 0,
    status: "paid", uploadedBy: "Prem", createdAt: "2026-01-20",
  },
  {
    id: "inv2", poId: "po2", poNumber: "PO-2026-007",
    vendorId: "v3", vendorName: "SketchBot Labs",
    department: "r_and_d",
    invoiceNumber: "SBL-0201", invoiceDate: "2026-02-20", dueDate: "2026-03-05",
    grossAmount: 35_000, advancePaid: 0, balanceDue: 0,
    status: "paid", uploadedBy: "Prem", createdAt: "2026-02-20",
  },
  {
    id: "inv3", poId: "po3", poNumber: "PO-2026-016",
    vendorId: "v1", vendorName: "LightCraft Productions",
    department: "event",
    invoiceNumber: "LC-0402", invoiceDate: "2026-04-20", dueDate: "2026-05-05",
    grossAmount: 68_000, advancePaid: 25_000, balanceDue: 43_000,
    status: "overdue", uploadedBy: "Yashwanth", createdAt: "2026-04-20",
  },
  {
    id: "inv4", poId: "po4", poNumber: "PO-2026-021",
    vendorId: "v6", vendorName: "Glambot Studios",
    eventName: "Paulo Alto", department: "event",
    invoiceNumber: "GS-0501", invoiceDate: "2026-05-15", dueDate: "2026-06-10",
    grossAmount: 50_000, advancePaid: 20_000, balanceDue: 30_000,
    status: "pending", uploadedBy: "Prem", createdAt: "2026-05-15",
  },
  {
    id: "inv5", poId: "po5", poNumber: "PO-2026-022",
    vendorId: "v1", vendorName: "LightCraft Productions",
    eventName: "Spectra", department: "event",
    invoiceNumber: "LC-0502", invoiceDate: "2026-05-18", dueDate: "2026-06-15",
    grossAmount: 1_35_000, advancePaid: 50_000, balanceDue: 85_000,
    status: "pending", uploadedBy: "Yashwanth", createdAt: "2026-05-18",
  },
];

/* ── Payments ── */
export const PAYMENTS: Payment[] = [
  { id: "pay1", invoiceId: "inv1", vendorName: "LightCraft Productions", amount: 24_000,  paymentDate: "2026-01-28", paymentMode: "neft", referenceNumber: "NEFT20260128LC001", isAdvance: false, paidBy: "Jigar" },
  { id: "pay2", invoiceId: "inv2", vendorName: "SketchBot Labs",         amount: 35_000,  paymentDate: "2026-02-28", paymentMode: "neft", referenceNumber: "NEFT20260228SBL01", isAdvance: false, paidBy: "Jigar" },
  { id: "pay3", invoiceId: "inv3", vendorName: "LightCraft Productions", amount: 25_000,  paymentDate: "2026-04-25", paymentMode: "neft", referenceNumber: "NEFT20260425LC002", isAdvance: true,  paidBy: "Jigar" },
  { id: "pay4", invoiceId: "inv4", vendorName: "Glambot Studios",        amount: 20_000,  paymentDate: "2026-05-15", paymentMode: "upi",  referenceNumber: "UPI20260515GS001",  isAdvance: true,  paidBy: "Jigar" },
  { id: "pay5", invoiceId: "inv5", vendorName: "LightCraft Productions", amount: 50_000,  paymentDate: "2026-05-20", paymentMode: "neft", referenceNumber: "NEFT20260520LC003", isAdvance: true,  paidBy: "Jigar" },
];

/* ── Approvals (only requests > ₹15,000) ── */
export const APPROVALS: Approval[] = [
  /* Jan–Apr (all approved / historical) */
  { id: "apr1", requestId: "r3",  requestNumber: "PR-2026-0003", requesterName: "Yashwanth", department: "event",  items: [{ name: "LED Stage Panels",             qty: 6,   unit: "panels", estimatedUnitPrice: 4_000  }], estimatedTotal: 24_000,  status: "approved", createdAt: "2026-01-12" },
  { id: "apr2", requestId: "r4",  requestNumber: "PR-2026-0004", requesterName: "Prem",      department: "r_and_d",items: [{ name: "MacBook Pro Rental (2 weeks)",  qty: 1,   unit: "unit",   estimatedUnitPrice: 18_000 }], estimatedTotal: 18_000,  status: "approved", createdAt: "2026-01-20" },
  { id: "apr3", requestId: "r7",  requestNumber: "PR-2026-0007", requesterName: "Prem",      department: "r_and_d",items: [{ name: "Sketchbot Kit v2",               qty: 1,   unit: "kit",    estimatedUnitPrice: 35_000 }], estimatedTotal: 35_000,  status: "approved", createdAt: "2026-02-14" },
  { id: "apr4", requestId: "r14", requestNumber: "PR-2026-0014", requesterName: "Prem",      department: "r_and_d",items: [{ name: "Sketchbot Sensor Pack v3",       qty: 1,   unit: "kit",    estimatedUnitPrice: 22_000 }], estimatedTotal: 22_000,  status: "approved", createdAt: "2026-04-02" },
  { id: "apr5", requestId: "r16", requestNumber: "PR-2026-0016", requesterName: "Yashwanth", department: "event",  items: [{ name: "LED Wall Panel Array (Stage)",  qty: 1,   unit: "set",    estimatedUnitPrice: 68_000 }], estimatedTotal: 68_000,  advancePaid: 25_000, status: "approved", createdAt: "2026-04-12" },
  /* May 2026 — 2 pending, 2 approved */
  { id: "apr6", requestId: "r19", requestNumber: "PR-2026-0019", requesterName: "Prem",      department: "r_and_d",eventName: "Verve Tiles",items: [{ name: "Acrylic Sheets (10mm, A3)",    qty: 20,  unit: "sheets", estimatedUnitPrice: 1_400  }], estimatedTotal: 28_000,  status: "pending",  createdAt: "2026-05-05" },
  { id: "apr7", requestId: "r20", requestNumber: "PR-2026-0020", requesterName: "Prem",      department: "event",  eventName: "PWC Event",  items: [{ name: "Branded Tote Bags (200 pcs)", qty: 200, unit: "pcs",    estimatedUnitPrice: 160    }], estimatedTotal: 32_000,  status: "pending",  createdAt: "2026-05-08" },
  { id: "apr8", requestId: "r21", requestNumber: "PR-2026-0021", requesterName: "Prem",      department: "event",  eventName: "Paulo Alto", items: [{ name: "Bilimbe (Glambot unit)",        qty: 1,   unit: "unit",   estimatedUnitPrice: 50_000 }], estimatedTotal: 50_000,  advancePaid: 20_000, status: "approved", createdAt: "2026-05-12" },
  { id: "apr9", requestId: "r22", requestNumber: "PR-2026-0022", requesterName: "Yashwanth", department: "event",  eventName: "Spectra",    items: [{ name: "LED Strips RGBW 15m",          qty: 10,  unit: "rolls",  estimatedUnitPrice: 13_500 }], estimatedTotal: 1_35_000,advancePaid: 50_000, status: "approved", createdAt: "2026-05-15" },
];

/* ── Analytics aggregates (Jan – May 2026) ── */

export const SPEND_BY_MONTH = [
  { month: "Jan", amount:   54_700 },
  { month: "Feb", amount:   63_300 },
  { month: "Mar", amount:   43_500 },
  { month: "Apr", amount: 1_06_300 },
  { month: "May", amount: 2_55_000 },
];

export const SPEND_BY_DEPARTMENT = [
  { department: "Event",          amount: 3_30_000, color: "#FF9F0A" },
  { department: "R&D",            amount: 1_03_000, color: "#006FBA" },
  { department: "Embedded",       amount:   58_600, color: "#00BDCD" },
  { department: "Software",       amount:   15_000, color: "#00AE5E" },
  { department: "General Office", amount:   16_200, color: "#8E8E93" },
];

export const SPEND_BY_EVENT = [
  { event: "Spectra",    amount: 1_35_000, color: "#FF9F0A" },
  { event: "Paulo Alto", amount:   50_000, color: "#0071E3" },
  { event: "PWC Event",  amount:   32_000, color: "#AF52DE" },
];

export const TOP_VENDORS = [
  { name: "LightCraft Productions", amount: 2_27_000, invoices: 3 },
  { name: "EmbedTech Supplies",     amount:    48_800, invoices: 8 },
  { name: "SketchBot Labs",         amount:    57_000, invoices: 2 },
  { name: "PC Rentals India",       amount:    42_000, invoices: 3 },
  { name: "Glambot Studios",        amount:    50_000, invoices: 1 },
];
