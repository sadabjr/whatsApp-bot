"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { TrendingUp, Mail, Lock, UserPlus, LogIn, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
      }
      router.push("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrapper flex-center" style={{ minHeight: "100vh", padding: "20px" }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card" 
        style={{ width: "100%", maxWidth: "420px", overflow: "hidden" }}
      >
        <div style={{ height: "6px", background: "var(--primary)" }} />
        
        <div style={{ padding: "40px 30px" }}>
          <header style={{ textAlign: "center", marginBottom: "40px" }}>
            <div className="flex-center" style={{ 
              width: "70px", height: "70px", margin: "0 auto 20px", 
              background: "var(--primary-soft)", color: "var(--primary)",
              borderRadius: "20px", fontSize: "2rem"
            }}>
              <TrendingUp size={36} />
            </div>
            <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
              {isLogin ? "Sign in to Digita Marketing Agency" : "Join our premium marketing network"}
            </p>
          </header>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ 
                  background: "#fef2f2", color: "var(--danger)", padding: "12px", 
                  borderRadius: "12px", border: "1px solid #fecaca", marginBottom: "20px",
                  fontSize: "0.9rem", textAlign: "center", fontWeight: "600"
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth}>
            {!isLogin && (
              <div style={{ marginBottom: "20px" }}>
                <label className="input-label">Full Name</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type="text" 
                    className="auth-input" 
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                  <span style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }}>
                    <UserPlus size={18} />
                  </span>
                </div>
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label className="input-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <input 
                  type="email" 
                  className="auth-input" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <span style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }}>
                  <Mail size={18} />
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label className="input-label">Password</label>
              <div style={{ position: "relative" }}>
                <input 
                  type="password" 
                  className="auth-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <span style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }}>
                  <Lock size={18} />
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-main" 
              disabled={loading}
              style={{ width: "100%", marginBottom: "15px" }}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </button>

            {isLogin && (
              <button 
                type="button" 
                onClick={handleGoogleSignIn}
                className="btn-main" 
                style={{ 
                  width: "100%", background: "white", color: "var(--text-main)", 
                  border: "1px solid var(--border)", boxShadow: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
                }}
              >
                <Globe size={20} color="#4285F4" />
                Sign in with Google
              </button>
            )}
          </form>

          <div style={{ textAlign: "center", marginTop: "25px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{ color: "var(--primary)", fontWeight: "700" }}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .input-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          margin-left: 4px;
        }
        .auth-input {
          width: 100%;
          padding: 14px 14px 14px 50px;
          background: #f1f5f9;
          border: 2px solid transparent;
          border-radius: 12px;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s;
          font-weight: 500;
        }
        .auth-input:focus {
          background: white;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-soft);
        }
        .btn-main {
          padding: 16px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
          cursor: pointer;
        }
        .btn-main:active {
          transform: scale(0.98);
        }
        .btn-main:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
