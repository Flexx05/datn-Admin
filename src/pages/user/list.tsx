/* eslint-disable @typescript-eslint/no-explicit-any */
import { EditButton, List, ShowButton, useTable } from "@refinedev/antd";
import { CrudFilters, useInvalidate } from "@refinedev/core";
import { Button, Input, Popconfirm, Space, Table, Tag, message } from "antd";
import axios from "axios";
import { useState } from "react";
import { API_URL } from "../../config/dataProvider";
import { IUser } from "../../interface/user";

export const UserList = () => {
  const { tableProps, setFilters } = useTable<IUser>({
    syncWithLocation: true,
    resource: "admin/users",
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " + (error.response?.data?.message || error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
    onSearch: (value: unknown): CrudFilters => [
      { field: "search", operator: "contains", value: String(value) },
    ],
    meta: {
      transform: (response: any) => ({
        data: response.data.users,
        total: response.data.pagination.totalUsers,
      }),
    },
  });

  const invalidate = useInvalidate();
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  const setFiltersTyped = setFilters as (
    filters: CrudFilters,
    behavior?: string
  ) => void;

  const handleChangeStatus = async (record: IUser) => {
    setLoadingId(record._id);
    try {
      await axios.patch(`${API_URL}/admin/users/${record._id}/status`, {
        isActive: !record.isActive,
      });
      message.success("Cập nhật trạng thái thành công");
      await invalidate({ resource: "admin/users", invalidates: ["list"] });
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <List title="Quản lý khách hàng">
      <Input.Search
        placeholder="Tìm kiếm khách hàng"
        allowClear
        onSearch={(value: string) =>
          setFiltersTyped(
            [{ field: "search", operator: "contains", value }],
            "merge"
          )
        }
        style={{ marginBottom: 16, maxWidth: 300 }}
      />
      <Table
        {...tableProps}
        rowKey="_id"
        onChange={(pagination, filters, sorter, extra) => {
          tableProps.onChange?.(pagination, filters, sorter, extra);

          if (filters.isActive !== undefined) {
            setFiltersTyped(
              [
                ...(filters.isActive
                  ? [
                      {
                        field: "isActive",
                        operator: "eq" as const,
                        value: Boolean(filters.isActive[0]),
                      },
                    ]
                  : []),
              ],
              "merge"
            );
          }
        }}
      >
        <Table.Column
          dataIndex="stt"
          title="STT"
          render={(_: unknown, __: IUser, index: number) => index + 1}
        />
        <Table.Column dataIndex="fullName" title="Tên người dùng" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column
          dataIndex="phone"
          title="Số điện thoại"
          render={(value: string) => value || "Chưa cập nhật"}
        />
        <Table.Column
          dataIndex="isActive"
          title="Trạng thái"
          filters={[
            { text: "Hoạt động", value: true },
            { text: "Khoá", value: false },
          ]}
          filterMultiple={false}
          render={(value: boolean) =>
            value ? (
              <Tag color="green">Hoạt động</Tag>
            ) : (
              <Tag color="red">Khoá</Tag>
            )
          }
        />
        <Table.Column
          title="Hành động"
          dataIndex="actions"
          render={(_, record: IUser) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record._id} />
              <EditButton hideText size="small" recordItemId={record._id} />
              <Popconfirm
                title={
                  record.isActive
                    ? "Bạn chắc chắn muốn khoá tài khoản này?"
                    : "Bạn chắc chắn muốn mở khoá tài khoản này?"
                }
                onConfirm={() => handleChangeStatus(record)}
                okText={record.isActive ? "Khoá" : "Mở khoá"}
                cancelText="Huỷ"
                okButtonProps={{ loading: loadingId === record._id }}
              >
                <Button
                  size="small"
                  type={record.isActive ? "default" : "primary"}
                >
                  {record.isActive ? "Khoá" : "Mở khoá"}
                </Button>
              </Popconfirm>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
