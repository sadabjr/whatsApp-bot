"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, push, remove } from "firebase/database";
import { Plus, Trash2, Image as ImageIcon, X, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PortfolioPage() {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", rating: "", imageUrl: "" });

  useEffect(() => {
    const portRef = ref(db, "restaurants"); // Consistent with 'restaurants' in database
    const unsubscribe = onValue(portRef, (snapshot) => {
      const data = [];
      snapshot.forEach((child) => {
        data.push({ id: child.key, ...child.val() });
      });
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await push(ref(db, "restaurants"), formData);
      setIsModalOpen(false);
      setFormData({ name: "", rating: "", imageUrl: "" });
    } catch (err) {
      alert("Error adding portfolio item: " + err.message);
    }
  };

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Project Portfolio</h1>
          <p style={{ color: "var(--text-muted)", fontWeight: "600" }}>Showcase your successful campaigns and client work.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 24px", background: "var(--primary)", color: "white", borderRadius: "12px", fontWeight: "700" }}
        >
          <Plus size={20} />
          Add Project
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {items.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card" 
            style={{ overflow: "hidden" }}
          >
            <div style={{ height: "200px", position: "relative" }}>
              <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button 
                onClick={() => remove(ref(db, `restaurants/${item.id}`))}
                style={{ 
                  position: "absolute", top: "12px", right: "12px", 
                  width: "36px", height: "36px", background: "white", 
                  color: "var(--danger)", borderRadius: "10px" 
                }}
                className="flex-center"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "5px" }}>{item.name}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "600" }}>{item.rating}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="flex-center" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="premium-card" style={{ width: "100%", maxWidth: "480px", padding: "30px", position: "relative" }}
            >
              <button onClick={() => setIsModalOpen(false)} style={{ position: "absolute", right: "20px", top: "20px", color: "var(--text-muted)" }}><X size={24} /></button>
              <h2 style={{ marginBottom: "25px" }}>New Portfolio Project</h2>
              <form onSubmit={handleAddItem}>
                <div style={{ marginBottom: "20px" }}>
                  <label className="field-label">Client / Project Name</label>
                  <input type="text" className="premium-input" placeholder="e.g. Eco Friendly Store" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label className="field-label">Project Type / Result</label>
                  <input type="text" className="premium-input" placeholder="e.g. 5x Growth in 3 Months" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} required />
                </div>
                <div style={{ marginBottom: "30px" }}>
                  <label className="field-label">Image URL</label>
                  <input type="text" className="premium-input" placeholder="https://example.com/work.jpg" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} required />
                </div>
                <button type="submit" style={{ width: "100%", padding: "16px", background: "var(--primary)", color: "white", borderRadius: "12px", fontWeight: "700" }}>Add to Portfolio</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .field-label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; }
        .premium-input { width: 100%; padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; font-family: inherit; font-size: 1rem; background: var(--bg-app); transition: all 0.2s; }
        .premium-input:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 4px var(--primary-soft); }
      `}</style>
    </div>
  );
}
