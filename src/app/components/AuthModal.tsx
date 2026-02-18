import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  Loader2, Sun, Eye, EyeOff, User, Mail, Phone, MapPin, Lock, ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register' | 'admin';
}

// ─── Reusable field ───────────────────────────────────────────────────────────
function Field({
  id, label, type = 'text', placeholder, value, onChange, icon: Icon, required, minLength,
}: {
  id: string; label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  icon: React.ElementType; required?: boolean; minLength?: number;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-gray-300 text-sm font-medium">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          id={id}
          type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          className="pl-10 pr-10 bg-[#0d1a0d] border-green-900/50 text-white placeholder:text-gray-600 focus:border-green-500 focus:ring-green-500/20 rounded-xl h-11"
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Error / Success banners ──────────────────────────────────────────────────
function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
      <span className="mt-0.5">⚠</span> {msg}
    </div>
  );
}
function SuccessBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
      <span className="mt-0.5">✓</span> {msg}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen, onClose, defaultTab = 'login',
}) => {
  const { login, signup, adminSignup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // Admin
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');

  const reset = () => { setError(''); setSuccess(''); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      setSuccess('Login successful! Redirecting…');
      setTimeout(onClose, 800);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      await signup(regEmail, regPassword, regName, regPhone, regAddress);
      setSuccess('Account created! Logging you in…');
      setTimeout(onClose, 800);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      await adminSignup(adminEmail, adminPassword, adminName, adminKey);
      setSuccess('Admin account created! Logging you in…');
      setTimeout(onClose, 800);
    } catch (err: any) {
      setError(err.message || 'Admin registration failed. Check your admin key.');
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-[#0a0f0a] border border-green-900/40 text-white rounded-2xl shadow-2xl shadow-green-900/30 p-0 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 bg-gradient-to-br from-green-900/30 to-emerald-900/10 border-b border-green-900/30">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg font-bold">Orbit Green Power</DialogTitle>
                <DialogDescription className="sr-only">
                  Login or create an account to access the customer or admin portal.
                </DialogDescription>
                <p className="text-green-400 text-xs">Customer & Admin Portal</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-8 py-6">
          <Tabs defaultValue={defaultTab} onValueChange={reset}>
            <TabsList className="grid w-full grid-cols-3 bg-[#0d1a0d] border border-green-900/30 rounded-xl p-1 mb-6">
              <TabsTrigger value="login"
                className="rounded-lg text-gray-400 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-sm font-medium transition-all">
                Login
              </TabsTrigger>
              <TabsTrigger value="register"
                className="rounded-lg text-gray-400 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-sm font-medium transition-all">
                Register
              </TabsTrigger>
              <TabsTrigger value="admin"
                className="rounded-lg text-gray-400 data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-sm font-medium transition-all">
                Admin
              </TabsTrigger>
            </TabsList>

            {/* ── Login ── */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && <ErrorBanner msg={error} />}
                {success && <SuccessBanner msg={success} />}
                <Field id="login-email" label="Email Address" type="email" placeholder="your@email.com"
                  value={loginEmail} onChange={setLoginEmail} icon={Mail} required />
                <Field id="login-password" label="Password" type="password" placeholder="Enter your password"
                  value={loginPassword} onChange={setLoginPassword} icon={Lock} required />
                <Button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-5 rounded-xl font-semibold shadow-lg shadow-green-500/20 border-0 mt-2">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in…</> : 'Login to Portal'}
                </Button>
              </form>
            </TabsContent>

            {/* ── Register ── */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {error && <ErrorBanner msg={error} />}
                {success && <SuccessBanner msg={success} />}
                <Field id="reg-name" label="Full Name" placeholder="Rajesh Kumar"
                  value={regName} onChange={setRegName} icon={User} required />
                <Field id="reg-email" label="Email Address" type="email" placeholder="your@email.com"
                  value={regEmail} onChange={setRegEmail} icon={Mail} required />
                <Field id="reg-password" label="Password" type="password" placeholder="Min. 6 characters"
                  value={regPassword} onChange={setRegPassword} icon={Lock} required minLength={6} />
                <Field id="reg-phone" label="Phone Number" type="tel" placeholder="+91 98765 43210"
                  value={regPhone} onChange={setRegPhone} icon={Phone} />
                <Field id="reg-address" label="Address" placeholder="City, State"
                  value={regAddress} onChange={setRegAddress} icon={MapPin} />
                <Button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-5 rounded-xl font-semibold shadow-lg shadow-green-500/20 border-0 mt-2">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account…</> : 'Create Account'}
                </Button>
              </form>
            </TabsContent>

            {/* ── Admin ── */}
            <TabsContent value="admin">
              <form onSubmit={handleAdminSignup} className="space-y-4">
                {error && <ErrorBanner msg={error} />}
                {success && <SuccessBanner msg={success} />}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                  Admin registration requires a secret key. Contact your system administrator.
                </div>
                <Field id="admin-name" label="Admin Name" placeholder="Admin Name"
                  value={adminName} onChange={setAdminName} icon={User} required />
                <Field id="admin-email" label="Email Address" type="email" placeholder="admin@email.com"
                  value={adminEmail} onChange={setAdminEmail} icon={Mail} required />
                <Field id="admin-password" label="Password" type="password" placeholder="Min. 6 characters"
                  value={adminPassword} onChange={setAdminPassword} icon={Lock} required minLength={6} />
                <Field id="admin-key" label="Admin Secret Key" type="password" placeholder="Enter admin key"
                  value={adminKey} onChange={setAdminKey} icon={ShieldCheck} required />
                <Button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-5 rounded-xl font-semibold shadow-lg shadow-green-500/20 border-0 mt-2">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Admin…</> : 'Create Admin Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
