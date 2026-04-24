"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Search, ShoppingBag, Receipt, Bell, Home, LogOut, ChevronLeft, MapPin, Phone, CheckCircle2, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    auth.onAuthStateChanged(u => setUser(u));

    const dishesRef = ref(db, "dishes");
    onValue(dishesRef, (snap) => {
      const data = [];
      snap.forEach(c => { data.push({ id: c.key, ...c.val() }); });
      setServices(data);
    });

    const portfolioRef = ref(db, "restaurants");
    onValue(portfolioRef, (snap) => {
      const data = [];
      snap.forEach(c => { data.push({ id: c.key, ...c.val() }); });
      setPortfolio(data);
    });
  }, []);

  return (
    <div className="flex-center" style={{ minHeight: "100vh", background: "#0f172a" }}>
      <div className="mobile-container">
        {/* Header */}
        <header className="app-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="flex-center" style={{ width: "40px", height: "40px", background: "white", borderRadius: "12px", color: "var(--primary)" }}>
                <CheckCircle2 size={24} />
              </div>
              <h1 style={{ color: "white", fontSize: "1.2rem", margin: 0 }}>Digita Marketing</h1>
            </div>
            {user ? (
              <Link href="/admin" className="user-badge">
                <LayoutDashboard size={16} />
                Admin
              </Link>
            ) : (
              <Link href="/login" className="user-badge">Login</Link>
            )}
          </div>
          
          <div className="search-box">
            <Search size={20} color="var(--text-light)" />
            <input type="text" placeholder="How can we grow your business?" />
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: "20px", flex: 1, overflowY: "auto", paddingBottom: "100px" }}>
          <section style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
            {["SEO", "Ads", "Web", "Social"].map((cat, i) => (
              <div key={i} className="flex-center" style={{ flexDirection: "column", gap: "8px" }}>
                <div className="cat-icon flex-center">
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--primary)" }} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)" }}>{cat}</span>
              </div>
            ))}
          </section>

          <h2 style={{ fontSize: "1.3rem", marginBottom: "15px" }}>Success Portfolio</h2>
          <div className="horizontal-scroll">
            {portfolio.map(item => (
              <div key={item.id} className="portfolio-card">
                <img src={item.imageUrl} alt={item.name} />
                <div className="card-overlay">
                  <h4>{item.name}</h4>
                  <p>{item.rating}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="promo-banner">
            <div style={{ position: "relative", zIndex: 2 }}>
              <h3 style={{ color: "var(--primary)", fontSize: "1.5rem" }}>SAVE 20%</h3>
              <p style={{ color: "white", opacity: 0.9 }}>On your first digital campaign!</p>
            </div>
            <div className="banner-circle" />
          </div>

          <h2 style={{ fontSize: "1.3rem", marginBottom: "15px", marginTop: "30px" }}>Recommended Packages</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            {services.map(service => (
              <div key={service.id} className="premium-card" style={{ padding: "10px" }}>
                <img src={service.imageUrl} style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "12px", marginBottom: "10px" }} />
                <h4 style={{ fontSize: "0.9rem", marginBottom: "5px" }}>{service.name}</h4>
                <p style={{ color: "var(--primary)", fontWeight: "800" }}>₹{service.price}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Bottom Nav */}
        <nav className="bottom-nav">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "orders", icon: Receipt, label: "Orders" },
            { id: "alerts", icon: Bell, label: "Alerts" },
            { id: "profile", icon: LayoutDashboard, label: "Admin", href: "/admin" },
          ].map((item) => (
            <div 
              key={item.id} 
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => item.href ? router.push(item.href) : setActiveTab(item.id)}
            >
              <item.icon size={24} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      <style jsx>{`
        .mobile-container {
          width: 100%;
          max-width: 414px;
          height: 100vh;
          background: var(--bg-app);
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        @media (min-width: 420px) {
          .mobile-container {
            height: 90vh;
            border-radius: var(--radius-xl);
            border: 8px solid var(--secondary);
            box-shadow: var(--shadow-premium);
          }
        }
        .app-header {
          padding: 50px 25px 30px;
          background: linear-gradient(135deg, var(--secondary) 0%, #1e293b 100%);
          border-bottom-left-radius: 35px;
          border-bottom-right-radius: 35px;
        }
        .user-badge {
          background: rgba(255,255,255,0.1);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .search-box {
          background: white;
          padding: 12px 18px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: var(--shadow-lg);
        }
        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-family: inherit;
          font-weight: 500;
        }
        .cat-icon {
          width: 55px;
          height: 55px;
          background: white;
          border-radius: 18px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
        }
        .horizontal-scroll {
          display: flex;
          overflow-x: auto;
          gap: 15px;
          padding-bottom: 10px;
        }
        .horizontal-scroll::-webkit-scrollbar { display: none; }
        .portfolio-card {
          flex-shrink: 0;
          width: 220px;
          height: 140px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        .portfolio-card img { width: 100%; height: 100%; object-fit: cover; }
        .card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 15px; color: white;
        }
        .promo-banner {
          margin-top: 25px;
          padding: 25px;
          background: var(--secondary);
          border-radius: 25px;
          position: relative;
          overflow: hidden;
        }
        .banner-circle {
          position: absolute; top: -50px; right: -50px;
          width: 150px; height: 150px;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0.1;
        }
        .bottom-nav {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 80px; background: white;
          border-top: 1px solid var(--border);
          display: flex; justify-content: space-around; align-items: center;
          padding: 0 10px;
        }
        .nav-item {
          display: flex; flex-direction: column; align-items: center;
          gap: 4px; color: var(--text-light);
          cursor: pointer; transition: all 0.2s;
        }
        .nav-item.active { color: var(--primary); }
        .nav-item span { font-size: 0.7rem; font-weight: 700; }
      `}</style>
    </div>
  );
}
