import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole, AuthState } from "../types";
import { authAPI } from "../lib/api";

interface AuthContextType extends AuthState {
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (userId && !user.id) {
          user.id = userId;
        }
        setState({
          user,
          token,
          loading: false,
          error: null,
        });
      } catch {
        setState({ user: null, token: null, loading: false, error: null });
      }
    } else {
      setState({ user: null, token: null, loading: false, error: null });
    }
  }, []);

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await authAPI.register({ firstName, lastName, email, password });

      if (response.id) {
        localStorage.setItem("userId", response.id);
      }

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Register failed";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await authAPI.login({ email, password });

      const user: User = {
        id: response.id,
        firstName: response.fullName?.split(" ")[0] || "",
        lastName: response.fullName?.split(" ")[1] || "",
        email: response.email,
        role: response.role as UserRole,
      };

      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userId", response.id);
      localStorage.setItem("user", JSON.stringify(user));

      setState({
        user,
        token: response.token,
        loading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    setState({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
