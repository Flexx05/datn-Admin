/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ShoppingOutlined,
  CheckOutlined,
  TruckOutlined,
  CloseOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { List, Tag } from "antd";
import { Link } from "react-router";
import { formatCurrency } from "../order/formatCurrency";

type Props = {
  orderData: any;
  isLoading: boolean;
};

const statusMap: Record<
  number,
  { text: string; color: string; icon: React.ReactNode }
> = {
  0: { text: "Chờ xác nhận", color: "orange", icon: <ShoppingOutlined /> },
  1: { text: "Đã xác nhận", color: "blue", icon: <CheckOutlined /> },
  2: { text: "Đang giao hàng", color: "purple", icon: <TruckOutlined /> },
  3: { text: "Đã giao hàng", color: "yellow", icon: <CheckOutlined /> },
  4: { text: "Hoàn thành", color: "green", icon: <CheckOutlined /> },
  5: { text: "Đã huỷ", color: "red", icon: <CloseOutlined /> },
  6: { text: "Hoàn hàng", color: "cyan", icon: <UndoOutlined /> },
};

const OrderNearly = ({ orderData, isLoading }: Props) => {
  const top10Order = orderData?.slice(0, 10);
  return (
    <List
      dataSource={top10Order}
      loading={isLoading}
      renderItem={(item: any) => (
        <List.Item
          key={item._id}
          actions={[
            <Tag
              color={statusMap[item.status].color}
              icon={statusMap[item.status].icon}
            >
              {statusMap[item.status].text}
            </Tag>,
            <>{formatCurrency(item.totalAmount)}</>,
            <Link to={`/orders/show/${item._id}`}>Chi tiết</Link>,
          ]}
        >
          <List.Item.Meta
            title={
              <>
                Đơn hàng: <Tag color="magenta">{item.orderCode}</Tag>
              </>
            }
            description={`${item.recipientInfo.name} - ${item.recipientInfo.phone}`}
          />
        </List.Item>
      )}
    />
  );
};

export default OrderNearly;
