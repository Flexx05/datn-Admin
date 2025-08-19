import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Show } from "@refinedev/antd";
import { Button, Card, Descriptions, List, message, Popconfirm, Modal, Empty, Space, Tag } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";

import { API_URL } from "../../config/dataProvider";
import { formatCurrency } from "./formatCurrency";
import { socket } from "../../socket";

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

// Trạng thái yêu cầu hoàn hàng
const returnStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Chờ xử lý", color: "orange" },
  1: { text: "Đã chấp nhận", color: "green" },
  2: { text: "Đã từ chối", color: "red" },
};

export const ReturnRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Lấy dữ liệu chi tiết yêu cầu hoàn hàng
  useEffect(() => {
    const fetchReturnRequest = async () => {
      try {
        const response = await axios.get(`${API_URL}/return-requests/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Request Data:", response.data);
        setReturnRequest(response.data.data);
        setLoading(false);
      } catch (error: any) {
        message.error("Lỗi khi tải chi tiết yêu cầu hoàn hàng");
        console.error(error);
        setLoading(false);
      }
    };
    fetchReturnRequest();
  }, [id]);

  // Lắng nghe sự kiện socket để cập nhật realtime
  useEffect(() => {
    const handleChange = () => {
      const fetchReturnRequest = async () => {
        try {
          const response = await axios.get(`${API_URL}/return-requests/${id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setReturnRequest(response.data.data);
        } catch (error: any) {
          console.error(error);
        }
      };
      fetchReturnRequest();
    };
    socket.on("return-request-status-changed", handleChange);
    return () => {
      socket.off("return-request-status-changed", handleChange);
    };
  }, [id]);

  // Xử lý thay đổi trạng thái yêu cầu hoàn hàng
  const handleChangeStatus = async (newStatus: number) => {
    setActionLoading(true);
    try {
      await axios.patch(
        `${API_URL}/return-requests/${id}/status`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Cập nhật trạng thái yêu cầu hoàn hàng thành công");
      setReturnRequest((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (error: any) {
      message.error("Cập nhật trạng thái yêu cầu hoàn hàng thất bại");
      console.error(error);
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
          <List
            dataSource={returnRequest.products}
            renderItem={(product) => (
              <List.Item>
                <List.Item.Meta
                  title={`Mã sản phẩm: ${product.productId}`}
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
            )}
          />
        </Card>

        {/* Hiển thị hình ảnh minh chứng */}
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
                      style={{ width: '80px', height: '80px' }}
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
                onConfirm={() => handleChangeStatus(2)}
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
      </Space>

      {/* Modal xem trước ảnh */}
      <Modal
        title="Xem trước hình ảnh"
        open={!!previewImage}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        width={760}
      >
        {previewImage && (
          <div className="flex justify-center">
            <img
              src={previewImage}
              alt="Image preview"
              className="w-full max-h-[500px] object-contain"
            />
          </div>
        )}
      </Modal>
    </Show>
  );
};