import { Avatar, List } from "antd";
import { Link } from "react-router-dom";
import { IProduct } from "../../interface/product";
import { DashboardFilterValue } from "./DashboardFilter";
import { useMemo } from "react";
import dayjs from "dayjs";

type Props = {
  productsData: IProduct[];
  ordersData: any;
  isLoading: boolean;
  filter: DashboardFilterValue;
};

const TopSellingProducts = ({
  productsData,
  ordersData,
  isLoading,
  filter,
}: Props) => {
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

  // Tính tổng số lượng bán cho từng sản phẩm
  const productSales: Record<string, number> = {};
  orderSuccess?.forEach((order: any) => {
    order?.items?.forEach((item: any) => {
      const id = item.productId;
      productSales[id] = (productSales[id] || 0) + (item.quantity || 0);
    });
  });

  // Lấy top 10 productId bán chạy nhất
  const topProductIds = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([productId]) => productId);

  // Lấy thông tin chi tiết sản phẩm từ productsData
  const topProducts: (IProduct & { totalSold: number })[] =
    topProductIds
      .map((id) => {
        const product = productsData?.find((p) => p._id === id);
        return product ? { ...product, totalSold: productSales[id] } : null;
      })
      .filter((item): item is IProduct & { totalSold: number } => item !== null)
      .slice(0, 10) || [];

  return (
    <List
      dataSource={topProducts}
      loading={isLoading}
      renderItem={(item: IProduct & { totalSold: number }) => (
        <List.Item
          key={item._id}
          actions={[
            <span key="sold">Đã bán: {item.totalSold}</span>,
            <Link key="view" to={`/product/id/${item._id}`}>
              Chi tiết
            </Link>,
          ]}
        >
          <List.Item.Meta
            avatar={
              <Avatar
                src={item.image?.[0]}
                shape="square"
                style={{ backgroundColor: "#f0f0f0" }}
              />
            }
            title={<Link to={`/product/id/${item._id}`}>{item.name}</Link>}
            description={`${item.categoryName || "Danh mục không xác định"} - ${
              item.brandName || "Thương hiệu không xác định"
            }`}
          />
        </List.Item>
      )}
    />
  );
};

export default TopSellingProducts;
