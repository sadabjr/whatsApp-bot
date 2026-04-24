"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { ShoppingBag, Search, Filter, MoreVertical, CheckCircle2, Clock, Truck, Package } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  "Placed": { bg: "#fef3c7", text: "#92400e", icon: Clock },
  "Preparing": { bg: "#e0e7ff", text: "#3730a3", icon: Package },
  "Out for Delivery": { bg: "#ffedd5", text: "#9a3412", icon: Truck },
  "Delivered": { bg: "#d1fae5", text: "#065f46", icon: CheckCircle2 },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersRef = ref(db, "orders");
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = [];
      snapshot.forEach((child) => {
        data.push({ id: child.key, ...child.val() });
      });
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    update(ref(db, `orders/${orderId}`), { status: newStatus });
  };

  return (
    <div>
      <header style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Campaign Management</h1>
        <p style={{ color: "var(--text-muted)", fontWeight: "600" }}>Track and manage active marketing campaigns and client orders.</p>
      </header>

      <div className="premium-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", background: "white" }}>
          <div style={{ position: "relative", width: "300px" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              style={{ width: "100%", padding: "10px 10px 10px 40px", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "0.9rem" }}
            />
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", border: "1px solid var(--border)", borderRadius: "10px", fontWeight: "600", fontSize: "0.9rem" }}>
            <Filter size={18} />
            Filter
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-app)", textAlign: "left" }}>
                <th className="th">Campaign ID</th>
                <th className="th">Client</th>
                <th className="th">Services</th>
                <th className="th">Budget</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusInfo = statusColors[order.status || "Placed"] || statusColors["Placed"];
                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="td" style={{ fontFamily: "monospace", fontWeight: "700" }}>#{order.id.substring(1, 7).toUpperCase()}</td>
                    <td className="td">
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "700" }}>{order.userEmail || "Guest"}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{order.phone || "No phone"}</span>
                      </div>
                    </td>
                    <td className="td">
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "250px" }}>
                        {order.items?.map(i => `${i.quantity}x ${i.name}`).join(", ") || "No items"}
                      </div>
                    </td>
                    <td className="td" style={{ fontWeight: "800", color: "var(--primary)" }}>₹{order.total}</td>
                    <td className="td">
                      <select 
                        value={order.status || "Placed"}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{ 
                          padding: "8px 12px", borderRadius: "8px", fontWeight: "700", fontSize: "0.8rem",
                          background: statusInfo.bg, color: statusInfo.text, border: "none", cursor: "pointer"
                        }}
                      >
                        {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-light)" }}>
              <ShoppingBag size={48} style={{ marginBottom: "15px", opacity: 0.3 }} />
              <p style={{ fontWeight: "600" }}>No campaigns found.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .th { padding: 16px 24px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; }
        .td { padding: 20px 24px; font-size: 0.95rem; }
      `}</style>
    </div>
  );
}
