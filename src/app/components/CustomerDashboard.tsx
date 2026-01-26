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
import { useAuth } from '@/app/contexts/AuthContext';
import { installationAPI, complaintsAPI, documentsAPI, notificationsAPI } from '@/app/utils/api';
import { 
  Sun, LogOut, User, FileText, MessageSquare, Bell, Zap, 
  Calendar, MapPin, Award, Shield, CheckCircle, Clock, Loader2 
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user, accessToken, logout } = useAuth();
  const [installation, setInstallation] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Complaint form
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('General');

  useEffect(() => {
    loadDashboardData();
  }, [accessToken]);

  const loadDashboardData = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      const [installData, complaintsData, docsData, notifsData] = await Promise.all([
        installationAPI.get(accessToken),
        complaintsAPI.getUserComplaints(accessToken),
        documentsAPI.get(accessToken),
        notificationsAPI.get(accessToken),
      ]);

      setInstallation(installData.installation);
      setComplaints(complaintsData.complaints || []);
      setDocuments(docsData.documents || {});
      setNotifications(notifsData.notifications || []);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      await complaintsAPI.create(accessToken, {
        title: complaintTitle,
        description: complaintDescription,
        category: complaintCategory,
      });

      setSuccess('Complaint submitted successfully!');
      setComplaintTitle('');
      setComplaintDescription('');
      setComplaintCategory('General');
      
      // Reload complaints
      const { complaints: updatedComplaints } = await complaintsAPI.getUserComplaints(accessToken);
      setComplaints(updatedComplaints || []);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitLoading(false);
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
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-600">Orbit Green Power</h1>
                <p className="text-sm text-gray-600">Customer Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="installation">
              <Zap className="mr-2 h-4 w-4" />
              Installation
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="support">
              <MessageSquare className="mr-2 h-4 w-4" />
              Support
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              {notifications.length > 0 && (
                <Badge className="ml-2 bg-red-500">{notifications.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p className="text-lg font-semibold">{user?.name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-lg font-semibold">{user?.email}</p>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <p className="text-lg font-semibold">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label>Customer ID</Label>
                    <p className="text-lg font-semibold text-green-600">{user?.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <p className="text-lg font-semibold">{user?.address || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Installation Tab */}
          <TabsContent value="installation">
            {installation ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Solar Installation Details</CardTitle>
                        <CardDescription>Your system information</CardDescription>
                      </div>
                      <Badge className={
                        installation.status === 'Installed' ? 'bg-green-600' :
                        installation.status === 'Pending' ? 'bg-yellow-600' :
                        'bg-blue-600'
                      }>
                        {installation.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="flex items-start gap-3">
                        <Zap className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <Label className="text-gray-600">System Capacity</Label>
                          <p className="text-xl font-bold">{installation.capacity}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <Label className="text-gray-600">Installation Date</Label>
                          <p className="text-xl font-bold">
                            {new Date(installation.installationDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <Label className="text-gray-600">Location</Label>
                          <p className="text-xl font-bold">{installation.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Sun className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <Label className="text-gray-600">Panel Brand</Label>
                          <p className="text-xl font-bold">{installation.panelBrand}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Award className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <Label className="text-gray-600">Inverter Brand</Label>
                          <p className="text-xl font-bold">{installation.inverterBrand}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Shield className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                          <Label className="text-gray-600">Warranty Period</Label>
                          <p className="text-xl font-bold">{installation.warrantyPeriod}</p>
                        </div>
                      </div>
                    </div>

                    {installation.subsidyAmount > 0 && (
                      <div className="mt-6 p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Financial Details</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-600">Total Cost</Label>
                            <p className="text-lg font-bold">₹{installation.totalCost?.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Subsidy Received</Label>
                            <p className="text-lg font-bold text-green-600">₹{installation.subsidyAmount?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sun className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Installation Found</h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any solar installation registered yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    Contact our support team to get started with your solar journey.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <CardDescription>Your installation and subsidy documents</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(documents).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(documents).map(([type, doc]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-semibold capitalize">{type.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-600">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Documents</h3>
                    <p className="text-gray-600">Your installation documents will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="grid gap-6">
              {/* Submit Complaint */}
              <Card>
                <CardHeader>
                  <CardTitle>Raise Service Request</CardTitle>
                  <CardDescription>Submit a complaint or request for support</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitComplaint} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert className="border-green-600 text-green-600">
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={complaintCategory} onValueChange={setComplaintCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="Technical">Technical Issue</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Billing">Billing</SelectItem>
                          <SelectItem value="Subsidy">Subsidy Related</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Subject</Label>
                      <Input
                        id="title"
                        placeholder="Brief description of your issue"
                        value={complaintTitle}
                        onChange={(e) => setComplaintTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide detailed information about your request"
                        rows={4}
                        value={complaintDescription}
                        onChange={(e) => setComplaintDescription(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitLoading}>
                      {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Request
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Complaints History */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Service Requests</CardTitle>
                  <CardDescription>Track status of your complaints and requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {complaints.length > 0 ? (
                    <div className="space-y-4">
                      {complaints.map((complaint) => (
                        <div key={complaint.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{complaint.title}</h4>
                              <p className="text-sm text-gray-600">{complaint.description}</p>
                            </div>
                            <Badge className={
                              complaint.status === 'Open' ? 'bg-yellow-600' :
                              complaint.status === 'In Progress' ? 'bg-blue-600' :
                              'bg-green-600'
                            }>
                              {complaint.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Category: {complaint.category}</span>
                            <span>•</span>
                            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                          </div>
                          {complaint.adminNotes && (
                            <div className="mt-3 p-3 bg-blue-50 rounded">
                              <p className="text-sm font-semibold text-blue-900">Admin Response:</p>
                              <p className="text-sm text-blue-800">{complaint.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No service requests yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Important updates and announcements</CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notif, index) => (
                      <div key={index} className="border-l-4 border-green-600 bg-green-50 p-4 rounded">
                        <h4 className="font-semibold mb-1">{notif.title}</h4>
                        <p className="text-gray-700 mb-2">{notif.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
                    <p className="text-gray-600">You're all caught up!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
