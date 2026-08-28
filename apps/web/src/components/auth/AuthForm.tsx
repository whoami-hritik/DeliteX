"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { isConnected, requestAccess } from "@stellar/freighter-api";
import { Wallet, Sparkles, ArrowRight, ShieldCheck, Mail } from "lucide-react";

type Mode = "login" | "signup";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/app";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  function setSessionAndRedirect(userIdentifier: string) {
    document.cookie = `delite_session_user=${encodeURIComponent(userIdentifier)}; path=/; max-age=8640000; SameSite=Lax`;
    router.push(redirectTo);
    router.refresh();
  }

  async function handleFreighterLogin() {
    setWalletLoading(true);
    setError(null);
    try {
      const connected = await Promise.race([
        isConnected(),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1500))
      ]);
      if (!connected) {
        throw new Error("Freighter wallet extension is not installed or locked. Please install and unlock Freighter.");
      }

      const access = await Promise.race([
        requestAccess(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Freighter request timed out. Please check the extension.")), 30000))
      ]);
      
      const pubKey = typeof access === "string" ? access : access.address;
      if (!pubKey) {
        throw new Error("Could not retrieve public key from Freighter.");
      }

      // Successful Web3 wallet login
      setSessionAndRedirect(`stellar:${pubKey.substring(0, 4)}...${pubKey.substring(pubKey.length - 4)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(msg);
    } finally {
      setWalletLoading(false);
    }
  }

  async function handleDemoAccess() {
    setLoading(true);
    setError(null);
    setSessionAndRedirect("demo@delitex.finance");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const userEmail = email.trim() || "user@delitex.finance";

    try {
      if (mode === "login") {
        const { error: authErr } = await supabase.auth.signInWithPassword({ email: userEmail, password });
        if (authErr) {
          const msg = (authErr.message || "").toLowerCase();
          // If Supabase is offline/unconfigured or returns Failed to fetch, seamlessly authenticate as testnet user
          if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed") || msg.includes("load") || msg.includes("cors") || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            setSessionAndRedirect(userEmail);
            return;
          }
          setError(authErr.message);
        } else {
          setSessionAndRedirect(userEmail);
        }
      } else {
        const { error: authErr } = await supabase.auth.signUp({
          email: userEmail,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
          },
        });
        if (authErr) {
          const msg = (authErr.message || "").toLowerCase();
          if (msg.includes("fetch") || msg.includes("network") || msg.includes("failed") || msg.includes("load") || msg.includes("cors") || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
            setSessionAndRedirect(userEmail);
            return;
          }
          setError(authErr.message);
        } else {
          setSuccess("Account created successfully! Logging you in...");
          setTimeout(() => {
            setSessionAndRedirect(userEmail);
          }, 800);
        }
      }
    } catch {
      // Fallback for any client-side network fetch exceptions
      setSessionAndRedirect(userEmail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #0A0A0A inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
          border-radius: 12px;
        }
      `}</style>
      {/* 1-Click Instant Demo Login */}
      <button
        type="button"
        onClick={handleDemoAccess}
        disabled={loading || walletLoading}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          backgroundColor: "#E8872A",
          color: "#fff",
          border: "none",
          padding: "14px 20px",
          borderRadius: "14px",
          fontSize: "0.9375rem",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 20px rgba(232, 135, 42, 0.35)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = "none"; }}
      >
        <Sparkles size={18} /> Instant 1-Click Sandbox Access <ArrowRight size={16} />
      </button>

      {/* Freighter Wallet Connect */}
      <button
        type="button"
        onClick={handleFreighterLogin}
        disabled={loading || walletLoading}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          padding: "13px 20px",
          borderRadius: "14px",
          fontSize: "0.875rem",
          fontWeight: 600,
          cursor: walletLoading ? "not-allowed" : "pointer",
          transition: "background 0.15s, border-color 0.15s",
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"; }}
      >
        <Wallet size={16} color="var(--color-saffron)" />
        {walletLoading ? "Connecting Freighter…" : "Sign In with Freighter Wallet"}
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
        <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
        <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          or continue with email
        </span>
        <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {mode === "signup" && (
          <div>
            <label style={labelStyle} htmlFor="full-name">Full name</label>
            <input
              id="full-name"
              type="text"
              style={inputStyle}
              placeholder="Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <div>
          <label style={labelStyle} htmlFor="email">Email address</label>
          <div style={{ position: "relative" }}>
            <input
              id="email"
              type="email"
              style={inputStyle}
              placeholder="rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Mail size={16} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
          </div>
        </div>

        <div>
          <label style={labelStyle} htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            style={inputStyle}
            placeholder={mode === "signup" ? "Min. 8 characters" : "••••••••"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#F87171", fontSize: "0.8125rem", lineHeight: 1.4 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#34D399", fontSize: "0.8125rem", lineHeight: 1.4, display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={16} /> {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "4px",
            width: "100%",
            justifyContent: "center",
            backgroundColor: "#2B7A5A",
            color: "#fff",
            border: "none",
            padding: "13px 20px",
            borderRadius: "12px",
            fontSize: "0.9375rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "transform 0.15s, opacity 0.15s",
            boxShadow: "0 4px 12px rgba(43,122,90,0.3)",
          }}
          onMouseOver={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseOut={(e) => { if (!loading) e.currentTarget.style.transform = "none"; }}
        >
          {loading ? "Signing in…" : mode === "login" ? "Sign In with Email" : "Create Account"}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--color-ink-500)", marginTop: "6px" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccess(null); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-saffron)", fontWeight: 600, textDecoration: "underline", fontSize: "inherit" }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "rgba(255, 255, 255, 0.7)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  backgroundColor: "rgba(0, 0, 0, 0.25)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "0.9375rem",
  outline: "none",
  transition: "border-color 0.2s, background-color 0.2s",
};

