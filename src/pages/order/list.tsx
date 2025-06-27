import { CheckOutlined, CloseOutlined, EyeOutlined, ShoppingOutlined, TruckOutlined, StarOutlined, UndoOutlined } from "@ant-design/icons";
import { List, useTable } from "@refinedev/antd";
import { useInvalidate } from "@refinedev/core";
import { Button, Input, Popconfirm, Select, Space, Table, Tag, Tooltip, message } from "antd";
import axios from "axios";
import { useState, useMemo } from "react";
// import { Link } from "react-router-dom";
import { API_URL } from "../../config/dataProvider";
import { Link } from "react-router";
// import { IOrder } from "../../interface/order";

// Enum mapping
const statusMap: Record<number, { text: string; color: string; icon: React.ReactNode }> = {
  0: { text: "Chờ xác nhận", color: "orange", icon: <ShoppingOutlined /> },
  1: { text: "Đã xác nhận", color: "blue", icon: <CheckOutlined /> },
  2: { text: "Đang giao hàng", color: "purple", icon: <TruckOutlined /> },
  3: { text: "Đã giao hàng", color: "green", icon: <CheckOutlined /> },
  4: { text: "Hoàn thành", color: "red", icon: <CheckOutlined /> },
  5: { text: "Đã huỷ", color: "red", icon: <CloseOutlined /> },
  6: { text: "Hoàn hàng", color: "cyan", icon: <UndoOutlined /> },
};

const paymentStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Chưa thanh toán", color: "orange" },
  1: { text: "Đã thanh toán", color: "green" },
  2: { text: "Hoàn tiền", color: "blue" },
};

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

  // Filter logic
  const filteredData = useMemo(() => {
    if (!tableProps.dataSource) return [];
    let filtered = [...tableProps.dataSource];
    if (searchText) {
      filtered = filtered.filter(order =>
        order.orderCode?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (orderStatusFilter !== undefined) {
      filtered = filtered.filter(order => order.status === orderStatusFilter);
    }
    if (paymentStatusFilter !== undefined) {
      filtered = filtered.filter(order => order.paymentStatus === paymentStatusFilter);
    }
    return filtered;
  }, [tableProps.dataSource, searchText, orderStatusFilter, paymentStatusFilter]);

  // Đổi trạng thái đơn hàng
  const handleChangeStatus = async (record: IOrder, newStatus: number) => {
    setLoadingId(record._id);
    try {
      let paymentStatus = record.paymentStatus;
      if (newStatus === 3) paymentStatus = 1; // Đã giao hàng thì thanh toán luôn
      await axios.patch(`${API_URL}/order/status/${record._id}`, {
        status: newStatus,
        paymentStatus,
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
          {Object.entries(statusMap).map(([key, val]) => (
            <Select.Option key={key} value={Number(key)}>{val.text}</Select.Option>
          ))}
        </Select>
        <Select
          placeholder="Lọc trạng thái thanh toán"
          allowClear
          value={paymentStatusFilter}
          style={{ width: 200 }}
          onChange={setPaymentStatusFilter}
        >
          {Object.entries(paymentStatusMap).map(([key, val]) => (
            <Select.Option key={key} value={Number(key)}>{val.text}</Select.Option>
          ))}
        </Select>
        {(searchText || orderStatusFilter !== undefined || paymentStatusFilter !== undefined) && (
          <Button onClick={handleClearAllFilters}>Xóa tất cả bộ lọc</Button>
        )}
        <div style={{ color: '#666', fontSize: '12px' }}>
          Hiển thị {filteredData.length} / {tableProps.dataSource?.length || 0} đơn hàng
        </div>
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
          render={(_, record: IOrder) => (
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
          render={(_, record: IOrder) => (
            <div style={{ fontSize: '13px', color: '#555' }}>
              {record.shippingAddress || 'N/A'}
            </div>
          )}
        />
        <Table.Column
          title="Ngày đặt"
          dataIndex="createdAt"
          width={150}
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
          render={(status: number) => {
            const s = statusMap[status];
            return (
              <Tag color={s?.color} icon={s?.icon} style={{ fontWeight: 'bold' }}>
                {s?.text || status}
              </Tag>
            );
          }}
        />
        <Table.Column
          title="Thanh toán"
          dataIndex="paymentStatus"
          width={130}
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
          render={(_, record: IOrder) => (
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
                    onConfirm={() => handleChangeStatus(record, 5)}
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
                    onConfirm={() => handleChangeStatus(record, 5)}
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
              {record.status === 3 && (
                <Button size="small" icon={<StarOutlined />} disabled>
                  Hoàn thành
                </Button>
              )}
              {record.status === 6 && (
                <Tag color="cyan" icon={<UndoOutlined />}>Hoàn hàng</Tag>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};