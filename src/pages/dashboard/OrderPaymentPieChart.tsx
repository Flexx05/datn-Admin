import { useList } from "@refinedev/core";
import { Card } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import { DashboardFilterValue } from "./DashboardFilter";
import dayjs from "dayjs";

interface Props {
  filter: DashboardFilterValue;
}

const PAYMENT_COLORS = ["#1890ff", "#fa541c", "#82ca9d"];
const paymentMethodMap: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "VNPAY",
  VI: "Ví Binova",
};

const OrderPaymentPieChart = ({ filter }: Props) => {
  const { data: ordersData, isLoading } = useList({
    resource: "order",
    pagination: { mode: "off" },
  });

  const paymentData = useMemo(() => {
    if (!ordersData?.data) return [];
    let filtered = ordersData.data.filter(
      (order) => order.status === 4 && order.paymentStatus === 1
    );
    if (filter.startDate && filter.endDate) {
      filtered = filtered.filter((order) => {
        const createdAt = dayjs(order.createdAt);
        return (
          createdAt.isSameOrAfter(dayjs(filter.startDate), "day") &&
          createdAt.isSameOrBefore(dayjs(filter.endDate), "day")
        );
      });
    } else if (filter.month && filter.year) {
      filtered = filtered.filter((order) => {
        const createdAt = dayjs(order.createdAt);
        return (
          createdAt.month() + 1 === filter.month &&
          createdAt.year() === filter.year
        );
      });
    }
    const group: Record<string, number> = {};
    filtered.forEach((order) => {
      const method =
        paymentMethodMap[order.paymentMethod] || order.paymentMethod || "Khác";
      group[method] = (group[method] || 0) + 1;
    });
    return Object.entries(group).map(([name, value]) => ({ name, value }));
  }, [ordersData, filter]);

  return (
    <Card
      title="Tỷ lệ đơn hàng theo phương thức thanh toán"
      bordered={false}
      loading={isLoading}
    >
      <ResponsiveContainer width="100%" height={350}>
        {paymentData.length > 0 ? (
          <PieChart>
            <Pie
              data={paymentData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {paymentData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value} đơn`} />
            <Legend />
          </PieChart>
        ) : (
          <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>
            Không có dữ liệu để hiển thị biểu đồ
          </div>
        )}
      </ResponsiveContainer>
    </Card>
  );
};

export default OrderPaymentPieChart;
