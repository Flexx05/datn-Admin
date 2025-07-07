/* eslint-disable @typescript-eslint/no-explicit-any */
import { List, Tag } from "antd";
import { Link } from "react-router";
import { formatCurrency } from "../order/formatCurrency";
import { statusMap } from "./statusMap";

type Props = {
  orderData: any;
  isLoading: boolean;
};

const OrderNearly = ({ orderData, isLoading }: Props) => {
  const top10Order = orderData?.slice(0, 10);

  return (
    <List
      dataSource={top10Order}
      loading={isLoading}
      renderItem={(item: any) => {
        const status = statusMap[item.status ?? "default"];

        return (
          <List.Item
            key={item._id}
            actions={[
              <Tag color={status.color} icon={status.icon}>
                {status.text}
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
        );
      }}
    />
  );
};

export default OrderNearly;
