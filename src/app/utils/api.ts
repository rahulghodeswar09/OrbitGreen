import { supabase, API_BASE } from '@/lib/supabase';

// ─── Generic fetch helper ───────────────────────────────────────────────────
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

// ─── Re-export supabase client ──────────────────────────────────────────────
export { supabase };

// ─── Auth API ───────────────────────────────────────────────────────────────
export const authAPI = {
  async signup(
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string
  ) {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone, address }),
    });
  },

  async adminSignup(
    email: string,
    password: string,
    name: string,
    adminKey: string
  ) {
    return apiCall('/auth/admin-signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, adminKey }),
    });
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getProfile(accessToken: string) {
    return apiCall('/auth/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async updateProfile(
    accessToken: string,
    data: { name?: string; phone?: string; address?: string }
  ) {
    return apiCall('/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
  },
};

// ─── Customer API (Admin only) ───────────────────────────────────────────────
export const customerAPI = {
  async getAll(accessToken: string) {
    return apiCall('/admin/customers', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async delete(accessToken: string, customerId: string) {
    return apiCall(`/admin/customers/${customerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};

// ─── Installation API ────────────────────────────────────────────────────────
export const installationAPI = {
  async get(accessToken: string) {
    return apiCall('/installation', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async create(accessToken: string, customerId: string, data: Record<string, unknown>) {
    return apiCall(`/admin/installation/${customerId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
  },
};

// ─── Complaints API ──────────────────────────────────────────────────────────
export const complaintsAPI = {
  async create(
    accessToken: string,
    data: { title: string; description: string; category?: string }
  ) {
    return apiCall('/complaints', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(data),
    });
  },

  async getUserComplaints(accessToken: string) {
    return apiCall('/complaints', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async getAllComplaints(accessToken: string) {
    return apiCall('/admin/complaints', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async updateStatus(
    accessToken: string,
    complaintId: string,
    status: string,
    adminNotes?: string
  ) {
    return apiCall(`/admin/complaints/${complaintId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ status, adminNotes }),
    });
  },
};

// ─── Documents API ───────────────────────────────────────────────────────────
export const documentsAPI = {
  async save(
    accessToken: string,
    type: string,
    name: string,
    url: string,
    userId?: string
  ) {
    return apiCall('/documents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ type, name, url, userId }),
    });
  },

  async get(accessToken: string, userId?: string) {
    const endpoint = userId ? `/documents/${userId}` : '/documents';
    return apiCall(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};

// ─── Notifications API ───────────────────────────────────────────────────────
export const notificationsAPI = {
  async get(accessToken: string) {
    return apiCall('/notifications', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  async send(
    accessToken: string,
    title: string,
    message: string,
    userId?: string
  ) {
    return apiCall('/admin/notifications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ title, message, userId }),
    });
  },
};

// ─── Analytics API ───────────────────────────────────────────────────────────
export const analyticsAPI = {
  async get(accessToken: string) {
    return apiCall('/admin/analytics', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};

// ─── Public API (no auth) ────────────────────────────────────────────────────
export const publicAPI = {
  async getPlans() {
    return apiCall('/plans');
  },

  async getTestimonials() {
    return apiCall('/testimonials');
  },

  async updatePlans(accessToken: string, plans: unknown[]) {
    return apiCall('/admin/plans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ plans }),
    });
  },
};