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

    // lọc đơn hợp lệ
    const validOrders = ordersData.data.filter(
      (order: any) => order.status === 4 && order.paymentStatus === 1
    );

    // đơn trong 90 ngày gần nhất
    const recentOrders = validOrders.filter((order: any) =>
      dayjs(order.createdAt).isAfter(dayjs().subtract(90, "day"))
    );

    const customerMap: Record<string, any> = {};

    // lifetime (toàn bộ đơn)
    validOrders.forEach((order: any) => {
      const userId = order.userId?._id || order.userId;
      if (!customerMap[userId]) {
        customerMap[userId] = {
          userId,
          name: order.userId?.fullName || "N/A",
          email: order.userId?.email || "N/A",
          avatar: order.userId?.avatar,
          rank: order.userId?.rank ?? null,
          total: 0, // 90 ngày
          count: 0, // 90 ngày
          lastOrderDate: null, // toàn bộ
          lifetimeTotal: 0,
        };
      }
      customerMap[userId].lifetimeTotal += order.totalAmount;

      // cập nhật đơn gần nhất (toàn bộ)
      const createdAt = new Date(order.createdAt);
      if (
        !customerMap[userId].lastOrderDate ||
        createdAt > customerMap[userId].lastOrderDate
      ) {
        customerMap[userId].lastOrderDate = createdAt;
      }
    });

    // tính 90 ngày
    recentOrders.forEach((order: any) => {
      const userId = order.userId?._id || order.userId;
      customerMap[userId].total += order.totalAmount;
      customerMap[userId].count += 1;
    });

    return Object.values(customerMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [ordersData]);

  return (
    <Card
      title="Xếp hạng khách hàng thân thiết (90 ngày gần nhất)"
      loading={isLoading}
    >
      <Table
        dataSource={ranking}
        rowKey="userId"
        pagination={false}
        scroll={{ x: true }}
        columns={[
          {
            title: "Khách hàng",
            dataIndex: "name",
            width: 250,
            render: (_, record) => (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar src={record.avatar} />
                <div style={{ minWidth: 0 }}>
                  <strong>{record.name}</strong>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#999",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 180,
                    }}
                  >
                    {record.email}
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: "Số đơn (90 ngày)",
            dataIndex: "count",
            align: "center",
            width: 120,
          },
          {
            title: "Tổng chi tiêu (90 ngày)",
            dataIndex: "total",
            width: 160,
            render: (val) => val.toLocaleString("vi-VN") + "₫",
            align: "right",
          },
          {
            title: "Tổng chi tiêu (toàn bộ)",
            dataIndex: "lifetimeTotal",
            width: 180,
            render: (val) => val.toLocaleString("vi-VN") + "₫",
            align: "right",
            sorter: (a, b) => a.lifetimeTotal - b.lifetimeTotal,
          },
          {
            title: "Đơn gần nhất",
            dataIndex: "lastOrderDate",
            width: 180,
            render: (val) => {
              if (!val) return "Chưa có";
              const formatted = dayjs(val).format("DD/MM/YYYY");
              const isOld = dayjs(val).isBefore(dayjs().subtract(90, "day"));
              return (
                <span>
                  {formatted}
                  {isOld && (
                    <span style={{ color: "red", marginLeft: 4, fontSize: 12 }}>
                      (ngoài 90 ngày)
                    </span>
                  )}
                </span>
              );
            },
            align: "center",
          },
          {
            title: "Hạng",
            dataIndex: "rank",
            width: 120,
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
