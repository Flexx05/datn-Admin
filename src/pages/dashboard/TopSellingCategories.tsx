// src/components/dashboard/TopSellingCategoriesPieChart.tsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { IProduct } from "../../interface/product";
import { Card } from "antd";
import { DashboardFilterValue } from "./DashboardFilter";
import { useMemo } from "react";
import dayjs from "dayjs";

type Props = {
  productsData: IProduct[];
  ordersData: any;
  isLoading: boolean;
  filter: DashboardFilterValue; // Thêm filter để lọc dữ liệu
};

const COLORS = [
  "#1890ff",
  "#fa541c",
  "#52c41a",
  "#722ed1",
  "#fadb14",
  "#eb2f96",
  "#13c2c2",
  "#fa8c16",
  "#b37feb",
  "#ff7875",
];

const TopSellingCategories = ({
  productsData,
  ordersData,
  isLoading,
  filter,
}: Props) => {
  const productSales: Record<string, number> = {};
  const categorySalesMap: Record<string, number> = {};
  const unknownCategories: {
    productId: string;
    productName?: string;
    realCategory?: any;
  }[] = [];

  const orderSuccess = useMemo(() => {
    if (!ordersData?.data) return [];
    let filtered = ordersData.data.filter(
      (order: any) => order.status === 4 && order.paymentStatus === 1
    );
    if (filter.startDate && filter.endDate) {
      const start = new Date(filter.startDate);
      const end = new Date(dayjs(filter.endDate).endOf("day").toISOString());
      filtered = filtered.filter((order: any) => {
        const createdAt = new Date(order.createdAt);
        return createdAt >= start && createdAt <= end;
      });
    } else if (filter.month && filter.year) {
      filtered = filtered.filter((order: any) => {
        const createdAt = new Date(order.createdAt);
        return (
          createdAt.getMonth() + 1 === filter.month &&
          createdAt.getFullYear() === filter.year
        );
      });
    }
    return filtered;
  }, [ordersData, filter]);

  orderSuccess?.forEach((order: any) => {
    order?.items?.forEach((item: any) => {
      const id = item.productId;
      productSales[id] = (productSales[id] || 0) + (item.quantity || 0);
    });
  });

  for (const [productId, soldQty] of Object.entries(productSales)) {
    const product = productsData.find((p) => p._id === productId);
    if (!product) {
      unknownCategories.push({
        productId,
        productName: "(Không tìm thấy sản phẩm)",
        realCategory: undefined,
      });
      continue;
    }

    const rawCategory = product.categoryName;
    if (!rawCategory || rawCategory.trim() === "") {
      unknownCategories.push({
        productId,
        productName: product.name,
        realCategory: rawCategory,
      });
      continue;
    }

    const category = rawCategory.trim();
    categorySalesMap[category] = (categorySalesMap[category] || 0) + soldQty;
  }

  const pieData = Object.entries(categorySalesMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const totalSold = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card
      title="Tỷ lệ sản phẩm theo danh mục"
      bordered={false}
      loading={isLoading}
    >
      <ResponsiveContainer width="100%" height={350}>
        {pieData.length > 0 ? (
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, value }) =>
                `${name} (${(((value ?? 0) / totalSold) * 100).toFixed(1)}%)`
              }
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
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

export default TopSellingCategories;
