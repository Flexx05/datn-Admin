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
  Image,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { API_URL } from "../../config/dataProvider";
import { IBrand } from "../../interface/brand";

export const BrandList = () => {
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

  const handleChangeStatus = async (record: IBrand) => {
    setLoadingId(record._id);
    try {
      await axios.patch(`${API_URL}/brand/edit/${record._id}`, {
        isActive: !record.isActive,
      });

      message.success("Cập nhật trạng thái thành công");
      await invalidate({
        resource: "brand",
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
    <List title={"Quản lý thương hiệu"}>
      <Tabs
        activeKey={filterActive ? "active" : "trash"}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      >
        <Tabs.TabPane tab="Thương hiệu đang hoạt động" key="active" />
        <Tabs.TabPane tab="Thùng rác" key="trash" />
      </Tabs>
      <Input.Search
        placeholder="Tìm kiếm thương hiệu"
        allowClear
        onSearch={handleSearch}
        style={{ marginBottom: 16, maxWidth: 300 }}
      />
      <Table {...tableProps} rowKey="_id">
        <Table.Column
          dataIndex="stt"
          title={"STT"}
          render={(_: unknown, __: IBrand, index: number) => index + 1}
        />
        <Table.Column
          dataIndex="logoUrl"
          title={"Ảnh thương hiệu"}
          render={(value: string) => (
            <Image src={value} width={50} height={50} />
          )}
        />
        <Table.Column dataIndex="name" title={"Tên thương hiệu"} />
        <Table.Column dataIndex="slug" title={"Đường dẫn"} />
        <Table.Column
          dataIndex="createdAt"
          title="Ngày tạo"
          render={(value: string) => (
            <Typography.Text>
              {dayjs(value).format("DD/MM/YYYY")}
            </Typography.Text>
          )}
        />
        <Table.Column
          dataIndex="isActive"
          title={"Trạng thái"}
          render={(value: boolean) =>
            value ? (
              <Tag color="green">Có hiệu lực</Tag>
            ) : (
              <Tag color="red">Không có hiệu lực</Tag>
            )
          }
        />
        <Table.Column
          title={"Hành động"}
          dataIndex="actions"
          render={(_, record: IBrand) => (
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
                  <Button type="default" size="small">
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
