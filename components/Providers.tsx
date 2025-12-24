"use client";

import { SessionProvider } from "next-auth/react";
import UserTracker from "./UserTracker";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserTracker />
      {children}
    </SessionProvider>
  );
}