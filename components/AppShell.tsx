"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Topbar />
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}
