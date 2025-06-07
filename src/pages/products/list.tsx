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
  Tabs,
  Tag,
} from "antd";
import axios from "axios";
import { useCallback, useState } from "react";
import { API_URL } from "../../config/dataProvider";
import {
  IProduct,
  IProductAttribute,
  IVariation,
} from "../../interface/product";
import { ColorDots } from "./ColorDots";
import { VariationTable } from "./VariationTable";

export const ProductList = () => {
  const [filterActive, setFilterActive] = useState<boolean>(true);
  const { tableProps, setFilters } = useTable<IProduct>({
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
        field: "name",
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

  const handleChangeStatus = useCallback(
    async (record: IProduct | IVariation | any) => {
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
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Lỗi không xác định";
        message.error("Cập nhật trạng thái thất bại: " + errorMessage);
      } finally {
        setLoadingId(null);
      }
    },
    [invalidate]
  );

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
    <List title={"Quản lý sản phẩm"}>
      <Tabs
        activeKey={filterActive ? "active" : "trash"}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      >
        <Tabs.TabPane tab="Sản phẩm đang hoạt động" key="active" />
        <Tabs.TabPane tab="Thùng rác" key="trash" />
      </Tabs>
      <Input.Search
        placeholder="Tìm kiếm sản phẩm"
        allowClear
        onSearch={handleSearch}
        style={{ marginBottom: 16, maxWidth: 300 }}
      />
      <Table
        {...tableProps}
        rowKey="_id"
        expandable={{
          expandedRowRender: (record: IProduct | IVariation | any) => (
            <VariationTable variations={record.variation} />
          ),
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
          title="Màu sắc"
          dataIndex="attributes"
          key="color"
          render={(attrs: IProductAttribute[]) => {
            const colorAttr = attrs.find(
              (attr) => attr.attributeName === "Màu sắc"
            );
            return colorAttr ? <ColorDots colors={colorAttr.values} /> : null;
          }}
        />
        <Table.Column
          title="Kích thước"
          dataIndex="attributes"
          key="size"
          render={(attrs: IProductAttribute[]) => {
            const sizeAttr = attrs.find(
              (attr) => attr.attributeName === "Kích thước"
            );
            return sizeAttr?.values?.join(", ") || "";
          }}
        />
        <Table.Column
          title="Tồn kho"
          dataIndex="stock"
          render={(_, record: IProduct) =>
            record.variation?.reduce((prev, curr) => prev + curr.stock, 0) || 0
          }
        />
        <Table.Column
          title="Trạng thái"
          dataIndex="isActive"
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
                  disabled={loadingId === record._id}
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
                      cursor:
                        loadingId === record._id ? "not-allowed" : "pointer",
                      opacity: loadingId === record._id ? 0.5 : 1,
                    }}
                    disabled={loadingId === record._id}
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
