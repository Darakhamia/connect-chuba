"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { QueryProvider } from "@/components/providers/query-provider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="connect-chuba-theme">
      <SocketProvider>
        <QueryProvider>
          <ModalProvider />
          {children}
        </QueryProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

