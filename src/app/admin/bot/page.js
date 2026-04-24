"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set, update } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { MessageSquare, RefreshCw, CheckCircle2, AlertCircle, Info, Settings2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BotSettings() {
  const { user } = useAuth();
  const [botData, setBotData] = useState({
    status: "offline",
    qr: "",
    businessName: "",
    phone: "",
    welcomeMsg: "Hi! I'm the {businessName} Assistant. How can I help you today?"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const botRef = ref(db, `botConfigs/${user.uid}`);
    const unsubscribe = onValue(botRef, (snapshot) => {
      if (snapshot.exists()) {
        setBotData(prev => ({ ...prev, ...snapshot.val() }));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      await update(ref(db, `botConfigs/${user.uid}`), {
        businessName: botData.businessName,
        welcomeMsg: botData.welcomeMsg,
        phone: botData.phone
      });
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Error saving settings: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: "1000px" }}>
      <header style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>WhatsApp Bot Settings</h1>
        <p style={{ color: "var(--text-muted)", fontWeight: "600" }}>Connect your WhatsApp account and customize your automated responses.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "30px" }}>
        {/* Connection Card */}
        <div className="premium-card" style={{ padding: "30px", height: "fit-content" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
            <RefreshCw size={20} className={botData.status === "online" ? "" : "spin-slow"} color="var(--primary)" />
            Connection Status
          </h3>

          <div style={{ textAlign: "center", padding: "20px" }}>
            {botData.status === "online" ? (
              <div className="flex-center" style={{ flexDirection: "column", gap: "15px" }}>
                <div style={{ 
                  width: "100px", height: "100px", borderRadius: "50%", 
                  background: "var(--primary-soft)", color: "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <CheckCircle2 size={60} />
                </div>
                <h4 style={{ color: "var(--primary)", fontSize: "1.2rem" }}>Connected</h4>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Your bot is actively responding to messages.</p>
                <button 
                  onClick={() => update(ref(db, `botConfigs/${user.uid}`), { status: "offline", qr: "" })}
                  style={{ color: "var(--danger)", fontWeight: "700", fontSize: "0.85rem", marginTop: "10px" }}
                >
                  Disconnect Account
                </button>
              </div>
            ) : botData.qr ? (
              <div className="flex-center" style={{ flexDirection: "column", gap: "20px" }}>
                <div style={{ 
                  padding: "15px", background: "white", borderRadius: "20px", 
                  boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid var(--border)" 
                }}>
                  <QRCodeSVG value={botData.qr} size={200} />
                </div>
                <div>
                  <h4 style={{ marginBottom: "5px" }}>Scan QR Code</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Open WhatsApp on your phone &gt; Linked Devices &gt; Link a Device.</p>
                </div>
              </div>
            ) : (
              <div className="flex-center" style={{ flexDirection: "column", gap: "15px", padding: "40px 0" }}>
                <AlertCircle size={48} color="var(--text-light)" />
                <p style={{ fontWeight: "600", color: "var(--text-muted)" }}>Initializing connection...</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>If this takes too long, please check if the bot server is running.</p>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Form */}
        <div className="premium-card" style={{ padding: "30px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Settings2 size={20} color="var(--primary)" />
            Business Configuration
          </h3>

          <form onSubmit={handleSaveConfig}>
            <div style={{ marginBottom: "20px" }}>
              <label className="field-label">Business Name</label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder="e.g. Digita Marketing"
                value={botData.businessName}
                onChange={(e) => setBotData({ ...botData, businessName: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="field-label">Support Phone (Shown in Bot)</label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder="+91 0000000000"
                value={botData.phone}
                onChange={(e) => setBotData({ ...botData, phone: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label className="field-label">Custom Welcome Message</label>
              <textarea 
                className="premium-input" 
                style={{ height: "120px", resize: "none" }}
                value={botData.welcomeMsg}
                onChange={(e) => setBotData({ ...botData, welcomeMsg: e.target.value })}
                placeholder="Use {businessName} as a placeholder"
              />
            </div>

            <div style={{ 
              padding: "15px", background: "var(--bg-app)", borderRadius: "12px", 
              marginBottom: "30px", border: "1px solid var(--border)",
              display: "flex", gap: "12px"
            }}>
              <Info size={20} color="var(--info)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Predefined responses are automatically generated based on your <strong>Services</strong> and <strong>Portfolio</strong>. 
                Users can type "menu" at any time to see your offerings.
              </p>
            </div>

            <button type="submit" className="btn-save">Save Settings</button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .field-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .premium-input {
          width: 100%;
          padding: 14px 18px;
          border: 1px solid var(--border);
          border-radius: 12px;
          font-family: inherit;
          font-size: 1rem;
          background: var(--bg-app);
          transition: all 0.2s;
        }
        .premium-input:focus {
          outline: none;
          border-color: var(--primary);
          background: white;
          box-shadow: 0 0 0 4px var(--primary-soft);
        }
        .btn-save {
          width: 100%;
          padding: 16px;
          background: var(--primary);
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
