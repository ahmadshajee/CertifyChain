/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

import { API_CONFIG } from '../config';

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('token');
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  /**
   * Get headers for requests
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Generic request handler
   */
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config = {
        headers: this.getHeaders(options.includeAuth !== false),
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * Register new user
   */
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    });
  }

  /**
   * Login user
   */
  async login(credentials) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      includeAuth: false,
    });
    if (result.success && result.data.token) {
      this.setToken(result.data.token);
    }
    return result;
  }

  /**
   * Get nonce for wallet authentication
   */
  async getNonce(walletAddress) {
    return this.request(`/auth/nonce/${walletAddress}`, {
      method: 'GET',
      includeAuth: false,
    });
  }

  /**
   * Verify wallet signature
   */
  async verifyWallet(walletAddress, signature) {
    const result = await this.request('/auth/wallet', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature }),
      includeAuth: false,
    });
    if (result.success && result.data.token) {
      this.setToken(result.data.token);
    }
    return result;
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return this.request('/auth/me');
  }

  /**
   * Logout user
   */
  logout() {
    this.setToken(null);
    localStorage.removeItem('user');
  }

  // ==================== INSTITUTION ENDPOINTS ====================

  /**
   * Register institution
   */
  async registerInstitution(institutionData) {
    return this.request('/institutions', {
      method: 'POST',
      body: JSON.stringify(institutionData),
    });
  }

  /**
   * Get all institutions
   */
  async getInstitutions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/institutions${params ? `?${params}` : ''}`);
  }

  /**
   * Get institution by ID
   */
  async getInstitution(id) {
    return this.request(`/institutions/${id}`);
  }

  /**
   * Update institution
   */
  async updateInstitution(id, updateData) {
    return this.request(`/institutions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Request verification for institution
   */
  async requestVerification(institutionId, documents) {
    return this.request(`/institutions/${institutionId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ documents }),
    });
  }

  /**
   * Approve institution verification (admin only)
   */
  async approveInstitution(institutionId) {
    return this.request(`/institutions/${institutionId}/approve`, {
      method: 'POST',
    });
  }

  /**
   * Reject institution verification (admin only)
   */
  async rejectInstitution(institutionId, reason) {
    return this.request(`/institutions/${institutionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ==================== CREDENTIAL ENDPOINTS ====================

  /**
   * Issue new credential
   */
  async issueCredential(credentialData) {
    return this.request('/credentials', {
      method: 'POST',
      body: JSON.stringify(credentialData),
    });
  }

  /**
   * Get all credentials (with filters)
   */
  async getCredentials(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/credentials${params ? `?${params}` : ''}`);
  }

  /**
   * Get credential by ID
   */
  async getCredential(id) {
    return this.request(`/credentials/${id}`);
  }

  /**
   * Get credentials by student address
   */
  async getStudentCredentials(walletAddress) {
    return this.request(`/credentials/student/${walletAddress}`);
  }

  /**
   * Get credentials issued by institution
   */
  async getInstitutionCredentials(institutionId) {
    return this.request(`/credentials/institution/${institutionId}`);
  }

  /**
   * Revoke credential
   */
  async revokeCredential(credentialId, reason) {
    return this.request(`/credentials/${credentialId}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ==================== VERIFICATION ENDPOINTS ====================

  /**
   * Verify credential (public endpoint)
   */
  async verifyCredential(credentialId) {
    return this.request(`/verification/verify/${credentialId}`, {
      method: 'GET',
      includeAuth: false,
    });
  }

  /**
   * Verify by IPFS hash
   */
  async verifyByHash(ipfsHash) {
    return this.request(`/verification/hash/${ipfsHash}`, {
      method: 'GET',
      includeAuth: false,
    });
  }

  /**
   * Batch verify credentials
   */
  async batchVerify(credentialIds) {
    return this.request('/verification/batch', {
      method: 'POST',
      body: JSON.stringify({ credentialIds }),
      includeAuth: false,
    });
  }

  /**
   * Get verification statistics
   */
  async getVerificationStats() {
    return this.request('/verification/stats');
  }

  /**
   * Log verification event
   */
  async logVerification(credentialId, verifierInfo) {
    return this.request('/verification/log', {
      method: 'POST',
      body: JSON.stringify({ credentialId, ...verifierInfo }),
      includeAuth: false,
    });
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
