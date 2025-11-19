import api from './api';

export const authService = {
  login: async (correo: string, password: string) => {
    const url = (api.defaults.baseURL || '') + '/auth/login';
    const payload = { correo, contrasena: password };
    try {
      console.debug('AuthService - POST', url, payload);
      const response = await api.post('/auth/login', payload);
      console.debug('AuthService - response', response.status, response.data);
      return response.data;
    } catch (error: any) {
      console.error('AuthService - login error:', error?.response?.status, error?.response?.data);
      throw error;
    }
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  requestPasswordReset: async (correo: string) => {
    const response = await api.post('/auth/request-password-reset', { correo });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};
