/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogoutOutlined } from "@ant-design/icons";
import { useLogout, useMenu } from "@refinedev/core";
import { Layout, Menu } from "antd";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IconMapping } from "../../utils/IconMapping";
import { TitleLogo } from "../TitleLogo";

const { Sider } = Layout;

export const CustomSider = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: logout } = useLogout();
  const { menuItems: rawMenuItems } = useMenu();
  const menuItems = rawMenuItems.map(({ children, ...item }) => item);

  // TODO: Phân quyền

  return (
    <Sider
      theme="light"
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      breakpoint="md"
      width={220}
      collapsedWidth={80}
      style={{ position: "sticky", top: 0, height: "100vh" }}
    >
      <TitleLogo
        collapsed={collapsed}
        style={{ justifyContent: "center", margin: "8px 0px" }}
      />

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={[
          ...menuItems.map((item) => ({
            ...item,
            onClick: () => navigate(item.route || item.key),
            icon: IconMapping[item.icon as string],
            label: item.label,
            key: item.key,
          })),
          {
            key: "/logout",
            icon: <LogoutOutlined />,
            onClick: () => logout(),
            label: "Đăng xuất",
          },
        ]}
      />
    </Sider>
  );
};
