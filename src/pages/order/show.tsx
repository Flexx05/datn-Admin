import {
  CalendarOutlined,
  EnvironmentOutlined,
  PrinterOutlined
} from "@ant-design/icons";
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import {
  Button,
  Card,
  Col,
  Descriptions,
  message,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Typography
} from "antd";
import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router";
import { API_URL } from "../../config/dataProvider";
import { IOrderDetail } from "../../interface/order";

const { Title, Text } = Typography;

// Interface cập nhật theo API response

export const OrderShow = () => {
  const { id } = useParams();
  
  const { queryResult } = useShow<IOrderDetail>({
    resource: "order",
    id: id,
    errorNotification: (error: any) => ({
      message: "❌ Lỗi hệ thống " + (error.response?.data?.message || error.message),
      description: "Không thể tải thông tin đơn hàng.",
      type: "error",
    }),
    meta: {
      transform: (response: any) => response.data,
    },
  });

  const { data: order, isLoading } = queryResult;
  const orderData = order?.data
  console.log("Order Data:", orderData);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Hàm cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (newStatus: string) => {
    setLoadingAction(newStatus);
    try {
      await axios.patch(`${API_URL}/order/status/${orderData?._id}`, {
        status: newStatus,
      });
      message.success(`Cập nhật trạng thái đơn hàng thành công: ${newStatus}`);
    } catch (error) {
      message.error("Cập nhật trạng thái đơn hàng thất bại");
    } finally {
      setLoadingAction(null);
    }
  };

  const getStatusDisplayText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      "Cho xac nhan": "Chờ xác nhận",
      "Da xac nhan": "Đã xác nhận", 
      "Dang giao hang": "Đang giao hàng",
      "Da giao hang": "Đã giao hàng",
      "Hoan thanh": "Hoàn thành",
      "Da huy": "Đã hủy",
      "Chua thanh toan": 'Chưa thanh toán',
      "Da thanh toan": 'Đã thanh toán',
      "That bai": 'Thất bại',
      "Da hoan tien": 'Đã hoàn tiền'
    };

    return statusMap[status] || status;
  };

  // Hàm in đơn hàng
  const handlePrintOrder = () => {
    window.print();
  };

  // Hàm format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm format ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Hàm lấy màu cho trạng thái đơn hàng
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('cho') || statusLower.includes('pending')) return 'orange';
    if (statusLower.includes('xac nhan') || statusLower.includes('confirmed')) return 'blue';
    if (statusLower.includes('dang giao') || statusLower.includes('shipping')) return 'purple';
    if (statusLower.includes('da giao') || statusLower.includes('delivered')) return 'green';
    if (statusLower.includes('hoan thanh') || statusLower.includes('completed')) return 'cyan';
    if (statusLower.includes('huy') || statusLower.includes('cancelled')) return 'red';
    return 'default';
  };

  // Hàm lấy màu cho trạng thái thanh toán
  const getPaymentStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('chua') || statusLower.includes('pending')) return 'orange';
    if (statusLower.includes('da') || statusLower.includes('paid')) return 'green';
    if (statusLower.includes('that bai') || statusLower.includes('failed')) return 'red';
    if (statusLower.includes('hoan') || statusLower.includes('refunded')) return 'purple';
    return 'default';
  };

  // Hàm lấy text cho phương thức thanh toán
  const getPaymentMethodText = (method: string) => {
    const methodUpper = method.toUpperCase();
    switch (methodUpper) {
      case 'COD':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'VNPAY':
        return 'VNPay';
      case 'MOMO':
        return 'MoMo';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng';
      case 'CREDIT_CARD':
        return 'Thẻ tín dụng';
      default:
        return method;
    }
  };

  // Cột cho bảng sản phẩm
  const productColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: any, record: IOrderDetail['items'][0]) => (
        <div>
          <div><strong>{record.productName}</strong></div>
        </div>
      )
    },
    {
      title: 'Phân loại',
      key: 'variant',
      render: (_: any, record: IOrderDetail['items'][0]) => (
        <div>
          {record.variantAttributes?.length > 0 ? (
            <Space direction="vertical" size="small">
              {record.variantAttributes.map((attr: any, index: number) => (
                <div key={index} style={{ 
                  padding: '4px 8px', 
                  backgroundColor: 'Background', // Nền trong suốt
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  <Text strong style={{ color: '#000' }}> {/* Chữ màu đen */}
                    {attr.attributeName}:
                  </Text>{' '}
                  {attr.attributeName.toLowerCase().includes('màu') ? (
                    // Hiển thị màu sắc với ô màu
                    <Space size="small">
                      {attr.values?.map((value: string, valueIndex: number) => (
                        <Space key={valueIndex} size="small">
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              backgroundColor: value,
                              border: '1px solid #d9d9d9',
                              borderRadius: '2px',
                              display: 'inline-block',
                              marginBottom: '-4px',
                              marginLeft: '6px',
                            }}
                          />
                        </Space>
                      ))}
                    </Space>
                  ) : (
                    // Hiển thị thông thường cho các thuộc tính khác
                    <Text style={{ color: '#000' }}> {/* Chữ màu đen */}
                      {attr.values && attr.values.length > 0 
                        ? attr.values.join(', ') 
                        : 'N/A'
                      }
                    </Text>
                  )}
                </div>
              ))}
            </Space>
          ) : (
            <Tag color="default">Không có phân loại</Tag>
          )}
        </div>
      )
    },
    
    
    {
      title: 'Đơn giá',
      key: 'price',
      render: (_: any, record: IOrderDetail['items'][0]) => (
        <Text strong>{formatCurrency(record.priceAtOrder)}</Text>
      )
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_: any, record: IOrderDetail['items'][0]) => (
        <Text strong>{record.quantity}</Text>
      )
    },
    {
      title: 'Thành tiền',
      key: 'totalPrice',
      render: (_: any, record: IOrderDetail['items'][0]) => (
        <Text strong style={{ color: '#f5222d' }}>
          {formatCurrency(record.totalPrice)}
        </Text>
      )
    }
  ];

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!orderData) {
    return <div>Không tìm thấy đơn hàng</div>;
  }

  return (
    <Show
      title={`Chi tiết đơn hàng ${orderData.orderCode}`}
      headerButtons={({ defaultButtons }) => (
        <Space>
          {defaultButtons}
          <Button 
            icon={<PrinterOutlined />} 
            onClick={handlePrintOrder}
          >
            In đơn hàng
          </Button>
        </Space>
      )}
    >
      <Row gutter={[24, 24]}>
        {/* Thông tin tổng quan */}
        <Col span={24}>
          <Card title="Thông tin đơn hàng" size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Mã đơn hàng">
                    <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                      {orderData.orderCode}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đặt hàng">
                    <Space>
                      <CalendarOutlined />
                      {formatDate(orderData.createdAt)}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày giao hàng">
                    {orderData.expectedDeliveryDate ? formatDate(orderData.expectedDeliveryDate) : 'Chưa xác định'}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Trạng thái đơn hàng">
                    <Tag color={getStatusColor(orderData.status)} style={{ fontSize: '14px' }}>
                      {getStatusDisplayText(orderData.status)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền">
                    <Text strong style={{ color: '#f5222d', fontSize: '18px' }}>
                      {formatCurrency(orderData.totalAmount)}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Cập nhật lần cuối">
                    {formatDate(orderData.updatedAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Địa chỉ giao hàng */}
        <Col span={12}>
          <Card title="Địa chỉ giao hàng" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <EnvironmentOutlined /> {orderData.shippingAddress.address}
              </div>
              <div>
                <strong>{orderData.shippingAddress.city}, {orderData.shippingAddress.country}</strong>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Thông tin thanh toán */}
        <Col span={12}>
          <Card title="Thông tin thanh toán" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Phương thức thanh toán">
                {getPaymentMethodText(orderData.paymentMethod)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                <Tag color={getPaymentStatusColor(orderData.paymentStatus)}>
                  {getStatusDisplayText(orderData.paymentStatus)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Danh sách sản phẩm */}
        <Col span={24}>
          <Card title="Danh sách sản phẩm" size="small">
            <Table
              dataSource={orderData.items}
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
                      <Text strong>{formatCurrency(orderData.subtotal)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text>Phí vận chuyển:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text>{formatCurrency(orderData.shippingFee)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {orderData.discountAmount > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text>Giảm giá:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text style={{ color: '#52c41a' }}>
                          -{formatCurrency(orderData.discountAmount)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                        {formatCurrency(orderData.totalAmount)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </Col>

        {/* Voucher (nếu có) */}
        {orderData.voucherId && orderData.voucherId.length > 0 && (
          <Col span={24}>
            <Card title="Voucher sử dụng" size="small">
              <Space wrap>
                {orderData.voucherId.map((voucherId, index) => (
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
              {orderData.status === 'Cho xac nhan' && (
                <>
                  <Popconfirm
                    title="Xác nhận đơn hàng này?"
                    onConfirm={() => handleUpdateStatus('Da xac nhan')}
                    okText="Xác nhận"
                    cancelText="Huỷ"
                  >
                    <Button 
                      type="primary" 
                      loading={loadingAction === 'Da xac nhan'}
                    >
                      Xác nhận đơn hàng
                    </Button>
                  </Popconfirm>
                  
                  <Popconfirm
                    title="Huỷ đơn hàng này?"
                    onConfirm={() => handleUpdateStatus('Da huy')}
                    okText="Huỷ đơn"
                    cancelText="Không"
                  >
                    <Button 
                      danger 
                      loading={loadingAction === 'Da huy'}
                    >
                      Huỷ đơn hàng
                    </Button>
                  </Popconfirm>
                </>
              )}
              
              {orderData.status === 'Da xac nhan' && (
                <Popconfirm
                  title="Chuyển đơn hàng sang trạng thái đang giao?"
                  onConfirm={() => handleUpdateStatus('Dang giao hang')}
                  okText="Giao hàng"
                  cancelText="Huỷ"
                >
                  <Button 
                    type="primary" 
                    loading={loadingAction === 'Dang giao hang'}
                  >
                    Bắt đầu giao hàng
                  </Button>
                </Popconfirm>
              )}
              
              {orderData.status === 'Dang giao hang' && (
                <Popconfirm
                  title="Xác nhận đã giao hàng thành công?"
                  onConfirm={() => handleUpdateStatus('Da giao hang')}
                  okText="Đã giao"
                  cancelText="Huỷ"
                >
                  <Button 
                    type="primary" 
                    loading={loadingAction === 'Da giao hang'}
                  >
                    Xác nhận đã giao
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Card>
        </Col>

      </Row>
    </Show>
  );
};
