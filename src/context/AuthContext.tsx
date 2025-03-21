
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Mock faculty data (would come from backend in real implementation)
const FACULTY_CREDENTIALS = [
  { username: 'faculty1', password: 'password1', name: 'Dr. Aishwarya Sharma' },
  { username: 'faculty2', password: 'password2', name: 'Prof. Rajat Verma' },
  { username: 'faculty3', password: 'password3', name: 'Dr. Neeraj Singh' },
  { username: 'faculty4', password: 'password4', name: 'Prof. Sunita Kumari' },
];

type User = {
  username: string;
  name: string;
};

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing session on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call with 500ms delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const faculty = FACULTY_CREDENTIALS.find(
          (f) => f.username === username && f.password === password
        );

        if (faculty) {
          const userData = { username: faculty.username, name: faculty.name };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          toast.success(`Welcome back, ${faculty.name}`);
          resolve(true);
        } else {
          toast.error('Invalid username or password');
          resolve(false);
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
