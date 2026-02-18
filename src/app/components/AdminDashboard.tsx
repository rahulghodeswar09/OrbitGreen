import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/app/components/ui/dialog';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  customerAPI, installationAPI, complaintsAPI, notificationsAPI, analyticsAPI,
} from '@/app/utils/api';
import {
  Sun, LogOut, Users, Zap, MessageSquare, Bell, TrendingUp,
  Trash2, Plus, Loader2, Send, Edit, Home, Settings,
  CheckCircle, Clock, AlertCircle, BarChart3, Search,
  ChevronRight, RefreshCw, Shield,
} from 'lucide-react';

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'installations', label: 'Installations', icon: Zap },
  { id: 'complaints', label: 'Complaints', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
      {status}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, color = 'green',
}: { icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  };
  return (
    <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30 hover:border-green-500/40 transition-all">
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm font-medium">{label}</div>
      {sub && <div className="text-gray-600 text-xs mt-1">{sub}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const AdminDashboard: React.FC = () => {
  const { user, accessToken, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Installation form
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [installForm, setInstallForm] = useState({
    capacity: '', installationDate: '', location: '',
    panelBrand: '', inverterBrand: '', warrantyPeriod: '25 years',
    status: 'Installed', subsidyAmount: '', totalCost: '',
  });

  // Notification form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTarget, setNotifTarget] = useState('all');

  // Complaint dialog
  const [editComplaint, setEditComplaint] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => { loadData(); }, [accessToken]);

  const loadData = async (silent = false) => {
    if (!accessToken) return;
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [cust, comp, anal] = await Promise.all([
        customerAPI.getAll(accessToken),
        complaintsAPI.getAllComplaints(accessToken),
        analyticsAPI.get(accessToken),
      ]);
      setCustomers(cust.customers || []);
      setComplaints(comp.complaints || []);
      setAnalytics(anal.analytics);
    } catch (err: any) {
      setError('Failed to load admin data. ' + (err.message || ''));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!accessToken || !confirm(`Delete customer "${name}"? This cannot be undone.`)) return;
    try {
      await customerAPI.delete(accessToken, id);
      showSuccess(`Customer "${name}" deleted successfully.`);
      await loadData(true);
    } catch (err: any) { showError(err.message || 'Failed to delete customer'); }
  };

  const handleAddInstallation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedCustomer) { showError('Please select a customer.'); return; }
    try {
      await installationAPI.create(accessToken, selectedCustomer, {
        ...installForm,
        subsidyAmount: parseFloat(installForm.subsidyAmount) || 0,
        totalCost: parseFloat(installForm.totalCost) || 0,
      });
      showSuccess('Installation data saved successfully!');
      setSelectedCustomer('');
      setInstallForm({ capacity: '', installationDate: '', location: '', panelBrand: '', inverterBrand: '', warrantyPeriod: '25 years', status: 'Installed', subsidyAmount: '', totalCost: '' });
    } catch (err: any) { showError(err.message || 'Failed to save installation'); }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    try {
      await notificationsAPI.send(accessToken, notifTitle, notifMessage, notifTarget === 'all' ? undefined : notifTarget);
      showSuccess('Notification sent successfully!');
      setNotifTitle(''); setNotifMessage(''); setNotifTarget('all');
    } catch (err: any) { showError(err.message || 'Failed to send notification'); }
  };

  const handleUpdateComplaint = async () => {
    if (!accessToken || !editComplaint) return;
    setEditLoading(true);
    try {
      await complaintsAPI.updateStatus(accessToken, editComplaint.id, editStatus, editNotes);
      showSuccess('Complaint updated successfully!');
      setEditComplaint(null);
      await loadData(true);
    } catch (err: any) { showError(err.message || 'Failed to update complaint'); }
    finally { setEditLoading(false); }
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sun className="h-8 w-8 text-white" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-green-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white flex">

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d1a0d] border-r border-green-900/30 fixed top-0 left-0 h-full z-40">
        <div className="p-6 border-b border-green-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Admin Dashboard</p>
              <p className="text-xs text-green-400">Orbit Green Power</p>
            </div>
          </div>
        </div>

        {/* Admin info */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-green-500/5 border border-green-900/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-400" />
                <p className="text-green-400 text-xs">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-2">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === id
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-green-900/20'
                }`}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {id === 'complaints' && complaints.filter(c => c.status === 'Open').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {complaints.filter(c => c.status === 'Open').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-green-900/30 space-y-2">
          <Button variant="ghost" size="sm" onClick={() => loadData(true)} disabled={refreshing}
            className="w-full justify-start text-gray-400 hover:text-green-400 hover:bg-green-900/10 rounded-xl">
            <RefreshCw className={`mr-3 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Data
          </Button>
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
          <span className="text-white font-bold text-sm">Admin Panel</span>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-red-400">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d1a0d]/95 backdrop-blur border-t border-green-900/30 flex">
        {NAV.slice(0, 5).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${activeTab === id ? 'text-green-400' : 'text-gray-600'}`}>
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-6 md:p-8">

          {/* Global alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 flex-shrink-0" /> {success}
            </div>
          )}

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
                <p className="text-gray-500 mt-1">Orbit Green Power Technology — Control Panel</p>
              </div>

              {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Users} label="Total Customers" value={analytics.totalCustomers} sub="Registered users" color="green" />
                  <StatCard icon={Zap} label="Active Installations" value={analytics.activeInstallations} sub="Installed systems" color="blue" />
                  <StatCard icon={MessageSquare} label="Open Tickets" value={analytics.pendingComplaints} sub="Needs attention" color="yellow" />
                  <StatCard icon={TrendingUp} label="Total Complaints" value={analytics.totalComplaints} sub="All time" color="purple" />
                </div>
              )}

              {/* Recent customers */}
              <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white">Recent Customers</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('customers')}
                    className="text-green-400 hover:text-green-300 text-xs">
                    View All <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                {customers.length > 0 ? (
                  <div className="space-y-3">
                    {customers.slice(0, 5).map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0f0a] border border-green-900/20">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            {c.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{c.name}</p>
                            <p className="text-gray-500 text-xs">{c.email}</p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No customers yet</p>
                  </div>
                )}
              </div>

              {/* Open complaints */}
              {complaints.filter(c => c.status === 'Open').length > 0 && (
                <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-yellow-900/30">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-400" /> Open Complaints
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('complaints')}
                      className="text-yellow-400 hover:text-yellow-300 text-xs">
                      Manage <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {complaints.filter(c => c.status === 'Open').slice(0, 3).map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0f0a] border border-yellow-900/20">
                        <div>
                          <p className="text-white text-sm font-medium">{c.title}</p>
                          <p className="text-gray-500 text-xs">{c.category} · {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Customers ── */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Customer Management</h1>
                  <p className="text-gray-500 mt-1">{customers.length} registered customers</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email…"
                  className="pl-11 bg-[#0d1a0d] border-green-900/50 text-white placeholder:text-gray-600 rounded-xl h-11" />
              </div>

              <div className="rounded-2xl bg-[#0d1a0d] border border-green-900/30 overflow-hidden">
                {filteredCustomers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-green-900/30">
                          <th className="text-left px-6 py-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Customer</th>
                          <th className="text-left px-6 py-4 text-gray-500 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Phone</th>
                          <th className="text-left px-6 py-4 text-gray-500 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Address</th>
                          <th className="text-left px-6 py-4 text-gray-500 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Joined</th>
                          <th className="text-right px-6 py-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-green-900/20">
                        {filteredCustomers.map(c => (
                          <tr key={c.id} className="hover:bg-green-900/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {c.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">{c.name}</p>
                                  <p className="text-gray-500 text-xs">{c.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm hidden md:table-cell">{c.phone || '—'}</td>
                            <td className="px-6 py-4 text-gray-400 text-sm hidden lg:table-cell">{c.address || '—'}</td>
                            <td className="px-6 py-4 text-gray-500 text-xs hidden md:table-cell">
                              {new Date(c.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm"
                                onClick={() => handleDeleteCustomer(c.id, c.name)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Users className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">
                      {searchQuery ? 'No customers match your search' : 'No customers yet'}
                    </h3>
                    <p className="text-gray-500 text-sm">Customers will appear here after registration.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Installations ── */}
          {activeTab === 'installations' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Add Installation</h1>
              <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30">
                <h2 className="text-lg font-bold text-white mb-6">New Solar Installation Record</h2>
                <form onSubmit={handleAddInstallation} className="space-y-5">
                  {/* Customer select */}
                  <div className="space-y-1.5">
                    <Label className="text-gray-300 text-sm">Select Customer *</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger className="bg-[#0a0f0a] border-green-900/50 text-white rounded-xl h-11">
                        <SelectValue placeholder="Choose a customer…" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1a0d] border-green-900/50 text-white">
                        {customers.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name} — {c.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Capacity */}
                    <div className="space-y-1.5">
                      <Label className="text-gray-300 text-sm">System Capacity *</Label>
                      <Input value={installForm.capacity} required
                        onChange={e => setInstallForm({ ...installForm, capacity: e.target.value })}
                        placeholder="e.g. 3kW"
                        className="bg-[#0a0f0a] border-green-900/50 text-white placeholder:text-gray-600 rounded-xl h-11" />
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                      <Label className="text-gray-300 text-sm">Installation Date *</Label>
                      <Input type="date" value={installForm.installationDate} required
                        onChange={e => setInstallForm({ ...installForm, installationDate: e.target.value })}
                        className="bg-[#0a0f0a] border-green-900/50 text-white rounded-xl h-11" />
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                      <Label className="text-gray-300 text-sm">Location *</Label>
                      <Input value={installForm.location} required
                        onChange={e => setInstallForm({ ...installForm, location: e.target.value })}
                        placeholder="City, State"
                        className="bg-[#0a0f0a] border-green-900/50 text-white placeholder:text-gray-600 rounded-xl h-11" />
                    </div>

                    {/* Panel brand */}
                    <div className="space-y-1.5">
                      <Label className="text-gray-300 text-sm">Panel Brand</Label>
                      <Select value={installForm.panelBrand} onValueChange={v => setInstallForm({ ...installForm, panelBrand: v })}>
                        <SelectTrigger className="bg-[#0a0f0a] border-green-900/50 text-white rounded-xl h-11">
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d1a0d] border-green-900/50 text-white">
                          {['Waaree', 'Adani Solar', 'Vikram Solar', 'Tata Power Solar', 'RenewSys'].map(b => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Inverter brand */}
                    <div className="space-y-1.5">
                      <Label className="text-gray-300 text-sm">Inverter Brand</Label>
                      <Select value={installForm.inverterBrand} onValueChange={v => setInstallForm({ ...installForm, inverterBrand: v })}>
                        <SelectTrigger className="bg-[#0a0f0a] border-green-900/50 text-white rounded-xl h-11">
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d1a0d] border-green-900/50 text-white">
                          {['Growatt', 'Luminous', 'Havells', 'Delta', 'SMA', 'Fronius'].map(b => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Warranty */}
                    <div className="space-y-1.5">
                      <Label className="text-gray-300 text-sm">Warranty Period</Label>
                      <Input value={installForm.warrantyPeriod}
                        onChange={e => setInstallForm({ ...installForm, warrantyPeriod: e.target.value })}
                        placeholder="e.g. 25 years"
                        className="bg-[#0a0f0a] border-green-900/50 text-white placeholder:text-gray-600 rounded-xl h-11" />
                    </div>

                    {/* Total cost */}
                    <div className="space-y-1.5">
                      <Label className="text-gray-300 text-sm">Total Cost (₹)</Label>
                      <Input type="number" value={installForm.totalCost}
                        onChange={e => setInstallForm({ ...installForm, totalCost: e.target.value })}
                        placeholder="120000"
                        className="bg-[#0a0f0a] border-green-900/50 text-white placeholder:text-gray-600 rounded-xl h-11" />
                    </div>

                    {/* Subsidy */}
                    <div className="space-y-1.5">
                      <Label className="text-gray-300 text-sm">Subsidy Amount (₹)</Label>
                      <Input type="number" value={installForm.subsidyAmount}
                        onChange={e => setInstallForm({ ...installForm, subsidyAmount: e.target.value })}
                        placeholder="60000"
                        className="bg-[#0a0f0a] border-green-900/50 text-white placeholder:text-gray-600 rounded-xl h-11" />
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                      <Label className="text-gray-300 text-sm">Status</Label>
                      <Select value={installForm.status} onValueChange={v => setInstallForm({ ...installForm, status: v })}>
                        <SelectTrigger className="bg-[#0a0f0a] border-green-900/50 text-white rounded-xl h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d1a0d] border-green-900/50 text-white">
                          <SelectItem value="Installed">Installed</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white border-0 rounded-xl px-8 py-5">
                    <Plus className="mr-2 h-4 w-4" /> Save Installation
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* ── Complaints ── */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Complaint Management</h1>
                <p className="text-gray-500 mt-1">{complaints.length} total · {complaints.filter(c => c.status === 'Open').length} open</p>
              </div>

              <div className="space-y-4">
                {complaints.length > 0 ? complaints.map(c => (
                  <div key={c.id} className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30 hover:border-green-500/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-white font-semibold text-base">{c.title}</h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{c.description}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                      <span>Category: {c.category}</span>
                      <span>ID: {c.userId?.substring(0, 8)}</span>
                    </div>
                    {c.adminNotes && (
                      <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p className="text-blue-400 text-xs font-semibold mb-1">Admin Notes:</p>
                        <p className="text-blue-300 text-sm">{c.adminNotes}</p>
                      </div>
                    )}
                    <Button size="sm" variant="outline"
                      onClick={() => { setEditComplaint(c); setEditStatus(c.status); setEditNotes(c.adminNotes || ''); }}
                      className="border-green-700 text-green-400 hover:bg-green-900/20 rounded-lg">
                      <Edit className="mr-2 h-3 w-3" /> Update Status
                    </Button>
                  </div>
                )) : (
                  <div className="p-16 rounded-2xl bg-[#0d1a0d] border border-green-900/30 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">No Complaints</h3>
                    <p className="text-gray-500 text-sm">All clear! No customer complaints at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Send Notification</h1>
              <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30">
                <h2 className="text-lg font-bold text-white mb-6">Broadcast to Customers</h2>
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-gray-300 text-sm">Target Audience</Label>
                    <Select value={notifTarget} onValueChange={setNotifTarget}>
                      <SelectTrigger className="bg-[#0a0f0a] border-green-900/50 text-white rounded-xl h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1a0d] border-green-900/50 text-white">
                        <SelectItem value="all">📢 All Customers</SelectItem>
                        {customers.map(c => (
                          <SelectItem key={c.id} value={c.id}>👤 {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-300 text-sm">Notification Title *</Label>
                    <Input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} required
                      placeholder="e.g. Maintenance Schedule Update"
                      className="bg-[#0a0f0a] border-green-900/50 text-white placeholder:text-gray-600 rounded-xl h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-300 text-sm">Message *</Label>
                    <Textarea value={notifMessage} onChange={e => setNotifMessage(e.target.value)} required rows={5}
                      placeholder="Write your message here…"
                      className="bg-[#0a0f0a] border-green-900/50 text-white placeholder:text-gray-600 rounded-xl resize-none" />
                  </div>
                  <Button type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white border-0 rounded-xl px-8 py-5">
                    <Send className="mr-2 h-4 w-4" /> Send Notification
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* ── Analytics ── */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
              {analytics ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Users} label="Total Customers" value={analytics.totalCustomers} color="green" />
                    <StatCard icon={Zap} label="Active Installations" value={analytics.activeInstallations} color="blue" />
                    <StatCard icon={AlertCircle} label="Open Tickets" value={analytics.pendingComplaints} color="yellow" />
                    <StatCard icon={MessageSquare} label="Total Complaints" value={analytics.totalComplaints} color="purple" />
                  </div>

                  {/* Complaint breakdown */}
                  <div className="p-6 rounded-2xl bg-[#0d1a0d] border border-green-900/30">
                    <h2 className="text-lg font-bold text-white mb-5">Complaint Status Breakdown</h2>
                    {['Open', 'In Progress', 'Resolved', 'Closed'].map(status => {
                      const count = complaints.filter(c => c.status === status).length;
                      const pct = complaints.length ? Math.round((count / complaints.length) * 100) : 0;
                      const colors: Record<string, string> = {
                        Open: 'bg-yellow-500', 'In Progress': 'bg-blue-500',
                        Resolved: 'bg-green-500', Closed: 'bg-gray-500',
                      };
                      return (
                        <div key={status} className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-gray-400 text-sm">{status}</span>
                            <span className="text-white text-sm font-semibold">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-[#0a0f0a] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${colors[status]}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/30">
                    <h2 className="text-lg font-bold text-white mb-4">Business Summary</h2>
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-3xl font-extrabold text-green-400">{analytics.totalCustomers}</p>
                        <p className="text-gray-400 text-sm mt-1">Total Customers</p>
                      </div>
                      <div>
                        <p className="text-3xl font-extrabold text-blue-400">{analytics.activeInstallations}</p>
                        <p className="text-gray-400 text-sm mt-1">Active Systems</p>
                      </div>
                      <div>
                        <p className="text-3xl font-extrabold text-yellow-400">
                          {analytics.totalComplaints > 0
                            ? Math.round(((analytics.totalComplaints - analytics.pendingComplaints) / analytics.totalComplaints) * 100)
                            : 100}%
                        </p>
                        <p className="text-gray-400 text-sm mt-1">Resolution Rate</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-16 rounded-2xl bg-[#0d1a0d] border border-green-900/30 text-center">
                  <BarChart3 className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Analytics data unavailable</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ── Edit Complaint Dialog ── */}
      <Dialog open={!!editComplaint} onOpenChange={() => setEditComplaint(null)}>
        <DialogContent className="bg-[#0d1a0d] border border-green-900/40 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Update Complaint</DialogTitle>
            <DialogDescription className="text-gray-500">{editComplaint?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="bg-[#0a0f0a] border-green-900/50 text-white rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1a0d] border-green-900/50 text-white">
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-300 text-sm">Admin Notes / Response</Label>
              <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={4}
                placeholder="Add your response or notes…"
                className="bg-[#0a0f0a] border-green-900/50 text-white placeholder:text-gray-600 rounded-xl resize-none" />
            </div>
            <Button onClick={handleUpdateComplaint} disabled={editLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white border-0 rounded-xl py-5">
              {editLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating…</> : 'Update Complaint'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
