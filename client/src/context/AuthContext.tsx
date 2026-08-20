import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  studentProfile: Student | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  setStudentProfile: (profile: Student | null) => void;
  updateStudentProfile: (profile: Student) => void;
  isAdmin: boolean;
  isStudent: boolean;
  isProfileCompleted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('adexa_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('adexa_token');
  });
  const [studentProfile, setStudentProfile] = useState<Student | null>(() => {
    const savedStudent = localStorage.getItem('adexa_student');
    if (savedStudent) {
      try {
        return JSON.parse(savedStudent);
      } catch {
        // ignore
      }
    }
    const savedUser = localStorage.getItem('adexa_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        return u.studentProfile || null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSession = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        if (res.user.studentProfile) {
          setStudentProfile(res.user.studentProfile);
          localStorage.setItem('adexa_student', JSON.stringify(res.user.studentProfile));
        }
        localStorage.setItem('adexa_user', JSON.stringify(res.user));
      }
    } catch (error) {
      console.warn('Session verification failed, logging out.');
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [token]);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        if (res.user.studentProfile) {
          setStudentProfile(res.user.studentProfile);
          localStorage.setItem('adexa_student', JSON.stringify(res.user.studentProfile));
        } else {
          setStudentProfile(null);
          localStorage.removeItem('adexa_student');
        }
        localStorage.setItem('adexa_token', res.token);
        localStorage.setItem('adexa_user', JSON.stringify(res.user));
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(userData);
      if (res.success) {
        setToken(res.token);
        setUser(res.user);
        if (res.user.studentProfile) {
          setStudentProfile(res.user.studentProfile);
          localStorage.setItem('adexa_student', JSON.stringify(res.user.studentProfile));
        } else {
          setStudentProfile(null);
          localStorage.removeItem('adexa_student');
        }
        localStorage.setItem('adexa_token', res.token);
        localStorage.setItem('adexa_user', JSON.stringify(res.user));
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setStudentProfile(null);
    setToken(null);
    localStorage.removeItem('adexa_token');
    localStorage.removeItem('adexa_user');
    localStorage.removeItem('adexa_student');
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updatedUser };
      setUser(merged as User);
      localStorage.setItem('adexa_user', JSON.stringify(merged));
    }
  };

  const updateStudentProfile = (profile: Student) => {
    setStudentProfile(profile);
    localStorage.setItem('adexa_student', JSON.stringify(profile));
    if (user) {
      const updatedUser = {
        ...user,
        isProfileCompleted: profile.isProfileCompleted,
        studentProfile: profile,
      };
      setUser(updatedUser);
      localStorage.setItem('adexa_user', JSON.stringify(updatedUser));
    }
  };

  const isProfileCompleted = Boolean(studentProfile?.isProfileCompleted || user?.isProfileCompleted);

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        setStudentProfile,
        updateStudentProfile,
        isAdmin: user?.role === 'ADMIN',
        isStudent: user?.role === 'STUDENT',
        isProfileCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
