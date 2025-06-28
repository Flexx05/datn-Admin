/* eslint-disable @typescript-eslint/no-explicit-any */
import { useList } from "@refinedev/core";
import { Select } from "antd";
import dayjs from "dayjs";
import { useContext, useMemo, useState } from "react";
import { Line, LineChart, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";
import { ColorModeContext } from "../../contexts/color-mode";
import { formatCurrency } from "../order/formatCurrency";

const groupOptions = [
  { label: "Ngày", value: "day" },
  { label: "Tháng", value: "month" },
  { label: "Năm", value: "year" },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  const { mode } = useContext(ColorModeContext);
  const colorMode = mode === "dark" ? "#1a1a1a" : "white";
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: colorMode,
          border: "1px solid #ccc",
          padding: 8,
          borderRadius: 4,
        }}
      >
        <strong>{label}</strong>
        <div>
          Doanh thu:{" "}
          <span style={{ color: "#82ca9d" }}>
            {formatCurrency(payload[0].value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const LineChartComponent = () => {
  const [groupBy, setGroupBy] = useState<"day" | "month" | "year">("month");

  // Lấy dữ liệu orders
  const { data } = useList({
    resource: "order",
    pagination: { mode: "off" },
  });

  const orderSuccess = data?.data?.filter((order) => order.status === 4);

  // Xử lý dữ liệu nhóm theo lựa chọn
  const revenueData = useMemo(() => {
    if (!orderSuccess) return [];
    const group: Record<string, number> = {};
    orderSuccess.forEach((order: any) => {
      let key = "";
      if (groupBy === "day") key = dayjs(order.createdAt).format("DD/MM/YYYY");
      else if (groupBy === "month")
        key = dayjs(order.createdAt).format("MM/YYYY");
      else if (groupBy === "year") key = dayjs(order.createdAt).format("YYYY");
      group[key] = (group[key] || 0) + (order.totalAmount || 0);
    });
    // Sắp xếp theo thời gian tăng dần
    return Object.entries(group)
      .sort(
        ([a], [b]) =>
          dayjs(
            a,
            groupBy === "day"
              ? "DD/MM/YYYY"
              : groupBy === "month"
              ? "MM/YYYY"
              : "YYYY"
          ).unix() -
          dayjs(
            b,
            groupBy === "day"
              ? "DD/MM/YYYY"
              : groupBy === "month"
              ? "MM/YYYY"
              : "YYYY"
          ).unix()
      )
      .map(([data, value]) => ({ data, value }));
  }, [orderSuccess, groupBy]);

  return (
    <>
      <Select
        options={groupOptions}
        value={groupBy}
        onChange={setGroupBy}
        style={{ marginBottom: 16, width: 160 }}
      />
      <LineChart width={500} height={300} data={revenueData}>
        <XAxis dataKey="data" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="value" stroke="#82ca9d" />
      </LineChart>
    </>
  );
};

export default LineChartComponent;
