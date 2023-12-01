import { useState, useEffect, createContext } from 'react';
import netlifyIdentity, { type User } from 'netlify-identity-widget';

declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

interface NetlifyAuth {
  isAuthenticated: boolean;
  user: User | null;
  initialize(callback: (user: User | null) => void): void;
  authenticate(callback: (user: User) => void): void;
  signout(callback: () => void): void;
}

const netlifyAuth: NetlifyAuth = {
  isAuthenticated: false,
  user: null,
  initialize(callback) {
    window.netlifyIdentity = netlifyIdentity;
    netlifyIdentity.on('init', (user: User | null) => {
      callback(user);
    });
    netlifyIdentity.init();
  },
  authenticate(callback) {
    this.isAuthenticated = true;
    netlifyIdentity.open();
    netlifyIdentity.on('login', (user) => {
      this.user = user;
      callback(user);
      netlifyIdentity.close();
    });
  },
  signout(callback) {
    this.isAuthenticated = false;
    netlifyIdentity.logout();
    netlifyIdentity.on('logout', () => {
      this.user = null;
      callback();
    });
  },
};

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  loading: boolean;
  deleteAccount?: () => void;
}
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: false,
  deleteAccount: () => {},
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(
    netlifyAuth.isAuthenticated
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = () => {
    netlifyAuth.authenticate((user) => {
      setLoggedIn(!!user);
      setUser(user);
    });
  };

  const logout = () => {
    netlifyAuth.signout(() => {
      setLoggedIn(false);
      setUser(null);
    });
  };

  const deleteAccount = () => {
    if (
      window.confirm(
        'Are you sure? This will delete the issues you created and your account. Note: do not worry, this will not delete your Netlify account.'
      )
    ) {
      fetch('/.netlify/functions/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token?.access_token}`,
        },
      })
        .then(async () => logout())
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    netlifyAuth.initialize((user: User | null) => {
      setUser(user);
      setLoggedIn(!!user);
    });
    setLoading(false);
  }, [loggedIn]);

  const contextValues = { user, login, logout, loading, deleteAccount };

  return (
    <AuthContext.Provider value={contextValues}>
      {children}
    </AuthContext.Provider>
  );
};
