import api from './api';

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (name, email, phoneNumber, password, confirmPassword, secretCode) => {
  const response = await api.post('/auth/register', { name, email, phoneNumber, password, confirmPassword, secretCode });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const verifyOtp = async (email, otp, newPassword) => {
  const response = await api.post('/auth/verify-otp', { email, otp, newPassword });
  return response.data;
};

export const verifyOtpOnly = async (email, otp) => {
  const response = await api.post('/auth/verify-otp-only', { email, otp });
  return response.data;
};

export const verifyRegistrationUser = async (email, otp) => {
  const response = await api.post('/auth/verify-registration', { email, otp });
  return response.data;
};

export const resendRegistrationOtp = async (email) => {
  const response = await api.post('/auth/resend-registration-otp', { email });
  return response.data;
};
