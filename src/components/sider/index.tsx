// components/layout/CustomSider.tsx
import {
  AppstoreOutlined,
  BarcodeOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  GiftOutlined,
  LogoutOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useLogout } from "@refinedev/core";
import { Layout, Menu, Tooltip } from "antd";
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ColorModeContext } from "../../contexts/color-mode";
import { TitleLogo } from "../TitleLogo";

const { Sider } = Layout;

const menuItems = [
  {
    key: "/dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/product",
    icon: <AppstoreOutlined />,
    label: "Quản lý sản phẩm",
  },
  {
    key: "/category",
    icon: <BarcodeOutlined />,
    label: "Quản lý danh mục",
  },
  {
    key: "/brand",
    icon: <TagOutlined />,
    label: "Quản lý thương hiệu",
  },
  {
    key: "/attribute",
    icon: <DeploymentUnitOutlined />,
    label: "Quản lý thuộc tính",
  },
  {
    key: "/comments",
    icon: <StarOutlined />,
    label: "Quản lý đánh giá",
  },
  {
    key: "/admin/users",
    icon: <UserOutlined />,
    label: "Quản lý khách hàng",
  },
  {
    key: "/staffs",
    icon: <TeamOutlined />,
    label: "Quản lý nhân viên",
  },
  {
    key: "/orders",
    icon: <ShoppingCartOutlined />,
    label: "Quản lý đơn hàng",
  },
  {
    key: "/vouchers",
    icon: <GiftOutlined />,
    label: "Quản lý voucher",
  },
  {
    key: "/conversation",
    icon: <CustomerServiceOutlined />,
    label: "Chăm sóc khách hàng",
  },
  {
    key: "/quick-chat",
    icon: <MessageOutlined />,
    label: "Quản lý tin nhắn nhanh",
  },
  {
    key: "/logout",
    icon: <LogoutOutlined />,
    label: "Đăng xuất",
  },
];

// TODO: Sửa lại màu sider
// TODO: Làm chức năng phân quyền

export const CustomSider = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useContext(ColorModeContext);
  const { mutate: logout } = useLogout();
  return (
    <Sider
      theme={mode === "dark" ? "dark" : "light"}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={220}
      collapsedWidth={80}
      style={{ position: "sticky", top: 0, height: "100vh" }}
    >
      <TitleLogo
        collapsed={collapsed}
        style={{ justifyContent: "center", marginBottom: 16 }}
      />

      <Menu
        theme={mode === "dark" ? "dark" : "light"}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems.map((item) => ({
          ...item,
          onClick: () => {
            item.key !== "/logout" ? navigate(item.key) : logout();
          },
          label: collapsed ? (
            <Tooltip title={item.label} placement="right">
              <span>{item.icon}</span>
            </Tooltip>
          ) : (
            <span>
              <span>{item.label}</span>
            </span>
          ),
        }))}
      />
    </Sider>
  );
};
