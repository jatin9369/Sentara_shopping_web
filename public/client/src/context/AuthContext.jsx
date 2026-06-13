import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user session on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('sentara_token');
      if (token) {
        try {
          const data = await api.auth.getMe();
          if (data.success) {
            setUser(data.user);
          } else {
            localStorage.removeItem('sentara_token');
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
          localStorage.removeItem('sentara_token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.auth.login(email, password);
      if (data.success) {
        localStorage.setItem('sentara_token', data.token);
        setUser(data.user);
        return data;
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, address, password) => {
    setError(null);
    try {
      const data = await api.auth.register(name, email, address, password);
      if (data.success) {
        localStorage.setItem('sentara_token', data.token);
        setUser(data.user);
        return data;
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const loginWithOtp = async (mobile, otp) => {
    setError(null);
    try {
      const data = await api.auth.verifyOtp(mobile, otp);
      if (data.success) {
        localStorage.setItem('sentara_token', data.token);
        setUser(data.user);
        return data;
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
      throw err;
    }
  };

  const requestOtp = async (mobile, name) => {
    setError(null);
    try {
      return await api.auth.sendOtp(mobile, name);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
      throw err;
    }
  };

  const updateProfile = async (name, email) => {
    setError(null);
    try {
      const data = await api.user.updateProfile(name, email);
      if (data.success) {
        if (data.token) {
          localStorage.setItem('sentara_token', data.token);
        }
        setUser(data.user);
        return data;
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('sentara_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        login,
        register,
        loginWithOtp,
        requestOtp,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
