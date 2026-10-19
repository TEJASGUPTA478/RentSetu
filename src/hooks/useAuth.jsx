import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Read persisted user from localStorage
function readPersistedUser() {
  try {
    const raw = localStorage.getItem('rentsetu_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => readPersistedUser());

  const login = useCallback((user, remember) => {
    setCurrentUser(user);
    if (remember) {
      localStorage.setItem('rentsetu_user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('rentsetu_user', JSON.stringify(user));
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('rentsetu_user');
    sessionStorage.removeItem('rentsetu_user');
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
