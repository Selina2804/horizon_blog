import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";

const BASE_URL = import.meta.env.PROD 
  ? "https://693a3c10e8d59937aa0a30c1_mockapi.io/api"  // ĐÚNG (có dấu _)
  : "/api";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: "user" | "admin";
  password: string;
  favorites?: string[]; 
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (newUser: Omit<User, "id">) => Promise<boolean>;
  updateUser: (updated: Partial<User>) => Promise<void>;
  setUser: (u: User | null) => void; // ✅ THÊM
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // ✅ Load user từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem("loggedUser");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("loggedUser");
      }
    }
  }, []);

  // ✅ Login
  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    try {
      const res = await axios.get<User[]>(`${BASE_URL}/users`);

      const found = res.data.find(
        (u) => u.email === email && u.password === password
      );

      if (found) {
        const logged = { ...found };
        setUser(logged);
        localStorage.setItem("loggedUser", JSON.stringify(logged));
        return logged;
      }

      return null;
    } catch (err) {
      console.error("Login error:", err);
      return null;
    }
  };

  // ✅ Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("loggedUser");
  };

  // ✅ Register
  const register = async (newUser: Omit<User, "id">): Promise<boolean> => {
    try {
      const res = await axios.get<User[]>(`${BASE_URL}/users`);

      const exists = res.data.some((u) => u.email === newUser.email);
      if (exists) return false;

      // ✅ Tạo user mới có favorites: []
      const created = await axios.post<User>(`${BASE_URL}/users`, {
        ...newUser,
        favorites: [], // ✅ THÊM
      });

      const createdUser = { ...created.data };
      setUser(createdUser);
      localStorage.setItem("loggedUser", JSON.stringify(createdUser));

      return true;
    } catch (err) {
      console.error("Register error:", err);
      return false;
    }
  };

  // ✅ Update user
  const updateUser = async (updated: Partial<User>): Promise<void> => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updated };

      const res = await axios.put<User>(
        `${BASE_URL}/users/${user.id}`,
        updatedUser
      );

      const finalUser = { ...res.data };
      setUser(finalUser);
      localStorage.setItem("loggedUser", JSON.stringify(finalUser));
    } catch (err) {
      console.error("Update user error:", err);
      alert("Có lỗi khi cập nhật thông tin. Vui lòng thử lại.");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, updateUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
