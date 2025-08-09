import { useList } from "@refinedev/core";
import { Card } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useMemo } from "react";
import { DashboardFilterValue } from "./DashboardFilter";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface Props {
  filter: DashboardFilterValue;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "white",
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 4,
          boxShadow: "0 0 8px rgba(0,0,0,0.1)",
        }}
      >
        <strong>{label}</strong>
        {payload.map((entry: any, index: number) => {
          const isRevenue = entry.dataKey === "revenue";
          const formattedValue = isRevenue
            ? entry.value?.toLocaleString() + " ₫"
            : entry.value;
          return (
            <div
              key={`tooltip-${index}`}
              style={{ color: entry.color, marginTop: 4 }}
            >
              ● {entry.name}: {formattedValue}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const OrderRevenueLineChart = ({ filter }: Props) => {
  const { data: ordersData, isLoading } = useList({
    resource: "order",
    pagination: { mode: "off" },
  });

  const chartData = useMemo(() => {
    if (!ordersData?.data) return [];
    let filtered = ordersData.data.filter(
      (order) => order.status === 4 && order.paymentStatus === 1
    );
    // Lọc theo khoảng ngày
    if (filter.startDate && filter.endDate) {
      filtered = filtered.filter((order) => {
        const createdAt = dayjs(order.createdAt);
        return (
          createdAt.isSameOrAfter(dayjs(filter.startDate), "day") &&
          createdAt.isSameOrBefore(dayjs(filter.endDate), "day")
        );
      });
    }
    // Lọc theo tháng/năm
    else if (filter.month && filter.year) {
      filtered = filtered.filter((order) => {
        const createdAt = dayjs(order.createdAt);
        return (
          createdAt.month() + 1 === filter.month &&
          createdAt.year() === filter.year
        );
      });
    }
    const group: Record<
      string,
      { date: string; revenue: number; orderCount: number }
    > = {};
    filtered.forEach((order) => {
      const day = dayjs(order.createdAt).format("YYYY-MM-DD");
      if (!group[day]) group[day] = { date: day, revenue: 0, orderCount: 0 };
      group[day].revenue += order.totalAmount || 0;
      group[day].orderCount += 1;
    });
    return Object.values(group).sort(
      (a, b) =>
        dayjs(a.date, "YYYY-MM-DD").unix() - dayjs(b.date, "YYYY-MM-DD").unix()
    );
  }, [ordersData, filter]);

  return (
    <Card
      title="Biểu đồ doanh thu & số đơn hàng theo ngày"
      bordered={false}
      loading={isLoading}
    >
      <ResponsiveContainer width="100%" height={400}>
        {chartData.length > 0 ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#1890ff"
              name="Doanh thu (₫)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orderCount"
              stroke="#fa541c"
              name="Số đơn hàng"
            />
          </LineChart>
        ) : (
          <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>
            Không có dữ liệu để hiển thị biểu đồ
          </div>
        )}
      </ResponsiveContainer>
    </Card>
  );
};

export default OrderRevenueLineChart;
