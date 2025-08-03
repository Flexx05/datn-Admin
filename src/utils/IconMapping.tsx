import {
  AppstoreOutlined,
  BarcodeOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  GiftOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const IconMapping: Record<string, JSX.Element> = {
  dashboard: <DashboardOutlined />,
  product: <AppstoreOutlined />,
  category: <BarcodeOutlined />,
  brand: <TagOutlined />,
  attribute: <DeploymentUnitOutlined />,
  comment: <StarOutlined />,
  user: <UserOutlined />,
  staff: <TeamOutlined />,
  order: <ShoppingCartOutlined />,
  voucher: <GiftOutlined />,
  conversation: <CustomerServiceOutlined />,
  "quick-chat": <MessageOutlined />,
};
