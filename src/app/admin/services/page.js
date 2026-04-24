"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, push, remove, set } from "firebase/database";
import { Plus, Trash2, Edit3, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", imageUrl: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const servicesRef = ref(db, "dishes"); // Keeping 'dishes' for database consistency
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const data = [];
      snapshot.forEach((child) => {
        data.push({ id: child.key, ...child.val() });
      });
      setServices(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    
    try {
      await push(ref(db, "dishes"), formData);
      setIsModalOpen(false);
      setFormData({ name: "", price: "", imageUrl: "" });
    } catch (err) {
      alert("Error adding service: " + err.message);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      remove(ref(db, `dishes/${id}`));
    }
  };

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Marketing Services</h1>
          <p style={{ color: "var(--text-muted)", fontWeight: "600" }}>Manage the service packages that your WhatsApp bot and website display.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-add" 
          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 24px", background: "var(--primary)", color: "white", borderRadius: "12px", fontWeight: "700" }}
        >
          <Plus size={20} />
          Add Service
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
        {services.map((service, i) => (
          <motion.div 
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card" 
            style={{ overflow: "hidden" }}
          >
            <div style={{ height: "180px", position: "relative", background: "#f1f5f9" }}>
              {service.imageUrl ? (
                <img src={service.imageUrl} alt={service.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div className="flex-center" style={{ width: "100%", height: "100%", color: "var(--text-light)" }}>
                  <ImageIcon size={48} />
                </div>
              )}
              <button 
                onClick={() => handleDelete(service.id)}
                style={{ 
                  position: "absolute", top: "12px", right: "12px", 
                  width: "36px", height: "36px", background: "white", 
                  color: "var(--danger)", borderRadius: "10px", 
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)" 
                }}
                className="flex-center"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "5px" }}>{service.name}</h3>
              <p style={{ color: "var(--primary)", fontWeight: "800", fontSize: "1.2rem" }}>₹{service.price}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="flex-center" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="premium-card" 
              style={{ width: "100%", maxWidth: "480px", padding: "30px", position: "relative" }}
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ position: "absolute", right: "20px", top: "20px", color: "var(--text-muted)" }}
              >
                <X size={24} />
              </button>
              
              <h2 style={{ marginBottom: "25px" }}>Add New Service</h2>
              
              <form onSubmit={handleAddService}>
                <div style={{ marginBottom: "20px" }}>
                  <label className="field-label">Service Name</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder="e.g. Premium SEO Package"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                  <label className="field-label">Price / Budget</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder="e.g. 15,000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: "30px" }}>
                  <label className="field-label">Image URL</label>
                  <input 
                    type="text" 
                    className="premium-input" 
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>

                <button type="submit" style={{ width: "100%", padding: "16px", background: "var(--primary)", color: "white", borderRadius: "12px", fontWeight: "700" }}>
                  Save Service
                </button>
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
