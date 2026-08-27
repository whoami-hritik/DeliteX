"use client";

import { useState } from "react";
import Sidebar, { type Section } from "@/components/dashboard/Sidebar";
import OverviewView from "@/components/dashboard/OverviewView";
import IncomeView from "@/components/dashboard/IncomeView";
import BillsView from "@/components/dashboard/BillsView";
import FamilyView from "@/components/dashboard/FamilyView";
import SavingsView from "@/components/dashboard/SavingsView";
import RulesEditor from "@/components/dashboard/RulesEditor";
import AgentNotification from "@/components/dashboard/AgentNotification";
import StellarView from "@/components/dashboard/StellarView";
import AgentHistoryView from "@/components/dashboard/AgentHistoryView";
import DemoBar from "@/components/dashboard/DemoBar";
import ProfileView from "@/components/dashboard/ProfileView";
import ProceduralGroundBackground from "@/components/ui/ProceduralGroundBackground";
import { DashboardProvider, useDashboardContext } from "@/hooks/DashboardContext";
import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { isConnected as isFreighterConnected } from "@stellar/freighter-api";
import { Wallet, LogOut, ExternalLink, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SECTION_TITLES: Record<Section, string> = {
  overview: "Overview",
  income: "Income",
  bills: "Bills",
  family: "Family",
  savings: "Savings",
  rules: "Rules",
  agent: "AI Agent",
  stellar: "Stellar (Testnet)",
  profile: "Profile & Settings",
};

interface DashboardShellProps {
  userEmail: string;
}

function WalletDropdown({ publicKey, onDisconnect }: { publicKey: string, onDisconnect: () => void }) {
  const [open, setOpen] = useState(false);
  
  const shortKey = `${publicKey.substring(0, 4)}...${publicKey.substring(publicKey.length - 4)}`;

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[var(--color-bg-card)] backdrop-blur-xl border border-[var(--color-border)] px-4 py-2 rounded-full hover:bg-white/10 hover:shadow-sm transition-all text-sm font-semibold text-[var(--color-ink-900)]"
      >
        <Wallet size={16} className="text-[var(--color-ink-500)]" />
        {shortKey}
        <ChevronDown size={14} className={`text-[var(--color-ink-500)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-2xl p-2 w-52 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col gap-1"
          >
            <a 
              href={`https://stellar.expert/explorer/testnet/account/${publicKey}`} 
              target="_blank" 
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ExternalLink size={16} className="text-white/50" />
              View on Explorer
            </a>
            <button 
              onClick={() => {
                setOpen(false);
                onDisconnect();
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-saffron)] hover:bg-[var(--color-saffron)]/10 transition-colors text-left w-full"
            >
              <LogOut size={16} />
              Disconnect Wallet
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardContent({ userEmail }: { userEmail: string }) {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const { loading, stellarAccount, refreshStellar, updateStellarPublicKey } = useDashboardContext();
  const [funding, setFunding] = useState(false);
  const pendingDecisions = 0;

  async function handleConnectWallet() {
    try {
      setFunding(true);
      StellarWalletsKit.init({
        network: Networks.TESTNET,
        selectedWalletId: "freighter",
        modules: [new FreighterModule(), new xBullModule(), new AlbedoModule()],
      });
      
      const { address: publicKey } = await StellarWalletsKit.authModal();
      
      try { await isFreighterConnected(); } catch { /* ignore */ }
      
      localStorage.setItem("delite_wallet_id", StellarWalletsKit.selectedModule.productId);
      
      await updateStellarPublicKey(publicKey);
      await fetch(`/api/stellar/account?fund=true`);
      await refreshStellar();
    } catch (err) {
      console.error(err);
    } finally {
      setFunding(false);
    }
  }

  const handleDisconnect = async () => {
    try {
      localStorage.removeItem("delite_wallet_id");
      await updateStellarPublicKey("");
      await refreshStellar();
    } catch(err) {
      console.error("Failed to disconnect", err);
    }
  };

  function renderSection() {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full animate-spin" />
            <p className="text-[var(--color-ink-500)] font-medium">Loading testnet data...</p>
          </div>
        </div>
      );
    }

    if (!stellarAccount && activeSection !== "stellar") {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto mt-20 p-10 bg-[var(--color-bg-card)] backdrop-blur-2xl rounded-3xl border border-[var(--color-border)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-center flex flex-col items-center gap-6"
        >
          <div className="text-[3rem]">
            💳
          </div>
          <div>
            <h2 className="font-display text-3xl text-[var(--color-ink-900)] font-bold mb-3 tracking-tight">
              Connect your Wallet
            </h2>
            <p className="text-[var(--color-ink-500)] leading-relaxed text-sm">
              You need a Stellar Testnet wallet to use the dashboard. Connect with Freighter, xBull, or Albedo, and we&apos;ll automatically fund it with 10,000 XLM via Friendbot.
            </p>
          </div>
          <button 
            onClick={handleConnectWallet}
            disabled={funding}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            {funding ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting & Funding...
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </motion.div>
      );
    }

    switch (activeSection) {
      case "overview":  return <OverviewView />;
      case "income":    return <IncomeView />;
      case "bills":     return <BillsView />;
      case "family":    return <FamilyView />;
      case "savings":   return <SavingsView />;
      case "rules":     return <RulesEditor />;
      case "agent":     return <AgentHistoryView />;
      case "stellar":   return <StellarView />;
      case "profile":   return <ProfileView userEmail={userEmail} />;
    }
  }

  return (
    <div className="dashboard-theme min-h-screen flex flex-col relative font-body">
      <ProceduralGroundBackground />
      <AgentNotification />
      <DemoBar />
      <div className="flex flex-1 relative z-10">
        <Sidebar
          activeSection={activeSection}
          onNavigate={setActiveSection}
          userEmail={userEmail}
          pendingDecisions={pendingDecisions}
        />

        <main className="flex-1 min-w-0 p-6 md:p-10 pb-32 max-w-[1400px]">
          {/* Page header */}
          <div className="flex justify-between items-start mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-ink-300)] mb-2">
                {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--color-ink-900)]">
                {SECTION_TITLES[activeSection]}
              </h1>
            </motion.div>
            
            {stellarAccount && (
              <WalletDropdown 
                publicKey={stellarAccount.publicKey} 
                onDisconnect={handleDisconnect} 
              />
            )}
          </div>

          <div className="relative">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardShell(props: DashboardShellProps) {
  return (
    <DashboardProvider>
      <DashboardContent {...props} />
    </DashboardProvider>
  );
}
