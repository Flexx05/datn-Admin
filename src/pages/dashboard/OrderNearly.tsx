/* eslint-disable @typescript-eslint/no-explicit-any */
import { List, Tag, Select } from "antd";
import { Link } from "react-router";
import { formatCurrency } from "../order/formatCurrency";
import { statusMap } from "./statusMap";
import { useState } from "react";

type Props = {
  orderData: any;
  isLoading: boolean;
};

const OrderNearly = ({ orderData, isLoading }: Props) => {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Lấy 10 đơn gần nhất
  const top10Order = orderData?.slice(0, 10) ?? [];

  // Lọc trong 10 đơn này
  const filteredOrders =
    filterStatus === "all"
      ? top10Order
      : top10Order.filter(
          (item: any) => String(item.status) === String(filterStatus)
        );

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          style={{ width: 150 }}
          options={[
            { label: "Tất cả", value: "all" },
            ...Object.entries(statusMap)
              .filter(([key]) => key !== "default")
              .map(([key, value]) => ({
                value: String(key),
                label: value.text,
              })),
          ]}
        />
      </div>

      <List
        dataSource={filteredOrders}
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
    </>
  );
};

export default OrderNearly;
