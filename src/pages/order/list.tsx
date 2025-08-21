/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  TruckOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { List, useTable } from "@refinedev/antd";
import { useInvalidate } from "@refinedev/core";
import {
  Input as AntInput,
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { API_URL } from "../../config/dataProvider";
import { Order } from "../../interface/order";
import { socket } from "../../socket";
import { axiosInstance } from "../../utils/axiosInstance";
import { statusMap } from "../dashboard/statusMap";
import ButtonChat from "./ButtonChat";
import { formatCurrency } from "./formatCurrency";

// Định nghĩa interface cho yêu cầu hoàn hàng
interface ReturnRequest {
  _id: string;
  orderId: {
    _id: string;
    orderCode: string;
    totalAmount: number;
    userId: string;
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
}

const paymentStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Chưa thanh toán", color: "orange" },
  1: { text: "Đã thanh toán", color: "green" },
  2: { text: "Hoàn tiền", color: "blue" },
  3: { text: "Đã hủy", color: "red" },
};

const returnStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Chờ duyệt", color: "orange" },
  1: { text: "Đã chấp nhận", color: "green" },
  2: { text: "Đã nhận hàng", color: "blue" },
  // 2: { text: "Đã nhận hàng", color: "blue" },
  3: { text: "Đã hoàn tiền", color: "green" },
  4: { text: "Đã từ chối", color: "red" },
};

const cancelReasons = [
  "Bão lũ giao hàng không được",
  "Shipper ốm",
  "Hết hàng",
  "Khác",
];

// Component xử lý hành động cho yêu cầu hoàn hàng
const ReturnRequestActions: React.FC<{
  record: ReturnRequest;
  loadingId: string | null;
  onChangeReturnStatus: (
    record: ReturnRequest,
    newStatus: number
  ) => Promise<void>;
}> = ({ record, loadingId, onChangeReturnStatus }) => {
  const isLoading = loadingId === record._id;

  // Nút chat
  const chatButton = <ButtonChat record={record.orderId} />;

  switch (record.status) {
    case 0: // Chờ duyệt
      return (
        <Space>
          <Popconfirm
            title="Chấp nhận yêu cầu hoàn hàng?"
            onConfirm={() => onChangeReturnStatus(record, 1)}
            okText="Chấp nhận"
            cancelText="Hủy"
            okButtonProps={{ loading: isLoading }}
          >
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              loading={isLoading}
            >
              Chấp nhận
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Từ chối yêu cầu hoàn hàng?"
            onConfirm={() => onChangeReturnStatus(record, 4)}
            okText="Từ chối"
            cancelText="Hủy"
            okButtonProps={{ loading: isLoading }}
          >
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              loading={isLoading}
            >
              Từ chối
            </Button>
          </Popconfirm>
          {chatButton}
        </Space>
      );
    case 1: // Đã nhận hàng
      return (
        <Space>
          <Popconfirm
            title="Xác nhận đã hoàn tiền?"
            onConfirm={() => onChangeReturnStatus(record, 3)}
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
              Hoàn tiền
            </Button>
          </Popconfirm>
          {chatButton}
        </Space>
      );
    case 2: // Đã nhận hàng
    case 3: // Đã hoàn tiền
    case 4: // Đã từ chối
      return <Space>{chatButton}</Space>;
    default:
      return <Space>{chatButton}</Space>;
  }
};

// Component xử lý hành động (Action buttons) tùy trạng thái đơn hàng
const OrderActions: React.FC<{
  record: Order;
  loadingId: string | null;
  onChangeStatus: (
    record: Order,
    newStatus: number,
    reason?: string,
    paymentStatus?: number
  ) => Promise<void>;
  onShowCancelModal: (id: string) => void;
}> = ({ record, loadingId, onChangeStatus, onShowCancelModal }) => {
  const isLoading = loadingId === record._id;

  // Nút chat
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
        </Space>
      );

    case 2: // Đang giao
      return (
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
      );

    // case 3:
    //   return <Space>{chatButton}</Space>;

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

export const OrderList: React.FC = () => {
  const { tableProps } = useTable<Order>({
    syncWithLocation: true,
    resource: "order",
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " + (error.response?.data?.message || error.message),
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
  const [searchText, setSearchText] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    number | undefined
  >();
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    number | undefined
  >();
  const [returnStatusFilter, setReturnStatusFilter] = useState<
    number | undefined
  >();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "returnRequests">("all");
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [ordersData, setOrdersData] = useState<Order[]>([
    ...(tableProps.dataSource || []),
  ]);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  const [form] = Form.useForm();

  // Đồng bộ ordersData khi tableProps.dataSource thay đổi
  useEffect(() => {
    setOrdersData([...(tableProps.dataSource || [])]);
  }, [tableProps.dataSource]);

  // Fetch return requests từ API
  const fetchReturnRequests = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/return-requests`);
      setReturnRequests(response.data.data?.returnRequests || []);
    } catch (error: any) {
      message.error("Lỗi khi tải danh sách yêu cầu hoàn hàng");
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTab === "returnRequests") {
      fetchReturnRequests();
    }
  }, [activeTab]);

  // Lắng nghe sự kiện socket để cập nhật bảng realtime
  useEffect(() => {
    const handleChange = (data: any) => {
      console.log("Received WebSocket event:", data);
      if (data.order) {
        setOrdersData((prevData) =>
          prevData.map((order) =>
            order._id === data.order._id ? { ...order, ...data.order } : order
          )
        );
        invalidate({ resource: "order", invalidates: ["list"] });
        if (activeTab === "returnRequests") {
          fetchReturnRequests(); // Làm mới danh sách yêu cầu hoàn hàng
        }
      }
    };

    socket.on("order-status-changed", handleChange);
    socket.on("new-notification", handleChange);
    return () => {
      socket.off("order-status-changed", handleChange);
      socket.off("new-notification", handleChange);
    };
  }, [invalidate, activeTab]);

  useEffect(() => {
    if (activeTab === "returnRequests") {
      fetchReturnRequests();
    }
  }, [activeTab]);

  // Xử lý thay đổi trạng thái yêu cầu hoàn hàng
  const handleChangeReturnStatus = async (
    record: ReturnRequest,
    newStatus: number
  ) => {
    setLoadingId(record._id);
    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      // If status is 3 (Đã hoàn tiền), process refund and update order's totalAmount
      if (newStatus === 3) {
        await axiosInstance.patch(
          `${API_URL}/order/status/${record.orderId._id}`,
          {
            paymentStatus: 2,
            userId: user?._id,
          }
        );
        const refundResponse = await axiosInstance.post(
          `${API_URL}/wallet/cancel-refund`,
          {
            orderId: record.orderId._id,
            type: 0,
            amount: record.refundAmount,
            status: 1,
            description: `Hoàn tiền cho yêu cầu hoàn hàng đơn ${record.orderId.orderCode}: ${record.reason}`,
            returnRequestId: record._id,
          }
        );

        if (!refundResponse.data.success) {
          throw new Error(
            refundResponse.data.message || "Refund request failed"
          );
        }
      }
      if (newStatus === 4) {
        await axiosInstance.patch(
          `${API_URL}/order/status/${record.orderId._id}`,
          {
            status: 4,
            paymentStatus: 1,
            userId: user?._id,
          }
        );
      }

      // Update return request status
      await axiosInstance.patch(
        `${API_URL}/return-requests/${record._id}/status`,
        { status: newStatus }
      );

      message.success("Cập nhật trạng thái yêu cầu hoàn hàng thành công");
      setReturnRequests((prev) =>
        prev.map((req) =>
          req._id === record._id ? { ...req, status: newStatus } : req
        )
      );

      // Invalidate order list to refresh data
      await invalidate({ resource: "order", invalidates: ["list"] });
    } catch (error: any) {
      message.error(
        error.message || "Cập nhật trạng thái yêu cầu hoàn hàng thất bại"
      );
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  // Lọc dữ liệu dựa trên tab đang chọn và các bộ lọc khác
  const filteredData = useMemo(() => {
    let data: any =
      activeTab === "returnRequests" ? returnRequests : ordersData || [];

    const lowerSearch = searchText.toLowerCase();

    if (activeTab === "returnRequests") {
      data = data.filter((request: any) => {
        const matchSearch =
          !searchText ||
          request.orderId.orderCode.toLowerCase().includes(lowerSearch) ||
          request.reason.toLowerCase().includes(lowerSearch);

        const matchReturnStatus =
          returnStatusFilter === undefined ||
          request.status === returnStatusFilter;

        return matchSearch && matchReturnStatus;
      });
    } else {
      data = data.filter((order: Order) => {
        const matchSearch =
          !searchText ||
          order.recipientInfo?.name?.toLowerCase().includes(lowerSearch) ||
          order.recipientInfo?.phone?.toLowerCase().includes(lowerSearch) ||
          order.recipientInfo?.email?.toLowerCase().includes(lowerSearch) ||
          order.orderCode?.toLowerCase().includes(lowerSearch);

        const matchStatus =
          orderStatusFilter === undefined || order.status === orderStatusFilter;

        const matchPayment =
          paymentStatusFilter === undefined ||
          order.paymentStatus === paymentStatusFilter;

        return matchSearch && matchStatus && matchPayment;
      });
    }

    return data.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [
    ordersData,
    returnRequests,
    searchText,
    orderStatusFilter,
    paymentStatusFilter,
    returnStatusFilter,
    activeTab,
  ]);

  // Lắng nghe sự kiện socket để cập nhật bảng realtime
  useEffect(() => {
    const handleChange = (data: any) => {
      console.log("Received WebSocket event:", data); // Log để kiểm tra
      if (data.order) {
        // Cập nhật trực tiếp danh sách đơn hàng
        setOrdersData((prevData) =>
          prevData.map((order) =>
            order._id === data.order._id ? { ...order, ...data.order } : order
          )
        );
        if (activeTab === "returnRequests") {
          fetchReturnRequests();
        }
      } else {
        invalidate({ resource: "order", invalidates: ["list"] });
      }
    };
    socket.on("order-status-changed", handleChange);
    socket.on("new-notification", handleChange);
    return () => {
      socket.off("order-status-changed", handleChange);
      socket.off("new-notification", handleChange);
    };
  }, [invalidate, activeTab]);

  const handleChangeStatus = async (
    record: Order,
    newStatus: number,
    reason?: string,
    paymentStatus?: number
  ) => {
    setLoadingId(record._id);
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

      await invalidate({ resource: "order", invalidates: ["list"] });
      message.success("Cập nhật trạng thái thành công");
    } catch (error: any) {
      console.error(error);
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoadingId(null);
    }
  };

  const showCancelModal = (id: string) => {
    setSelectedOrderId(id);
    setIsModalVisible(true);
  };

  const handleCancelOrder = async (values: {
    reason: string;
    customReason?: string;
  }) => {
    if (!selectedOrderId) return;

    setIsCancelLoading(true); // Bật trạng thái loading
    try {
      const finalReason =
        values.reason === "Khác" && values.customReason
          ? values.customReason
          : values.reason;

      const record = filteredData.find(
        (order: Order) => order._id === selectedOrderId
      );
      if (record) {
        await handleChangeStatus(record, 5, finalReason, 3);
        if (
          record.paymentMethod === "VNPAY" ||
          (record.paymentMethod === "VI" && record.paymentStatus === 1)
        ) {
          const refundResponse = await axiosInstance.post(
            "http://localhost:8080/api/wallet/cancel-refund",
            {
              orderId: record._id,
              type: 0,
              amount: record.totalAmount,
              status: 1,
              description: `Trả lại tiền đơn hàng đã hủy ${record.orderCode}: ${finalReason}`,
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
      setIsCancelLoading(false); // Tắt trạng thái loading
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleClearAllFilters = () => {
    setSearchText("");
    setOrderStatusFilter(undefined);
    setPaymentStatusFilter(undefined);
    setReturnStatusFilter(undefined);
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

  return (
    <List title="Quản lý đơn hàng">
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder={
            activeTab === "returnRequests"
              ? "Tìm kiếm theo mã đơn hoặc lý do hoàn"
              : "Tìm kiếm theo tên, SĐT, email khách hàng"
          }
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          enterButton
        />
        {activeTab === "all" ? (
          <>
            <Select
              placeholder="Lọc trạng thái đơn hàng"
              allowClear
              value={orderStatusFilter}
              style={{ width: 200 }}
              onChange={setOrderStatusFilter}
              options={Object.entries(statusMap).map(([key, val]) => ({
                label: val.text,
                value: Number(key),
              }))}
            />
            <Select
              placeholder="Lọc trạng thái thanh toán"
              allowClear
              value={paymentStatusFilter}
              style={{ width: 200 }}
              onChange={setPaymentStatusFilter}
              options={Object.entries(paymentStatusMap).map(([key, val]) => ({
                label: val.text,
                value: Number(key),
              }))}
            />
          </>
        ) : (
          <Select
            placeholder="Lọc trạng thái yêu cầu hoàn"
            allowClear
            value={returnStatusFilter}
            style={{ width: 200 }}
            onChange={setReturnStatusFilter}
            options={Object.entries(returnStatusMap).map(([key, val]) => ({
              label: val.text,
              value: Number(key),
            }))}
          />
        )}
        {(searchText ||
          orderStatusFilter !== undefined ||
          paymentStatusFilter !== undefined ||
          returnStatusFilter !== undefined) && (
          <Button onClick={handleClearAllFilters}>Xóa tất cả bộ lọc</Button>
        )}
        <div style={{ color: "#666", fontSize: 12 }}>
          Hiển thị {filteredData.length} /{" "}
          {(activeTab === "returnRequests" ? returnRequests : ordersData)
            ?.length || 0}{" "}
          {activeTab === "returnRequests" ? "yêu cầu hoàn hàng" : "đơn hàng"}
        </div>
      </Space>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as "all" | "returnRequests")}
        style={{ marginBottom: 16 }}
      >
        <Tabs.TabPane tab="Tất cả đơn hàng" key="all" />
        <Tabs.TabPane tab="Yêu cầu hoàn hàng" key="returnRequests" />
      </Tabs>

      {activeTab === "all" ? (
        <Table<Order>
          {...tableProps}
          dataSource={filteredData as Order[]}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={tableProps.pagination}
        >
          <Table.Column<Order>
            dataIndex="orderCode"
            title="Mã đơn"
            width={120}
            fixed="left"
            render={(code) => (
              <Tag color="blue" style={{ fontWeight: "bold" }}>
                {code || "N/A"}
              </Tag>
            )}
          />
          <Table.Column<Order>
            title="Khách hàng"
            width={180}
            render={(_, record) => (
              <div>
                <div style={{ fontWeight: 500 }}>
                  {record.recipientInfo?.name || "N/A"}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {record.recipientInfo?.phone}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {record.recipientInfo?.email}
                </div>
              </div>
            )}
          />
          <Table.Column<Order>
            title="Địa chỉ"
            width={200}
            render={(_, record) => (
              <div style={{ fontSize: 13, color: "#555" }}>
                {record.shippingAddress || "N/A"}
              </div>
            )}
          />
          <Table.Column<Order>
            title="Ngày đặt"
            dataIndex="createdAt"
            width={150}
            sorter={(a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
            render={(createdAt) => (
              <div style={{ fontSize: 13, color: "#555" }}>
                {formatDate(createdAt)}
              </div>
            )}
          />
          <Table.Column<Order>
            title="Trạng thái"
            dataIndex="status"
            width={150}
            filters={Object.entries(statusMap).map(([key, val]) => ({
              text: val.text,
              value: Number(key),
            }))}
            onFilter={(value, record) => record.status === value}
            render={(status) => {
              const s = statusMap[status];
              return (
                <Tag
                  color={s?.color}
                  icon={s?.icon}
                  style={{ fontWeight: "bold" }}
                >
                  {s?.text || status}
                </Tag>
              );
            }}
          />
          <Table.Column<Order>
            title="Thanh toán"
            dataIndex="paymentStatus"
            width={130}
            filters={Object.entries(paymentStatusMap).map(([key, val]) => ({
              text: val.text,
              value: Number(key),
            }))}
            onFilter={(value, record) => record.paymentStatus === value}
            render={(paymentStatus) => {
              const p = paymentStatusMap[paymentStatus];
              return (
                <Tag color={p?.color} style={{ fontWeight: "bold" }}>
                  {p?.text || paymentStatus}
                </Tag>
              );
            }}
          />
          <Table.Column<Order>
            title="Tổng tiền"
            dataIndex="totalAmount"
            width={120}
            render={(value) => (
              <span style={{ fontWeight: 500, color: "#d4380d" }}>
                {formatCurrency(value)}
              </span>
            )}
          />
          <Table.Column<Order>
            title="Hành động"
            width={220}
            fixed="right"
            render={(_, record) => (
              <Space>
                <Tooltip title="Xem chi tiết">
                  <Link to={`/orders/show/${record._id}`}>
                    <Button size="small" icon={<EyeOutlined />} />
                  </Link>
                </Tooltip>
                <OrderActions
                  record={record}
                  loadingId={loadingId}
                  onChangeStatus={handleChangeStatus}
                  onShowCancelModal={showCancelModal}
                />
              </Space>
            )}
          />
        </Table>
      ) : (
        <Table<ReturnRequest>
          dataSource={filteredData as ReturnRequest[]}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={{
            current: 1,
            pageSize: 10,
            total: returnRequests.length,
          }}
        >
          <Table.Column<ReturnRequest>
            dataIndex={["orderId", "orderCode"]}
            title="Mã đơn"
            width={120}
            fixed="left"
            render={(code) => (
              <Tag color="blue" style={{ fontWeight: "bold" }}>
                {code || "N/A"}
              </Tag>
            )}
          />
          <Table.Column<ReturnRequest>
            title="Lý do hoàn"
            dataIndex="reason"
            width={200}
            render={(reason) => (
              <div style={{ fontSize: 13, color: "" }}>{reason || "N/A"}</div>
            )}
          />
          <Table.Column<ReturnRequest>
            title="Số tiền hoàn"
            dataIndex="refundAmount"
            width={120}
            render={(value) => (
              <span style={{ fontWeight: 500, color: "#d4380d" }}>
                {formatCurrency(value)}
              </span>
            )}
          />
          <Table.Column<ReturnRequest>
            title="Ngày yêu cầu"
            dataIndex="createdAt"
            width={150}
            sorter={(a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
            render={(createdAt) => (
              <div style={{ fontSize: 13, color: "" }}>
                {formatDate(createdAt)}
              </div>
            )}
          />
          <Table.Column<ReturnRequest>
            title="Trạng thái"
            dataIndex="status"
            width={150}
            filters={Object.entries(returnStatusMap).map(([key, val]) => ({
              text: val.text,
              value: Number(key),
            }))}
            onFilter={(value, record) => record.status === value}
            render={(status) => {
              const s = returnStatusMap[status];
              return (
                <Tag color={s?.color} style={{ fontWeight: "bold" }}>
                  {s?.text || status}
                </Tag>
              );
            }}
          />
          <Table.Column<ReturnRequest>
            title="Hành động"
            width={220}
            fixed="right"
            render={(_, record) => (
              <Space>
                <Tooltip title="Xem chi tiết đơn hàng">
                  <Link to={`/orders/return-requests/show/${record._id}`}>
                    <Button size="small" icon={<EyeOutlined />} />
                  </Link>
                </Tooltip>
                <ReturnRequestActions
                  record={record}
                  loadingId={loadingId}
                  onChangeReturnStatus={handleChangeReturnStatus}
                />
              </Space>
            )}
          />
        </Table>
      )}

      <Modal
        title="Hủy đơn hàng"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        className="rounded-lg"
        destroyOnClose
      >
        <Form
          form={form}
          onFinish={handleCancelOrder}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="reason"
            label="Lý do hủy"
            rules={[{ required: true, message: "Vui lòng chọn lý do hủy" }]}
          >
            <Select placeholder="Chọn lý do">
              {cancelReasons.map((reason) => (
                <Select.Option key={reason} value={reason}>
                  {reason}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) => prev.reason !== current.reason}
          >
            {({ getFieldValue }) =>
              getFieldValue("reason") === "Khác" ? (
                <Form.Item
                  name="customReason"
                  label="Lý do cụ thể"
                  rules={[
                    { required: true, message: "Vui lòng nhập lý do cụ thể" },
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
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
            >
              <Button onClick={handleModalCancel}>Hủy bỏ</Button>
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
    </List>
  );
};
