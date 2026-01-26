import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  customerAPI,
  installationAPI,
  complaintsAPI,
  notificationsAPI,
  analyticsAPI,
} from '@/app/utils/api';
import {
  Sun,
  LogOut,
  Users,
  Zap,
  MessageSquare,
  Bell,
  TrendingUp,
  Trash2,
  Plus,
  Loader2,
  Send,
  Edit,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, accessToken, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Installation form
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [installForm, setInstallForm] = useState({
    capacity: '',
    installationDate: '',
    location: '',
    panelBrand: '',
    inverterBrand: '',
    warrantyPeriod: '25 years',
    status: 'Installed',
    subsidyAmount: '',
    totalCost: '',
  });

  // Notification form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTarget, setNotifTarget] = useState('all');

  // Complaint update
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [complaintStatus, setComplaintStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [accessToken]);

  const loadAdminData = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const [customersData, complaintsData, analyticsData] = await Promise.all([
        customerAPI.getAll(accessToken),
        complaintsAPI.getAllComplaints(accessToken),
        analyticsAPI.get(accessToken),
      ]);

      setCustomers(customersData.customers || []);
      setComplaints(complaintsData.complaints || []);
      setAnalytics(analyticsData.analytics);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!accessToken) return;
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      await customerAPI.delete(accessToken, customerId);
      setSuccess('Customer deleted successfully');
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete customer');
    }
  };

  const handleAddInstallation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedCustomer) return;

    try {
      await installationAPI.create(accessToken, selectedCustomer, {
        ...installForm,
        subsidyAmount: parseFloat(installForm.subsidyAmount) || 0,
        totalCost: parseFloat(installForm.totalCost) || 0,
      });

      setSuccess('Installation data added successfully');
      setSelectedCustomer('');
      setInstallForm({
        capacity: '',
        installationDate: '',
        location: '',
        panelBrand: '',
        inverterBrand: '',
        warrantyPeriod: '25 years',
        status: 'Installed',
        subsidyAmount: '',
        totalCost: '',
      });
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to add installation');
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    try {
      await notificationsAPI.send(
        accessToken,
        notifTitle,
        notifMessage,
        notifTarget === 'all' ? undefined : notifTarget
      );

      setSuccess('Notification sent successfully');
      setNotifTitle('');
      setNotifMessage('');
      setNotifTarget('all');
    } catch (err: any) {
      setError(err.message || 'Failed to send notification');
    }
  };

  const handleUpdateComplaint = async () => {
    if (!accessToken || !selectedComplaint) return;

    try {
      await complaintsAPI.updateStatus(
        accessToken,
        selectedComplaint.id,
        complaintStatus,
        adminNotes
      );

      setSuccess('Complaint updated successfully');
      setSelectedComplaint(null);
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to update complaint');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-green-100">Orbit Green Power Technology</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-green-100">{user?.email}</p>
              </div>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-600 text-green-600">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.totalCustomers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Installations</CardTitle>
                <Zap className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.activeInstallations}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
                <MessageSquare className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.pendingComplaints}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.totalComplaints}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="customers">
              <Users className="mr-2 h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="installations">
              <Zap className="mr-2 h-4 w-4" />
              Installations
            </TabsTrigger>
            <TabsTrigger value="complaints">
              <MessageSquare className="mr-2 h-4 w-4" />
              Complaints
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>View and manage all customers</CardDescription>
              </CardHeader>
              <CardContent>
                {customers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customer.phone || 'N/A'}</TableCell>
                            <TableCell>{customer.address || 'N/A'}</TableCell>
                            <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteCustomer(customer.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No customers found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Installations Tab */}
          <TabsContent value="installations">
            <Card>
              <CardHeader>
                <CardTitle>Add Installation</CardTitle>
                <CardDescription>Create new solar installation record</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddInstallation} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Customer</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>System Capacity</Label>
                      <Input
                        placeholder="e.g., 3kW"
                        value={installForm.capacity}
                        onChange={(e) => setInstallForm({ ...installForm, capacity: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Installation Date</Label>
                      <Input
                        type="date"
                        value={installForm.installationDate}
                        onChange={(e) => setInstallForm({ ...installForm, installationDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        placeholder="City, State"
                        value={installForm.location}
                        onChange={(e) => setInstallForm({ ...installForm, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Panel Brand</Label>
                      <Select
                        value={installForm.panelBrand}
                        onValueChange={(value) => setInstallForm({ ...installForm, panelBrand: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Waaree">Waaree</SelectItem>
                          <SelectItem value="Adani Solar">Adani Solar</SelectItem>
                          <SelectItem value="Vikram Solar">Vikram Solar</SelectItem>
                          <SelectItem value="Tata Power Solar">Tata Power Solar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Inverter Brand</Label>
                      <Select
                        value={installForm.inverterBrand}
                        onValueChange={(value) => setInstallForm({ ...installForm, inverterBrand: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Growatt">Growatt</SelectItem>
                          <SelectItem value="Luminous">Luminous</SelectItem>
                          <SelectItem value="Havells">Havells</SelectItem>
                          <SelectItem value="Delta">Delta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Warranty Period</Label>
                      <Input
                        placeholder="e.g., 25 years"
                        value={installForm.warrantyPeriod}
                        onChange={(e) => setInstallForm({ ...installForm, warrantyPeriod: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total Cost (₹)</Label>
                      <Input
                        type="number"
                        placeholder="120000"
                        value={installForm.totalCost}
                        onChange={(e) => setInstallForm({ ...installForm, totalCost: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Subsidy Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="60000"
                        value={installForm.subsidyAmount}
                        onChange={(e) => setInstallForm({ ...installForm, subsidyAmount: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={installForm.status}
                        onValueChange={(value) => setInstallForm({ ...installForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Installed">Installed</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Installation
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints">
            <Card>
              <CardHeader>
                <CardTitle>Manage Complaints</CardTitle>
                <CardDescription>View and update customer service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {complaints.length > 0 ? (
                  <div className="space-y-4">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{complaint.title}</h4>
                            <p className="text-sm text-gray-600">{complaint.description}</p>
                          </div>
                          <Badge
                            className={
                              complaint.status === 'Open'
                                ? 'bg-yellow-600'
                                : complaint.status === 'In Progress'
                                ? 'bg-blue-600'
                                : 'bg-green-600'
                            }
                          >
                            {complaint.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>Category: {complaint.category}</span>
                          <span>•</span>
                          <span>ID: {complaint.userId.substring(0, 8)}</span>
                          <span>•</span>
                          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                        {complaint.adminNotes && (
                          <div className="mb-3 p-3 bg-blue-50 rounded">
                            <p className="text-sm font-semibold text-blue-900">Admin Notes:</p>
                            <p className="text-sm text-blue-800">{complaint.adminNotes}</p>
                          </div>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedComplaint(complaint);
                                setComplaintStatus(complaint.status);
                                setAdminNotes(complaint.adminNotes || '');
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Update Status
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Complaint</DialogTitle>
                              <DialogDescription>{complaint.title}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={complaintStatus} onValueChange={setComplaintStatus}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Open">Open</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Admin Notes</Label>
                                <Textarea
                                  placeholder="Add notes or response..."
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  rows={4}
                                />
                              </div>
                              <Button
                                onClick={handleUpdateComplaint}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                Update Complaint
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No complaints found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>Broadcast messages to customers</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target</Label>
                    <Select value={notifTarget} onValueChange={setNotifTarget}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Notification title"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Your message..."
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Send className="mr-2 h-4 w-4" />
                    Send Notification
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
