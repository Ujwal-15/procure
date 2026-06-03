"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { USERS } from "@/lib/mock-data";
import type { User } from "@/types";

interface UserContextType {
  currentUser: User;
}

const UserContext = createContext<UserContextType | null>(null);

function resolveUser(): User {
  if (typeof window === "undefined") return USERS[0];
  try {
    const stored = localStorage.getItem("app_user_email");
    if (stored) {
      const user = USERS.find(u => u.email.toLowerCase() === stored.toLowerCase());
      if (user) return user;
    }
  } catch {}
  const match = document.cookie.match(/(?:^|;\s*)app_user=([^;]*)/);
  if (match) {
    const email = decodeURIComponent(match[1]).toLowerCase();
    const user  = USERS.find(u => u.email.toLowerCase() === email);
    if (user) return user;
  }
  return USERS[0];
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);

  useEffect(() => {
    setCurrentUser(resolveUser());
  }, []);

  return (
    <UserContext.Provider value={{ currentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within UserProvider");
  return ctx;
}
