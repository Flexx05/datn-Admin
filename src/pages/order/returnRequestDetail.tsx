import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Show } from "@refinedev/antd";
import { Button, Card, Descriptions, Empty, List, message, Modal, Popconfirm, Space, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { API_URL } from "../../config/dataProvider";
import { socket } from "../../socket";
import { axiosInstance } from "../../utils/axiosInstance";
import { formatCurrency } from "./formatCurrency";

// Định nghĩa interface cho yêu cầu hoàn hàng
interface ReturnRequest {
  _id: string;
  orderId: {
    _id: string;
    orderCode: string;
    totalAmount: number;
    recipientInfo?: {
      name: string;
      phone: string;
      email: string;
    };
    shippingAddress?: string;
  };
  products: {
    productId: string;
    quantity: number;
    price: number;
    _id: string;
  }[];
  reason: string;
  refundAmount: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

// Định nghĩa interface cho sản phẩm
interface Product {
  _id: string;
  name: string;
  image: string[];
}

const returnStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: "ĐANG CHỜ", color: "orange" },
  1: { text: "ĐÃ DUYỆT", color: "blue" },
  2: { text: "Đã nhận hàng", color: "cyan" },
  3: { text: "ĐÃ HOÀN TIỀN", color: "green" },
  4: { text: "ĐÃ TỪ CHỐI", color: "red" },
};

export const ReturnRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Lấy dữ liệu chi tiết yêu cầu hoàn hàng
  useEffect(() => {
    const fetchReturnRequest = async () => {
      try {
        const response = await axiosInstance.get(`${API_URL}/return-requests/${id} `);
        console.log("Return Request Response:", response.data); // Debug
        setReturnRequest(response.data.data);
        setLoading(false);
      } catch (error: any) {
        message.error("Lỗi khi tải chi tiết yêu cầu hoàn hàng");
        console.error("Fetch Return Request Error:", error);
        setLoading(false);
      }
    };
    fetchReturnRequest();
  }, [id]);

  // Lấy thông tin sản phẩm theo productId
  useEffect(() => {
    if (returnRequest?.products?.length) {
      const fetchProducts = async () => {
        setProductsLoading(true);
        try {
          const productPromises = returnRequest.products.map(async (product) => {
            try {
              const response = await axiosInstance.get(`${API_URL}/product/id/${product.productId} `);
              console.log(`Product ${product.productId} Response: `, response.data); // Debug
              return {
                _id: product.productId,
                name: response.data?.name || `Sản phẩm ${product.productId} `,
                image: response.data?.image || [],
              };
            } catch (error) {
              console.error(`Error fetching product ${product.productId}: `, error); // Debug
              return {
                _id: product.productId,
                name: `Sản phẩm ${product.productId} `,
                image: [],
              };
            }
          });
          const productResults = await Promise.all(productPromises);
          const productMap = productResults.reduce((acc, product) => {
            acc[product._id] = product;
            return acc;
          }, {} as Record<string, Product>);
          setProducts(productMap);
          console.log("Products State:", productMap); // Debug
        } catch (error: any) {
          message.error("Lỗi khi tải thông tin sản phẩm");
          console.error("Fetch Products Error:", error);
        } finally {
          setProductsLoading(false);
        }
      };
      fetchProducts();
    }
  }, [returnRequest]);

  // Lắng nghe sự kiện socket để cập nhật realtime
  useEffect(() => {
    const handleChange = async () => {
      try {
        const response = await axiosInstance.get(`${API_URL}/return-requests/${id}`);
        setReturnRequest(response.data.data);
      } catch (error: any) {
        // Không hiển thị lỗi để tránh làm phiền người dùng
      }
    };
    socket.on("return-request-status-changed", handleChange);
    return () => {
      socket.off("return-request-status-changed", handleChange);
    };
  }, [id]);

  // Xử lý thay đổi trạng thái yêu cầu hoàn hàng
  const handleChangeStatus = async (newStatus: number) => {
    setActionLoading(true);
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    try {
      if (newStatus === 3) {
        await axiosInstance.patch(`${API_URL}/order/status/${returnRequest?.orderId?._id}`,
          {
            status: 4,
            paymentStatus: 2,
            userId: user?._id,
          }
        );
        // Cập nhật tổng tiền hoàn và tổng đơn hàng
        await axiosInstance.patch(
          `${API_URL}/order/update-return-order/${returnRequest?.orderId?._id}`,
          {}
        );
        await axiosInstance.post(
          `${API_URL}/wallet/cancel-refund`,
          {
            orderId: returnRequest?.orderId?._id,
            type: 0,
            amount: returnRequest?.refundAmount,
            status: 1,
            description: `Hoàn tiền cho yêu cầu hoàn hàng đơn ${returnRequest?.orderId?.orderCode}: ${returnRequest?.reason}`,
            returnRequestId: returnRequest?._id,
          }
        );

      }
      if (newStatus === 4) {
        await axiosInstance.patch(
          `${API_URL}/order/status/${returnRequest?.orderId?._id}`,
          {
            status: 4,
            paymentStatus: 1,
            userId: user?._id,
          }
        );
        await axiosInstance.patch(`${API_URL}/order/update-item-status/${returnRequest?.orderId?._id}`, { items: [] });
      }

      await axiosInstance.patch(`${API_URL}/return-requests/${id}/status`, { status: newStatus });
      message.success("Cập nhật trạng thái yêu cầu hoàn hàng thành công");
      setReturnRequest((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (error: any) {
      message.error("Cập nhật trạng thái yêu cầu hoàn hàng thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!returnRequest) {
    return <div>Không tìm thấy yêu cầu hoàn hàng</div>;
  }

  return (
    <Show
      title={`Chi tiết yêu cầu hoàn hàng #${returnRequest.orderId.orderCode}`}
      breadcrumb={false}
    >
      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        {/* Thông tin đơn hàng */}
        <Card title="Thông tin đơn hàng" bordered>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã đơn hàng">
              <Tag color="blue">#{returnRequest.orderId.orderCode}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {returnRequest.orderId.recipientInfo?.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {returnRequest.orderId.recipientInfo?.phone || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {returnRequest.orderId.recipientInfo?.email || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng">
              {returnRequest.orderId.shippingAddress || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền đơn hàng">
              <span style={{ fontWeight: 500, color: "#d4380d" }}>
                {formatCurrency(returnRequest.orderId.totalAmount)}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin yêu cầu hoàn hàng */}
        <Card title="Thông tin yêu cầu hoàn hàng" bordered>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Lý do hoàn">
              {returnRequest.reason || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền hoàn">
              <span style={{ fontWeight: 500, color: "#d4380d" }}>
                {formatCurrency(returnRequest.refundAmount)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={returnStatusMap[returnRequest.status]?.color} style={{ fontWeight: "bold" }}>
                {returnStatusMap[returnRequest.status]?.text || returnRequest.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDate(returnRequest.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">
              {formatDate(returnRequest.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Danh sách sản phẩm */}
        <Card title="Sản phẩm yêu cầu hoàn" bordered>
          {productsLoading ? (
            <div>Đang tải sản phẩm...</div>
          ) : returnRequest.products.length > 0 ? (
            <List
              dataSource={returnRequest.products}
              renderItem={(product) => {
                const productDetails = products[product.productId];
                const imageUrl = productDetails?.image?.[0] || "";
                return (
                  <List.Item key={product._id}>
                    <List.Item.Meta
                      avatar={
                        imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={productDetails?.name || "Sản phẩm"}
                            style={{ width: 50, height: 50, objectFit: "contain" }}
                            onError={(e) => {
                              e.currentTarget.src = "/default-image.jpg"; // Hình ảnh dự phòng
                            }}
                          />
                        ) : (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={null}
                            style={{ width: 50, height: 50 }}
                          />
                        )
                      }
                      title={productDetails?.name || `Mã sản phẩm: ${product.productId}`}
                      description={
                        <Space direction="vertical" size="small">
                          <span>Số lượng: {product.quantity}</span>
                          <span>
                            Giá: <span style={{ color: "#d4380d" }}>{formatCurrency(product.price)}</span>
                          </span>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          ) : (
            <Empty description="Không có sản phẩm nào trong yêu cầu hoàn hàng" />
          )}
        </Card>

        {/* Hình ảnh minh chứng */}
        <Card title="Hình ảnh minh chứng" bordered>
          {returnRequest.images && returnRequest.images.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 1, sm: 3, md: 4, lg: 5 }}
              dataSource={returnRequest.images}
              renderItem={(url, index) => (
                <List.Item>
                  <div
                    className="relative w-full h-20 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center bg-gray-100"
                    onClick={() => setPreviewImage(url)}
                  >
                    <img
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                      style={{ width: "80px", height: "80px" }}
                      onError={(e) => {
                        e.currentTarget.src = "/default-image.jpg"; // Hình ảnh dự phòng
                      }}
                    />
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có hình ảnh minh chứng"
            />
          )}
          <style>
            {`
              .image-list .ant-list-item {
                margin-bottom: 16px;
              }
              .image-list .ant-list-item img {
                transition: transform 0.3s ease;
              }
              .image-list .ant-list-item img:hover {
                transform: scale(1.05);
              }
              .image-list .ant-list-grid {
                max-height: 400px;
                overflow-y: auto;
                padding-right: 8px;
              }
              .image-list .ant-list-grid::-webkit-scrollbar {
                width: 6px;
              }
              .image-list .ant-list-grid::-webkit-scrollbar-thumb {
                background-color: #ccc;
                border-radius: 3px;
              }
              .image-list .ant-list-grid::-webkit-scrollbar-track {
                background-color: #f1f1f1;
              }
            `}
          </style>
        </Card>

        {/* Hành động */}
        {returnRequest.status === 0 && (
          <Card>
            <Space>
              <Popconfirm
                title="Chấp nhận yêu cầu hoàn hàng?"
                onConfirm={() => handleChangeStatus(1)}
                okText="Chấp nhận"
                cancelText="Hủy"
                okButtonProps={{ loading: actionLoading }}
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={actionLoading}
                >
                  Chấp nhận
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Từ chối yêu cầu hoàn hàng?"
                onConfirm={() => handleChangeStatus(4)}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{ loading: actionLoading }}
              >
                <Button danger icon={<CloseOutlined />} loading={actionLoading}>
                  Từ chối
                </Button>
              </Popconfirm>
            </Space>
          </Card>
        )}
        {returnRequest.status === 1 && (
          <Card>
            <Space>
              <Popconfirm
                title="Chấp nhận yêu cầu hoàn hàng?"
                onConfirm={() => handleChangeStatus(3)}
                okText="Chấp nhận"
                cancelText="Hủy"
                okButtonProps={{ loading: actionLoading }}
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={actionLoading}
                >
                  Hoàn tiền
                </Button>
              </Popconfirm>

            </Space>
          </Card>
        )}
      </Space>

      {/* Modal xem trước ảnh */}
      <Modal
        title="Xem trước hình ảnh"
        open={!!previewImage}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        width={700} // Tăng chiều rộng Modal
        bodyStyle={{ padding: 16, maxHeight: "600px", overflow: "auto" }} // Giới hạn chiều cao và thêm cuộn
      >
        {previewImage && (
          <div
            className="flex justify-center items-center"
            style={{
              maxWidth: "100%",
              maxHeight: "500px", // Giới hạn chiều cao container
              overflow: "hidden", // Ngăn tràn
            }}
          >
            <img
              src={previewImage}
              alt="Image preview"
              style={{
                maxWidth: "100%", // Đảm bảo không vượt quá container
                maxHeight: "500px", // Giới hạn chiều cao
                objectFit: "contain", // Giữ tỷ lệ hình ảnh
                borderRadius: "8px", // Bo góc nhẹ
              }}
              onError={(e) => {
                e.currentTarget.src = "/default-image.jpg"; // Hình ảnh dự phòng
              }}
            />
          </div>
        )}
      </Modal>
    </Show>
  );
};