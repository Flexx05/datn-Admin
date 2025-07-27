import {
  CalendarOutlined,
  EnvironmentOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import {
  Input as AntInput,
  Select as AntSelect,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router";
import { API_URL } from "../../config/dataProvider";
import { IOrderDetail, Order } from "../../interface/order";
import { formatCurrency } from "./formatCurrency";
import Loader from "../../utils/loading";

const { Text } = Typography;

const cancelReasons = [
  "Bão lũ giao hàng không được",
  "Shipper ốm",
  "Hết hàng",
  "Khác",
];

export const OrderShow = () => {
  const { id } = useParams();
  const { queryResult } = useShow<Order>({
    resource: "order",
    id: id,
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " +
        (error.response?.data?.message || error.response?.data?.error),
      description: "Không thể tải thông tin đơn hàng.",
      type: "error",
    }),
    meta: {
      transform: (response: any) => response.data,
    },
  });

  const { data: order, isLoading, refetch } = queryResult;
  const orderData: any | undefined = order?.data;
  console.log("Order Data:", orderData);

  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Hàm cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (
    newStatus: number,
    cancelReason?: string
  ) => {
    setLoadingAction(newStatus);
    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    try {
      const payload: any = { status: newStatus, userId: parsedUser?._id };
      if (newStatus === 5) {
        payload.paymentStatus = 3; // Update paymentStatus to 3 when canceling
        if (cancelReason) payload.cancelReason = cancelReason; // Include cancel reason if provided
      }
      await axios.patch(`${API_URL}/order/status/${orderData?._id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      message.success(`Cập nhật trạng thái đơn hàng thành công`);
      await refetch();
    } catch (error) {
      message.error("Cập nhật trạng thái đơn hàng thất bại");
    } finally {
      setLoadingAction(null);
    }
  };

  const showCancelModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelOrder = async (values: {
    reason: string;
    customReason?: string;
  }) => {
    const finalReason =
      values.reason === "Khác" && values.customReason
        ? values.customReason
        : values.reason;
    await handleUpdateStatus(5, finalReason);
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const getStatusDisplayText = (status: number): string => {
    const statusMap: { [key: number]: string } = {
      0: "Chờ xác nhận",
      1: "Đã xác nhận",
      2: "Đang giao hàng",
      3: "Đã giao hàng",
      4: "Hoàn thành",
      5: "Đã hủy",
    };
    return statusMap[status] || status?.toString();
  };

  const getPaymentStatusDisplayText = (status: number): string => {
    const statusMap: { [key: number]: string } = {
      0: "Chưa thanh toán",
      1: "Đã thanh toán",
      2: "Đã hoàn tiền",
      3: "Đã hủy",
    };
    return statusMap[status] || status?.toString();
  };

  // Hàm in đơn hàng
  const handlePrintOrder = () => {
    window.print();
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusColor = (status: number) => {
    if (status === 0) return "orange";
    if (status === 1) return "blue";
    if (status === 2) return "purple";
    if (status === 3) return "green";
    if (status === 4) return "cyan";
    if (status === 5) return "red";
    return "default";
  };

  const getPaymentStatusColor = (status: number) => {
    if (status === 0) return "orange";
    if (status === 1) return "green";
    if (status === 2) return "purple";
    if (status === 3) return "red";
    return "default";
  };

  const getPaymentMethodText = (method: string) => {
    const methodUpper = method?.toUpperCase();
    switch (methodUpper) {
      case "COD":
        return "Thanh toán khi nhận hàng (COD)";
      case "VNPAY":
        return "Thanh toán qua VNPAY";
      default:
        return method;
    }
  };

  // Quy trình giao hàng
  const deliverySteps = [
    {
      title: "Chờ xác nhận",
      description: "Đơn hàng đang chờ xác nhận",
    },
    {
      title: "Đã xác nhận",
      description: "Đơn hàng đã được xác nhận",
    },
    {
      title: "Đang giao hàng",
      description: "Đơn hàng đang được vận chuyển",
    },
    {
      title: "Đã giao hàng",
      description: "Đơn hàng đã giao thành công",
    },
    {
      title: "Hoàn thành",
      description: "Đơn hàng đã hoàn thành",
    },
  ];

  const getCurrentStep = (status: number) => {
    if (status === 5) return -1; // Đã hủy không hiển thị trong quy trình
    return Math.min(status, 4); // Giới hạn bước tối đa là 4 (Hoàn thành)
  };

  const productColumns = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_: any, record: IOrderDetail["items"][0]) => (
        <div>
          <strong>{record.productName}</strong>
        </div>
      ),
    },
    {
      title: "Phân loại",
      key: "variant",
      render: (_: any, record: IOrderDetail["items"][0]) => (
        <div>
          {record.variantAttributes?.length > 0 ? (
            <Space direction="vertical" size="small">
              {record.variantAttributes.map((attr: any, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <Text strong style={{ color: "#000" }}>
                    {attr.attributeName}:
                  </Text>{" "}
                  {attr.attributeName.toLowerCase().includes("màu") ? (
                    <Space size="small">
                      {attr.values?.map((value: string, valueIndex: number) => (
                        <Space key={valueIndex} size="small">
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              backgroundColor: value,
                              border: "1px solid #d9d9d9",
                              borderRadius: "2px",
                              display: "inline-block",
                              marginBottom: "-4px",
                              marginLeft: "6px",
                            }}
                          />
                        </Space>
                      ))}
                    </Space>
                  ) : (
                    <Text style={{ color: "#000" }}>
                      {attr.values && attr.values.length > 0
                        ? attr.values.join(", ")
                        : "N/A"}
                    </Text>
                  )}
                </div>
              ))}
            </Space>
          ) : (
            <Text>Không có phân loại</Text>
          )}
        </div>
      ),
    },
    {
      title: "Đơn giá",
      key: "price",
      render: (_: any, record: IOrderDetail["items"][0]) => (
        <Text strong>{formatCurrency(record.priceAtOrder)}</Text>
      ),
    },
    {
      title: "Số lượng",
      key: "quantity",
      render: (_: any, record: IOrderDetail["items"][0]) => (
        <Text strong>{record.quantity}</Text>
      ),
    },
    {
      title: "Thành tiền",
      key: "totalPrice",
      render: (_: any, record: IOrderDetail["items"][0]) => (
        <Text strong style={{ color: "#f5222d" }}>
          {formatCurrency(record.totalPrice)}
        </Text>
      ),
    },
  ];

  return (
    <Show
      isLoading={false}
      title={`Chi tiết đơn hàng ${orderData?.orderCode}`}
      headerButtons={() => (
        <Space>
          <Button icon={<PrinterOutlined />} onClick={handlePrintOrder}>
            In đơn hàng
          </Button>
        </Space>
      )}
    >
      <Spin spinning={isLoading} indicator={<Loader />}>
        <Row gutter={[24, 24]}>
          {/* Quy trình giao hàng */}
          <Col span={24}>
            <Card title="Quy trình giao hàng" size="small">
              {orderData?.status === 5 ? (
                <>
                  <Tag color="red">Đơn hàng đã bị hủy</Tag>
                  <p
                    style={{
                      marginTop: 8,
                      color: "#ff4d4f",
                      fontStyle: "italic",
                    }}
                  >
                    Lý do hủy:{" "}
                    {orderData?.cancelReason || "Không có lý do cụ thể"}
                  </p>
                </>
              ) : (
                <Steps
                  current={getCurrentStep(orderData?.status)}
                  items={deliverySteps}
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          </Col>

          {/* Thông tin tổng quan */}
          <Col span={24}>
            <Card title="Thông tin đơn hàng" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Mã đơn hàng">
                      <Text
                        strong
                        style={{ color: "#1890ff", fontSize: "16px" }}
                      >
                        {orderData?.orderCode}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày đặt hàng">
                      <Space>
                        <CalendarOutlined />
                        {formatDate(orderData?.createdAt)}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày giao hàng">
                      <Text>
                        {orderData?.status === 4 && orderData?.updatedAt
                          ? formatDate(orderData?.updatedAt)
                          : "Chưa xác định"}
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Trạng thái đơn hàng">
                      <Tag
                        color={getStatusColor(orderData?.status)}
                        style={{ fontSize: "14px" }}
                      >
                        {getStatusDisplayText(orderData?.status)}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                      <Text
                        strong
                        style={{ color: "#f5222d", fontSize: "18px" }}
                      >
                        {formatCurrency(orderData?.totalAmount)}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Cập nhật lần cuối">
                      <Text>{formatDate(orderData?.updatedAt)}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Địa chỉ giao hàng */}
          <Col span={12}>
            <Card title="Địa chỉ giao hàng" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <EnvironmentOutlined /> {orderData?.recipientInfo.name} (
                  {orderData?.recipientInfo.phone})
                </div>
                <div>
                  <strong>{orderData?.shippingAddress}</strong>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Thông tin thanh toán */}
          <Col span={12}>
            <Card title="Thông tin thanh toán" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Phương thức thanh toán">
                  {getPaymentMethodText(orderData?.paymentMethod)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái thanh toán">
                  <Tag color={getPaymentStatusColor(orderData?.paymentStatus)}>
                    {getPaymentStatusDisplayText(orderData?.paymentStatus)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Danh sách sản phẩm */}
          <Col span={24}>
            <Card title="Danh sách sản phẩm" size="small">
              <Table
                dataSource={orderData?.items}
                columns={productColumns}
                rowKey="_id"
                pagination={false}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text strong>Tạm tính:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong>
                          {formatCurrency(orderData?.subtotal)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text>Phí vận chuyển:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text>{formatCurrency(orderData?.shippingFee)}</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    {orderData?.discountAmount > 0 && (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}>
                          <Text>Giảm giá:</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <Text style={{ color: "#52c41a" }}>
                            -{formatCurrency(orderData?.discountAmount)}
                          </Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text strong style={{ fontSize: "16px" }}>
                          Tổng cộng:
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text
                          strong
                          style={{ fontSize: "16px", color: "#f5222d" }}
                        >
                          {formatCurrency(orderData?.totalAmount)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>
          </Col>

          {/* Voucher (nếu có) */}
          {orderData?.voucherId && orderData?.voucherId.length > 0 && (
            <Col span={24}>
              <Card title="Voucher sử dụng" size="small">
                <Space wrap>
                  {orderData?.voucherId.map((voucherId: any, index: number) => (
                    <Tag key={index} color="green">
                      {voucherId}
                    </Tag>
                  ))}
                </Space>
              </Card>
            </Col>
          )}

          {/* Hành động */}
          <Col span={24}>
            <Card title="Hành động" size="small">
              <Space>
                {orderData?.status === 0 && (
                  <>
                    <Popconfirm
                      title="Xác nhận đơn hàng này?"
                      onConfirm={() => handleUpdateStatus(1)}
                      okText="Xác nhận"
                      cancelText="Huỷ"
                    >
                      <Button type="primary" loading={loadingAction === 1}>
                        Xác nhận đơn hàng
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title="Huỷ đơn hàng này?"
                      onConfirm={showCancelModal}
                      okText="Huỷ đơn"
                      cancelText="Không"
                    >
                      <Button danger loading={loadingAction === 5}>
                        Huỷ đơn hàng
                      </Button>
                    </Popconfirm>
                  </>
                )}
                {orderData?.status === 1 && (
                  <>
                    <Popconfirm
                      title="Chuyển đơn hàng sang trạng thái đang giao?"
                      onConfirm={() => handleUpdateStatus(2)}
                      okText="Giao hàng"
                      cancelText="Huỷ"
                    >
                      <Button type="primary" loading={loadingAction === 2}>
                        Bắt đầu giao hàng
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title="Huỷ đơn hàng này?"
                      onConfirm={showCancelModal}
                      okText="Huỷ đơn"
                      cancelText="Không"
                    >
                      <Button danger loading={loadingAction === 5}>
                        Huỷ đơn hàng
                      </Button>
                    </Popconfirm>
                  </>
                )}
                {orderData?.status === 2 && (
                  <Popconfirm
                    title="Xác nhận đã giao hàng thành công?"
                    onConfirm={() => handleUpdateStatus(3)}
                    okText="Đã giao"
                    cancelText="Huỷ"
                  >
                    <Button type="primary" loading={loadingAction === 3}>
                      Xác nhận đã giao
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </Card>
          </Col>

          <Modal
            title="Hủy đơn hàng"
            visible={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
            className="rounded-lg"
          >
            <Form form={form} onFinish={handleCancelOrder} layout="vertical">
              <Form.Item
                name="reason"
                label="Lý do hủy"
                rules={[{ required: true, message: "Vui lòng chọn lý do hủy" }]}
              >
                <AntSelect placeholder="Chọn lý do">
                  {cancelReasons.map((reason) => (
                    <AntSelect.Option key={reason} value={reason}>
                      {reason}
                    </AntSelect.Option>
                  ))}
                </AntSelect>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.reason !== currentValues.reason
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("reason") === "Khác" ? (
                    <Form.Item
                      name="customReason"
                      label="Lý do cụ thể"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập lý do cụ thể",
                        },
                      ]}
                    >
                      <AntInput.TextArea
                        rows={3}
                        placeholder="Nhập lý do hủy đơn hàng"
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
              <Form.Item>
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={handleModalCancel}
                    style={{ marginRight: "16px" }}
                  >
                    Hủy bỏ
                  </Button>
                  <Button type="primary" htmlType="submit" danger>
                    Xác nhận hủy
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Modal>
        </Row>
      </Spin>
    </Show>
  );
};
