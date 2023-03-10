import React, { createContext, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface IAuthContext {
  currentUser: AuthUser | null;
  login: any;
  logout: any;
}

export const AuthContext = createContext<IAuthContext>({
  currentUser: null,
  login: () => {},
  logout: () => {},
});

const AuthProvider = ({ children }: any) => {
  const [currentUser, setCurrentUser] = useLocalStorage('user', null);
  const navigate = useNavigate();

  const login = useCallback(
    async (data: AuthUser) => {
      setCurrentUser(data);
      navigate('/home');
    },
    [navigate, setCurrentUser]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    navigate('/', { replace: true });
  }, [navigate, setCurrentUser]);

  const value = useMemo(
    () => ({
      currentUser,
      login,
      logout,
    }),
    [currentUser, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
