import axios from 'axios';


// src/types/claim.ts

export interface Claim {
  _id: string;
  Title: string;
  Amount: number;
  status: number;
  Claim_Creation_Date: string;
  Claim_Date: string;
  Type: number;                    // R_NO from database (1, 2, 3, 4...)
  TypeDescription: string;         // Human-readable type (Cab, Food, Stay...)
  StatusDescription: string;       // Human-readable status
  Description?: string;
  userID: string;
  tenantID?: string;
  
  // Receipt fields (optional, only present if claim has receipt)
  HasReceipt?: boolean;
  ReceiptFileName?: string;
  ReceiptMimeType?: string;
  ReceiptSize?: number;
  ReceiptUploadedAt?: string;
}

export interface ClaimType {
  R_NO: number;
  T_Desc: string;
}

export interface LocalData {
  TenantID: number;
  UserID: number;
  Roles: string;
  FirstName: string;
  LastName: string;
}

const API_BASE_URL = 'http://localhost:5050';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const userData = sessionStorage.getItem('userData');
  if (userData) {
    const { Token } = JSON.parse(userData);
    if (Token) {
      config.headers.Authorization = `Bearer ${Token}`;
    }
  }
  return config;
});

export const claimsApi = {
  // Get claims with role-based filtering
  getClaimsByRole: async (userId: string, role: string, tenantId?: string) => {
    const params: any = { userId, role };
    if (tenantId) params.tenantId = tenantId;
    
    const response = await apiClient.get('/claims', { params });
    return response.data;
  },

  // Get claims for approval (for Claims page - Approvers/Admins)
  getClaimsForApproval: async (userId: string, role: string, tenantId?: string) => {
    const params: any = { userId, role };
    if (tenantId) params.tenantId = tenantId;
    
    const response = await apiClient.get('/claims/for-approval', { params });
    return response.data;
  },

  // Get all claims (admin only - no filtering)
  getAllClaims: async () => {
    const response = await apiClient.get('/claims');
    return response.data;
  },

  // Get claim by ID
  getClaimById: async (id: string) => {
    const response = await apiClient.get(`/claims/${id}`);
    return response.data;
  },

  // Create new claim
  createClaim: async (claimData: any) => {
    const response = await apiClient.post('/claims', claimData);
    return response.data;
  },

  // ✅ FIXED: Update claim - send JSON, not FormData
  updateClaim: async (claimId: string, claimData: any) => {
    const response = await apiClient.patch(`/claims/${claimId}`, claimData);
    return response.data;
  },

  // Update claim status (approve/reject)
  updateClaimStatus: async (id: string, status: number) => {
    console.log(`Updating claim ${id} status to ${status}`);
    const response = await apiClient.patch(`/claims/${id}/status`, { status });
    return response.data;
  },

  approveClaimByRole: async (id: string, userRole: string, userId: string) => {
    console.log(`Approving claim ${id} as ${userRole}`);
    const response = await apiClient.patch(`/claims/${id}/status`, { 
      status: "approve",
      userRole,
      userId
    });
    return response.data;
  },

  rejectClaimByRole: async (id: string, userRole: string, userId: string) => {
    console.log(`Rejecting claim ${id} as ${userRole}`);
    const response = await apiClient.patch(`/claims/${id}/status`, { 
      status: "reject",
      userRole,
      userId
    });
    return response.data;
  },

  // Delete claim
  deleteClaim: async (id: string) => {
    const response = await apiClient.delete(`/claims/${id}`);
    return response.data;
  },

  // Get dimension data
  getClaimStatuses: async () => {
    const response = await apiClient.get('/dimensions/claim-status');
    return response.data;
  },

  // ✅ Get claim types from database
  getClaimTypes: async () => {
    const response = await apiClient.get('/dimensions/claim-types');
    return response.data;
  },

  // Get receipt for a claim
  getClaimReceipt: async (claimId: string) => {
    const response = await apiClient.get(`/claims/${claimId}/receipt`);
    return response.data;
  },

  // Download receipt as file
  downloadClaimReceipt: async (claimId: string) => {
    const response = await apiClient.get(`/claims/${claimId}/receipt/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

    // Get analytics for user dashboard
  getUserAnalytics: async (userId: string, tenantId?: string) => {
    const params = tenantId ? { tenantId } : {};
    const response = await apiClient.get(`/analytics/user/${userId}`, { params });
    return response.data;
  }
};

export default apiClient;