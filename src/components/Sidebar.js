"use client";
import { TrendingUp, ShoppingBag, Megaphone, Briefcase, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { name: "Orders", icon: ShoppingBag, href: "/admin/orders" },
  { name: "Services", icon: Megaphone, href: "/admin/services" },
  { name: "Portfolio", icon: Briefcase, href: "/admin/portfolio" },
  { name: "Bot Settings", icon: Settings, href: "/admin/bot" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="sidebar" style={{
      width: "var(--sidebar-width)",
      background: "#0f172a",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      padding: "30px 20px",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 100,
      color: "white"
    }}>
      <div className="logo flex-center" style={{ gap: "12px", fontSize: "1.4rem", fontWeight: "800", marginBottom: "50px", justifyContent: "flex-start" }}>
        <TrendingUp color="var(--primary)" size={32} />
        <span>Digita Marketing</span>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  color: isActive ? "white" : "#94a3b8",
                  background: isActive ? "var(--primary)" : "transparent",
                  fontWeight: "600",
                  transition: "all 0.2s"
                }}>
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button 
        onClick={handleLogout}
        className="logout-btn" 
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 18px",
          borderRadius: "12px",
          color: "#f87171",
          fontWeight: "600",
          marginTop: "auto"
        }}
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
}
