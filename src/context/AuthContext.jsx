import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedData = localStorage.getItem('employeeLogin');
    return storedData ? JSON.parse(storedData) : null;
  });

  const login = (userData) => {
    setAuth(userData);
    localStorage.setItem('employeeLogin', JSON.stringify(userData));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('employeeLogin');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
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
