/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthProvider } from "@refinedev/core";
import axios from "axios";

export const TOKEN_KEY = "token";
export const USER_KEY = "user";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const res = await axios.post(`http://localhost:8080/api/login`, {
        email,
        password,
      });
      console.log(res);

      if (
        res.data &&
        res.data.accessToken &&
        res.data.user.isActive === true &&
        res.data.user.role !== "user"
      ) {
        localStorage.setItem(TOKEN_KEY, res.data.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        return {
          success: true,
          redirectTo: "/",
          successNotification: {
            message: res.data.message || "Đăng nhập thành công",
          },
        };
      } else {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: "Bạn không có quyền truy cập",
          },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message:
            error.response?.data?.error ||
            error.message ||
            "Đăng nhập thất bại",
        },
      };
    }
  },
  logout: async () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return {
        success: true,
        redirectTo: "/login",
        successNotification: {
          message: "Đã đăng xuất",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: "LogoutError",
          message: "Đăng xuất thất bại",
        },
      };
    }
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => {
    const user = localStorage.getItem(USER_KEY);
    const parsedUser = user ? JSON.parse(user) : null;
    if (parsedUser) {
      return parsedUser.role;
    }
    return null;
  },
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    if (token && user) {
      const parsedUser = JSON.parse(user);
      return {
        id: parsedUser._id,
        name: parsedUser.fullName,
        avatar:
          "https://th.bing.com/th/id/OIP.ZcFud0JRARzgjnRIqMWMxQHaHO?cb=iwc2&rs=1&pid=ImgDetMain",
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
