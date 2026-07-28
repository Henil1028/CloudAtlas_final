import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile, verifyRegistrationUser, resendRegistrationOtp } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cloudatlas_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('console-theme') || 'neon-noir-theme');

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('console-theme', newTheme);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
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
  };  const register = async (name, email, phoneNumber, password, confirmPassword, secretCode) => {
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
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
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
      await resendRegistrationOtp(email);
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
