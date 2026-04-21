"use client";
import { Toaster } from "react-hot-toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(5, 13, 26, 0.95)",
            border: "1px solid rgba(0, 212, 255, 0.3)",
            color: "#f0f4ff",
            backdropFilter: "blur(20px)",
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            padding: "12px 16px",
          },
          success: {
            iconTheme: { primary: "#00e676", secondary: "#020510" },
          },
          error: {
            iconTheme: { primary: "#ff3b3b", secondary: "#020510" },
          },
          duration: 3000,
        }}
      />
    </>
  );
}
