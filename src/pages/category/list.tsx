/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusCircleOutlined } from "@ant-design/icons";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { useInvalidate } from "@refinedev/core";
import { message, Popconfirm, Space, Table, Typography } from "antd";
import axios from "axios";
import { useState } from "react";
import { API_URL } from "../../config/dataProvider";
import { ICategory } from "../../interface/category";

export const CategoryList = () => {
  const { tableProps } = useTable<ICategory>({
    syncWithLocation: true,
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " + (error.response?.data?.message | error.message),
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

  return (
    <List title={"Quản lý danh mục"}>
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
                  width={200}
                />
                <Table.Column dataIndex="name" width={420} />
                <Table.Column
                  render={(child: ICategory) =>
                    child.isActive ? "Có hiệu lực" : "Không có hiệu lực"
                  }
                />
                <Table.Column
                  dataIndex="actions"
                  width={330}
                  render={(_, child: ICategory) => (
                    <Space>
                      <EditButton
                        hideText
                        size="small"
                        recordItemId={child._id}
                      />
                      <ShowButton
                        hideText
                        size="small"
                        recordItemId={child._id}
                      />
                      {child.isActive ? (
                        <DeleteButton
                          hideText
                          size="small"
                          recordItemId={child._id}
                          confirmTitle="Bạn chắc chắn xóa không ?"
                          confirmCancelText="Hủy"
                          confirmOkText="Xóa"
                          loading={loadingId === child._id}
                        />
                      ) : (
                        <Popconfirm
                          title="Bạn chắc chắn kích hoạt hiệu lực không ?"
                          onConfirm={() => handleChangeStatus(record)}
                          okText="Kích hoạt"
                          cancelText="Hủy"
                          okButtonProps={{ loading: loadingId === record._id }}
                        >
                          <PlusCircleOutlined
                            style={{
                              border: "1px solid #404040",
                              borderRadius: "20%",
                              padding: 4,
                              cursor: "pointer",
                              opacity: loadingId === record._id ? 0.5 : 1,
                            }}
                          />
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
        <Table.Column dataIndex="name" title="Tên danh mục" width={430} />
        <Table.Column
          width={400}
          title="Trạng thái"
          render={(child: ICategory) =>
            child.isActive ? "Có hiệu lực" : "Không có hiệu lực"
          }
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: ICategory) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record._id} />
              <ShowButton hideText size="small" recordItemId={record._id} />
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
                  <PlusCircleOutlined
                    style={{
                      border: "1px solid #404040",
                      borderRadius: "20%",
                      padding: 4,
                      cursor: "pointer",
                      opacity: loadingId === record._id ? 0.5 : 1,
                    }}
                  />
                </Popconfirm>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
