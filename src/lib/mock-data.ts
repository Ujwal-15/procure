import type {
  User, Vendor, ProcurementEvent, ProcurementRequest,
  PurchaseOrder, Invoice, Payment, Approval
} from "@/types";

export const CURRENT_USER: User = {
  id: "u1",
  name: "Arjun Mehta",
  email: "arjun@eventtech.in",
  role: "management",
  location: "mumbai",
  avatar: "AM",
};

export const USERS: User[] = [
  { id: "u1", name: "Arjun Mehta", email: "arjun@eventtech.in", role: "management", location: "mumbai", avatar: "AM" },
  { id: "u2", name: "Priya Sharma", email: "priya@eventtech.in", role: "finance", location: "bengaluru", avatar: "PS" },
  { id: "u3", name: "Rohan Kapoor", email: "rohan@eventtech.in", role: "procurement", location: "delhi", avatar: "RK" },
  { id: "u4", name: "Ananya Singh", email: "ananya@eventtech.in", role: "procurement", location: "mumbai", avatar: "AS" },
  { id: "u5", name: "Vikram Nair", email: "vikram@eventtech.in", role: "requester", location: "bengaluru", avatar: "VN" },
  { id: "u6", name: "Sneha Reddy", email: "sneha@eventtech.in", role: "requester", location: "delhi", avatar: "SR" },
  { id: "u7", name: "Karan Joshi", email: "karan@eventtech.in", role: "admin", location: "mumbai", avatar: "KJ" },
];

export const VENDORS: Vendor[] = [
  {
    id: "v1", name: "Sharma AV Solutions", contactName: "Rajesh Sharma",
    phone: "+91 98765 43210", email: "rajesh@sharmaav.com",
    category: "AV & Production", location: "Mumbai",
    upiId: "sharmaav@hdfc", isActive: true,
    totalPaid: 4_80_000, totalPending: 1_24_500, createdAt: "2024-01-15",
  },
  {
    id: "v2", name: "TechRent India", contactName: "Aakash Patel",
    phone: "+91 87654 32109", email: "aakash@techrent.in",
    category: "Equipment Rental", location: "Bengaluru",
    upiId: "techrent@icici", isActive: true,
    totalPaid: 3_20_000, totalPending: 62_000, createdAt: "2024-02-01",
  },
  {
    id: "v3", name: "LightCraft Productions", contactName: "Meena Gupta",
    phone: "+91 76543 21098", email: "meena@lightcraft.com",
    category: "Lighting & SFX", location: "Delhi",
    upiId: "lightcraft@sbi", isActive: true,
    totalPaid: 2_80_000, totalPending: 42_000, createdAt: "2024-01-20",
  },
  {
    id: "v4", name: "Kapoor Logistics", contactName: "Sunil Kapoor",
    phone: "+91 65432 10987",
    category: "Logistics & Transport", location: "Mumbai",
    upiId: "kapoor.logistics@paytm", isActive: true,
    totalPaid: 1_60_000, totalPending: 18_500, createdAt: "2024-03-10",
  },
  {
    id: "v5", name: "PrintHub Delhi", contactName: "Divya Malhotra",
    phone: "+91 54321 09876", email: "divya@printhub.in",
    category: "Printing & Branding", location: "Delhi",
    isActive: true, totalPaid: 95_000, totalPending: 8_200, createdAt: "2024-03-15",
  },
  {
    id: "v6", name: "Nexwave Electronics", contactName: "Farhan Sheikh",
    phone: "+91 98123 45678", email: "farhan@nexwave.in",
    category: "Electronics & Components", location: "Bengaluru",
    isActive: true, totalPaid: 2_40_000, totalPending: 0, createdAt: "2024-02-20",
  },
  {
    id: "v7", name: "CreativeFabric Studio", contactName: "Pooja Iyer",
    phone: "+91 91234 56789",
    category: "Fabrication & Decor", location: "Mumbai",
    isActive: true, totalPaid: 1_80_000, totalPending: 35_000, createdAt: "2024-04-01",
  },
  {
    id: "v8", name: "CloudOps Systems", contactName: "Rahul Dev",
    phone: "+91 82345 67890", email: "rahul@cloudops.tech",
    category: "IT & Software", location: "Bengaluru",
    isActive: true, totalPaid: 3_60_000, totalPending: 0, createdAt: "2024-01-10",
  },
];

export const EVENTS: ProcurementEvent[] = [
  {
    id: "e1", name: "Sunburn Goa 2025", location: "Goa",
    eventDate: "2025-12-28", endDate: "2025-12-30",
    estimatedBudget: 15_00_000, status: "upcoming",
    createdBy: "u1", createdAt: "2025-09-01",
  },
  {
    id: "e2", name: "Tech Summit Mumbai 2025", location: "mumbai",
    eventDate: "2025-11-14", endDate: "2025-11-15",
    estimatedBudget: 8_00_000, status: "active",
    createdBy: "u1", createdAt: "2025-08-15",
  },
  {
    id: "e3", name: "Comic Con Bengaluru", location: "bengaluru",
    eventDate: "2025-10-18", endDate: "2025-10-19",
    estimatedBudget: 6_50_000, status: "completed",
    createdBy: "u1", createdAt: "2025-07-01",
  },
  {
    id: "e4", name: "AWS re:Invent India", location: "delhi",
    eventDate: "2025-09-05", endDate: "2025-09-06",
    estimatedBudget: 5_00_000, status: "completed",
    createdBy: "u7", createdAt: "2025-06-10",
  },
  {
    id: "e5", name: "EDC India 2026", location: "mumbai",
    eventDate: "2026-02-21", endDate: "2026-02-23",
    estimatedBudget: 20_00_000, status: "upcoming",
    createdBy: "u1", createdAt: "2025-11-01",
  },
];

export const REQUESTS: ProcurementRequest[] = [
  {
    id: "r1", requestNumber: "PR-2025-0041",
    requesterId: "u5", requesterName: "Vikram Nair",
    eventId: "e1", eventName: "Sunburn Goa 2025",
    department: "event", category: "event",
    items: [{ name: "LED Stage Panels (10x)", qty: 10, unit: "units", estimatedUnitPrice: 4200 }],
    estimatedTotal: 42_000, urgency: "high",
    status: "pending_approval", createdAt: "2025-11-20", updatedAt: "2025-11-20",
  },
  {
    id: "r2", requestNumber: "PR-2025-0040",
    requesterId: "u6", requesterName: "Sneha Reddy",
    eventId: "e2", eventName: "Tech Summit Mumbai 2025",
    department: "embedded", category: "event",
    items: [
      { name: "Raspberry Pi 5 (Model B)", qty: 5, unit: "units", estimatedUnitPrice: 6500 },
      { name: "GPIO Breakout Board", qty: 10, unit: "units", estimatedUnitPrice: 850 },
    ],
    estimatedTotal: 41_000, urgency: "critical",
    status: "invoice_uploaded", createdAt: "2025-11-18", updatedAt: "2025-11-19",
  },
  {
    id: "r3", requestNumber: "PR-2025-0039",
    requesterId: "u5", requesterName: "Vikram Nair",
    department: "r_and_d", category: "r_and_d",
    items: [{ name: "Oscilloscope (Rigol DS1054Z)", qty: 2, unit: "units", estimatedUnitPrice: 18500 }],
    estimatedTotal: 37_000, urgency: "medium",
    status: "ordered", createdAt: "2025-11-15", updatedAt: "2025-11-16",
  },
  {
    id: "r4", requestNumber: "PR-2025-0038",
    requesterId: "u6", requesterName: "Sneha Reddy",
    department: "general_office", category: "general",
    items: [{ name: "Office Stationery Pack", qty: 20, unit: "packs", estimatedUnitPrice: 350 }],
    estimatedTotal: 7_000, urgency: "low",
    status: "closed", createdAt: "2025-11-10", updatedAt: "2025-11-14",
  },
  {
    id: "r5", requestNumber: "PR-2025-0037",
    requesterId: "u5", requesterName: "Vikram Nair",
    eventId: "e2", eventName: "Tech Summit Mumbai 2025",
    department: "software", category: "event",
    items: [{ name: "Figma Teams Subscription (Annual)", qty: 5, unit: "seats", estimatedUnitPrice: 4500 }],
    estimatedTotal: 22_500, urgency: "medium",
    status: "approved", createdAt: "2025-11-08", updatedAt: "2025-11-09",
  },
  {
    id: "r6", requestNumber: "PR-2025-0036",
    requesterId: "u6", requesterName: "Sneha Reddy",
    eventId: "e1", eventName: "Sunburn Goa 2025",
    department: "event", category: "event",
    items: [
      { name: "Stage Truss System (10m)", qty: 2, unit: "units", estimatedUnitPrice: 35000 },
      { name: "Rigging Hardware Set", qty: 4, unit: "sets", estimatedUnitPrice: 8500 },
    ],
    estimatedTotal: 1_04_000, urgency: "high",
    status: "advance_paid", createdAt: "2025-11-05", updatedAt: "2025-11-12",
  },
];

export const INVOICES: Invoice[] = [
  {
    id: "inv1", poId: "po1", poNumber: "PO-2025-0038",
    vendorId: "v1", vendorName: "Sharma AV Solutions",
    eventName: "Tech Summit Mumbai 2025", department: "event",
    invoiceNumber: "SAV-1124", invoiceDate: "2025-11-15",
    dueDate: "2025-11-20",
    grossAmount: 1_24_500, advancePaid: 0, balanceDue: 1_24_500,
    status: "overdue", uploadedBy: "Rohan Kapoor", createdAt: "2025-11-15",
  },
  {
    id: "inv2", poId: "po2", poNumber: "PO-2025-0037",
    vendorId: "v2", vendorName: "TechRent India",
    eventName: "Tech Summit Mumbai 2025", department: "embedded",
    invoiceNumber: "TRI-0892", invoiceDate: "2025-11-18",
    dueDate: "2025-11-25",
    grossAmount: 62_000, advancePaid: 0, balanceDue: 62_000,
    status: "overdue", uploadedBy: "Ananya Singh", createdAt: "2025-11-18",
  },
  {
    id: "inv3", poId: "po3", poNumber: "PO-2025-0036",
    vendorId: "v3", vendorName: "LightCraft Productions",
    eventName: "Sunburn Goa 2025", department: "event",
    invoiceNumber: "LCP-0445", invoiceDate: "2025-11-19",
    dueDate: "2025-11-28",
    grossAmount: 42_000, advancePaid: 0, balanceDue: 42_000,
    status: "pending", uploadedBy: "Rohan Kapoor", createdAt: "2025-11-19",
  },
  {
    id: "inv4", poId: "po4", poNumber: "PO-2025-0035",
    vendorId: "v4", vendorName: "Kapoor Logistics",
    department: "general_office",
    invoiceNumber: "KL-2234", invoiceDate: "2025-11-17",
    dueDate: "2025-11-22",
    grossAmount: 18_500, advancePaid: 0, balanceDue: 18_500,
    status: "overdue", uploadedBy: "Ananya Singh", createdAt: "2025-11-17",
  },
  {
    id: "inv5", poId: "po5", poNumber: "PO-2025-0034",
    vendorId: "v5", vendorName: "PrintHub Delhi",
    eventName: "Sunburn Goa 2025", department: "event",
    invoiceNumber: "PHD-0567", invoiceDate: "2025-11-20",
    dueDate: "2025-11-30",
    grossAmount: 8_200, advancePaid: 0, balanceDue: 8_200,
    status: "pending", uploadedBy: "Rohan Kapoor", createdAt: "2025-11-20",
  },
  {
    id: "inv6", poId: "po6", poNumber: "PO-2025-0033",
    vendorId: "v7", vendorName: "CreativeFabric Studio",
    eventName: "Sunburn Goa 2025", department: "event",
    invoiceNumber: "CFS-0334", invoiceDate: "2025-11-10",
    dueDate: "2025-11-24",
    grossAmount: 70_000, advancePaid: 35_000, balanceDue: 35_000,
    status: "partially_paid", uploadedBy: "Ananya Singh", createdAt: "2025-11-10",
  },
];

export const PAYMENTS: Payment[] = [
  {
    id: "pay1", invoiceId: "inv6", vendorName: "CreativeFabric Studio",
    amount: 35_000, paymentDate: "2025-11-12",
    paymentMode: "neft", referenceNumber: "NEFT20251112ABC123",
    isAdvance: true, paidBy: "Priya Sharma",
  },
  {
    id: "pay2", invoiceId: "inv_old1", vendorName: "Nexwave Electronics",
    amount: 2_40_000, paymentDate: "2025-10-28",
    paymentMode: "neft", referenceNumber: "NEFT20251028XYZ789",
    isAdvance: false, paidBy: "Priya Sharma",
  },
  {
    id: "pay3", invoiceId: "inv_old2", vendorName: "CloudOps Systems",
    amount: 1_80_000, paymentDate: "2025-10-15",
    paymentMode: "imps", referenceNumber: "IMPS20251015DEF456",
    isAdvance: false, paidBy: "Priya Sharma",
  },
];

export const APPROVALS: Approval[] = [
  {
    id: "apr1", requestId: "r1", requestNumber: "PR-2025-0041",
    requesterName: "Vikram Nair", department: "event",
    eventName: "Sunburn Goa 2025",
    items: [{ name: "LED Stage Panels (10x)", qty: 10, unit: "units", estimatedUnitPrice: 4200 }],
    estimatedTotal: 42_000, urgency: "high",
    status: "pending", createdAt: "2025-11-20",
  },
  {
    id: "apr2", requestId: "r_old1", requestNumber: "PR-2025-0035",
    requesterName: "Sneha Reddy", department: "embedded",
    items: [{ name: "Signal Analyser Kit", qty: 1, unit: "unit", estimatedUnitPrice: 28000 }],
    estimatedTotal: 28_000, urgency: "medium",
    status: "approved", createdAt: "2025-11-05",
  },
];

export const SPEND_BY_MONTH = [
  { month: "Jun", amount: 3_20_000 },
  { month: "Jul", amount: 4_80_000 },
  { month: "Aug", amount: 2_90_000 },
  { month: "Sep", amount: 5_60_000 },
  { month: "Oct", amount: 7_20_000 },
  { month: "Nov", amount: 8_42_000 },
];

export const SPEND_BY_DEPARTMENT = [
  { department: "Event", amount: 4_20_000, color: "#FF9F0A" },
  { department: "R&D", amount: 1_80_000, color: "#0071E3" },
  { department: "Embedded", amount: 98_000, color: "#AF52DE" },
  { department: "Software", amount: 62_000, color: "#34C759" },
  { department: "General Office", amount: 40_000, color: "#8E8E93" },
];

export const SPEND_BY_EVENT = [
  { event: "Sunburn Goa 2025", amount: 3_20_000, color: "#FF9F0A" },
  { event: "Tech Summit Mumbai", amount: 2_80_000, color: "#0071E3" },
  { event: "Comic Con BLR", amount: 1_42_000, color: "#AF52DE" },
];

export const TOP_VENDORS = [
  { name: "Sharma AV Solutions", amount: 6_04_500, invoices: 8 },
  { name: "TechRent India", amount: 3_82_000, invoices: 6 },
  { name: "LightCraft Productions", amount: 3_22_000, invoices: 5 },
  { name: "Nexwave Electronics", amount: 2_40_000, invoices: 4 },
  { name: "CloudOps Systems", amount: 3_60_000, invoices: 3 },
];
