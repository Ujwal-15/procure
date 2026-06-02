"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { USERS } from "@/lib/mock-data";
import type { User } from "@/types";

/* The 3 users you can switch between in this demo */
const SWITCHABLE_IDS = ["u4", "u3", "u1"]; // Prem (requester), Jigar (finance), Alok (management)

interface UserContextType {
  currentUser: User;
  setCurrentUser: (u: User) => void;
  switchableUsers: User[];
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const switchableUsers = SWITCHABLE_IDS.map(id => USERS.find(u => u.id === id)!).filter(Boolean);
  const [currentUser, setCurrentUser] = useState<User>(switchableUsers[0]); // default: Prem

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, switchableUsers }}>
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within UserProvider");
  return ctx;
}
