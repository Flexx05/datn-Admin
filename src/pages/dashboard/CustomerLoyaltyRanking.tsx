import { useList } from "@refinedev/core";
import { Table, Card, Avatar } from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";

const getRank = (rank: number): string => {
  if (rank === 3) return "Kim cương";
  if (rank === 2) return "Vàng";
  if (rank === 1) return "Bạc";
  if (rank === 0) return "Đồng";
  return "Thành viên";
};

const CustomerLoyaltyRanking = () => {
  const { data: ordersData, isLoading } = useList({
    resource: "order",
    pagination: { mode: "off" },
  });

  const ranking = useMemo(() => {
    if (!ordersData?.data) return [];

    const recentOrders = ordersData.data.filter((order: any) => {
      const createdAt = dayjs(order.createdAt);
      return (
        order.status === 4 &&
        order.paymentStatus === 1 &&
        createdAt.isAfter(dayjs().subtract(90, "day"))
      );
    });

    const customerMap: Record<string, any> = {};

    recentOrders.forEach((order: any) => {
      const userId = order.userId?._id || order.userId;
      if (!customerMap[userId]) {
        customerMap[userId] = {
          userId,
          name: order.userId?.fullName || "N/A",
          email: order.userId?.email || "N/A",
          avatar: order.userId?.avatar,
          rank: order.userId?.rank ?? null,
          total: 0,
          count: 0,
        };
      }
      customerMap[userId].total += order.totalAmount;
      customerMap[userId].count += 1;
    });

    return Object.values(customerMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [ordersData]);

  return (
    <Card title="Xếp hạng khách hàng thân thiết" loading={isLoading}>
      <Table
        dataSource={ranking}
        rowKey="userId"
        pagination={false}
        columns={[
          {
            title: "Khách hàng",
            dataIndex: "name",
            render: (_, record) => (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar src={record.avatar} />
                <div>
                  <strong>{record.name}</strong>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {record.email}
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: "Số đơn",
            dataIndex: "count",
            align: "center",
          },
          {
            title: "Tổng chi tiêu",
            dataIndex: "total",
            render: (val) => val.toLocaleString("vi-VN") + "₫",
            align: "right",
            sorter: (a, b) => a.total - b.total,
            defaultSortOrder: "descend", // mặc định sắp giảm dần
          },
          {
            title: "Hạng",
            dataIndex: "rank",
            render: (val) => getRank(val),
            align: "center",
            filters: [
              { text: "Kim cương", value: 3 },
              { text: "Vàng", value: 2 },
              { text: "Bạc", value: 1 },
              { text: "Đồng", value: 0 },
            ],
            onFilter: (value, record) => record.rank === value,
          },
        ]}
      />
    </Card>
  );
};

export default CustomerLoyaltyRanking;
