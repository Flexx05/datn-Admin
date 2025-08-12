import { AccessControlProvider } from "@refinedev/core";

const staffPermissions: Record<string, string[]> = {
  product: ["list", "show"],
  category: ["list", "show"],
  brand: ["list", "show"],
  attribute: ["list", "show"],
  voucher: ["list", "show"],
  "admin/users": ["list", "show"],
  orders: ["list", "show", "returnRequests"],
  conversation: ["list", "show"],
  "quick-chat": ["list", "show", "create", "edit", "delete"],
};

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

    if (role === "admin") return { can: true };
    if (role === "staff") {
      const allowedActions = staffPermissions[resource as string] ?? [];
      return {
        can: allowedActions.includes(action),
        reason: `Bạn chỉ có quyền ${allowedActions.join(", ")} với ${resource}`,
      };
    }

    return { can: false };
  },
};
