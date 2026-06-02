"use client";
import { UserProvider } from "@/contexts/UserContext";
import { DataProvider, useData } from "@/contexts/DataContext";
import Sidebar from "@/components/layout/Sidebar";

function MainContent({ children }: { children: React.ReactNode }) {
  const { loading } = useData();
  return (
    <main className="flex-1 overflow-y-auto relative" style={{ backgroundColor: "var(--bg)" }}>
      {children}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40" style={{ backgroundColor: "var(--bg)" }}>
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent mb-3"
            style={{ borderColor: "var(--primary)", animation: "spin 0.8s linear infinite" }}
          />
          <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Loading workspace…</p>
        </div>
      )}
    </main>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DataProvider>
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
          <Sidebar />
          <MainContent>{children}</MainContent>
        </div>
      </DataProvider>
    </UserProvider>
  );
}
