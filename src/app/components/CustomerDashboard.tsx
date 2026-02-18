import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import { useAuth } from '@/app/contexts/AuthContext';
import { installationAPI, complaintsAPI, documentsAPI, notificationsAPI } from '@/app/utils/api';
import {
  Sun, LogOut, User, FileText, MessageSquare, Bell, Zap,
  Calendar, MapPin, Award, Shield, Loader2, CheckCircle,
  Clock, AlertCircle, Home, ChevronRight, Phone, Mail,
} from 'lucide-react';

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'installation', label: 'My Installation', icon: Zap },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'support', label: 'Support', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'My Profile', icon: User },
];

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Installed: 'bg-green-500/20 text-green-400 border-green-500/30',
    Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Maintenance: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Open: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
    Closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
      {status}
    </span>
  );
}

// ─── Info card ────────────────────────────────────────────────────────────────
function InfoCard({ icon: Icon, label, value, accent = false }: { icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-xl bg-[#0d1a0d] border border-green-900/30">
      <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-green-400" />
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium mb-1">{label}</p>
        <p className={`font-bold text-base ${accent ? 'text-green-400' : 'text-white'}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const CustomerDashboard: React.FC = () => {
  const { user, accessToken, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [installation, setInstallation] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Complaint form
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cCat, setCCat] = useState('General');

  useEffect(() => { loadData(); }, [accessToken]);

  const loadData = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [inst, comp, docs, notifs] = await Promise.all([
        installationAPI.get(accessToken),
        complaintsAPI.getUserComplaints(accessToken),
        documentsAPI.get(accessToken),
        notificationsAPI.get(accessToken),
      ]);
      setInstallation(inst.installation);
      setComplaints(comp.complaints || []);
      setDocuments(docs.documents || {});
      setNotifications(notifs.notifications || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally { setLoading(false); }
  };

  const handleComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSubmitLoading(true); setError(''); setSuccess('');
    try {
      await complaintsAPI.create(accessToken, { title: cTitle, description: cDesc, category: cCat });
      setSuccess('Service request submitted successfully!');
      setCTitle(''); setCDesc(''); setCCat('General');
      const { complaints: updated } = await complaintsAPI.getUserComplaints(accessToken);
      setComplaints(updated || []);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally { setSubmitLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sun className="h-8 w-8 text-white" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-green-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white flex">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d1a0d] border-r border-green-900/30 fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-green-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Orbit Green Power</p>
              <p className="text-xs text-green-400">Customer Portal</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-green-500/5 border border-green-900/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 mt-2">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === id
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-green-900/20'
                }`}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {id === 'notifications' && notifications.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-green-900/30">
          <Button variant="ghost" onClick={logout}
            className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-xl">
            <LogOut className="mr-3 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0d1a0d]/95 backdrop-blur border-b border-green-900/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <Sun className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-sm">Customer Portal</span>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-red-400">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d1a0d]/95 backdrop-blur border-t border-green-900/30 flex">
        {NAV.slice(0, 5).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${activeTab === id ? 'text-green-400' : 'text-gray-600'
              }`}>
            <Icon className="h-5 w-5" />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto p-6 md:p-8">

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="text-gray-500 mt-1">Here's your solar energy overview</p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'System Status', value: installation?.status || 'Not Installed', icon: Zap, accent: true },
                  { label: 'Capacity', value: installation?.capacity || '—', icon: Sun },
                  { label: 'Open Tickets', value: complaints.filter(c => c.status === 'Open').length.toString(), icon: MessageSquare },
                  { label: 'Notifications', value: notifications.length.toString(), icon: Bell },
                ].map(({ label, value, icon: Icon, accent }) => (
                  <div key={label} className="p-5 rounded-2xl bg-[#0d1a0d] border border-green-900/30 hover:border-green-500/40 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5 text-green-400" />
                    </div>
                    <p className={`text-xl font-bold ${accent ? 'text-green-400' : 'text-white'}`}>{value}</p>
                    <p className="text-gray-500 text-xs mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Installation summary */}
              {installation ? (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Your Solar Installation</h2>
                    <StatusBadge status={installation.status} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <InfoCard icon={Zap} label="Capacity" value={installation.capacity} accent />
                    <InfoCard icon={Calendar} label="Installed On" value={new Date(installation.installationDate).toLocaleDateString('en-IN')} />
                    <InfoCard icon={MapPin} label="Location" value={installation.location} />
                    <InfoCard icon={Sun} label="Panel Brand" value={installation.panelBrand} />
                    <InfoCard icon={Award} label="Inverter" value={installation.inverterBrand} />
                    <InfoCard icon={Shield} label="Warranty" value={installation.warrantyPeriod} />
                  </div>
                  {installation.subsidyAmount > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#0a0f0a]/50 border border-green-900/30">
                        <p className="text-gray-500 text-xs mb-1">Total Cost</p>
                        <p className="text-white font-bold text-lg">₹{installation.totalCost?.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <p className="text-green-400 text-xs mb-1">Subsidy Received</p>
                        <p className="text-green-400 font-bold text-lg">₹{installation.subsidyAmount?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#0d1a0d] border border-green-900/30 text-center">
                  <Sun className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">No Installation Yet</h3>
                  <p className="text-gray-500 text-sm mb-4">Contact us to get started with your solar journey</p>
                  <div className="flex gap-3 justify-center">
                    <Button size="sm" onClick={() => window.open('tel:+919876543210')}
                      className="bg-green-600 hover:bg-green-500 text-white border-0">
                      <Phone className="mr-2 h-4 w-4" /> Call Us
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open('mailto:info@orbitgreenpower.com')}
                      className="border-green-700 text-green-400 hover:bg-green-900/20">
                      <Mail className="mr-2 h-4 w-4" /> Email Us
                    </Button>
                  </div>
                </div>
              )}

              {/* Recent complaints */}
              {complaints.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-4">Recent Service Requests</h2>
                  <div className="space-y-3">
                    {complaints.slice(0, 3).map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0d1a0d] border border-green-900/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{c.title}</p>
                            <p className="text-gray-500 text-xs">{c.category} · {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Installation ── */}
          {activeTab === 'installation' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">My Installation</h1>
              {installation ? (
                <>
                  <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-white">Solar System Details</h2>
                      <StatusBadge status={installation.status} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoCard icon={Zap} label="System Capacity" value={installation.capacity} accent />
                      <InfoCard icon={Calendar} label="Installation Date" value={new Date(installation.installationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                      <InfoCard icon={MapPin} label="Location" value={installation.location} />
                      <InfoCard icon={Sun} label="Panel Brand" value={installation.panelBrand} />
                      <InfoCard icon={Award} label="Inverter Brand" value={installation.inverterBrand} />
                      <InfoCard icon={Shield} label="Warranty Period" value={installation.warrantyPeriod} />
                    </div>
                  </div>

                  {installation.subsidyAmount > 0 && (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/30">
                      <h2 className="text-lg font-bold text-white mb-4">Financial Summary</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-[#0a0f0a]/50 border border-green-900/30">
                          <p className="text-gray-500 text-xs mb-1">Total System Cost</p>
                          <p className="text-white font-bold text-xl">₹{installation.totalCost?.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                          <p className="text-green-400 text-xs mb-1">Government Subsidy</p>
                          <p className="text-green-400 font-bold text-xl">₹{installation.subsidyAmount?.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                          <p className="text-emerald-400 text-xs mb-1">Net Amount Paid</p>
                          <p className="text-emerald-400 font-bold text-xl">
                            ₹{((installation.totalCost || 0) - (installation.subsidyAmount || 0)).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 rounded-2xl bg-[#0d1a0d] border border-green-900/30 text-center">
                  <Sun className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">No Installation Registered</h3>
                  <p className="text-gray-500 mb-6">Your solar installation details will appear here once registered by our team.</p>
                  <Button onClick={() => window.open('tel:+919876543210')} className="bg-green-600 hover:bg-green-500 border-0">
                    <Phone className="mr-2 h-4 w-4" /> Contact Support
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── Documents ── */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Documents</h1>
              <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30">
                {Object.keys(documents).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(documents).map(([type, doc]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0f0a] border border-green-900/20 hover:border-green-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium capitalize">{type.replace(/_/g, ' ')}</p>
                            <p className="text-gray-500 text-xs">{doc.name}</p>
                            <p className="text-gray-600 text-xs">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.open(doc.url, '_blank')}
                          className="border-green-700 text-green-400 hover:bg-green-900/20 rounded-lg">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">No Documents Yet</h3>
                    <p className="text-gray-500 text-sm">Your installation and subsidy documents will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Support ── */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Support & Service Requests</h1>

              {/* Submit form */}
              <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30">
                <h2 className="text-lg font-bold text-white mb-5">Raise a New Request</h2>
                <form onSubmit={handleComplaint} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">⚠ {error}</div>
                  )}
                  {success && (
                    <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">✓ {success}</div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-gray-300 text-sm">Category</Label>
                      <Select value={cCat} onValueChange={setCCat}>
                        <SelectTrigger className="bg-[#0a0f0a] border-green-900/50 text-white rounded-xl h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d1a0d] border-green-900/50 text-white">
                          {['General', 'Technical', 'Maintenance', 'Billing', 'Subsidy'].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-gray-300 text-sm">Subject</Label>
                      <Input value={cTitle} onChange={e => setCTitle(e.target.value)} required
                        placeholder="Brief description of your issue"
                        className="bg-[#0a0f0a] border-green-900/50 text-white placeholder:text-gray-600 rounded-xl h-11" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-300 text-sm">Detailed Description</Label>
                    <Textarea value={cDesc} onChange={e => setCDesc(e.target.value)} required rows={4}
                      placeholder="Provide detailed information about your issue or request…"
                      className="bg-[#0a0f0a] border-green-900/50 text-white placeholder:text-gray-600 rounded-xl resize-none" />
                  </div>
                  <Button type="submit" disabled={submitLoading}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white border-0 rounded-xl px-8">
                    {submitLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : 'Submit Request'}
                  </Button>
                </form>
              </div>

              {/* History */}
              <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30">
                <h2 className="text-lg font-bold text-white mb-5">Request History</h2>
                {complaints.length > 0 ? (
                  <div className="space-y-4">
                    {complaints.map(c => (
                      <div key={c.id} className="p-5 rounded-xl bg-[#0a0f0a] border border-green-900/20">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold">{c.title}</p>
                            <p className="text-gray-500 text-sm mt-1">{c.description}</p>
                          </div>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                          <span>Category: {c.category}</span>
                        </div>
                        {c.adminNotes && (
                          <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-blue-400 text-xs font-semibold mb-1">Admin Response:</p>
                            <p className="text-blue-300 text-sm">{c.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No service requests yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30">
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((n, i) => (
                      <div key={i} className="flex gap-4 p-5 rounded-xl bg-[#0a0f0a] border border-green-900/20 border-l-4 border-l-green-500">
                        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <Bell className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold mb-1">{n.title}</p>
                          <p className="text-gray-400 text-sm mb-2">{n.message}</p>
                          <p className="text-gray-600 text-xs">
                            {new Date(n.createdAt).toLocaleDateString('en-IN')} at {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">All Caught Up!</h3>
                    <p className="text-gray-500 text-sm">No new notifications at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Profile ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30">
                <div className="flex items-center gap-5 mb-8 pb-6 border-b border-green-900/30">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-green-500/20">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                      <CheckCircle className="h-3 w-3" /> Verified Customer
                    </span>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', value: user?.name || '—', icon: User },
                    { label: 'Email Address', value: user?.email || '—', icon: Mail },
                    { label: 'Phone Number', value: user?.phone || 'Not provided', icon: Phone },
                    { label: 'Customer ID', value: user?.id?.substring(0, 8).toUpperCase() || '—', icon: Shield },
                    { label: 'Address', value: user?.address || 'Not provided', icon: MapPin },
                    { label: 'Account Type', value: 'Customer', icon: User },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="p-4 rounded-xl bg-[#0a0f0a] border border-green-900/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4 text-green-400" />
                        <p className="text-gray-500 text-xs font-medium">{label}</p>
                      </div>
                      <p className="text-white font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
