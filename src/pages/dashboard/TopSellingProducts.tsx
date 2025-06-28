import { List, Avatar } from "antd";
import { Link } from "react-router-dom";
import { useList } from "@refinedev/core";
import { IProduct } from "../../interface/product";

interface IOrderItem {
  productId: string;
  quantity: number;
}

interface IOrder {
  items: IOrderItem[];
}

const TopSellingProducts: React.FC = () => {
  const { data: productsData } = useList<IProduct>({
    resource: "product",
    pagination: { mode: "off" },
    filters: [{ field: "isActive", operator: "eq", value: true }],
  });

  const { data: ordersData } = useList<IOrder>({
    resource: "order",
    pagination: { mode: "off" },
  });

  // Tính tổng số lượng bán cho từng sản phẩm
  const productSales: Record<string, number> = {};
  ordersData?.data?.forEach((order: IOrder) => {
    order.items?.forEach((item) => {
      const id = item.productId;
      productSales[id] = (productSales[id] || 0) + (item.quantity || 0);
    });
  });

  // Lấy top 10 productId bán chạy nhất
  const topProductIds = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([productId]) => productId);

  // Lấy thông tin chi tiết sản phẩm từ productsData
  const topProducts: (IProduct & { totalSold: number })[] =
    topProductIds
      .map((id) => {
        const product = productsData?.data?.find((p) => p._id === id);
        return product ? { ...product, totalSold: productSales[id] } : null;
      })
      .filter(
        (item): item is IProduct & { totalSold: number } => item !== null
      ) || [];

  return (
    <List
      dataSource={topProducts}
      renderItem={(item: IProduct & { totalSold: number }) => (
        <List.Item
          key={item._id}
          actions={[
            <span key="sold">Đã bán: {item.totalSold}</span>,
            <Link key="view" to={`/product/id/${item._id}`}>
              View
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
