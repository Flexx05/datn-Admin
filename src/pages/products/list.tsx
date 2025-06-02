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
import {
  Image,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { useState } from "react";
import { API_URL } from "../../config/dataProvider";
import {
  IProduct,
  IProductAttribute,
  IVariation,
} from "../../interface/product";

export const ProductList = () => {
  const { tableProps, setFilters } = useTable<IProduct>({
    syncWithLocation: true,
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " + (error.response?.data?.message || error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });

  const invalidate = useInvalidate();
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  const handleChangeStatus = async (record: IProduct | IVariation | any) => {
    setLoadingId(record._id);
    try {
      await axios.patch(`${API_URL}/product/edit/status/${record._id}`, {
        isActive: !record.isActive,
      });

      message.success("Cập nhật trạng thái thành công");
      await invalidate({
        resource: "product",
        invalidates: ["list"],
      });
    } catch (error: any) {
      message.error(
        "Cập nhật trạng thái thất bại " + error.response?.data?.message
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <List title={"Quản lý sản phẩm"}>
      <Input.Search
        placeholder="Tìm kiếm sản phẩm"
        allowClear
        onSearch={(value) =>
          setFilters([{ field: "name", operator: "eq", value }], "replace")
        }
        style={{ marginBottom: 16, maxWidth: 300 }}
      />
      <Table
        {...tableProps}
        rowKey="_id"
        expandable={{
          expandedRowRender: (record: IProduct | IVariation | any) => {
            const children = record.variation;

            if (!children || children.length === 0) {
              return (
                <Typography.Text type="secondary">
                  Không có biến thể
                </Typography.Text>
              );
            }

            return (
              <Table
                dataSource={children}
                pagination={false}
                rowKey="_id"
                size="small"
              >
                <Table.Column
                  dataIndex="stt"
                  title="STT"
                  render={(_: unknown, __: IVariation, index: number) =>
                    index + 1
                  }
                />
                <Table.Column
                  dataIndex="image"
                  title="Ảnh"
                  render={(_, child: IVariation) => (
                    <Image width={55} src={child.image} />
                  )}
                />
                <Table.Column
                  dataIndex="attributes"
                  title="Thuộc tính"
                  render={(_, child: IVariation) => (
                    <Space>
                      {child.attributes.map(
                        (attr: IProductAttribute, attrIdx: number) => (
                          <span key={attrIdx}>
                            {attr.values.map((value: string, valIdx: number) =>
                              value.includes("#") ? (
                                <span
                                  key={valIdx}
                                  style={{
                                    display: "inline-block",
                                    width: 16,
                                    height: 16,
                                    backgroundColor: value,
                                    borderRadius: "50%",
                                    marginRight: 4,
                                    border: "1px solid #ccc",
                                  }}
                                />
                              ) : (
                                <span key={valIdx} style={{ marginRight: 4 }}>
                                  {value}
                                </span>
                              )
                            )}
                          </span>
                        )
                      )}
                    </Space>
                  )}
                />
                <Table.Column dataIndex="regularPrice" title="Giá bán" />
                <Table.Column dataIndex="salePrice" title="Giá sale" />
                <Table.Column
                  dataIndex="dateSale"
                  title="Thời gian sale"
                  render={(_, child: IVariation) =>
                    child.saleForm != ""
                      ? child.saleForm
                      : "Không có" + " - " + child.saleTo
                      ? child.saleTo
                      : "Không có"
                  }
                />
                <Table.Column
                  title="Trạng thái"
                  render={(value: boolean) =>
                    value === true ? (
                      <Tag color="green">Có hiệu lực</Tag>
                    ) : (
                      <Tag color="red">Không có hiệu lực</Tag>
                    )
                  }
                />
              </Table>
            );
          },
          rowExpandable: (record) => !!record.variation?.length,
        }}
      >
        <Table.Column
          dataIndex="stt"
          title="STT"
          render={(_: unknown, __: IProduct, index: number) => index + 1}
        />
        <Table.Column
          dataIndex="image"
          title="Ảnh sản phẩm"
          render={(_, record: IProduct) => (
            <Image
              src={record.image[0]}
              width={55}
              height={55}
              alt="Ảnh sản phẩm"
            />
          )}
        />
        <Table.Column dataIndex="name" title="Tên sản phẩm" />
        <Table.Column dataIndex="brandName" title="Thương hiệu" />
        <Table.Column dataIndex="categoryName" title="Danh mục" />
        <Table.Column
          dataIndex="attributes"
          title="Thuộc tính của sản phẩm"
          render={(value: IProductAttribute[]) => (
            <>
              {value?.map((item) => (
                <div>
                  {item.attributeName}:{" "}
                  {item.isColor ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      {item.values.map((color, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: color,
                            borderRadius: "50%",
                          }}
                        ></div>
                      ))}
                    </div>
                  ) : (
                    item.values.join(", ")
                  )}
                </div>
              ))}
            </>
          )}
        />
        <Table.Column
          title="Trạng thái"
          dataIndex="isActive"
          filters={[
            { text: "Có hiệu lực", value: true },
            { text: "Không có hiệu lực", value: false },
          ]}
          onFilter={(value, record) => {
            return (
              record.isActive === value ||
              record.subCategories?.some(
                (child: IProduct) => child.isActive === value
              )
            );
          }}
          render={(value: boolean) =>
            value ? (
              <Tag color="green">Có hiệu lực</Tag>
            ) : (
              <Tag color="red">Không có hiệu lực</Tag>
            )
          }
        />
        <Table.Column
          title="Hành động"
          dataIndex="actions"
          render={(_, record: IProduct) => (
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
