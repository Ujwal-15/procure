"use client";
import { UserProvider } from "@/contexts/UserContext";
import { DataProvider } from "@/contexts/DataContext";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DataProvider>
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
          <Sidebar />
          <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "var(--bg)" }}>
            {children}
          </main>
        </div>
      </DataProvider>
    </UserProvider>
  );
}
