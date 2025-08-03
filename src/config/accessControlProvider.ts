import { AccessControlProvider } from "@refinedev/core";

export const AccesControlProvider: AccessControlProvider = {
  can: async ({ action, resource }) => {
    const user = localStorage.getItem("user");
    let role: string | null = null;

    if (user) {
      try {
        role = JSON.parse(user)?.role;
      } catch (error) {
        console.error("Lỗi khi prarse user từ localStorage");
      }
    }

    if (resource === "products" && action === "list") {
      return {
        can: role === "staff" || role === "admin",
        reason: "Bạn chỉ có quyền xem danh sách sản phẩm",
      };
    }
    if (resource === "products" && action === "show") {
      return {
        can: role === "staff" || role === "admin",
        reason: "Bạn chỉ có quyền xem chi tiết sản phẩm",
      };
    }

    return { can: false };
  },
};
