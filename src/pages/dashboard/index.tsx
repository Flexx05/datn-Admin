import {
  AppstoreOutlined,
  ShoppingOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { Card, Col, Row, Statistic, Typography } from "antd";
import type React from "react";
import { Link } from "react-router-dom";
import { IBrand } from "../../interface/brand";
import { ICategory } from "../../interface/category";
import { IProduct } from "../../interface/product";
import LineChartComponent from "./LineChartComponent";
import TopSellingProducts from "./TopSellingProducts";
import PieChartComponent from "./PieChartComponent";

const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const { data: productsData, isLoading: isLoadingProducts } =
    useList<IProduct>({
      resource: "product",
      pagination: { pageSize: 5 },
      filters: [
        {
          field: "isActive",
          operator: "eq",
          value: true,
        },
      ],
    });

  const { data: ordersData, isLoading: isLoadingOrders } = useList({
    resource: "order",
    pagination: { pageSize: 5 },
  });

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useList<ICategory>({
      resource: "category",
      filters: [
        {
          field: "isActive",
          operator: "eq",
          value: true,
        },
      ],
    });

  const { data: brandsData, isLoading: isLoadingBrands } = useList<IBrand>({
    resource: "brand",
    filters: [
      {
        field: "isActive",
        operator: "eq",
        value: true,
      },
    ],
  });

  const totalProducts = productsData?.total || 0;
  const totalOrders = ordersData?.total || 0;
  const totalCategories = categoriesData?.total || 0;
  const totalBrands = brandsData?.total || 0;

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Trang chủ</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng sản phẩm"
              value={totalProducts}
              loading={isLoadingProducts}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
            <div style={{ marginTop: 8 }}>
              <Link to="/product">Xem danh sách</Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng đơn hàng"
              value={totalOrders}
              loading={isLoadingOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div style={{ marginTop: 8 }}>
              <Link to="/orders">Xem danh sách</Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng danh mục"
              value={totalCategories}
              loading={isLoadingCategories}
              prefix={<TagsOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
            <div style={{ marginTop: 8 }}>
              <Link to="/category">Xem danh sách</Link>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Tổng thương hiệu"
              value={totalBrands}
              loading={isLoadingBrands}
              prefix={<TagsOutlined />}
              valueStyle={{ color: "#995ed5" }}
            />
            <div style={{ marginTop: 8 }}>
              <Link to="/category">Xem danh sách</Link>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Doanh thu" bordered={false}>
            <LineChartComponent />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <PieChartComponent />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Top 10 sản phẩm bán chạy" bordered={false}>
            <TopSellingProducts />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
