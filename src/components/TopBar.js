"use client";
import { Menu, Bell, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header style={{
      height: "75px",
      background: "white",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 40px",
      position: "sticky",
      top: 0,
      zIndex: 90
    }}>
      <div className="flex-center" style={{ gap: "20px" }}>
        <button onClick={onMenuClick} className="mobile-toggle" style={{ display: "none" }}>
          <Menu size={24} />
        </button>
        <h2 style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>Admin Panel v2.0</h2>
      </div>

      <div className="flex-center" style={{ gap: "25px" }}>
        <button style={{ color: "var(--text-muted)", position: "relative" }}>
          <Bell size={22} />
          <span style={{ 
            position: "absolute", top: "-2px", right: "-2px", 
            width: "8px", height: "8px", background: "var(--danger)", 
            borderRadius: "50%", border: "2px solid white" 
          }} />
        </button>
        
        <div className="flex-center" style={{ gap: "12px", padding: "6px 16px", background: "var(--bg-app)", borderRadius: "12px" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>{user?.displayName || "Admin"}</p>
            <p style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--text-light)" }}>{user?.email}</p>
          </div>
          <div className="flex-center" style={{ width: "36px", height: "36px", background: "var(--primary)", color: "white", borderRadius: "10px" }}>
            <User size={20} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 992px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
