import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { meRequest, refreshRequest, logoutRequest } from '../services/auth.service';
import type { Me } from '../schemas';

interface AuthContextValue {
  user: Me | null;
  isLoading: boolean;
  setUser: (user: Me | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserRaw] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((nextUser: Me | null) => {
    setUserRaw(nextUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        await refreshRequest();
        const me = await meRequest();
        setUser(me);
      } catch {
        setUser(null);
      }
    }
    bootstrap();
  }, [setUser]);

  async function logout() {
    await logoutRequest();
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
