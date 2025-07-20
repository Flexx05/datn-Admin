/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { useInvalidate } from "@refinedev/core";
import {
  Button,
  Input,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Tooltip,
  Typography,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { API_URL } from "../../config/dataProvider";
import { IAttribute } from "../../interface/attribute";
import { ColorDots } from "../products/ColorDots";

export const AttributeList = () => {
  const [filterActive, setFilterActive] = useState<boolean>(true);
  const { tableProps, setFilters } = useTable({
    syncWithLocation: true,
    permanentFilter: [
      {
        field: "isActive",
        operator: "eq",
        value: filterActive,
      },
    ],
    onSearch: (value) => [
      {
        field: "search",
        operator: "contains",
        value: value,
      },
    ],
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " + (error.response?.data?.message | error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });
  const invalidate = useInvalidate();
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleChangeStatus = async (record: IAttribute) => {
    setLoadingId(record._id);
    try {
      await axios.patch(`${API_URL}/attribute/edit/${record._id}`, {
        values: record.values,
        name: record.name,
        isActive: !record.isActive,
      });

      message.success("Cập nhật trạng thái thành công");
      await invalidate({
        resource: "attribute",
        invalidates: ["list"],
      });
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoadingId(null);
    }
  };

  const handleTabChange = useCallback(
    (key: string) => {
      const isActiveFilter = key === "active";
      setFilterActive(isActiveFilter);
      // Cập nhật lại filter mới
      setFilters(
        [
          {
            field: "isActive",
            operator: "eq",
            value: isActiveFilter,
          },
        ],
        "replace"
      );
    },
    [setFilters]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setFilters(
        value
          ? [
              {
                field: "search",
                operator: "contains",
                value,
              },
              {
                field: "isActive",
                operator: "eq",
                value: filterActive,
              },
            ]
          : [
              {
                field: "isActive",
                operator: "eq",
                value: filterActive,
              },
            ],
        "replace"
      );
    },
    [filterActive, setFilters]
  );

  return (
    <List title={"Quản lý thuộc tính"}>
      <Tabs
        activeKey={filterActive ? "active" : "trash"}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      >
        <Tabs.TabPane tab="Thuộc tính đang hoạt động" key="active" />
        <Tabs.TabPane tab="Thùng rác" key="trash" />
      </Tabs>
      <Input.Search
        placeholder="Tìm kiếm tên thuộc tính"
        allowClear
        onSearch={handleSearch}
        style={{ marginBottom: 16, maxWidth: 300 }}
      />
      <Popconfirm
        title="Bạn chắc chắn xóa hàng loạt không ?"
        onConfirm={async () => {
          if (selectedRowKeys.length === 0) return;
          try {
            await Promise.all(
              selectedRowKeys.map((id) =>
                axios.delete(`${API_URL}/attribute/delete/${id}`)
              )
            );
            message.success("Xóa hàng loạt thành công");
            setSelectedRowKeys([]);
            await invalidate({
              resource: "attribute",
              invalidates: ["list"],
            });
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Lỗi không xác định";
            message.error("Xóa thất bại: " + errorMessage);
          }
        }}
      >
        <Button
          danger
          disabled={selectedRowKeys.length === 0}
          style={{ marginBottom: 16 }}
        >
          Xóa hàng loạt
        </Button>
      </Popconfirm>
      <Table
        {...tableProps}
        rowKey="_id"
        loading={tableProps.loading}
        rowSelection={{
          type: "checkbox",
          selectedRowKeys,
          onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
        }}
      >
        <Table.Column
          dataIndex="stt"
          title={"STT"}
          render={(_: unknown, __: IAttribute, index: number) => index + 1}
        />
        <Table.Column dataIndex="name" title={"Tên thuộc tính"} />
        <Table.Column
          dataIndex="values"
          title={"Giá trị"}
          render={(_: unknown, record: IAttribute) => {
            return record.isColor ? (
              <ColorDots colors={record.values} />
            ) : (
              record.values.join(", ")
            );
          }}
        />
        <Table.Column
          dataIndex="countProduct"
          title={"Số lượng sản phẩm sử dụng"}
          render={(value: number) => (
            <Typography.Text>{value || 0}</Typography.Text>
          )}
        />
        <Table.Column
          dataIndex="createdAt"
          title={"Ngày tạo"}
          render={(value: string) => (
            <Typography.Text>
              {dayjs(value).format("DD/MM/YYYY")}
            </Typography.Text>
          )}
          sorter={(a: IAttribute, b: IAttribute) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          }
        />
        <Table.Column
          title={"Hành động"}
          dataIndex="actions"
          render={(_, record: IAttribute) => (
            <Space>
              <Tooltip title="Chỉnh sửa thuộc tính">
                <EditButton
                  hideText
                  size="small"
                  recordItemId={record._id}
                  hidden={!record.isActive}
                />
              </Tooltip>
              <Tooltip title="Xem chi tiết">
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={record._id}
                  hidden={!record.isActive}
                />
              </Tooltip>
              <DeleteButton
                hideText
                size="small"
                recordItemId={record._id}
                confirmTitle={
                  record.isActive
                    ? "Bạn chắc chắn chuyển vào thùng rác không ?"
                    : "Bạn chắc chắn xóa vĩnh viễn không ?"
                }
                confirmCancelText="Hủy"
                confirmOkText="Xóa"
                loading={loadingId === record._id}
                hidden={record.countProduct > 0}
              />
              {record.isActive === false && (
                <Popconfirm
                  title="Bạn chắc chắn kích hoạt hiệu lực không ?"
                  onConfirm={() => handleChangeStatus(record)}
                  okText="Kích hoạt"
                  cancelText="Hủy"
                  okButtonProps={{ loading: loadingId === record._id }}
                >
                  <Button size="small" type="default">
                    Kích hoạt
                  </Button>
                </Popconfirm>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
