"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        localStorage.setItem("app_user_email", email.trim().toLowerCase());
        window.location.href = "/dashboard";
      } else {
        const data = await res.json();
        setError(data.error ?? "Login failed");
        setLoading(false);
      }
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4"
            style={{ boxShadow: "0 8px 32px rgba(0,111,186,0.35)" }}
          >
            <span className="text-white text-2xl font-bold tracking-tight">P</span>
          </div>
          <h1 className="text-[26px] font-bold tracking-tight gradient-text">Procure</h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--text-3)" }}>4Brains · Internal workspace</p>
        </div>

        <form onSubmit={handleLogin} className="card p-6 space-y-4">

          <div>
            <label className="block text-[12px] font-medium text-1 mb-1.5">Work email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              required
              autoFocus
              autoComplete="email"
              className="field"
              placeholder="you@4brains.in"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-1 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                required
                autoComplete="current-password"
                className="field"
                placeholder="••••••••"
                style={{ paddingRight: 44 }}
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

          {error && (
            <p className="text-[12.5px] font-medium" style={{ color: "var(--danger)" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-primary w-full justify-center"
            style={{ padding: "12px 16px", fontSize: 14 }}
          >
            {loading ? (
              <span
                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                style={{ animation: "spin 0.7s linear infinite" }}
              />
            ) : "Sign in →"}
          </button>
        </form>

        <p className="text-center text-[11.5px] mt-5" style={{ color: "var(--text-3)" }}>
          Use your 4Brains email and the shared team password
        </p>
      </div>
    </div>
  );
}
