"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  ReceiptText,
  Banknote,
  Landmark,
  Scale,
  Wallet,
  Receipt,
  Users,
  PiggyBank,
  Sliders,
  Bot,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";

type Section = "overview" | "treasury" | "invoicing" | "factoring" | "offramp" | "tax" | "income" | "bills" | "family" | "savings" | "rules" | "agent" | "stellar" | "profile";

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: "treasury",
    label: "Treasury",
    icon: <Building2 size={18} />,
  },
  {
    id: "invoicing",
    label: "Invoices",
    icon: <ReceiptText size={18} />,
  },
  {
    id: "factoring",
    label: "Working Capital",
    icon: <Banknote size={18} />,
  },
  {
    id: "offramp",
    label: "Bank Off-Ramp",
    icon: <Landmark size={18} />,
  },
  {
    id: "tax",
    label: "Tax Escrow",
    icon: <Scale size={18} />,
  },
  {
    id: "income",
    label: "Income",
    icon: <Wallet size={18} />,
  },
  {
    id: "bills",
    label: "Bills",
    icon: <Receipt size={18} />,
  },
  {
    id: "family",
    label: "Family",
    icon: <Users size={18} />,
  },
  {
    id: "savings",
    label: "Savings",
    icon: <PiggyBank size={18} />,
  },
  {
    id: "rules",
    label: "Rules",
    icon: <Sliders size={18} />,
  },
  {
    id: "agent",
    label: "AI Agent",
    icon: <Bot size={18} />,
  },
  {
    id: "stellar",
    label: "Stellar 🧪",
    icon: <Sparkles size={18} />,
  },
  {
    id: "profile",
    label: "Settings",
    icon: <Settings size={18} />,
  },
];

interface SidebarProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
  userEmail: string;
  pendingDecisions?: number;
}

export default function Sidebar({ activeSection, onNavigate, userEmail, pendingDecisions = 0 }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "DX";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="app-sidebar"
        style={{
          width: "240px",
          minHeight: "100vh",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 30,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 18px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            aria-label="DeliteX home"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <Image
              src="/images/logo_transparent.png"
              alt="DeliteX"
              width={110}
              height={34}
              style={{
                height: "32px",
                width: "auto",
                objectFit: "contain",
              }}
              priority
            />
          </Link>
          <span
            style={{
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "2px 6px",
              borderRadius: "4px",
              backgroundColor: "rgba(232, 135, 42, 0.12)",
              color: "var(--color-saffron)",
              border: "1px solid rgba(232, 135, 42, 0.25)",
            }}
          >
            Testnet
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <p
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-ink-300)",
              padding: "0 8px",
              marginBottom: "8px",
            }}
          >
            Menu
          </p>
          {navItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: active ? "rgba(232, 135, 42, 0.14)" : "transparent",
                  color: active ? "var(--color-saffron)" : "var(--color-ink-500)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 500,
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  borderLeft: active ? "3px solid var(--color-saffron)" : "3px solid transparent",
                }}
                onMouseOver={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "var(--color-ink-900)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--color-ink-500)";
                  }
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: active ? "var(--color-saffron)" : "var(--color-ink-500)",
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.id === "agent" && pendingDecisions > 0 && (
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-saffron)",
                      boxShadow: "0 0 8px var(--color-saffron)",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* User + Sign Out */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid var(--color-border)",
            backgroundColor: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(232, 135, 42, 0.3) 0%, rgba(43, 122, 90, 0.3) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--color-ink-900)",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-ink-700)",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userEmail}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "8px 12px",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              color: "var(--color-ink-500)",
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.color = "var(--color-ink-900)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-ink-500)";
            }}
          >
            <LogOut size={14} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav
        className="app-bottom-nav"
        style={{
          display: "none",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          backgroundColor: "rgba(10, 10, 10, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid var(--color-border)",
          padding: "8px 0 env(safe-area-inset-bottom, 8px)",
        }}
      >
        {navItems.slice(0, 5).map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: active ? "var(--color-saffron)" : "var(--color-ink-300)",
                fontSize: "0.625rem",
                fontFamily: "var(--font-body)",
                fontWeight: active ? 600 : 400,
                padding: "4px 0",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .app-sidebar { display: none !important; }
          .app-bottom-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}

export type { Section };
