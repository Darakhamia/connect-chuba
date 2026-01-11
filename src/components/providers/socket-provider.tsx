"use client";

import { createContext, useContext } from "react";

type SocketContextType = {
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  // Пока Socket.io не настроен, используем polling
  // В будущем здесь будет подключение к Socket.io серверу
  const isConnected = false;

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
