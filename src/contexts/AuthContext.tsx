import { authService } from '@/services/authService';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  nombre: string;
  correo: string;
  id_rol: number;
  rol?: string;
  id_semillero?: number;
  semillero?: {
    id: number;
    nombre: string;
  };
  permisos?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleId: number) => boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData.user || userData);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (correo: string, password: string) => {
    try {
      const response = await authService.login(correo, password);
      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Redirigir según el rol
      if (userData.id_rol === 1) {
        navigate('/dashboard');
      } else if (userData.id_rol === 2) {
        navigate('/dashboard');
      } else if (userData.id_rol === 3) {
        navigate('/admin-campo/mi-campo');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.id_rol === 1) return true; // Super Admin tiene todos los permisos
    return user.permisos?.includes(permission) || false;
  };

  const hasRole = (roleId: number): boolean => {
    return user?.id_rol === roleId;
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasPermission,
        hasRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
