/**
 * Authentication Context
 * Manages user authentication state across the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { useWeb3 } from './Web3Context';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { account, signMessage } = useWeb3();

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const result = await apiService.getProfile();
        if (result.success) {
          setUser(result.data.user);
        } else {
          // Token invalid, clear it
          apiService.logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  /**
   * Register with email/password
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.register(userData);
      if (result.success) {
        setUser(result.data.user);
        return { success: true };
      }
      setError(result.error);
      return { success: false, error: result.error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with email/password
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.login({ email, password });
      if (result.success) {
        setUser(result.data.user);
        return { success: true };
      }
      setError(result.error);
      return { success: false, error: result.error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with wallet (MetaMask)
   */
  const loginWithWallet = useCallback(async () => {
    if (!account) {
      return { success: false, error: 'Please connect your wallet first' };
    }

    setLoading(true);
    setError(null);
    try {
      // Get nonce from server
      const nonceResult = await apiService.getNonce(account);
      if (!nonceResult.success) {
        throw new Error(nonceResult.error || 'Failed to get nonce');
      }

      const { nonce } = nonceResult.data;
      const message = `Sign this message to authenticate with AccredChain.\n\nNonce: ${nonce}`;

      // Sign message with wallet
      const signature = await signMessage(message);
      if (!signature) {
        throw new Error('Failed to sign message');
      }

      // Verify signature on server
      const result = await apiService.verifyWallet(account, signature);
      if (result.success) {
        setUser(result.data.user);
        return { success: true };
      }
      throw new Error(result.error || 'Verification failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [account, signMessage]);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    apiService.logout();
    setUser(null);
    setError(null);
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = async (updates) => {
    // This would call an update profile API endpoint
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    loginWithWallet,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
