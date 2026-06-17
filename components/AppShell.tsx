"use client";

import { LocalStoreProvider } from "@/lib/local-store";
import { LocalEditsBanner } from "./LocalEditsBanner";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * App shell — mirrors TalOSSurvey's apps/web/app/(app)/layout.tsx structure:
 * sticky sidebar (navy gradient) + main column with sticky top header. Wraps
 * the tree in <LocalStoreProvider> so any page can read/mutate the local
 * editable state.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LocalStoreProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <LocalEditsBanner />
          <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </LocalStoreProvider>
  );
}
