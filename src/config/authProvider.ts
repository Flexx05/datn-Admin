/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthProvider } from "@refinedev/core";
import { axiosInstance } from "../utils/axiosInstance";
import { useAuth } from "../contexts/auth/AuthContext";

export const TOKEN_KEY = "token";
export const USER_KEY = "user";

export const useAuthProvider = (): AuthProvider => {
  const { login: ctxLogin, logout: ctxLogout, user, token } = useAuth();
  return {
    login: async ({ email, password }) => {
      try {
        const res = await axiosInstance.post(`/login`, {
          email,
          password,
        });
        const { accessToken, user: userData } = res.data;
        if (
          accessToken &&
          userData &&
          userData.isActive &&
          userData.role !== "user"
        ) {
          ctxLogin(userData, accessToken);
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
        ctxLogout();
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
      if (token && user?.role !== "user") {
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
      return user?.role || null;
    },
    getIdentity: async () => {
      if (token && user) {
        return {
          id: user._id,
          name: user.fullName,
          avatar:
            "https://th.bing.com/th/id/OIP.ZcFud0JRARzgjnRIqMWMxQHaHO?cb=iwc2&rs=1&pid=ImgDetMain",
        };
      }
      return null;
    },
    onError: async (error: any) => {
      console.error(error);
      return { error };
    },
  };
};
