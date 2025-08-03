/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogoutOutlined } from "@ant-design/icons";
import { useLogout, useMenu } from "@refinedev/core";
import { Layout, Menu } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AccesControlProvider } from "../../config/accessControlProvider";
import { IconMapping } from "../../utils/IconMapping";
import { TitleLogo } from "../TitleLogo";

const { Sider } = Layout;

export const CustomSider = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [visibleMenuItems, setVisibleMenuItems] = useState<typeof menuItems>(
    []
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: logout } = useLogout();
  const { menuItems: rawMenuItems } = useMenu();
  const menuItems = rawMenuItems.map(({ children, ...item }) => item);

  const filteredMenuItems = useMemo(() => {
    return menuItems;
  }, [menuItems]);

  const checkPermission = async (resource: string) => {
    const result = await AccesControlProvider.can({ resource, action: "list" });
    return result.can;
  };

  useEffect(() => {
    const filterMenu = async () => {
      const checks = await Promise.all(
        filteredMenuItems.map(async (item) => {
          const canView = await checkPermission((item.name as string) ?? "");
          return canView ? item : null;
        })
      );

      setVisibleMenuItems(checks.filter(Boolean) as typeof menuItems);
    };

    filterMenu();
  }, []);

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
          ...visibleMenuItems.map((item) => ({
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
