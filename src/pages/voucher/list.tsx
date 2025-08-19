import { EditButton, List, ShowButton, useTable } from "@refinedev/antd";
import { useInvalidate } from "@refinedev/core";
import {
  Input,
  Space,
  Table,
  Tag,
  Button,
  Popconfirm,
  message,
  Tabs,
  Tooltip,
} from "antd";
import { DeleteOutlined, RollbackOutlined } from "@ant-design/icons";
import { IVoucher } from "../../interface/voucher";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { axiosInstance } from "../../utils/axiosInstance";
import { socket } from "../../socket/socket";
import { CreateButton } from "../../utils/ButtonForManagement";

const VoucherList = () => {
  const [filterIsDeleted, setFilterIsDeleted] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { tableProps, setFilters } = useTable<IVoucher>({
    syncWithLocation: true,
    permanentFilter: [
      {
        field: "isDeleted",
        operator: "eq",
        value: !filterIsDeleted,
      },
    ],
    onSearch: (value) => [
      {
        field: "code",
        operator: "contains",
        value: value,
      },
      {
        field: "isDeleted",
        operator: "eq",
        value: !filterIsDeleted,
      },
    ],
    errorNotification: (error: any) => ({
      message:
        "Lỗi hệ thống " + (error.response?.data?.message || error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });

  const invalidate = useInvalidate();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.on("connect", () => {
      console.log("Socket connected!", socket.id);
    });
    socket.on("voucherStatusUpdated", () => {
      invalidate({
        resource: "vouchers",
        invalidates: ["list"],
      });
    });
    return () => {
      socket.off("voucherStatusUpdated");
      socket.off("connect");
      socket.disconnect();
    };
  }, [invalidate]);

  // Xử lý xóa mềm voucher (chuyển vào thùng rác)
  const handleDelete = useCallback(
    async (id: string) => {
      setLoadingId(id);
      try {
        await axiosInstance.delete(`/vouchers/delete/${id}`);
        message.success("Thao tác xóa thành công");
        await invalidate({
          resource: "vouchers",
          invalidates: ["list"],
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Lỗi không xác định";
        message.error("Xóa thất bại: " + errorMessage);
      } finally {
        setLoadingId(null);
      }
    },
    [invalidate]
  );

  // Khôi phục voucher từ thùng rác
  const handleRestore = useCallback(
    async (id: string) => {
      setLoadingId(id);
      try {
        await axiosInstance.patch(`/vouchers/restore/${id}`);
        message.success("Khôi phục voucher thành công");
        await invalidate({
          resource: "vouchers",
          invalidates: ["list"],
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Lỗi không xác định";
        message.error("Khôi phục thất bại: " + errorMessage);
      } finally {
        setLoadingId(null);
      }
    },
    [invalidate]
  );

  // Chuyển đổi giữa tab "Voucher đang hoạt động" và "Thùng rác"
  const handleTabChange = useCallback(
    (key: string) => {
      const isActiveFilter = key === "active";
      setFilterIsDeleted(isActiveFilter);
      setSearch("");
      setFilters(
        [
          {
            field: "isDeleted",
            operator: "eq",
            value: !isActiveFilter,
          },
        ],
        "replace"
      );
    },
    [setFilters]
  );

  // Xử lý tìm kiếm voucher
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setFilters(
        value
          ? [
              {
                field: "code",
                operator: "contains",
                value,
              },
              {
                field: "isDeleted",
                operator: "eq",
                value: !filterIsDeleted,
              },
            ]
          : [
              {
                field: "isDeleted",
                operator: "eq",
                value: !filterIsDeleted,
              },
            ],
        "replace"
      );
    },
    [filterIsDeleted, setFilters]
  );

  return (
    <List
      title="Quản lý Voucher"
      createButtonProps={CreateButton("Tạo voucher")}
    >
      <Tabs
        activeKey={filterIsDeleted ? "active" : "trash"}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      >
        <Tabs.TabPane tab="Voucher đang hoạt động" key="active" />
        <Tabs.TabPane tab="Thùng rác" key="trash" />
      </Tabs>

      <Input.Search
        placeholder="Tìm kiếm voucher"
        allowClear
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSearch={handleSearch}
        style={{ marginBottom: 16, maxWidth: 300 }}
      />

      <Table {...tableProps} rowKey="_id">
        <Table.Column title="STT" render={(_, __, index) => index + 1} />
        <Table.Column title="Mã giảm giá" dataIndex="code" />

        <Table.Column
          title="Loại voucher"
          dataIndex="voucherType"
          filters={[
            { text: "Dành cho sản phẩm", value: "product" },
            { text: "Dành cho phí vận chuyển", value: "shipping" },
          ]}
          onFilter={(value, record) => record.voucherType === value}
          render={(type: string) => {
            if (type === "product")
              return <Tag color="purple">Dành cho sản phẩm</Tag>;
            if (type === "shipping")
              return <Tag color="blue">Dành cho phí vận chuyển</Tag>;
            return type;
          }}
        />

        <Table.Column
          title="Loại tạo"
          dataIndex="isAuto"
          key="isAuto"
          filters={[
            { text: "Tạo tự động", value: true },
            { text: "Tạo thủ công", value: false },
          ]}
          onFilter={(value, record) => record.isAuto === value}
          render={(isAuto: boolean) => (
            <Tag color={isAuto ? "magenta" : "gold"}>
              {isAuto ? "Tạo tự động" : "Tạo thủ công"}
            </Tag>
          )}
        />

        <Table.Column
          title="Giá trị giảm"
          render={(_, record) => {
            if (record.discountType === "fixed") {
              return `${record.discountValue.toLocaleString()}đ`;
            }

            const value = `${record.discountValue}%`;
            const max = record.maxDiscount
              ? `(Tối đa ${record.maxDiscount.toLocaleString()}đ)`
              : "";

            return `${value}${max}`;
          }}
        />

        <Table.Column
          title="Đơn tối thiểu"
          dataIndex="minOrderValues"
          render={(value) => `${value.toLocaleString()}đ`}
        />

        <Table.Column
          title="Dùng / SL"
          render={(_, record) => `${record.used} / ${record.quantity}`}
        />

        <Table.Column
          title="Hiệu lực"
          render={(_, record) => (
            <div>
              {dayjs(record.startDate).format("HH:mm DD/MM/YYYY")}
              <br />
              {dayjs(record.endDate).format("HH:mm DD/MM/YYYY")}
            </div>
          )}
        />

        <Table.Column
          title="Trạng thái"
          dataIndex="voucherStatus"
          filters={[
            { text: "Có hiệu lực", value: "active" },
            { text: "Không có hiệu lực", value: "inactive" },
            { text: "Hết hạn", value: "expired" },
          ]}
          onFilter={(value, record) => record.voucherStatus === value}
          render={(status: string) => {
            if (status === "active")
              return <Tag color="green">Có hiệu lực</Tag>;
            if (status === "inactive")
              return <Tag color="yellow">Không có hiệu lực</Tag>;
            if (status === "expired") return <Tag color="red">Hết hạn</Tag>;
            return status;
          }}
        />

        <Table.Column<IVoucher>
          title="Thao tác"
          render={(_, record) => {
            const deleteButton = (
              <Popconfirm
                title="Bạn có chắc chắn chuyển voucher này vào thùng rác?"
                onConfirm={() => handleDelete(record._id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  size="small"
                  loading={loadingId === record._id}
                  disabled={loadingId === record._id}
                />
              </Popconfirm>
            );

           const permanentDeleteButton = record.isAuto ? (
             <Tooltip title="Không thể xóa vĩnh viễn voucher tự động">
               <span>
                 <Button
                   icon={<DeleteOutlined />}
                   danger
                   size="small"
                   disabled
                 />
               </span>
             </Tooltip>
           ) : (
             <Popconfirm
               title="Bạn có chắc chắn muốn xóa vĩnh viễn voucher này? Hành động này không thể hoàn tác."
               onConfirm={() => handleDelete(record._id)}
               okText="Xóa vĩnh viễn"
               cancelText="Hủy"
               okButtonProps={{
                 danger: true,
                 loading: loadingId === record._id,
               }}
             >
               <Button
                 icon={<DeleteOutlined />}
                 danger
                 size="small"
                 loading={loadingId === record._id}
                 disabled={loadingId === record._id}
               />
             </Popconfirm>
           );

            const editButton = (() => {
              if (record.voucherStatus === "expired") {
                return (
                  <Tooltip title="Voucher đã hết hạn, không thể chỉnh sửa">
                    <span>
                      <EditButton
                        hideText
                        size="small"
                        recordItemId={record._id}
                        disabled
                      />
                    </span>
                  </Tooltip>
                );
              }

              if (record.isAuto) {
                return (
                  <Tooltip title="Không thể chỉnh sửa voucher được tạo tự động">
                    <span>
                      <EditButton
                        hideText
                        size="small"
                        recordItemId={record._id}
                        disabled
                      />
                    </span>
                  </Tooltip>
                );
              }

              return (
                <EditButton hideText size="small" recordItemId={record._id} />
              );
            })();

            return (
              <Space>
                {filterIsDeleted && editButton}
                <ShowButton hideText size="small" recordItemId={record._id} />
                {!filterIsDeleted ? (
                  <>
                    {permanentDeleteButton}
                    <Popconfirm
                      title="Bạn chắc chắn khôi phục voucher này?"
                      onConfirm={() => handleRestore(record._id)}
                      okText="Khôi phục"
                      cancelText="Hủy"
                      okButtonProps={{ loading: loadingId === record._id }}
                    >
                      <Button
                        icon={<RollbackOutlined />}
                        size="small"
                        loading={loadingId === record._id}
                        disabled={loadingId === record._id}
                      >
                        Khôi phục
                      </Button>
                    </Popconfirm>
                  </>
                ) : (
                  deleteButton
                )}
              </Space>
            );
          }}
        />
      </Table>
    </List>
  );
};

export default VoucherList;
