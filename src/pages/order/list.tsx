import { CheckOutlined, CloseOutlined, EyeOutlined, ShoppingOutlined, TruckOutlined, UndoOutlined } from "@ant-design/icons";
import { List, useTable } from "@refinedev/antd";
import { useInvalidate } from "@refinedev/core";
import { Button, Input, Popconfirm, Space, Table, Tag, Tooltip, message, Modal, Form, Select as AntSelect, Input as AntInput } from "antd";
import axios from "axios";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../../config/dataProvider";
import { Order } from "../../interface/order";

// Enum mapping
const statusMap: Record<number, { text: string; color: string; icon: React.ReactNode }> = {
  0: { text: "Chờ xác nhận", color: "orange", icon: <ShoppingOutlined /> },
  1: { text: "Đã xác nhận", color: "blue", icon: <CheckOutlined /> },
  2: { text: "Đang giao hàng", color: "purple", icon: <TruckOutlined /> },
  3: { text: "Đã giao hàng", color: "green", icon: <CheckOutlined /> },
  4: { text: "Hoàn thành", color: "cyan", icon: <CheckOutlined /> },
  5: { text: "Đã huỷ", color: "red", icon: <CloseOutlined /> },
  6: { text: "Hoàn hàng", color: "cyan", icon: <UndoOutlined /> },
};

const paymentStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Chưa thanh toán", color: "orange" },
  1: { text: "Đã thanh toán", color: "green" },
  2: { text: "Hoàn tiền", color: "blue" },
  3: { text: "Đã hủy", color: "red" },
};

const cancelReasons = [
  'Bão lũ giao hàng không được',
  'Shipper ốm',
  'Hết hàng',
  'Khác'
];

export const OrderList = () => {
  const { tableProps } = useTable<Order>({
    syncWithLocation: true,
    resource: "order",
    errorNotification: (error: any) => ({
      message: "❌ Lỗi hệ thống " + (error.response?.data?.message || error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
    meta: {
      transform: (response: any) => ({
        data: response.data?.orders || [],
        total: response.data?.pagination?.totalOrders || 0,
      }),
    },
  });

  const invalidate = useInvalidate();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<number | undefined>(undefined);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<number | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Filter logic
  const filteredData = useMemo(() => {
    if (!tableProps.dataSource) return [];
    let filtered: Order[] = [...tableProps.dataSource];
    if (searchText) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(order =>
        order.recipientInfo?.name?.toLowerCase().includes(lower) ||
        order.recipientInfo?.phone?.toLowerCase().includes(lower) ||
        order.recipientInfo?.email?.toLowerCase().includes(lower) ||
        order.orderCode?.toLowerCase().includes(lower)
      );
    }
    if (orderStatusFilter !== undefined) {
      filtered = filtered.filter(order => order.status === orderStatusFilter);
    }
    if (paymentStatusFilter !== undefined) {
      filtered = filtered.filter(order => order.paymentStatus === paymentStatusFilter);
    }
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return filtered;
  }, [tableProps.dataSource, searchText, orderStatusFilter, paymentStatusFilter]);

  // Đổi trạng thái đơn hàng
  const handleChangeStatus = async (record: Order, newStatus: number, reason?: string, paymentStatus?: number) => {
    setLoadingId(record._id);
    try {
      let currentPaymentStatus = paymentStatus !== undefined ? paymentStatus : record.paymentStatus;
      if (newStatus === 3) currentPaymentStatus = 1; // Đã giao hàng thì thanh toán luôn
      await axios.patch(`${API_URL}/order/status/${record._id}`, {
        status: newStatus,
        paymentStatus: currentPaymentStatus,
        ...(reason && { cancelReason: reason }), // Include reason if provided
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      await invalidate({ resource: "order", invalidates: ["list"] });
      message.success("Cập nhật trạng thái thành công");
    } catch (error: any) {
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoadingId(null);
    }
  };

  const showCancelModal = (id: string) => {
    setSelectedOrderId(id);
    setIsModalVisible(true);
  };

  const handleCancelOrder = async (values: { reason: string, customReason?: string }) => {
    if (!selectedOrderId) return;
    const finalReason = values.reason === 'Khác' && values.customReason ? values.customReason : values.reason;
    const record = filteredData.find(order => order._id === selectedOrderId);
    if (record) {
      await handleChangeStatus(record, 5, finalReason, 3);
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleClearAllFilters = () => {
    setSearchText("");
    setOrderStatusFilter(undefined);
    setPaymentStatusFilter(undefined);
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <List title="Quản lý đơn hàng">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Tìm kiếm theo tên, SĐT, email khách hàng"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </Space>
      <Table
        {...tableProps}
        dataSource={filteredData}
        rowKey="_id"
        scroll={{ x: 1200 }}
      >
        <Table.Column
          dataIndex="orderCode"
          title="Mã đơn"
          width={120}
          fixed="left"
          render={(code: string) => (
            <Tag color="blue" style={{ fontWeight: 'bold' }}>
              #{code || 'N/A'}
            </Tag>
          )}
        />
        <Table.Column
          title="Khách hàng"
          width={180}
          render={(_, record: Order) => (
            <div>
              <div style={{ fontWeight: 500 }}>{record.recipientInfo?.name || 'N/A'}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{record.recipientInfo?.phone}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{record.recipientInfo?.email}</div>
            </div>
          )}
        />
        <Table.Column
          title="Địa chỉ"
          width={200}
          render={(_, record: Order) => (
            <div style={{ fontSize: '13px', color: '#555' }}>
              {record.shippingAddress || 'N/A'}
            </div>
          )}
        />
        <Table.Column
          title="Ngày đặt"
          dataIndex="createdAt"
          width={150}
          sorter={(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()}
          render={(createdAt: string) => (
            <div style={{ fontSize: '13px', color: '#555' }}>
              {createdAt ? formatDate(createdAt) : 'N/A'}
            </div>
          )}
        />
        <Table.Column
          title="Trạng thái"
          dataIndex="status"
          width={150}
          filters={Object.entries(statusMap).map(([key, val]) => ({
            text: val.text,
            value: Number(key),
          }))}
          onFilter={(value, record) => record.status === value}
          render={(status: number) => {
            const s = statusMap[status];
            return (
              <div>
                <Tag color={s?.color} icon={s?.icon} style={{ fontWeight: 'bold' }}>
                  {s?.text || status}
                </Tag>
              </div>
            );
          }}
        />
        <Table.Column
          title="Thanh toán"
          dataIndex="paymentStatus"
          width={130}
          filters={Object.entries(paymentStatusMap).map(([key, val]) => ({
            text: val.text,
            value: Number(key),
          }))}
          onFilter={(value, record) => record.paymentStatus === value}
          render={(paymentStatus: number) => {
            const p = paymentStatusMap[paymentStatus];
            return (
              <Tag color={p?.color} style={{ fontWeight: 'bold' }}>
                {p?.text || paymentStatus}
              </Tag>
            );
          }}
        />
        <Table.Column
          title="Tổng tiền"
          dataIndex="totalAmount"
          width={120}
          render={(value: number) =>
            <span style={{ fontWeight: 500, color: "#d4380d" }}>
              {formatCurrency(value)}
            </span>
          }
        />
        <Table.Column
          title="Hành động"
          width={220}
          fixed="right"
          render={(_, record: Order) => (
            <Space>
              <Tooltip title="Xem chi tiết">
                <Link to={`/orders/show/${record._id}`}>
                  <Button size="small" icon={<EyeOutlined />} />
                </Link>
              </Tooltip>
              {record.status === 0 && (
                <>
                  <Popconfirm
                    title="Xác nhận đơn hàng này?"
                    onConfirm={() => handleChangeStatus(record, 1)}
                    okText="Xác nhận"
                    cancelText="Huỷ"
                    okButtonProps={{ loading: loadingId === record._id }}
                  >
                    <Button size="small" type="primary" icon={<CheckOutlined />} loading={loadingId === record._id}>
                      Xác nhận
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Huỷ đơn hàng này?"
                    onConfirm={() => showCancelModal(record._id)}
                    okText="Huỷ đơn"
                    cancelText="Không"
                    okButtonProps={{ danger: true }}
                  >
                    <Button size="small" danger icon={<CloseOutlined />}>
                      Huỷ
                    </Button>
                  </Popconfirm>
                </>
              )}
              {record.status === 1 && (
                <>
                  <Button size="small" onClick={() => handleChangeStatus(record, 2)} icon={<TruckOutlined />}>
                    Giao hàng
                  </Button>
                  <Popconfirm
                    title="Huỷ đơn hàng này?"
                    onConfirm={() => showCancelModal(record._id)}
                    okText="Huỷ đơn"
                    cancelText="Không"
                    okButtonProps={{ danger: true }}
                  >
                    <Button size="small" danger icon={<CloseOutlined />}>
                      Huỷ
                    </Button>
                  </Popconfirm>
                </>
              )}
              {record.status === 2 && (
                <Button size="small" type="primary" onClick={() => handleChangeStatus(record, 3)} icon={<CheckOutlined />}>
                  Đã giao
                </Button>
              )}
              {record.status === 6 && (
                <Tag color="cyan" icon={<UndoOutlined />}>Hoàn hàng</Tag>
              )}
            </Space>
          )}
        />
      </Table>
      <Modal
        title="Hủy đơn hàng"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        className="rounded-lg"
      >
        <Form
          form={form}
          onFinish={handleCancelOrder}
          layout="vertical"
        >
          <Form.Item
            name="reason"
            label="Lý do hủy"
            rules={[{ required: true, message: 'Vui lòng chọn lý do hủy' }]}
          >
            <AntSelect placeholder="Chọn lý do">
              {cancelReasons.map((reason) => (
                <AntSelect.Option key={reason} value={reason}>{reason}</AntSelect.Option>
              ))}
            </AntSelect>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.reason !== currentValues.reason}
          >
            {({ getFieldValue }) =>
              getFieldValue('reason') === 'Khác' ? (
                <Form.Item
                  name="customReason"
                  label="Lý do cụ thể"
                  rules={[{ required: true, message: 'Vui lòng nhập lý do cụ thể' }]}
                >
                  <AntInput.TextArea rows={3} placeholder="Nhập lý do hủy đơn hàng" />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item>
            <div className="flex gap-2 justify-end">
              <Button onClick={handleModalCancel} style={{ marginRight: '16px' }}>
                Hủy bỏ
              </Button>
              <Button type="primary" htmlType="submit" danger>
                Xác nhận hủy
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </List>
  );
};