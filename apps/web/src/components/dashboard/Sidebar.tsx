"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  WalletCards, 
  Receipt, 
  Users, 
  PiggyBank, 
  GitBranch, 
  Bot, 
  Orbit, 
  Settings 
} from "lucide-react";
import { motion } from "framer-motion";

type Section = "overview" | "income" | "bills" | "family" | "savings" | "rules" | "agent" | "stellar" | "profile";

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { id: "income", label: "Income", icon: <WalletCards size={18} /> },
  { id: "bills", label: "Bills", icon: <Receipt size={18} /> },
  { id: "family", label: "Family", icon: <Users size={18} /> },
  { id: "savings", label: "Savings", icon: <PiggyBank size={18} /> },
  { id: "rules", label: "Rules", icon: <GitBranch size={18} /> },
  { id: "agent", label: "AI Agent", icon: <Bot size={18} /> },
  { id: "stellar", label: "Stellar 🧪", icon: <Orbit size={18} /> },
  { id: "profile", label: "Settings", icon: <Settings size={18} /> },
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

  const initials = userEmail.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] h-screen sticky top-0 bg-white border-r border-gray-100 flex-shrink-0 overflow-y-auto">
        {/* Wordmark */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-gray-900">
            Delite<span className="text-indigo-600">X</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="px-3 text-xs font-bold tracking-wider text-gray-400 uppercase mb-4 mt-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group
                  ${active 
                    ? "text-indigo-700" 
                    : "text-gray-500 hover:text-gray-900"
                  }`}
              >
                {active && (
                  <motion.div 
                    layoutId="active-nav" 
                    className="absolute inset-0 bg-indigo-50/80 rounded-xl border border-indigo-100/50 -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Fallback hover background for non-active items */}
                {!active && (
                  <div className="absolute inset-0 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                )}
                
                <span className={`${active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"} transition-colors relative z-10`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left relative z-10">{item.label}</span>
                
                {item.id === "agent" && pendingDecisions > 0 && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 shadow-sm shadow-indigo-200 relative z-10" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0 shadow-sm border border-indigo-50">
              {initials}
            </div>
            <p className="text-sm font-medium text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
              {userEmail}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 pb-safe flex px-2 pt-2 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        {navItems.slice(0, 5).map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center gap-1.5 p-2 transition-colors
                ${active ? "text-indigo-600" : "text-gray-400"}
              `}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${active ? "bg-indigo-50" : "transparent"}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export type { Section };
