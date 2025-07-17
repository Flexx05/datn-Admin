import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Statistic,
  Table,
  message,
} from "antd";
import { List } from "@refinedev/antd";
import { axiosInstance } from "../../utils/axiosInstance";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "../order/formatCurrency";

const { RangePicker } = DatePicker;

const PAYMENT_COLORS = ["#1890ff", "#fa541c"];

const OrderStatistics = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    paymentMethod: "",
    limit: 10,
    page: 1,
  });
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Hàm xử lý thay đổi tháng và năm (copy từ top-products)
  const handleMonthYearChange = (month: number | null, year: number | null) => {
    setSelectedMonth(month);
    setSelectedYear(year);

    let startDate = "";
    let endDate = "";

    if (month === null && year === null) {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "", page: 1 }));
      return;
    }

    if (month !== null && year !== null) {
      startDate = dayjs(`${year}-${month.toString().padStart(2, "0")}-01`)
        .startOf("month")
        .format("YYYY-MM-DD");
      endDate = dayjs(`${year}-${month.toString().padStart(2, "0")}-01`)
        .endOf("month")
        .format("YYYY-MM-DD");
    } else if (year !== null && month === null) {
      startDate = dayjs(`${year}-01-01`).format("YYYY-MM-DD");
      endDate = dayjs(`${year}-12-31`).format("YYYY-MM-DD");
    } else if (month !== null && year === null) {
      const currentYear = dayjs().year();
      setSelectedYear(currentYear);
      startDate = dayjs(
        `${currentYear}-${month.toString().padStart(2, "0")}-01`
      )
        .startOf("month")
        .format("YYYY-MM-DD");
      endDate = dayjs(`${currentYear}-${month.toString().padStart(2, "0")}-01`)
        .endOf("month")
        .format("YYYY-MM-DD");
    }

    setFilters((prev) => ({ ...prev, startDate, endDate, page: 1 }));
  };

  // Sửa lại hàm handleDateChange để reset tháng/năm khi chọn lại ngày
  const handleDateChange = (dates: any) => {
    setSelectedMonth(null);
    setSelectedYear(null);
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        startDate: dayjs(dates[0]).format("YYYY-MM-DD"),
        endDate: dayjs(dates[1]).format("YYYY-MM-DD"),
        page: 1,
      });
    } else {
      setFilters({ ...filters, startDate: "", endDate: "", page: 1 });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.paymentMethod)
        params.append("paymentMethod", filters.paymentMethod);
      params.append("limit", filters.limit.toString());
      params.append("page", filters.page.toString());

      const res = await axiosInstance.get(
        `/statistics/order-revenue?${params.toString()}`
      );
      if (res.data.success === false) {
        setData(null);
        message.warning(res.data.message || "Không có dữ liệu");
      } else {
        setData(res.data);
      }
    } catch (err) {
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const chartData =
    data?.allOrders
      ?.reduce((acc: any[], order: any) => {
        const date = dayjs(order.createdAt).format("YYYY-MM-DD");
        const found = acc.find((i) => i.date === date);
        if (found) {
          found.revenue += order.totalAmount || 0;
          found.orderCount += 1;
        } else {
          acc.push({
            date,
            revenue: order.totalAmount || 0,
            orderCount: 1,
          });
        }
        return acc;
      }, [])
      ?.sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      ) || [];

  const paymentMethods = [
    { label: "Tất cả", value: "" },
    { label: "Thanh toán khi nhận hàng (COD)", value: "COD" },
    { label: "VNPAY", value: "VNPAY" },
  ];

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => <span style={{ fontWeight: 500 }}>{id}</span>,
    },
    {
      title: "Khách hàng",
      key: "customerName",
      render: (_: any, record: any) =>
        record.recipientInfo?.name ||
        record.customerName ||
        record.shippingAddress?.name ||
        "Ẩn danh",
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value: number) => value?.toLocaleString() + " ₫",
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (v: string) => (v === "VNPAY" ? "VNPAY" : "COD"),
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (v: number) =>
        v === 1 ? (
          <span style={{ color: "#52c41a" }}>Đã thanh toán</span>
        ) : (
          <span style={{ color: "#faad14" }}>Khác</span>
        ),
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "status",
      key: "status",
      render: (v: number) =>
        v === 4 ? (
          <span style={{ color: "#52c41a" }}>Hoàn thành</span>
        ) : (
          <span style={{ color: "#faad14" }}>Khác</span>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right" as const,
      width: 120,
      render: (_: any, record: any) => (
        <a
          href={`/orders/show/${record._id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1890ff" }}
        >
          Xem chi tiết
        </a>
      ),
    },
  ];

  // Custom Tooltip cho biểu đồ doanh thu
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "white",
            border: "1px solid #ccc",
            padding: 8,
            borderRadius: 4,
          }}
        >
          <strong>{label}</strong>
          <div>
            Doanh thu:{" "}
            <span style={{ color: "#1890ff" }}>
              {formatCurrency(payload[0].value)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Dữ liệu Pie cho phương thức thanh toán
  const paymentPieData = useMemo(() => {
    if (!data?.allOrders) return [];
    const count: Record<string, number> = {};
    data.allOrders.forEach((order: any) => {
      count[order.paymentMethod] = (count[order.paymentMethod] || 0) + 1;
    });
    return Object.entries(count).map(([method, value]) => ({
      name: method === "VNPAY" ? "VNPAY" : "COD",
      value,
    }));
  }, [data]);

  return (
    <div>
      <List
        headerProps={{ title: "Thống kê doanh thu theo đơn hàng" }}
        wrapperProps={{ style: { padding: 0 } }}
      >
        <Card title="Bộ lọc" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ marginBottom: 8 }}>
                Thời gian (Mặc định lấy 7 ngày gần nhất)
              </div>
              <DatePicker.RangePicker
                onChange={handleDateChange}
                style={{ width: "100%", marginBottom: 8 }}
                value={
                  filters.startDate && filters.endDate
                    ? [dayjs(filters.startDate), dayjs(filters.endDate)]
                    : null
                }
              />
              <div style={{ display: "flex", gap: 8 }}>
                <Select
                  placeholder="Chọn tháng"
                  value={selectedMonth ?? undefined}
                  onChange={(value) =>
                    handleMonthYearChange(value || null, selectedYear)
                  }
                  style={{ width: "50%" }}
                  allowClear
                >
                  {[...Array(12)].map((_, index) => (
                    <Select.Option key={index + 1} value={index + 1}>
                      Tháng {index + 1}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  placeholder="Chọn năm"
                  value={selectedYear ?? undefined}
                  onChange={(value) =>
                    handleMonthYearChange(selectedMonth, value || null)
                  }
                  style={{ width: "50%" }}
                  allowClear
                >
                  {[2022, 2023, 2024, 2025].map((year) => (
                    <Select.Option key={year} value={year}>
                      Năm {year}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 8 }}>Phương thức thanh toán</div>
              <Select
                style={{ width: "100%" }}
                value={filters.paymentMethod}
                onChange={(v) =>
                  setFilters((prev) => ({ ...prev, paymentMethod: v, page: 1 }))
                }
                allowClear
                placeholder="Tất cả"
              >
                {paymentMethods.map((m) => (
                  <Select.Option key={m.value} value={m.value}>
                    {m.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 8 }}>Số lượng hiển thị</div>
              <Select
                value={filters.limit}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, limit: value, page: 1 }))
                }
                style={{ width: "100%" }}
              >
                {[10, 20, 50, 100].map((val) => (
                  <Select.Option key={val} value={val}>
                    {val} đơn hàng
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng doanh thu theo đơn hàng"
                value={data?.totalRevenue || 0}
                valueStyle={{ color: "#3f8600" }}
                formatter={(value) => value?.toLocaleString() + " ₫"}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số đơn hàng hoàn tất"
                value={data?.totalOrders || 0}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Doanh thu hôm nay"
                value={data?.todayRevenue || 0}
                valueStyle={{ color: "#fa541c" }}
                formatter={(value) => value?.toLocaleString() + " ₫"}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Số đơn hàng đã hoàn tất hôm nay"
                value={data?.todayOrdersCount || 0}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={14}>
            <Card title="Biểu đồ doanh thu & số đơn hàng theo ngày">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
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
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "50px",
                    color: "#999",
                  }}
                >
                  Không có dữ liệu để hiển thị biểu đồ
                </div>
              )}
            </Card>
          </Col>
          <Col span={10}>
            <Card title="Tỷ lệ đơn hàng theo phương thức thanh toán">
              {paymentPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={paymentPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label
                    >
                      {paymentPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} đơn`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "50px",
                    color: "#999",
                  }}
                >
                  Không có dữ liệu để hiển thị biểu đồ
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Card title="Danh sách đơn hàng đã hoàn tất">
          <Table
            columns={columns}
            dataSource={data?.orders || []}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: filters.limit,
              showSizeChanger: false,
              total: data?.pagination?.totalDocs || 0,
              current: filters.page,
              onChange: (page) => setFilters((prev) => ({ ...prev, page })),
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} đơn hàng`,
            }}
            scroll={{ x: 900 }}
          />
        </Card>
      </List>
    </div>
  );
};

export default OrderStatistics;
