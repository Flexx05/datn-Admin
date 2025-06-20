import { CheckOutlined, CloseOutlined, EyeOutlined, ShoppingOutlined, TruckOutlined, StarOutlined } from "@ant-design/icons";
import { List, useTable } from "@refinedev/antd";
import { useInvalidate } from "@refinedev/core";
import { Button, Input, Popconfirm, Select, Space, Table, Tag, Tooltip, message } from "antd";
import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { API_URL } from "../../config/dataProvider";
import { IOrder } from "../../interface/order";

export const OrderList = () => {
  const { tableProps } = useTable<IOrder>({
    syncWithLocation: true,
    resource: "order",
    errorNotification: (error: any) => ({
      message: "❌ Lỗi hệ thống " + (error.response?.data?.message || error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
    meta: {
      transform: (response: any) => ({
        data: response.data?.orders?.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt).toISOString(),
          updatedAt: new Date(order.updatedAt).toISOString()
        })) || [],
        total: response.data?.pagination?.totalOrders || 0
      }),
    },
  });

  const invalidate = useInvalidate();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Frontend filter states
  const [searchText, setSearchText] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string | undefined>(undefined);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | undefined>(undefined);

  // Auto-complete orders after 3 days
  useEffect(() => {
    const checkAndCompleteOrders = async () => {
      try {
        if (!tableProps.dataSource) return;

        const now = new Date();
        const ordersToComplete = [];

        for (const order of tableProps.dataSource) {
          if (order.status === "Da giao hang") {
            const deliveredDate = new Date(order.updatedAt);
            const daysDiff = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff >= 3) {
              ordersToComplete.push(order._id);
            }
          }
        }

        // Auto-complete orders that are due
        for (const orderId of ordersToComplete) {
          await handleAutoCompleteOrder(orderId);
        }
      } catch (error) {
        console.error("Error checking orders for auto-completion:", error);
      }
    };

    // Check every hour
    const interval = setInterval(checkAndCompleteOrders, 60 * 60 * 1000);

    // Check immediately on component mount
    checkAndCompleteOrders();

    return () => clearInterval(interval);
  }, [tableProps.dataSource]);

  const handleAutoCompleteOrder = async (orderId: string) => {
    try {
      await axios.patch(`${API_URL}/order/status/${orderId}`, {
        status: "Hoan thanh",
        paymentStatus: "Da thanh toan"
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      await invalidate({
        resource: "order",
        invalidates: ["list"]
      });
    } catch (error) {
      console.error("Error auto-completing order:", error);
    }
  };

  // Frontend filtering logic
  const filteredData = useMemo(() => {
    if (!tableProps.dataSource) return [];

    let filtered = [...tableProps.dataSource];

    // Search by order code
    if (searchText) {
      filtered = filtered.filter(order =>
        order.orderCode?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by order status
    if (orderStatusFilter) {
      filtered = filtered.filter(order => order.status === orderStatusFilter);
    }

    // Filter by payment status
    if (paymentStatusFilter) {
      filtered = filtered.filter(order => order.paymentStatus === paymentStatusFilter);
    }

    return filtered;
  }, [tableProps.dataSource, searchText, orderStatusFilter, paymentStatusFilter]);

  const handleChangeStatus = async (record: IOrder, newStatus: string) => {
    if (!record._id) {
      message.error("ID đơn hàng không hợp lệ");
      return;
    }

    let paymentStatus = record.paymentStatus;
    if (newStatus === "Da giao hang" || newStatus === "Hoan thanh") {
      paymentStatus = "Da thanh toan";
    }

    setLoadingId(record._id);
    try {
      const response = await axios.patch(`${API_URL}/order/status/${record._id}`, {
        status: newStatus,
        paymentStatus: paymentStatus
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.status === 200) {
        await invalidate({
          resource: "order",
          invalidates: ["list"]
        });
        message.success(`Cập nhật trạng thái thành công: ${getStatusDisplayText(newStatus)}`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra";
      message.error(`Cập nhật trạng thái thất bại: ${errorMessage}`);
      console.error("Error updating order status:", error);
    } finally {
      setLoadingId(null);
    }
  };

  // Clear all filters
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

  const getOrderStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Cho xac nhan": 'orange',
      "Da xac nhan": 'blue',
      "Dang giao hang": 'purple',
      "Da giao hang": 'green',
      "Hoan thanh": 'cyan',
      "Da huy": 'red'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status: IOrder['paymentStatus']) => {
    const colors = {
      "Chua thanh toan": 'orange',
      "Da thanh toan": 'green',
      "That bai": 'red',
      "Da hoan tien": 'blue'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      "Cho xac nhan": <ShoppingOutlined />,
      "Da xac nhan": <CheckOutlined />,
      "Dang giao hang": <TruckOutlined />,
      "Da giao hang": <CheckOutlined />,
      "Hoan thanh": <StarOutlined />,
      "Da huy": <CloseOutlined />
    };
    return icons[status];
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

  const getDaysRemaining = (record: IOrder) => {
    if (record.status !== "Da giao hang") return null;

    const deliveredDate = new Date(record.updatedAt);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = 3 - daysPassed;

    return daysRemaining > 0 ? daysRemaining : 0;
  };

  const renderActionButtons = (record: IOrder) => {
    const actions = [];

    actions.push(
      <Tooltip title="Xem chi tiết" key="show">
        <Link to={`/orders/show/${record._id}`}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            type="default"
          />
        </Link>
      </Tooltip>
    );

    if (record.status === 'Cho xac nhan') {
      actions.push(
        <Popconfirm
          key="confirm"
          title="Xác nhận xử lý đơn hàng?"
          description="Bạn có chắc chắn muốn xác nhận đơn hàng này?"
          onConfirm={() => handleChangeStatus(record, "Da xac nhan")}
          okButtonProps={{ loading: loadingId === record._id }}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Button
            size="small"
            type="primary"
            icon={<CheckOutlined />}
            loading={loadingId === record._id}
          >
            Xác nhận
          </Button>
        </Popconfirm>
      );

      actions.push(
        <Popconfirm
          key="cancel"
          title="Huỷ đơn hàng này?"
          description="Đơn hàng sẽ bị hủy và không thể khôi phục"
          onConfirm={() => handleChangeStatus(record, 'Da huy')}
          okText="Hủy đơn"
          cancelText="Không"
          okButtonProps={{ danger: true }}
        >
          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
          >
            Huỷ
          </Button>
        </Popconfirm>
      );
    }

    if (record.status === "Da xac nhan") {
      actions.push(
        <Button
          key="shipping"
          size="small"
          onClick={() => handleChangeStatus(record, 'Dang giao hang')}
          loading={loadingId === record._id}
          icon={<TruckOutlined />}
        >
          Bắt đầu giao hàng
        </Button>
      );
    }

    if (record.status === 'Dang giao hang') {
      actions.push(
        <Button
          key="delivered"
          size="small"
          type="primary"
          onClick={() => handleChangeStatus(record, "Da giao hang")}
          loading={loadingId === record._id}
          icon={<CheckOutlined />}
        >
          Xác nhận đã giao
        </Button>
      );
    }

    // Không có nút thủ công cho trạng thái "Hoan thanh" - chỉ tự động

    return <Space direction="vertical" size="small">{actions}</Space>;
  };

  return (
    <List title="Quản lý đơn hàng">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Tìm kiếm theo mã đơn hàng"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />

        <Select
          placeholder="Lọc trạng thái đơn hàng"
          allowClear
          value={orderStatusFilter}
          style={{ width: 200 }}
          onChange={setOrderStatusFilter}
        >
          <Select.Option value="Cho xac nhan">Chờ xác nhận</Select.Option>
          <Select.Option value="Da xac nhan">Đã xác nhận</Select.Option>
          <Select.Option value="Dang giao hang">Đang giao hàng</Select.Option>
          <Select.Option value="Da giao hang">Đã giao hàng</Select.Option>
          <Select.Option value="Hoan thanh">Hoàn thành</Select.Option>
          <Select.Option value="Da huy">Đã huỷ</Select.Option>
        </Select>

        <Select
          placeholder="Lọc trạng thái thanh toán"
          allowClear
          value={paymentStatusFilter}
          style={{ width: 200 }}
          onChange={setPaymentStatusFilter}
        >
          <Select.Option value="Chua thanh toan">Chưa thanh toán</Select.Option>
          <Select.Option value="Da thanh toan">Đã thanh toán</Select.Option>
          <Select.Option value="That bai">Thất bại</Select.Option>
          <Select.Option value="Da hoan tien">Đã hoàn tiền</Select.Option>
        </Select>

        {(searchText || orderStatusFilter || paymentStatusFilter) && (
          <Button onClick={handleClearAllFilters}>
            Xóa tất cả bộ lọc
          </Button>
        )}

        <div style={{ color: '#666', fontSize: '12px' }}>
          Hiển thị {filteredData.length} / {tableProps.dataSource?.length || 0} đơn hàng
        </div>
      </Space>

      <Table
        {...tableProps}
        dataSource={filteredData}
        rowKey="_id"
        scroll={{ x: 1500 }}
        pagination={{
          ...tableProps.pagination,
          total: filteredData.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} đơn hàng`,
        }}
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
          title="Thông tin khách hàng"
          width={250}
          render={(_, record: IOrder) => (
            <div>
              <div style={{ fontSize: '12px', color: '#ffffff' }}>
                {record.recipientInfo.email || 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: '#ffffff' }}>
                {record.recipientInfo.phone || 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: '#ffffff' }}>
                {record.shippingAddress || 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: '#ffffff' }}>
                {record.shippingAddress?.city || ''} {record.shippingAddress?.country || ''}
              </div>
            </div>
          )}
        />

        <Table.Column
          title="Ngày đặt hàng"
          width={180}
          dataIndex="createdAt"
          defaultSortOrder="descend" // Mặc định sắp xếp giảm dần
          sorter={(a: IOrder, b: IOrder) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB;
          }}
          render={(createdAt: string) => (
            <div style={{ fontSize: '13px', color: '#ffffff' }}>
              {formatDate(createdAt)}
            </div>
          )}
        />

        <Table.Column
          title="Trạng thái"
          dataIndex="status"
          width={150}
          render={(status: string, record: IOrder) => {
            const daysRemaining = getDaysRemaining(record);
            return (
              <div>
                <Tag
                  color={getOrderStatusColor(status)}
                  icon={getStatusIcon(status)}
                  style={{ fontWeight: 'bold' }}
                >
                  {getStatusDisplayText(status) || 'N/A'}
                </Tag>
                {status === "Da giao hang" && daysRemaining !== null && daysRemaining > 0 && (
                  <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                    Tự động hoàn thành sau {daysRemaining} ngày
                  </div>
                )}

              </div>
            );
          }}
        />

        <Table.Column
          title="Thanh toán"
          dataIndex="paymentStatus"
          width={150}
          render={(status: IOrder['paymentStatus']) => (
            <Tag color={getPaymentStatusColor(status)} style={{ fontWeight: 'bold' }}>
              {getStatusDisplayText(status) || 'N/A'}
            </Tag>
          )}
        />

        <Table.Column
          title="Tổng tiền"
          dataIndex="totalAmount"
          width={150}
          render={(amount: number) => (
            <div style={{
              fontWeight: 'bold',
              color: '#cf1322',
              fontSize: '14px'
            }}>
              {formatCurrency(amount)}
            </div>
          )}
        />

        <Table.Column
          title="Thao tác"
          width={200}
          fixed="right"
          render={(_, record: IOrder) => renderActionButtons(record)}
        />
      </Table>
    </List>
  );
};