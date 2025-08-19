import {
  CalendarOutlined,
  EnvironmentOutlined,
  PrinterOutlined,
  CheckOutlined,
  CloseOutlined,
  TruckOutlined,
  UndoOutlined,
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
import { axiosInstance } from "../../utils/axiosInstance";
import ButtonChat from "./ButtonChat"; // Import ButtonChat

const { Text } = Typography;

const cancelReasons = [
  "Bão lũ giao hàng không được",
  "Shipper ốm",
  "Hết hàng",
  "Khác",
];

// Component xử lý hành động (tái sử dụng từ OrderList)
const OrderActions: React.FC<{
  record: Order;
  loadingId: number | null;
  onChangeStatus: (
    record: Order,
    newStatus: number,
    reason?: string,
    paymentStatus?: number
  ) => Promise<void>;
  onShowCancelModal: (id: string) => void;
}> = ({ record, loadingId, onChangeStatus, onShowCancelModal }) => {
  const isLoading = loadingId === record.status;

  // Nút chat
  const chatButton = <ButtonChat record={record} />;

  switch (record.status) {
    case 0: // Chờ xác nhận
      return (
        <Space>
          <Popconfirm
            title="Xác nhận đơn hàng này?"
            onConfirm={() => onChangeStatus(record, 1)}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ loading: isLoading }}
          >
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              loading={isLoading}
            >
              Xác nhận
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Hủy đơn hàng này?"
            onConfirm={() => onShowCancelModal(record._id)}
            okText="Hủy đơn"
            cancelText="Hủy"
            okButtonProps={{ loading: isLoading }}
          >
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              loading={isLoading}
            >
              Hủy
            </Button>
          </Popconfirm>
          {chatButton}
        </Space>
      );

    case 1: // Đã xác nhận
      return (
        <Space>
          <Popconfirm
            title="Xác nhận giao hàng cho đơn hàng này?"
            onConfirm={() => onChangeStatus(record, 2)}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ loading: isLoading }}
          >
            <Button size="small" icon={<TruckOutlined />} loading={isLoading}>
              Giao hàng
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Hủy đơn hàng này?"
            onConfirm={() => onShowCancelModal(record._id)}
            okText="Hủy đơn"
            cancelText="Hủy"
            okButtonProps={{ loading: isLoading }}
          >
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              loading={isLoading}
            >
              Hủy
            </Button>
          </Popconfirm>
          {chatButton}
        </Space>
      );

    case 2: // Đang giao
      return (
        <Space>
          <Popconfirm
            title="Xác nhận đơn hàng đã giao thành công?"
            onConfirm={() => onChangeStatus(record, 3)}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ loading: isLoading }}
          >
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              loading={isLoading}
            >
              Đã giao
            </Button>
          </Popconfirm>
          {chatButton}
        </Space>
      );

    case 4: // Hoàn thành
      return <Space>{chatButton}</Space>;

    case 5: // Đã hủy
      return <Space>{record.completedBy !== "system" && chatButton}</Space>;

    case 6: // Yêu cầu hoàn hàng
      return (
        <Space>
          <Tag color="cyan" icon={<UndoOutlined />}>
            Hoàn hàng
          </Tag>
          {chatButton}
        </Space>
      );

    default:
      return null;
  }
};

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
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [form] = Form.useForm();

  // Hàm cập nhật trạng thái đơn hàng
  const handleChangeStatus = async (
    record: Order,
    newStatus: number,
    reason?: string,
    paymentStatus?: number
  ) => {
    setLoadingAction(newStatus);
    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      let effectivePaymentStatus =
        paymentStatus !== undefined ? paymentStatus : record.paymentStatus;

      if (newStatus === 3) {
        effectivePaymentStatus = 1;
      }

      await axiosInstance.patch(`${API_URL}/order/status/${record._id}`, {
        status: newStatus,
        paymentStatus: effectivePaymentStatus,
        ...(reason && { cancelReason: reason }),
        userId: user?._id,
      });

      await refetch();
      message.success("Cập nhật trạng thái thành công");
    } catch (error: any) {
      console.error(error);
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoadingAction(null);
    }
  };

  const showCancelModal = (id: string) => {
    setIsModalVisible(true);
  };

  const handleCancelOrder = async (values: {
    reason: string;
    customReason?: string;
  }) => {
    setIsCancelLoading(true);
    try {
      const finalReason =
        values.reason === "Khác" && values.customReason
          ? values.customReason
          : values.reason;

      if (orderData) {
        await handleChangeStatus(orderData, 5, finalReason, 3);
        if (
          orderData.paymentMethod === "VNPAY" ||
          (orderData.paymentMethod === "VI" && orderData.paymentStatus === 1)
        ) {
          const refundResponse = await axiosInstance.post(
            "http://localhost:8080/api/wallet/cancel-refund",
            {
              orderId: orderData._id,
              type: 0,
              amount: orderData.totalAmount,
              status: 1,
              description: `Trả lại tiền đơn hàng đã hủy ${orderData.orderCode}: ${finalReason}`,
            }
          );
          const refundData = await refundResponse.data;
          if (!refundData.success) {
            message.error("Yêu cầu hoàn tiền thất bại");
            return;
          }
        }
      }
      setIsModalVisible(false);
      form.resetFields();
      message.success("Hủy đơn hàng thành công");
    } catch (error: any) {
      message.error(error.message || "Hủy đơn hàng thất bại");
      console.error(error);
    } finally {
      setIsCancelLoading(false);
    }
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
      6: "Yêu cầu hoàn hàng", // Thêm trạng thái hoàn hàng
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
    if (status === 6) return "cyan"; // Màu cho trạng thái hoàn hàng
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

  const deliverySteps = [
    {
      title: "Chờ xác nhận",
      description: "Đơn hàng đang chờ xác nhận",
      status: 0,
    },
    {
      title: "Đã xác nhận",
      description: "Đơn hàng đã được xác nhận",
      status: 1,
    },
    {
      title: "Đang giao hàng",
      description: "Đơn hàng đang được vận chuyển",
      status: 2,
    },
    {
      title: "Đã giao hàng",
      description: "Đơn hàng đã giao thành công",
      status: 3,
    },
    {
      title: "Hoàn thành",
      description: "Đơn hàng đã hoàn thành",
      status: 4,
    },
  ];

  const getCurrentStep = (status: number) => {
    if (status === 5 || status === 6) return -1; // Xử lý cả trạng thái hoàn hàng
    return Math.min(status, 4);
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
              {orderData?.status === 5 || orderData?.status === 6 ? (
                <>
                  <Tag color={orderData?.status === 5 ? "red" : "cyan"}>
                    {orderData?.status === 5 ? "Đơn hàng đã bị hủy" : "Yêu cầu hoàn hàng"}
                  </Tag>
                  {orderData?.status === 5 && (
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
                  )}
                  {orderData?.statusHistory?.find((h: any) => h.status === 5) && (
                    <p style={{ marginTop: 8, color: "#666", fontSize: "12px" }}>
                      Thời gian hủy:{" "}
                      {formatDate(
                        orderData.statusHistory.find((h: any) => h.status === 5)
                          .changedAt
                      )}
                    </p>
                  )}
                </>
              ) : (
                <Steps
                  current={getCurrentStep(orderData?.status)}
                  items={deliverySteps.map((step, index) => {
                    const currentStep = getCurrentStep(orderData?.status);
                    const isActive = currentStep === index;
                    const isCompleted = currentStep > index;
                    const history = orderData?.statusHistory?.find(
                      (h: any) => h.status === step.status
                    );

                    return {
                      ...step,
                      icon: (
                        <div
                          className={`w-9 h-9 flex items-center justify-center rounded-full text-white text-xs font-medium
                            ${isCompleted || isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          {index + 1}
                        </div>
                      ),
                      title: <span className="text-base">{step.title}</span>,
                      description: (
                        <div>
                          <span>{step.description}</span>
                          {history && (
                            <p
                              style={{
                                color: "#666",
                                fontSize: "12px",
                                marginTop: 4,
                              }}
                            >
                              {formatDate(history.changedAt)}
                            </p>
                          )}
                        </div>
                      ),
                    };
                  })}
                  style={{ marginTop: 16 }}
                  direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'}
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
                        {orderData?.deliveryDate
                          ? formatDate(orderData?.deliveryDate)
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
                <div>
                  <strong>Ghi chú:</strong><p>{orderData?.note}</p>
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
              {orderData && (
                <OrderActions
                  record={orderData}
                  loadingId={loadingAction}
                  onChangeStatus={handleChangeStatus}
                  onShowCancelModal={showCancelModal}
                />
              )}
            </Card>
          </Col>

          <Modal
            title="Hủy đơn hàng"
            open={isModalVisible}
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
                  <Button
                    type="primary"
                    htmlType="submit"
                    danger
                    loading={isCancelLoading}
                  >
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