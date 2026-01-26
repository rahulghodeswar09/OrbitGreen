import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/app/contexts/AuthContext';
import { LandingPage } from '@/app/components/LandingPage';
import { AuthModal } from '@/app/components/AuthModal';
import { CustomerDashboard } from '@/app/components/CustomerDashboard';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { Toaster } from '@/app/components/ui/sonner';

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'admin'>('login');

  const handleLoginClick = () => {
    setAuthModalTab('login');
    setShowAuthModal(true);
  };

  const handleRegisterClick = () => {
    setAuthModalTab('register');
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show appropriate dashboard
  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard />;
    } else {
      return <CustomerDashboard />;
    }
  }

  // Otherwise show landing page
  return (
    <>
      <LandingPage
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}
