/* eslint-disable @typescript-eslint/no-explicit-any */
import { useList } from "@refinedev/core";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card } from "antd";

const COLORS = ["#82ca9d", "#ff4d4f"];

const PieChartComponent = () => {
  const { data: ordersData, isLoading } = useList({
    resource: "order",
    pagination: { mode: "off" },
  });

  // Đếm số lượng đơn hoàn thành và đã huỷ
  const pieData = [
    {
      name: "Hoàn thành",
      value:
        ordersData?.data?.filter((order: any) => order.status === 4).length ||
        0,
    },
    {
      name: "Đã huỷ",
      value:
        ordersData?.data?.filter((order: any) => order.status === 5).length ||
        0,
    },
  ];

  return (
    <Card
      title="Tỷ lệ đơn hàng hoàn thành / huỷ"
      bordered={false}
      loading={isLoading}
    >
      <PieChart width={320} height={260}>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </Card>
  );
};

export default PieChartComponent;
