import React, { useEffect, useState } from "react";
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
} from "recharts";

const { RangePicker } = DatePicker;

const OrderStatistics = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    paymentMethod: "",
  });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.paymentMethod)
        params.append("paymentMethod", filters.paymentMethod);

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
      message.error("Lỗi khi lấy dữ liệu thống kê");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filters]);

  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        startDate: dayjs(dates[0]).format("YYYY-MM-DD"),
        endDate: dayjs(dates[1]).format("YYYY-MM-DD"),
      });
    } else {
      setFilters({ ...filters, startDate: "", endDate: "" });
    }
  };

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
          title: "Mã đơn hàng",
          dataIndex: "_id",
          key: "_id",
          render: (id: string) => <span style={{ fontWeight: 500 }}>{id}</span>,
        },
        {
          title: "Khách hàng",
          dataIndex: "customerName",
          key: "customerName",
          render: (_: any, record: any) =>
            record.customerName || record.shippingAddress?.name || "Ẩn danh",
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
          title: "Trạng thái",
          dataIndex: "status",
          key: "status",
          render: (v: number) =>
            v === 4 ? (
              <span style={{ color: "#52c41a" }}>Hoàn thành</span>
            ) : (
              <span style={{ color: "#faad14" }}>Khác</span>
            ),
        },
      ];

  return (
    <div>
      <List
        headerProps={{ title: "Thống kê doanh thu theo đơn hàng" }}
        wrapperProps={{ style: { padding: 0 } }}
      >
        <Card title="Bộ lọc" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ marginBottom: 8 }}>Thời gian</div>
              <RangePicker
                onChange={handleDateChange}
                style={{ width: "100%" }}
                value={
                  filters.startDate && filters.endDate
                    ? [dayjs(filters.startDate), dayjs(filters.endDate)]
                    : null
                }
              />
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 8 }}>Phương thức thanh toán</div>
              <Select
                style={{ width: "100%" }}
                value={filters.paymentMethod}
                onChange={(v) =>
                  setFilters((prev) => ({ ...prev, paymentMethod: v }))
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
          </Row>
        </Card>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng doanh thu theo đơn hàng"
                value={data?.totalRevenue || 0}
                valueStyle={{ color: "#3f8600" }}
                formatter={(value) => value?.toLocaleString() + " ₫"}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng số đơn hàng"
                value={data?.totalOrders || 0}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="Biểu đồ doanh thu theo ngày">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1890ff"
                      name="Doanh thu"
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
          <Col span={12}>
            <Card title="Biểu đồ số đơn hàng theo ngày">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
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
        </Row>

        <Card title="Danh sách đơn hàng">
          <Table
            columns={columns}
            dataSource={data?.orders || []}
            rowKey="_id"
            loading={loading}
            pagination={false}
            scroll={{ x: 900 }}
          />
        </Card>
      </List>
    </div>
  );
};

export default OrderStatistics;
