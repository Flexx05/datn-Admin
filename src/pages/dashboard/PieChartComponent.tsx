/* eslint-disable @typescript-eslint/no-explicit-any */
import { useList } from "@refinedev/core";
import { Card, Col, Row, Select, Statistic } from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, Tooltip, TooltipProps } from "recharts";
import { ColorModeContext } from "../../contexts/color-mode";

const COLORS = ["#82ca9d", "#ff4d4f"];

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
          {payload[0].name}:{" "}
          <span style={{ color: "#82ca9d" }}>{payload[0].value} đơn hàng</span>
        </div>
      </div>
    );
  }
  return null;
};

const PieChartComponent = () => {
  const { data: ordersData, isLoading } = useList({
    resource: "order",
    pagination: { mode: "off" },
  });

  // Gom dữ liệu theo tháng
  const monthlyData = useMemo(() => {
    const result: Record<
      string,
      { complete: number; cancel: number; refund: number }
    > = {};
    ordersData?.data?.forEach((order: any) => {
      const month = dayjs(order.createdAt).format("MM/YYYY");
      if (!result[month]) result[month] = { complete: 0, cancel: 0, refund: 0 };
      if (order.status === 4 && order.paymentStatus === 1)
        result[month].complete += 1;
      if (order.status === 5) result[month].cancel += 1;
      if (order.status === 6) result[month].refund += 1;
    });
    return result;
  }, [ordersData]);

  // Danh sách tháng có dữ liệu (mới nhất lên đầu)
  const months = useMemo(
    () =>
      Object.keys(monthlyData).sort(
        (a, b) => dayjs(b, "MM/YYYY").unix() - dayjs(a, "MM/YYYY").unix()
      ),
    [monthlyData]
  );

  // Tháng đang chọn (mặc định là tháng mới nhất)
  const [selectedMonth, setSelectedMonth] = useState<string>(months[0] || "");

  // Cập nhật selectedMonth khi months thay đổi
  useEffect(() => {
    if (months.length > 0) setSelectedMonth(months[0]);
  }, [months]);

  // Dữ liệu PieChart cho tháng đang chọn
  const pieData = [
    {
      name: "Hoàn thành",
      value: monthlyData[selectedMonth]?.complete || 0,
    },
    {
      name: "Đã huỷ",
      value: monthlyData[selectedMonth]?.cancel || 0,
    },
    {
      name: "Hoàn hàng",
      value: monthlyData[selectedMonth]?.refund || 0,
    },
  ];

  // So sánh với tháng trước
  const currentIndex = months.indexOf(selectedMonth);
  const prevMonth = months[currentIndex + 1];
  const currentComplete = monthlyData[selectedMonth]?.complete || 0;
  const prevComplete = prevMonth ? monthlyData[prevMonth]?.complete || 0 : 0;
  const currentCancel = monthlyData[selectedMonth]?.cancel || 0;
  const prevCancel = prevMonth ? monthlyData[prevMonth]?.cancel || 0 : 0;
  const currentRefund = monthlyData[selectedMonth]?.refund || 0;
  const prevRefund = prevMonth ? monthlyData[prevMonth]?.refund || 0 : 0;

  const percentChangeComplete =
    prevComplete === 0
      ? currentComplete > 0
        ? 100
        : 0
      : ((currentComplete - prevComplete) / prevComplete) * 100;

  const percentChangeCancel =
    prevCancel === 0
      ? currentCancel > 0
        ? 100
        : 0
      : ((currentCancel - prevCancel) / prevCancel) * 100;

  const percentChangeRefund =
    prevRefund === 0
      ? currentRefund > 0
        ? 100
        : 0
      : ((currentRefund - prevRefund) / prevRefund) * 100;

  return (
    <Card
      title={
        <>
          Tỷ lệ đơn hàng <span style={{ color: "#82ca9d" }}>Hoàn thành</span> /{" "}
          <span style={{ color: "#ff4d4f" }}>Đã hủy</span> /{" "}
          <span style={{ color: "#ffc042ff" }}>Hoàn hàng</span> theo tháng
        </>
      }
      bordered={false}
      loading={isLoading}
      extra={
        <Select
          value={selectedMonth}
          onChange={setSelectedMonth}
          options={months.map((m) => ({ value: m, label: m }))}
          style={{ width: 120 }}
        />
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic
            title={
              <>
                <span style={{ color: "#82ca9d" }}>Hoàn thành</span> so với
                tháng trước
              </>
            }
            value={percentChangeComplete}
            precision={2}
            suffix="%"
            valueStyle={{
              color:
                percentChangeComplete > 0
                  ? "#3f8600"
                  : percentChangeComplete < 0
                  ? "#cf1322"
                  : undefined,
            }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={
              <>
                <span style={{ color: "#ff4d4f" }}>Đã hủy</span> so với tháng
                trước
              </>
            }
            value={percentChangeCancel}
            precision={2}
            suffix="%"
            valueStyle={{
              color:
                percentChangeCancel > 0
                  ? "#cf1322"
                  : percentChangeCancel < 0
                  ? "#3f8600"
                  : undefined,
            }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={
              <>
                <span style={{ color: "#ffc042ff" }}>Hoàn hàng</span> so với
                tháng trước
              </>
            }
            value={percentChangeRefund}
            precision={2}
            suffix="%"
            valueStyle={{
              color:
                percentChangeRefund > 0
                  ? "#cf1322"
                  : percentChangeRefund < 0
                  ? "#3f8600"
                  : undefined,
            }}
          />
        </Col>
      </Row>
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
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </Card>
  );
};

export default PieChartComponent;
