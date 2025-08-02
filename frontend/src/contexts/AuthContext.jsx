import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลจาก localStorage ตอน mount (หน้า reload/เปิด tab ใหม่)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.user && parsed.token) {
          setUser(parsed.user);
          setToken(parsed.token);
        } else {
          localStorage.removeItem('user'); // ล้างข้อมูลถ้าไม่ถูกต้อง
        }
      }
    } catch (error) {
      console.error('Failed to parse user from storage', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // ฟังก์ชัน Login (รับ email, password)
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      // data ต้องมีรูปแบบ { user: {...}, token: '...' }
      if (data && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data)); // เก็บคู่กัน user + token
      } else {
        throw new Error('Invalid login response');
      }
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  // ฟังก์ชัน Register (สร้าง user ใหม่) และ Auto login ต่อ
  const register = useCallback(async (username, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register({ username, email, password });
      // หลัง register สำเร็จ ล็อกอินอัตโนมัติ
      if (data) {
        // เรียก login อีกครั้ง หรือถ้า register คืน token/user มาเลยก็เซ็ตเลย
        await login(email, password);
      }
      return data;
    } finally {
      setLoading(false);
    }
  }, [login]);

  // ฟังก์ชัน Logout
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
