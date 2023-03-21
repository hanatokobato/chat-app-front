import React, { createContext, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export interface ICurrentUser {
  id: string;
  name: string;
  email: string;
}

interface IAuthContext {
  currentUser?: ICurrentUser;
  login: (user: ICurrentUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<IAuthContext>({
  currentUser: undefined,
  login: () => {},
  logout: () => {},
});

const AuthProvider = ({ children }: any) => {
  const [currentUser, setCurrentUser] = useLocalStorage('user', undefined);

  const login = useCallback(
    (user: ICurrentUser) => {
      setCurrentUser(user);
    },
    [setCurrentUser]
  );

  const logout = useCallback(() => {
    setCurrentUser(undefined);
  }, [setCurrentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
