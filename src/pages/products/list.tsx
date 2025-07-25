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
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import React, { useCallback, useState } from "react";
import {
  IProduct,
  IProductAttribute,
  IVariation,
} from "../../interface/product";
import { axiosInstance } from "../../utils/axiosInstance";
import { ColorDots } from "./ColorDots";
import { VariationTable } from "./VariationTable";
import LoadingShoes from "../../utils/loading";

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleChangeStatus = useCallback(
    async (record: IProduct | IVariation | any) => {
      setLoadingId(record._id);
      try {
        await axiosInstance.patch(`/product/edit/status/${record._id}`, {
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
      <Popconfirm
        title="Bạn chắc chắn xóa các sản phẩm đã chọn không ?"
        onConfirm={async () => {
          if (selectedRowKeys.length === 0) return;
          try {
            await Promise.all(
              selectedRowKeys.map((id) =>
                axiosInstance.delete(`product/delete/${id}`)
              )
            );
            message.success("Xóa thành công");
            await invalidate({
              resource: "product",
              invalidates: ["list"],
            });
            setSelectedRowKeys([]);
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Lỗi không xác định";
            message.error("Xóa thất bại: " + errorMessage);
          }
        }}
        okText="Xóa"
        cancelText="Hủy"
      >
        <Button
          type="primary"
          danger
          style={{ marginBottom: 16 }}
          disabled={!selectedRowKeys.length}
        >
          Xóa hàng loạt
        </Button>
      </Popconfirm>
      <Table
        {...tableProps}
        rowKey="_id"
        loading={
          tableProps.loading
            ? {
                indicator: <LoadingShoes />,
              }
            : false
        }
        rowSelection={{
          type: "checkbox",
          selectedRowKeys,
          onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
        }}
        expandable={{
          expandedRowRender: (record: IProduct | IVariation | any) => (
            <VariationTable product={record} />
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
          title="Thuộc tính"
          dataIndex="attributes"
          key="attributes"
          render={(attrs: IProductAttribute[]) => {
            // Tìm thuộc tính có giá trị là mã màu
            const colorAttr = attrs.find(
              (attr) =>
                Array.isArray(attr.values) &&
                attr.values.some(
                  (val) =>
                    typeof val === "string" &&
                    (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val) ||
                      /^rgb(a)?\(/.test(val))
                )
            );
            // Tìm thuộc tính còn lại là kích thước hoặc các giá trị khác
            const otherAttr = attrs.filter((attr) => attr !== colorAttr);
            return (
              <div>
                {colorAttr ? <ColorDots colors={colorAttr.values} /> : null}
                {otherAttr.length > 0 && (
                  <div style={{ marginTop: 4, fontSize: 13 }}>
                    {otherAttr.map((attr) => attr.values.join(", ")).join(", ")}
                  </div>
                )}
              </div>
            );
          }}
        />
        <Table.Column
          title="Tồn kho"
          dataIndex="inStock"
          render={(_, record: IProduct) =>
            record.variation?.reduce((prev, curr) => prev + curr.stock, 0) || 0
          }
          filters={[
            { text: "Còn hàng", value: true },
            { text: "Hết hàng", value: false },
          ]}
          onFilter={(value, record) => record.inStock === value}
        />
        <Table.Column
          title="Ngày tạo"
          dataIndex="createdAt"
          sorter={(a: IProduct, b: IProduct) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          }
          render={(value: string) => dayjs(value).format("DD/MM/YYYY")}
        />
        <Table.Column
          title="Hành động"
          dataIndex="actions"
          render={(_, record: IProduct) => (
            <Space>
              <Tooltip title="Chỉnh sửa sản phẩm">
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
                disabled={loadingId === record._id}
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
