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
  Typography,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { API_URL } from "../../config/dataProvider";
import { IAttribute } from "../../interface/attribute";

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
      <Table {...tableProps} rowKey="_id">
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
              <div style={{ display: "flex", gap: 4 }}>
                {record.values.map((item: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: item,
                      borderRadius: "50%",
                      border: "1px solid grey",
                    }}
                  ></div>
                ))}
              </div>
            ) : (
              record.values.join(", ")
            );
          }}
        />
        <Table.Column
          dataIndex="createdAt"
          title={"Ngày tạo"}
          render={(value: string) => (
            <Typography.Text>
              {dayjs(value).format("DD/MM/YYYY")}
            </Typography.Text>
          )}
        />
        <Table.Column
          title={"Hành động"}
          dataIndex="actions"
          render={(_, record: IAttribute) => (
            <Space>
              <EditButton
                hideText
                size="small"
                recordItemId={record._id}
                hidden={!record.isActive}
              />
              <ShowButton
                hideText
                size="small"
                recordItemId={record._id}
                hidden={!record.isActive}
              />
              {record.isActive ? (
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={record._id}
                  confirmTitle="Bạn chắc chắn xóa không ?"
                  confirmCancelText="Hủy"
                  confirmOkText="Xóa"
                  loading={loadingId === record._id}
                />
              ) : (
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
