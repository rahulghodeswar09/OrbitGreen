import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-b3c655af/health", (c) => {
  return c.json({ status: "ok" });
});

// =====================================================
// AUTHENTICATION ENDPOINTS
// =====================================================

// Customer Signup
app.post("/make-server-b3c655af/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, phone, address } = body;

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone, address, role: 'customer' },
      email_confirm: true, // Auto-confirm since email server isn't configured
    });

    if (authError) {
      console.log(`Signup error for ${email}: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    // Store user profile in KV store
    const userId = authData.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      phone: phone || '',
      address: address || '',
      role: 'customer',
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      message: "Customer registered successfully",
      userId: userId
    });
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Admin Signup (protected - could require admin key)
app.post("/make-server-b3c655af/auth/admin-signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, adminKey } = body;

    // Simple admin key validation (in production, use better security)
    if (adminKey !== "ADMIN_SECRET_2025") {
      return c.json({ error: "Invalid admin key" }, 403);
    }

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'admin' },
      email_confirm: true,
    });

    if (authError) {
      console.log(`Admin signup error: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    // Store admin profile
    const userId = authData.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      message: "Admin registered successfully",
      userId: userId
    });
  } catch (error) {
    console.log(`Server error during admin signup: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get User Profile (requires auth)
app.get("/make-server-b3c655af/auth/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log(`Auth error getting profile: ${error?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user profile from KV store
    const profile = await kv.get(`user:${user.id}`);
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log(`Server error getting profile: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update User Profile
app.put("/make-server-b3c655af/auth/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { name, phone, address } = body;

    // Get existing profile
    const existingProfile = await kv.get(`user:${user.id}`);
    if (!existingProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    // Update profile
    const updatedProfile = {
      ...existingProfile,
      name: name || existingProfile.name,
      phone: phone || existingProfile.phone,
      address: address || existingProfile.address,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    console.log(`Error updating profile: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// =====================================================
// CUSTOMER MANAGEMENT (Admin only)
// =====================================================

// Get all customers
app.get("/make-server-b3c655af/admin/customers", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    // Get all users with 'user:' prefix
    const allUsers = await kv.getByPrefix('user:');
    const customers = allUsers.filter((u: any) => u.role === 'customer');

    return c.json({ customers });
  } catch (error) {
    console.log(`Error fetching customers: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete customer (Admin only)
app.delete("/make-server-b3c655af/admin/customers/:customerId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const customerId = c.req.param('customerId');
    
    // Delete user profile
    await kv.del(`user:${customerId}`);
    // Delete installation data
    await kv.del(`installation:${customerId}`);
    // Delete documents
    await kv.del(`documents:${customerId}`);

    // Delete user from Supabase auth
    await supabase.auth.admin.deleteUser(customerId);

    return c.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.log(`Error deleting customer: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// =====================================================
// INSTALLATION MANAGEMENT
// =====================================================

// Get installation details for current user
app.get("/make-server-b3c655af/installation", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const installation = await kv.get(`installation:${user.id}`);
    
    return c.json({ installation: installation || null });
  } catch (error) {
    console.log(`Error fetching installation: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create/Update installation (Admin only)
app.post("/make-server-b3c655af/admin/installation/:customerId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const customerId = c.req.param('customerId');
    const body = await c.req.json();

    const installationData = {
      customerId,
      capacity: body.capacity,
      installationDate: body.installationDate,
      location: body.location,
      panelBrand: body.panelBrand,
      inverterBrand: body.inverterBrand,
      warrantyPeriod: body.warrantyPeriod,
      status: body.status || 'Installed',
      subsidyAmount: body.subsidyAmount || 0,
      totalCost: body.totalCost || 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`installation:${customerId}`, installationData);

    return c.json({ message: "Installation data saved", installation: installationData });
  } catch (error) {
    console.log(`Error saving installation: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// =====================================================
// COMPLAINTS & SUPPORT
// =====================================================

// Create complaint/ticket
app.post("/make-server-b3c655af/complaints", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const complaintId = `complaint:${Date.now()}:${user.id}`;

    const complaint = {
      id: complaintId,
      userId: user.id,
      title: body.title,
      description: body.description,
      category: body.category || 'General',
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(complaintId, complaint);

    return c.json({ message: "Complaint submitted", complaint });
  } catch (error) {
    console.log(`Error creating complaint: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user's complaints
app.get("/make-server-b3c655af/complaints", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allComplaints = await kv.getByPrefix('complaint:');
    const userComplaints = allComplaints.filter((c: any) => c.userId === user.id);

    return c.json({ complaints: userComplaints });
  } catch (error) {
    console.log(`Error fetching complaints: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get all complaints (Admin only)
app.get("/make-server-b3c655af/admin/complaints", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const allComplaints = await kv.getByPrefix('complaint:');

    return c.json({ complaints: allComplaints });
  } catch (error) {
    console.log(`Error fetching complaints: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update complaint status (Admin only)
app.put("/make-server-b3c655af/admin/complaints/:complaintId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const complaintId = c.req.param('complaintId');
    const body = await c.req.json();

    const complaint = await kv.get(complaintId);
    if (!complaint) {
      return c.json({ error: "Complaint not found" }, 404);
    }

    const updatedComplaint = {
      ...complaint,
      status: body.status || complaint.status,
      adminNotes: body.adminNotes || complaint.adminNotes,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(complaintId, updatedComplaint);

    return c.json({ message: "Complaint updated", complaint: updatedComplaint });
  } catch (error) {
    console.log(`Error updating complaint: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// =====================================================
// DOCUMENTS
// =====================================================

// Save document info
app.post("/make-server-b3c655af/documents", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const userId = body.userId || user.id;

    // Get existing documents
    const existingDocs = await kv.get(`documents:${userId}`) || {};

    const documents = {
      ...existingDocs,
      [body.type]: {
        name: body.name,
        url: body.url,
        uploadedAt: new Date().toISOString(),
      }
    };

    await kv.set(`documents:${userId}`, documents);

    return c.json({ message: "Document saved", documents });
  } catch (error) {
    console.log(`Error saving document: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get documents
app.get("/make-server-b3c655af/documents/:userId?", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = c.req.param('userId') || user.id;
    const documents = await kv.get(`documents:${userId}`) || {};

    return c.json({ documents });
  } catch (error) {
    console.log(`Error fetching documents: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// =====================================================
// NOTIFICATIONS
// =====================================================

// Send notification (Admin only)
app.post("/make-server-b3c655af/admin/notifications", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const body = await c.req.json();
    const notificationId = `notification:${Date.now()}`;

    const notification = {
      id: notificationId,
      userId: body.userId || 'all',
      title: body.title,
      message: body.message,
      createdAt: new Date().toISOString(),
      read: false,
    };

    if (body.userId) {
      // Single user notification
      const userNotifs = await kv.get(`notifications:${body.userId}`) || [];
      userNotifs.push(notification);
      await kv.set(`notifications:${body.userId}`, userNotifs);
    } else {
      // Broadcast to all customers
      const allUsers = await kv.getByPrefix('user:');
      const customers = allUsers.filter((u: any) => u.role === 'customer');
      
      for (const customer of customers) {
        const userNotifs = await kv.get(`notifications:${customer.id}`) || [];
        userNotifs.push({ ...notification, userId: customer.id });
        await kv.set(`notifications:${customer.id}`, userNotifs);
      }
    }

    return c.json({ message: "Notification sent", notification });
  } catch (error) {
    console.log(`Error sending notification: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user notifications
app.get("/make-server-b3c655af/notifications", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const notifications = await kv.get(`notifications:${user.id}`) || [];

    return c.json({ notifications });
  } catch (error) {
    console.log(`Error fetching notifications: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// =====================================================
// ADMIN ANALYTICS
// =====================================================

app.get("/make-server-b3c655af/admin/analytics", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const allUsers = await kv.getByPrefix('user:');
    const customers = allUsers.filter((u: any) => u.role === 'customer');
    
    const allComplaints = await kv.getByPrefix('complaint:');
    const openComplaints = allComplaints.filter((c: any) => c.status === 'Open');
    
    const allInstallations = await kv.getByPrefix('installation:');
    const activeInstallations = allInstallations.filter((i: any) => i.status === 'Installed');

    return c.json({
      analytics: {
        totalCustomers: customers.length,
        activeInstallations: activeInstallations.length,
        pendingComplaints: openComplaints.length,
        totalComplaints: allComplaints.length,
      }
    });
  } catch (error) {
    console.log(`Error fetching analytics: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// =====================================================
// SOLAR PLANS & TESTIMONIALS (Public data)
// =====================================================

// Get solar plans
app.get("/make-server-b3c655af/plans", async (c) => {
  try {
    const plans = await kv.get('solar:plans') || [];
    return c.json({ plans });
  } catch (error) {
    console.log(`Error fetching plans: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update solar plans (Admin only)
app.post("/make-server-b3c655af/admin/plans", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const adminProfile = await kv.get(`user:${user.id}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: "Admin access required" }, 403);
    }

    const body = await c.req.json();
    await kv.set('solar:plans', body.plans);

    return c.json({ message: "Plans updated", plans: body.plans });
  } catch (error) {
    console.log(`Error updating plans: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get testimonials
app.get("/make-server-b3c655af/testimonials", async (c) => {
  try {
    const testimonials = await kv.get('solar:testimonials') || [];
    return c.json({ testimonials });
  } catch (error) {
    console.log(`Error fetching testimonials: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);