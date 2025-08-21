import { notification } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/auth/AuthContext";

export const ProtectRouter = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  console.log(children);

  useEffect(() => {
    if (user?.role === "staff") {
      notification.error({
        message: "Truy cập bị từ chối",
        description: "Bạn không có quyền truy cập vào trang này.",
      });
      navigate("/");
    }
  }, [user, navigate]);

  if (user?.role === "staff") {
    return null;
  }
  return <>{children}</>;
};
