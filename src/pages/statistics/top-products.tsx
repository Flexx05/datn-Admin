import React, { useState, useEffect } from "react";
import {
  Table,
  Select,
  Row,
  Col,
  Card,
  DatePicker,
  message,
  Statistic,
} from "antd";
import { List } from "@refinedev/antd";
import { axiosInstance } from "../../utils/axiosInstance";
import { formatCurrency } from "../order/formatCurrency";
import { IProductStats, IStatisticsData } from "../../interface/statistics";
import dayjs from "dayjs";



const { RangePicker } = DatePicker;

const TopProductsStatistics = () => {
  const [data, setData] = useState<IStatisticsData | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    categoryId: "",
    brandId: "",
    limit: 10,
  });

  const fetchData = async () => {
    try {
      const { startDate, endDate, categoryId, brandId, limit } = filters;

      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return message.error(
          "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc!"
        );
      }

      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (categoryId) params.append("categoryId", categoryId);
      if (brandId) params.append("brandId", brandId);
      params.append("limit", limit.toString());

      const response = await axiosInstance.get(
        `/statistics/top-products?${params}`
      );

      if (response.data.success === false || !response.data.docs) {
        setData({
          docs: [],
          totalDocs: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          page: 1,
          limit,
          totalPages: 1,
        });
      } else {
        setData(response.data);
      }
    } catch (error) {
      setData({
        docs: [],
        totalDocs: 0,
        totalQuantity: 0,
        totalRevenue: 0,
        page: 1,
        limit: filters.limit,
        totalPages: 1,
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/category");
      setCategories(res.data.docs || []);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axiosInstance.get("/brand");
      setBrands(res.data.docs || []);
    } catch (err) {
      console.error("Lỗi lấy thương hiệu:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        startDate: dates[0] ? dayjs(dates[0]).format("YYYY-MM-DD") : "",
        endDate: dates[1] ? dayjs(dates[1]).format("YYYY-MM-DD") : "",
      });
    } else {
      setFilters({ ...filters, startDate: "", endDate: "" });
    }
  };

  const tableColumns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: IProductStats) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {record.image && (
            <img
              src={record.image}
              alt={text}
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                objectFit: "cover",
              }}
            />
          )}
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (text: string) => text || "Không xác định",
    },
    {
      title: "Thương hiệu",
      dataIndex: "brand",
      key: "brand",
      render: (text: string) => text || "Không xác định",
    },
    {
      title: "Số lượng bán",
      dataIndex: "quantity",
      key: "quantity",
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Số đơn hàng",
      dataIndex: "orderCount",
      key: "orderCount",
    },
    {
      title: "Tỷ lệ bán (%)",
      dataIndex: "soldPercentage",
      key: "soldPercentage",
      render: (value: number) => `${value}%`,
    },
  ];

  return (
    <div>
      <List
        headerProps={{ title: "Thống kê sản phẩm bán chạy" }}
        wrapperProps={{ style: { padding: 0 } }}
      >
        <Card style={{ marginBottom: 16 }} title="Bộ lọc">
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ marginBottom: 8 }}>Thời gian</div>
              <RangePicker
                onChange={handleDateChange}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={5}>
              <div style={{ marginBottom: 8 }}>Danh mục</div>
              <Select
                allowClear
                placeholder="Tất cả danh mục"
                style={{ width: "100%" }}
                value={filters.categoryId || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, categoryId: value }))
                }
              >
                {categories.map((cat) => (
                  <Select.Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={5}>
              <div style={{ marginBottom: 8 }}>Thương hiệu</div>
              <Select
                allowClear
                placeholder="Tất cả thương hiệu"
                style={{ width: "100%" }}
                value={filters.brandId || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, brandId: value }))
                }
              >
                {brands.map((b) => (
                  <Select.Option key={b._id} value={b._id}>
                    {b.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <div style={{ marginBottom: 8 }}>Số lượng hiển thị</div>
              <Select
                value={filters.limit}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, limit: value }))
                }
                style={{ width: "100%" }}
              >
                {[5, 10, 20, 50].map((val) => (
                  <Select.Option key={val} value={val}>
                    {val} sản phẩm
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        {data?.docs && data.docs.length > 0 && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={
                    data?.docs.reduce((sum, item) => sum + item.revenue, 0) || 0
                  }
                  formatter={(value) => formatCurrency(value as number)}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng số lượng"
                  value={
                    data?.docs.reduce((sum, item) => sum + item.quantity, 0) ||
                    0
                  }
                  formatter={(value) => value.toLocaleString()}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Số sản phẩm"
                  value={data?.docs.length || 0}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng số đơn hàng"
                  value={
                    data?.docs.reduce(
                      (sum, item) => sum + item.orderCount,
                      0
                    ) || 0
                  }
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Table
          columns={tableColumns}
          dataSource={data?.docs || []}
          rowKey="id"
          scroll={{ x: 1200 }}
        />
      </List>
    </div>
  );
};

export default TopProductsStatistics;
