"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main style={{ 
        flex: 1, 
        marginLeft: "var(--sidebar-width)", 
        display: "flex", 
        flexDirection: "column",
        background: "var(--bg-app)"
      }}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <div style={{ padding: "40px", flex: 1 }}>
          {children}
        </div>
      </main>

      <style jsx global>{`
        @media (max-width: 992px) {
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
