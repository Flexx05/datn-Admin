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
  message,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Tooltip,
  Typography,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { API_URL } from "../../config/dataProvider";
import { ICategory } from "../../interface/category";
import Loader from "../../utils/loading";

export const CategoryList = () => {
  const [filterActive, setFilterActive] = useState<boolean>(true);
  const { tableProps, setFilters } = useTable<ICategory>({
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
        "❌ Lỗi hệ thống " + (error.response?.data?.message || error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });

  const invalidate = useInvalidate();

  const handleChangeStatus = async (record: ICategory) => {
    try {
      await axios.patch(`${API_URL}/category/edit/${record._id}`, {
        parentId: record.parentId,
        name: record.name,
        isActive: !record.isActive,
      });

      message.success("Cập nhật trạng thái thành công");
      await invalidate({
        resource: "category",
        invalidates: ["list"],
      });
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
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

  const columns = [
    {
      dataIndex: "stt",
      title: "STT",
      render: (_: unknown, __: ICategory, index: number) => index + 1,
      width: 60,
    },
    {
      dataIndex: "name",
      title: "Tên danh mục",
      width: 200,
    },
    {
      dataIndex: "slug",
      title: "Đường dẫn",
      width: 200,
    },
    {
      dataIndex: "countProduct",
      title: "Số sản phẩm trong danh mục",
      width: 180,
    },
    {
      dataIndex: "createdAt",
      title: "Ngày tạo",
      render: (value: string) => (
        <Typography.Text>{dayjs(value).format("DD/MM/YYYY")}</Typography.Text>
      ),
      width: 100,
      sorter: (a: ICategory, b: ICategory) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Hành động",
      dataIndex: "actions",
      render: (_: unknown, record: ICategory) => {
        const isUnknown = record.slug === "danh-muc-khong-xac-dinh";
        return (
          <Space>
            <Tooltip title="Chỉnh sửa danh mục">
              <EditButton
                hideText
                size="small"
                recordItemId={record._id}
                hidden={!record.isActive || isUnknown}
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
                  ? `Bạn chắc chắn chuyển vào thùng rác ${
                      record.countProduct &&
                      `và chuyển ${record.countProduct} sản phẩm vào Danh mục không xác định`
                    } không ?`
                  : "Bạn chắc chắn xóa vĩnh viễn không ?"
              }
              confirmCancelText="Hủy"
              confirmOkText="Xóa"
              hidden={isUnknown}
            />
            {record.isActive === false && (
              <Popconfirm
                title="Bạn chắc chắn kích hoạt hiệu lực không ?"
                onConfirm={() => handleChangeStatus(record)}
                okText="Kích hoạt"
                cancelText="Hủy"
              >
                <Button size="small" type="default">
                  Kích hoạt
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
      width: 150,
    },
  ];

  return (
    <List title={"Quản lý danh mục"}>
      <Tabs
        activeKey={filterActive ? "active" : "trash"}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      >
        <Tabs.TabPane tab="Danh mục đang hoạt động" key="active" />
        <Tabs.TabPane tab="Thùng rác" key="trash" />
      </Tabs>
      <Input.Search
        placeholder="Tìm kiếm danh mục"
        allowClear
        onSearch={handleSearch}
        style={{ marginBottom: 16, maxWidth: 200 }}
      />
      <Table
        {...tableProps}
        loading={tableProps.loading ? { indicator: <Loader /> } : undefined}
        rowKey="_id"
        columns={columns}
        expandable={{
          expandedRowRender: (record: ICategory) => {
            const children = record.subCategories;

            if (!children || children.length === 0) {
              return (
                <Typography.Text type="secondary">
                  Không có danh mục con
                </Typography.Text>
              );
            }

            return (
              <Table
                dataSource={children}
                columns={columns}
                pagination={false}
                rowKey="_id"
                size="large"
                showHeader={false}
              />
            );
          },
          rowExpandable: (record) => !!record.subCategories?.length,
        }}
      />
    </List>
  );
};
