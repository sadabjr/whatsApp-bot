"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { IndianRupee, Tasks, MessageSquare, TrendingUp, Users, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    services: 0,
    activeBots: 1
  });

  useEffect(() => {
    const ordersRef = ref(db, "orders");
    const dishesRef = ref(db, "dishes");

    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      let totalRev = 0;
      let count = 0;
      snapshot.forEach((child) => {
        totalRev += parseFloat(child.val().total || 0);
        count++;
      });
      setStats(prev => ({ ...prev, revenue: totalRev, orders: count }));
    });

    const unsubscribeDishes = onValue(dishesRef, (snapshot) => {
      setStats(prev => ({ ...prev, services: snapshot.size }));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeDishes();
    };
  }, []);

  const statCards = [
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: "#10b981", trend: "+12.5%" },
    { label: "Active Projects", value: stats.orders, icon: ArrowUpRight, color: "#3b82f6", trend: "+3 new" },
    { label: "Services Offered", value: stats.services, icon: TrendingUp, color: "#8b5cf6", trend: "Optimized" },
    { label: "Bot Status", value: "Online", icon: MessageSquare, color: "#f59e0b", trend: "24/7" },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <header style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Dashboard Overview</h1>
        <p style={{ color: "var(--text-muted)", fontWeight: "600" }}>Welcome back! Here's what's happening with your agency today.</p>
      </header>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
        gap: "24px",
        marginBottom: "40px"
      }}>
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card" 
            style={{ padding: "24px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ 
                width: "48px", height: "48px", borderRadius: "14px", 
                background: `${stat.color}15`, color: stat.color,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <stat.icon size={24} />
              </div>
              <span style={{ 
                fontSize: "0.75rem", fontWeight: "800", color: "var(--primary)", 
                background: "var(--primary-soft)", padding: "4px 10px", borderRadius: "20px" 
              }}>
                {stat.trend}
              </span>
            </div>
            <h3 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>{stat.value}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "600" }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <div className="premium-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
            <h3 style={{ fontSize: "1.2rem" }}>Recent Activity</h3>
            <button style={{ color: "var(--primary)", fontWeight: "700", fontSize: "0.85rem" }}>View All</button>
          </div>
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-light)" }}>
            <p style={{ fontWeight: "600" }}>No recent activity to show.</p>
          </div>
        </div>

        <div className="premium-card" style={{ padding: "24px", background: "var(--secondary)", color: "white" }}>
          <h3 style={{ fontSize: "1.2rem", color: "white", marginBottom: "15px" }}>Bot Status</h3>
          <div style={{ 
            padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--primary)" }} />
              <span style={{ fontWeight: "700" }}>WhatsApp Bot: Online</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Last connected: 2 minutes ago</p>
          </div>
          <button style={{ 
            width: "100%", padding: "14px", background: "var(--primary)", color: "white",
            borderRadius: "12px", fontWeight: "700", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
          }}>
            Manage Bot
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
