import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra authentication khi component mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // Nếu không lấy được user data, xóa token
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check error:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // Gọi API login để lấy token
      const token = await authService.login(username, password);
      
      // Lấy thông tin user từ token
      const userData = await authService.getCurrentUser();
      if (!userData) {
        throw new Error('Không thể lấy thông tin người dùng');
      }
      
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      // Đảm bảo xóa token nếu có lỗi
      localStorage.removeItem('token');
      throw error;
    }
  };

  const logout = () => {
    // Xóa token và user data
    authService.logout();
    // Reset user state
    setUser(null);
    // Chuyển hướng về trang login
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 