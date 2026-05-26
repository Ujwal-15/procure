"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("arjun@eventtech.in");
  const [password, setPassword] = useState("password");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#1D1D1F] flex items-center justify-center mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
            <span className="text-white text-2xl font-semibold tracking-tight">P</span>
          </div>
          <h1 className="text-[24px] font-semibold text-[#1D1D1F] tracking-tight">Procure</h1>
          <p className="text-[14px] text-[#636366] mt-1">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-[#E8E8ED] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent placeholder:text-[#AEAEB2] transition-all"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 text-[14px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent placeholder:text-[#AEAEB2] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AEAEB2] hover:text-[#636366] transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full py-3 text-[14px] font-semibold text-white bg-[#1D1D1F] rounded-xl hover:bg-[#3A3A3C] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#AEAEB2] mt-6">
          Procurement & Vendor Payment Platform
        </p>
      </div>
    </div>
  );
}
