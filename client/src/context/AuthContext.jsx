import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile, verifyRegistrationUser, resendRegistrationOtp } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cloudatlas_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('cloudatlas_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('console-theme') || 'neon-noir-theme');

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('console-theme', newTheme);
  };

  const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  // Helper to establish 2-hour session expiration timestamp
  const recordSessionStart = () => {
    const expiresAt = Date.now() + TWO_HOURS_MS;
    localStorage.setItem('cloudatlas_login_expires', expiresAt.toString());
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        // If token exists but no expiry recorded, record 2 hours from now
        if (!localStorage.getItem('cloudatlas_login_expires')) {
          recordSessionStart();
        }
        try {
          const profile = await getProfile();
          setUser(profile);
          localStorage.setItem('cloudatlas_user', JSON.stringify(profile));
        } catch (err) {
          console.error('Failed to initialize user session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Automatic 2-hour session expiration monitoring timer
  useEffect(() => {
    const checkSessionExpiration = () => {
      const savedToken = localStorage.getItem('cloudatlas_token');
      const expiresAtStr = localStorage.getItem('cloudatlas_login_expires');

      if (savedToken && expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr, 10);
        if (!isNaN(expiresAt) && Date.now() >= expiresAt) {
          console.warn('⏰ 2-Hour User Session Expired. Automatically logging out user...');
          logout();
          const currentPath = window.location.pathname;
          const targetLogin = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
          window.location.href = `${targetLogin}?expired=true`;
        }
      }
    };

    // Run check on mount
    checkSessionExpiration();

    // Monitor session expiry every 5 seconds
    const intervalId = setInterval(checkSessionExpiration, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('cloudatlas_token', data.token);
      localStorage.setItem('cloudatlas_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      }));
      recordSessionStart();
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, phoneNumber, password, confirmPassword, secretCode) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(name, email, phoneNumber, password, confirmPassword, secretCode);
      if (data.status === 'pending_verification') {
        return data;
      }
      localStorage.setItem('cloudatlas_token', data.token);
      localStorage.setItem('cloudatlas_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role,
      }));
      recordSessionStart();
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role,
      });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyRegistration = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const data = await verifyRegistrationUser(email, otp);
      localStorage.setItem('cloudatlas_token', data.token);
      localStorage.setItem('cloudatlas_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role,
      }));
      recordSessionStart();
      setToken(data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role,
      });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resendRegistration = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const data = await resendRegistrationOtp(email);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend code.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = (navigateFn) => {
    localStorage.removeItem('cloudatlas_token');
    localStorage.removeItem('cloudatlas_user');
    localStorage.removeItem('cloudatlas_login_expires');
    setToken(null);
    setUser(null);
    setError(null);
    if (navigateFn) navigateFn('/', { replace: true });
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        verifyRegistration,
        resendRegistration,
        logout,
        setError,
        theme,
        updateTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
