import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/app/contexts/AuthContext';
import { LandingPage } from '@/app/components/LandingPage';
import { CustomerDashboard } from '@/app/components/CustomerDashboard';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { AuthModal } from '@/app/components/AuthModal';
import { Loader2, Sun } from 'lucide-react';

// ─── Inner app (needs auth context) ──────────────────────────────────────────
function AppInner() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'admin'>('login');

  const openLogin = () => { setAuthModalTab('login'); setAuthModalOpen(true); };
  const openRegister = () => { setAuthModalTab('register'); setAuthModalOpen(true); };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
            <Sun className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Orbit Green Power</h1>
          <p className="text-green-400 text-sm mb-6">Technology</p>
          <Loader2 className="h-6 w-6 animate-spin text-green-400 mx-auto" />
        </div>
      </div>
    );
  }

  // Authenticated — route by role
  if (user) {
    if (user.role === 'admin') return <AdminDashboard />;
    return <CustomerDashboard />;
  }

  // Public landing page
  return (
    <>
      <LandingPage onLoginClick={openLogin} onRegisterClick={openRegister} />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
}

// ─── Root with provider ───────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
