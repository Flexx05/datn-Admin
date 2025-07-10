import { useEffect, useState } from "react";
import { Table, Card, DatePicker, Select, Space, Button } from "antd";
import { Column } from "@ant-design/plots";
import { Pie } from "@ant-design/plots";
import { axiosInstance } from "../../utils/axiosInstance";
import { useSelect } from "@refinedev/antd";
import { IBrand } from "../../interface/brand";
import { ICategory } from "../../interface/category";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

type FilterState = {
  brandId?: string;
  categoryId?: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
};

const TopProductsStatistics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    brandId: undefined,
    categoryId: undefined,
    dateRange: null,
  });

  const { selectProps: brandSelectProps } = useSelect<IBrand>({
    resource: "brand",
    optionLabel: "name",
    optionValue: "_id",
  });

  const { selectProps: categorySelectProps } = useSelect<ICategory>({
    resource: "category",
    optionLabel: "name",
    optionValue: "_id",
  });

  const fetchTopProducts = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 10 };

      if (filters.brandId) params.brandId = filters.brandId;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.startDate = filters.dateRange[0].format("YYYY-MM-DD");
        params.endDate = filters.dateRange[1].format("YYYY-MM-DD");
      }

      const res = await axiosInstance.get("/statistics/top-products", {
        params,
      });
      setData(res.data.docs || []);
    } catch (error) {
      console.error("Error fetching top products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, [filters]);

  const columns = [
    { title: "Sản phẩm", dataIndex: "name", key: "name" },
    { title: "Thương hiệu", dataIndex: "brandName", key: "brandName" },
    { title: "Danh mục", dataIndex: "categoryName", key: "categoryName" },
    { title: "Số lượng bán", dataIndex: "quantitySold", key: "quantitySold" },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (value: number) =>
        value.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Giá trung bình",
      dataIndex: "averagePrice",
      key: "averagePrice",
      render: (value: number) =>
        value.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
  ];

  const barChartConfig = {
    data,
    xField: "name",
    yField: "quantitySold",
    label: { position: "middle", style: { fill: "#fff" } },
    xAxis: { label: { autoHide: true, autoRotate: false } },
    meta: {
      name: { alias: "Sản phẩm" },
      quantitySold: { alias: "Số lượng bán" },
    },
  };

  const pieChartConfig = {
    data,
    angleField: "totalRevenue",
    colorField: "name",
    radius: 1,
    label: { type: "outer", content: "{name} ({percentage})" },
    interactions: [{ type: "element-active" }],
  };

  return (
    <div>
      <h1>Thống kê sản phẩm bán chạy</h1>

      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Select
            {...brandSelectProps}
            placeholder="Lọc theo thương hiệu"
            allowClear
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                brandId: value as unknown as string | undefined,
              }))
            }
          />
          <Select
            {...categorySelectProps}
            placeholder="Lọc theo danh mục"
            allowClear
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                categoryId: value as unknown as string | undefined,
              }))
            }
          />
          <RangePicker
            onChange={(range) =>
              setFilters((prev) => ({
                ...prev,
                dateRange:
                  range && range[0] && range[1] ? [range[0], range[1]] : null,
              }))
            }
            allowClear
          />
          <Button
            onClick={() =>
              setFilters({
                brandId: undefined,
                categoryId: undefined,
                dateRange: null,
              })
            }
          >
            Đặt lại
          </Button>
        </Space>
      </Card>

      <Card title="Bảng thống kê" style={{ marginBottom: 24 }}>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="productId"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Card title="Biểu đồ số lượng bán (cột)" style={{ marginBottom: 24 }}>
        <Column {...barChartConfig} />
      </Card>

      <Card title="Biểu đồ doanh thu (tròn)">
        <Pie {...pieChartConfig} />
      </Card>
    </div>
  );
};

export default TopProductsStatistics;
