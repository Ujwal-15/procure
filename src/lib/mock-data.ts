import type { User } from "@/types";

/* ────────────────────────────────────────────────────────────
   USERS — full 4Brains employee roster
   Roles:
     management  → Alok, Sanjeev, Ujwal   (final approvers)
     finance     → Jigar Parmar           (reviews & marks paid)
     requester   → everyone else          (raises requests)
   ──────────────────────────────────────────────────────────── */
export const USERS: User[] = [
  /* ── Developer (full access) ── */
  { id: "u00", name: "Ujwal Hannehra",         email: "ujwal@4brains.in",             role: "developer",  avatar: "UH" },

  /* ── Management / Owners (approve/reject) ── */
  { id: "u01", name: "Alok Kumar",             email: "alok@4brains.in",              role: "management", avatar: "AK" },
  { id: "u02", name: "Sanjeev Shankar Sinha",  email: "sanjeev@4brains.in",           role: "management", avatar: "SS" },

  /* ── Finance / Accountant ── */
  { id: "u04", name: "Jigar Parmar",           email: "jigar.parmar@4brains.in",      role: "finance",    avatar: "JP" },

  /* ── Operations / Requester ── */
  { id: "u05", name: "Prem Kumar",             email: "prem@4brains.in",              role: "requester",  avatar: "PK" },
  { id: "u06", name: "Yashwant Joshi",         email: "yashwant@4brains.in",          role: "requester",  avatar: "YJ" },
  { id: "u07", name: "Vikram Javaram Bhati",   email: "vikram@4brains.in",            role: "requester",  avatar: "VB" },
  { id: "u08", name: "Sumit Bhadani",          email: "sumit@4brains.in",             role: "requester",  avatar: "SB" },
  { id: "u09", name: "Pawan Kumar",            email: "pawan@4brains.in",             role: "requester",  avatar: "PW" },
  { id: "u10", name: "Varsha Sundariyal",      email: "varsha@4brains.in",            role: "requester",  avatar: "VS" },
  { id: "u11", name: "Akash Rajesh Pandey",    email: "akash.p@4brains.in",           role: "requester",  avatar: "AP" },
  { id: "u12", name: "Akash Ramesh Sandis",    email: "akash@4brains.in",             role: "requester",  avatar: "AS" },
  { id: "u13", name: "Aman Sharma",            email: "aman@4brains.in",              role: "requester",  avatar: "AM" },
  { id: "u14", name: "Ketan Jadhav",           email: "ketan@4brains.in",             role: "requester",  avatar: "KJ" },
  { id: "u15", name: "Shailesh Gautam",        email: "shailesh.gautam@4brains.in",   role: "requester",  avatar: "SG" },
  { id: "u16", name: "Abhinav Daga",           email: "abhinav@4brains.in",           role: "requester",  avatar: "AD" },
  { id: "u17", name: "Pooja Kumari",           email: "pooja@4brains.in",             role: "requester",  avatar: "PO" },
  { id: "u18", name: "Mahinder Bhardwaj",      email: "mahendra@4brains.in",          role: "requester",  avatar: "MB" },
  { id: "u19", name: "Sankalp Patnaik",        email: "sankalp.patnaik@4brains.in",   role: "requester",  avatar: "SP" },
  { id: "u20", name: "Vijay Patil",            email: "vijay.patil@4brains.in",       role: "requester",  avatar: "VP" },
  { id: "u21", name: "Deepanshu Yadav",        email: "deepanshu@4brains.in",         role: "requester",  avatar: "DY" },
  { id: "u22", name: "Nikhil Tiwary",          email: "nikhil.t@4brains.in",          role: "requester",  avatar: "NT" },
  { id: "u23", name: "Shashikant Sharma",      email: "shashikant@4brains.in",        role: "requester",  avatar: "SK" },
  { id: "u24", name: "Rakesh Rao",             email: "rakesh@4brains.in",            role: "requester",  avatar: "RR" },
  { id: "u25", name: "Bharath Gowda",          email: "bharath@4brains.in",           role: "requester",  avatar: "BG" },
  { id: "u26", name: "Abhijeet Kulkarni",      email: "abhijeet@4brains.in",          role: "requester",  avatar: "AJ" },
  { id: "u27", name: "Satish Rana",            email: "satish@4brains.in",            role: "requester",  avatar: "SR" },
  { id: "u28", name: "Rudresh H",              email: "rudresh@4brains.in",           role: "requester",  avatar: "RH" },
  { id: "u29", name: "Sushant Shekhar",        email: "sushant@4brains.in",           role: "requester",  avatar: "SH" },
  { id: "u30", name: "Himanshu Gaud",          email: "himanshu@4brains.in",          role: "requester",  avatar: "HG" },
  { id: "u31", name: "Himanshu Bisht",         email: "himanshu.b@4brains.in",        role: "requester",  avatar: "HB" },
  { id: "u32", name: "Abdul Kadir",            email: "abdul@4brains.in",             role: "requester",  avatar: "AK" },
  { id: "u33", name: "Gurun Kumar",            email: "gurun@4brains.in",             role: "requester",  avatar: "GK" },
  { id: "u34", name: "Praful Sharma",          email: "praful@4brains.in",            role: "requester",  avatar: "PS" },
  { id: "u35", name: "Shashank A S",           email: "shashank@4brains.in",          role: "requester",  avatar: "SA" },
  { id: "u36", name: "Kushal B V",             email: "kushal@4brains.in",            role: "requester",  avatar: "KB" },
  { id: "u37", name: "Jaspal Rana",            email: "jaspal@4brains.in",            role: "requester",  avatar: "JR" },
  { id: "u38", name: "Mukul Sharma",           email: "mukul.sharma@4brains.in",      role: "requester",  avatar: "MS" },
  { id: "u39", name: "Harikesh Singh",         email: "harikesh.singh@4brains.in",    role: "requester",  avatar: "HS" },
  { id: "u40", name: "Vishal Kumar",           email: "vishal.k@4brains.in",          role: "requester",  avatar: "VK" },
  { id: "u41", name: "Nidhisha K",             email: "nidhisha.k@4brains.in",        role: "requester",  avatar: "NK" },
  { id: "u42", name: "Aditi Priya",            email: "aditi.priya@4brains.in",       role: "requester",  avatar: "AI" },
  { id: "u43", name: "Amanat Ansari",          email: "amanat.ansari@4brains.in",     role: "requester",  avatar: "AA" },
  { id: "u44", name: "Ayush Jaiswal",          email: "ayush.jaiswal@4brains.in",     role: "requester",  avatar: "AJ" },
  { id: "u45", name: "Raushan Kumar",          email: "raushan.kumar@4brains.in",     role: "requester",  avatar: "RK" },
  { id: "u46", name: "Sushant Kumar",          email: "sushant.kumar@4brains.in",     role: "requester",  avatar: "SK" },
  { id: "u47", name: "Himangshu Kamila",       email: "himangshu.kamila@4brains.in",  role: "requester",  avatar: "HK" },
  { id: "u48", name: "Shreshth Kujur",         email: "shreshth.kujur@4brains.in",    role: "requester",  avatar: "SK" },
  { id: "u49", name: "Khushi Singh",           email: "khushi.singh@4brains.in",      role: "requester",  avatar: "KS" },
  { id: "u50", name: "Sumit Srivastava",       email: "sumit.srivastava@4brains.in",  role: "requester",  avatar: "SV" },
  { id: "u51", name: "Santhosh V",             email: "santhosh.kumar@4brains.in",    role: "requester",  avatar: "SV" },
  { id: "u52", name: "Sonu Kumar Shaw",        email: "sonu.kumar@4brains.in",        role: "requester",  avatar: "SK" },
  { id: "u53", name: "Vicky Bhardwaj",         email: "vicky.bhardwaj@4brains.in",    role: "requester",  avatar: "VB" },
  { id: "u54", name: "Darakshan Imteyaz",      email: "darakshan.imteyaz@4brains.in", role: "requester",  avatar: "DI" },
  { id: "u55", name: "Nikhil Kumar",           email: "nikhil.kumar@4brains.in",      role: "requester",  avatar: "NK" },
  { id: "u56", name: "Kushan H K",             email: "kushan@4brains.in",            role: "requester",  avatar: "KH" },
  { id: "u57", name: "Roshan V",               email: "roshan@4brains.in",            role: "requester",  avatar: "RV" },
  { id: "u58", name: "Rahul Mehta",            email: "rahul.mehta@4brains.in",       role: "requester",  avatar: "RM" },
  { id: "u59", name: "K Raju",                 email: "raju.kathir@4brains.in",       role: "requester",  avatar: "KR" },
];

/* Default user — overridden at runtime by cookie (UserContext) */
export const CURRENT_USER: User = USERS[0];

/* Analytics — no longer hardcoded; all computed live in pages */
export const TOP_VENDORS: { name: string; amount: number; invoices: number }[] = [];
