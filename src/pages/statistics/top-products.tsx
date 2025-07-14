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
  Button,
} from "antd";
import { List } from "@refinedev/antd";
import { axiosInstance } from "../../utils/axiosInstance";
import { formatCurrency } from "../order/formatCurrency";
import { IProductStats, IStatisticsData } from "../../interface/statistics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { utils as XLSXUtils, writeFile } from "xlsx";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF4560",
];

const TopProductsStatistics = () => {
  const [data, setData] = useState<IStatisticsData | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
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

      // Kiểm tra tính hợp lệ của ngày
      if (startDate && endDate) {
        const startDateObj = dayjs(startDate);
        const endDateObj = dayjs(endDate);

        if (!startDateObj.isValid() || !endDateObj.isValid()) {
          return message.error("Ngày không hợp lệ!");
        }

        if (startDateObj.isAfter(endDateObj)) {
          return message.error(
            "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc!"
          );
        }
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
          totalOrderCount: 0,
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
        totalOrderCount: 0,
        page: 1,
        limit: filters.limit,
        totalPages: 1,
      });
    }
  };

  // Lấy danh mục và thương hiệu khi để hiển thị select
  useEffect(() => {
    axiosInstance
      .get("/category?isActive=true&_limit=off")
      .then((res) => setCategories(res.data.docs || []));
    axiosInstance
      .get("/brand?isActive=true&_limit=off")
      .then((res) => setBrands(res.data.docs || []));
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);
  
  // Hàm xử lý thay đổi tháng và năm
  const handleMonthYearChange = (month: number | null, year: number | null) => {
    setSelectedMonth(month);
    setSelectedYear(year);

    let startDate = "";
    let endDate = "";

    // Nếu cả tháng và năm đều null, xóa filter
    if (month === null && year === null) {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
      return;
    }

    // Nếu có cả tháng và năm
    if (month !== null && year !== null) {
      startDate = dayjs(`${year}-${month.toString().padStart(2, "0")}-01`)
        .startOf("month")
        .format("YYYY-MM-DD");
      endDate = dayjs(`${year}-${month.toString().padStart(2, "0")}-01`)
        .endOf("month")
        .format("YYYY-MM-DD");
    }
    // Nếu chỉ có năm (không có tháng)
    else if (year !== null && month === null) {
      startDate = dayjs(`${year}-01-01`).format("YYYY-MM-DD");
      endDate = dayjs(`${year}-12-31`).format("YYYY-MM-DD");
    }
    // Nếu chỉ có tháng (không có năm) - sử dụng năm hiện tại
    else if (month !== null && year === null) {
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

    setFilters((prev) => ({ ...prev, startDate, endDate }));
  };
 
  // Hàm xử lý thay đổi ngày
  const handleDateChange = (dates: any) => {
    setSelectedMonth(null);
    setSelectedYear(null);
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
  
  // Hàm xuất dữ liệu ra file Excel
  const handleExportExcel = () => {
    if (!data?.docs || data.docs.length === 0) {
      return message.warning("Không có dữ liệu để xuất");
    }

    // Xác định ngày xuất dữ liệu
    let exportStartDate = filters.startDate;
    let exportEndDate = filters.endDate;

    const title =
      selectedMonth && selectedYear
        ? `THỐNG KÊ SẢN PHẨM THÁNG ${selectedMonth} NĂM ${selectedYear}`
        : selectedYear
        ? `THỐNG KÊ SẢN PHẨM NĂM ${selectedYear}`
        : `THỐNG KÊ SẢN PHẨM TỪ ${exportStartDate} ĐẾN ${exportEndDate}`;

    // Nếu không có ngày được chọn, lấy 7 ngày trước đến ngày hiện tại
    if (!exportStartDate || !exportEndDate) {
      exportEndDate = dayjs().format("YYYY-MM-DD");
      exportStartDate = dayjs().subtract(7, "day").format("YYYY-MM-DD");
    }

    const exportData = data.docs.map((item, index) => ({
      STT: index + 1,
      "Tên sản phẩm": item.name,
      "Danh mục": item.category || "Không xác định",
      "Thương hiệu": item.brand || "Không xác định",
      "Số lượng bán": item.quantity,
      "Doanh thu": item.revenue,
      "Đơn giá": item.unitPrice,
      "Số đơn hàng": item.orderCount,
      "Tỷ lệ bán (%)": item.soldPercentage,
    }));

    const worksheet = XLSXUtils.json_to_sheet([]);

    // Thêm bộ lọc dữ liệu
    const infoRows = [];
    infoRows.push(["Từ ngày", exportStartDate]);
    infoRows.push(["Đến ngày", exportEndDate]);

    const selectedCategory = categories
      .flatMap((cat) => cat.subCategories || [])
      .find((sub) => sub._id === filters.categoryId);
    if (selectedCategory) {
      infoRows.push(["Danh mục", selectedCategory.name]);
    }

    const selectedBrand = brands.find((b) => b._id === filters.brandId);
    if (selectedBrand) {
      infoRows.push(["Thương hiệu", selectedBrand.name]);
    }

    // Thêm thông tin tổng quan
    infoRows.push(["Tổng doanh thu", data.totalRevenue]);
    infoRows.push(["Tổng số lượng", data.totalQuantity]);
    infoRows.push(["Tổng sản phẩm", data.totalDocs]);
    infoRows.push(["Tổng số đơn hàng", data.totalOrderCount]);

    XLSXUtils.sheet_add_aoa(worksheet, [[title]], { origin: "A1" }); 
    XLSXUtils.sheet_add_aoa(worksheet, infoRows, { origin: "A2" }); 
    XLSXUtils.sheet_add_json(worksheet, exportData, {
      origin: `A${infoRows.length + 3}`,
      skipHeader: false,
    });

    const workbook = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(workbook, worksheet, "Top Sản Phẩm");

    // Tạo tên file dựa trên loại filter
    let fileName = "Thong_ke_san_pham";

    if (selectedMonth && selectedYear) {
      fileName += `_thang${selectedMonth}_nam${selectedYear}`;
    } else if (selectedYear && !selectedMonth) {
      fileName += `_nam${selectedYear}`;
    } else if (selectedMonth && !selectedYear) {
      const currentYear = dayjs().year();
      fileName += `_thang${selectedMonth}_nam${currentYear}`;
    } else {
      // Nếu không có tháng/năm, sử dụng ngày xuất
      fileName += `_${exportStartDate}_den_${exportEndDate}`;
    }

    fileName += `.xlsx`;
    writeFile(workbook, fileName);
  };
  
  // Cấu hình các cột của bảng
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
      title: "Tồn kho",
      dataIndex: "totalStock",
      key: "totalStock",
      render: (value: number) => (
        <div>
          {value}
          {value === 0 && (
            <div
              style={{
                backgroundColor: "#f5222d",
                color: "#fff",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 12,
                marginTop: 4,
                display: "inline-block",
              }}
            >
              Hết hàng
            </div>
          )}
          {value > 0 && value <= 5 && (
            <div
              style={{
                backgroundColor: "#faad14",
                color: "#000",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 12,
                marginTop: 4,
                display: "inline-block",
              }}
            >
              Sắp hết hàng
            </div>
          )}
        </div>
      ),
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
  
  // Tooltip tùy chỉnh cho biểu đồ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{
                color: entry.color,
                margin: "4px 0",
              }}
            >
              {entry.name === "Tồn kho"
                ? `${entry.value} ${
                    entry.value === 0
                      ? "(Hết hàng)"
                      : entry.value <= 5
                      ? "(Sắp hết hàng)"
                      : ""
                  }`
                : entry.name === "Doanh thu"
                ? formatCurrency(entry.value)
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Dữ liệu biểu đồ tỷ lệ sản phẩm theo danh mục
  const categoryPieData =
    data?.docs?.reduce((acc: any[], cur) => {
      const found = acc.find((i) => i.name === cur.category);
      if (found) found.value += cur.quantity;
      else
        acc.push({
          name: cur.category || "Không xác định",
          value: cur.quantity,
        });
      return acc;
    }, []) || [];

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
                style={{ width: "100%", marginBottom: 8 }}
                value={
                  filters.startDate &&
                  filters.endDate &&
                  dayjs(filters.startDate).isValid() &&
                  dayjs(filters.endDate).isValid()
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
                {categories.flatMap((cat) =>
                  (cat.subCategories || []).map((sub: any) => (
                    <Select.Option key={sub._id} value={sub._id}>
                      {sub.name}
                    </Select.Option>
                  ))
                )}
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
          <Row justify="end" style={{ marginBottom: 16 }}>
            <Col>
              <Button type="primary" onClick={handleExportExcel}>
                Xuất Excel
              </Button>
            </Col>
          </Row>
        </Card>

        {data?.docs && data.docs.length > 0 && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={data?.totalRevenue || 0}
                  formatter={(value) => formatCurrency(value as number)}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng số lượng bán"
                  value={data?.totalQuantity || 0}
                  formatter={(value) => value.toLocaleString()}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng số sản phẩm"
                  value={data?.totalDocs || 0}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng số đơn hàng"
                  value={data?.totalOrderCount || 0}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Card title="Top sản phẩm theo số lượng bán">
              {data?.docs && data.docs.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.docs.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="quantity"
                      fill="#1890ff"
                      name="Số lượng bán"
                    />
                  </BarChart>
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
            <Card title="Sản phẩm tồn kho">
              {data?.docs && data.docs.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data?.docs?.slice(0, 10) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="totalStock" fill="#fa541c" name="Tồn kho" />
                  </BarChart>
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
            <Card
              title="Tỷ lệ sản phẩm theo danh mục"
              style={{ marginTop: 16 }}
            >
              {categoryPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
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

        <Table
          columns={tableColumns}
          dataSource={data?.docs.slice(0, filters.limit) || []}
          rowKey="id"
          scroll={{ x: 1200 }}
        />
      </List>
    </div>
  );
};

export default TopProductsStatistics;
