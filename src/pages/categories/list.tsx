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
  Typography,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { API_URL } from "../../config/dataProvider";
import { ICategory } from "../../interface/category";

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
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  const handleChangeStatus = async (record: ICategory) => {
    setLoadingId(record._id);
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
        style={{ marginBottom: 16, maxWidth: 300 }}
      />
      <Table
        {...tableProps}
        rowKey="_id"
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
                pagination={false}
                rowKey="_id"
                size="small"
                showHeader={false}
              >
                <Table.Column
                  dataIndex="stt"
                  render={(_: unknown, __: ICategory, index: number) =>
                    index + 1
                  }
                  width={90}
                />
                <Table.Column dataIndex="name" width={250} />
                <Table.Column dataIndex="slug" width={270} />
                <Table.Column dataIndex="countProduct" width={300} />
                <Table.Column
                  dataIndex="createdAt"
                  render={(value: string) => (
                    <Typography.Text>
                      {dayjs(value).format("DD/MM/YYYY")}
                    </Typography.Text>
                  )}
                />
                <Table.Column
                  dataIndex="actions"
                  width={180}
                  render={(_, child: ICategory) => (
                    <Space>
                      <EditButton
                        hideText
                        size="small"
                        recordItemId={child._id}
                        hidden={!child.isActive}
                      />
                      <ShowButton
                        hideText
                        size="small"
                        recordItemId={child._id}
                        hidden={!child.isActive}
                      />
                      <DeleteButton
                        hideText
                        size="small"
                        recordItemId={child._id}
                        confirmTitle={
                          child.isActive
                            ? `Bạn chắc chắn chuyển vào thùng rác ${
                                child.countProduct &&
                                `và chuyển ${child.countProduct} sản phẩm vào Danh mục không xác định`
                              } không ?`
                            : "Bạn chắc chắn xóa vĩnh viễn không ?"
                        }
                        confirmCancelText="Hủy"
                        confirmOkText="Xóa"
                        loading={loadingId === child._id}
                      />
                      {child.isActive === false && (
                        <Popconfirm
                          title="Bạn chắc chắn kích hoạt hiệu lực không ?"
                          onConfirm={() => handleChangeStatus(child)}
                          okText="Kích hoạt"
                          cancelText="Hủy"
                          okButtonProps={{ loading: loadingId === child._id }}
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
            );
          },
          rowExpandable: (record) => !!record.subCategories?.length,
        }}
      >
        <Table.Column
          dataIndex="stt"
          title="STT"
          render={(_: unknown, __: ICategory, index: number) => index + 1}
        />
        <Table.Column dataIndex="name" title="Tên danh mục" />
        <Table.Column dataIndex="slug" title="Đường dẫn" />
        <Table.Column
          dataIndex="countProduct"
          title="Số sản phẩm trong danh mục"
        />
        <Table.Column
          dataIndex="createdAt"
          title="Ngày tạo"
          render={(value: string) => (
            <Typography.Text>
              {dayjs(value).format("DD/MM/YYYY")}
            </Typography.Text>
          )}
          sorter={(a: ICategory, b: ICategory) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          }
        />
        <Table.Column
          title="Hành động"
          dataIndex="actions"
          render={(_, record: ICategory) => {
            const isUnknown = record.slug === "danh-muc-khong-xac-dinh"; // thay slug này nếu cần
            return (
              <Space>
                <EditButton
                  hideText
                  size="small"
                  recordItemId={record._id}
                  hidden={!record.isActive || isUnknown}
                />
                <ShowButton
                  hideText
                  size="small"
                  recordItemId={record._id}
                  hidden={!record.isActive}
                />
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
                  loading={loadingId === record._id}
                  hidden={isUnknown}
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
            );
          }}
        />
      </Table>
    </List>
  );
};
