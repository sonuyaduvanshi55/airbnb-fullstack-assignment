"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const USERS = {
  guest: { id: 1, name: "Sonu Guest", role: "guest" as const, avatar: "https://i.pravatar.cc/80?img=47" },
  host: { id: 2, name: "Maya Kapoor", role: "host" as const, avatar: "https://i.pravatar.cc/80?img=32" }
};

type CurrentUser = (typeof USERS)[keyof typeof USERS];

type UserContextValue = {
  user: CurrentUser;
  setRole: (role: "guest" | "host") => void;
};

const UserContext = createContext<UserContextValue | null>(null);

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };

type ToastContextValue = {
  showToast: (message: string, tone?: Toast["tone"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<"guest" | "host">("guest");
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem("staybnb-role");
    if (stored === "host" || stored === "guest") setRoleState(stored);
  }, []);

  const setRole = useCallback((nextRole: "guest" | "host") => {
    setRoleState(nextRole);
    window.localStorage.setItem("staybnb-role", nextRole);
  }, []);

  const showToast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const userValue = useMemo(() => ({ user: USERS[role], setRole }), [role, setRole]);
  const toastValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <UserContext.Provider value={userValue}>
      <ToastContext.Provider value={toastValue}>
        {children}
        <div className="toast-stack" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.tone}`}>
              {toast.message}
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useCurrentUser must be used inside AppProviders");
  return context;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside AppProviders");
  return context;
}
