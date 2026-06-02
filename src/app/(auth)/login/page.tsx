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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-[0_8px_32px_rgba(79,70,229,0.35)]">
            <span className="text-white text-2xl font-bold tracking-tight">P</span>
          </div>
          <h1 className="text-[26px] font-bold tracking-tight gradient-text">Procure</h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--text-3)" }}>Sign in to your workspace</p>
        </div>

        <form onSubmit={handleLogin} className="card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-1 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="field"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-1 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="field"
                  placeholder="••••••••"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-3)" }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center mt-5"
            style={{ padding: "12px 16px", fontSize: 14 }}
          >
            {loading ? (
              <span
                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                style={{ animation: "spin 0.7s linear infinite" }}
              />
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[12px] mt-6" style={{ color: "var(--text-3)" }}>
          Procurement &amp; Vendor Payment Platform
        </p>
      </div>
    </div>
  );
}
