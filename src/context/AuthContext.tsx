import React, { createContext, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export interface ICurrentUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface IAuthContext {
  currentUser?: ICurrentUser;
  login: (user: ICurrentUser) => void;
  logout: () => void;
  setUserAttr: (attr: string, value: any) => void;
}

export const AuthContext = createContext<IAuthContext>({
  currentUser: undefined,
  login: () => {},
  logout: () => {},
  setUserAttr: () => {},
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

  const setUserAttr = useCallback(
    (attr: string, value: any) => {
      setCurrentUser((curUser: ICurrentUser) => ({
        ...curUser,
        [attr]: value,
      }));
    },
    [setCurrentUser]
  );

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, setUserAttr }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
