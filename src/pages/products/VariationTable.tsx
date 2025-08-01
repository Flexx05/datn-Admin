/* eslint-disable @typescript-eslint/no-explicit-any */
import { RetweetOutlined } from "@ant-design/icons";
import { useInvalidate } from "@refinedev/core";
import {
  Image,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import {
  IProduct,
  IProductAttribute,
  IVariation,
} from "../../interface/product";
import { formatCurrency } from "../order/formatCurrency";
import { ColorDots } from "./ColorDots";
import { axiosInstance } from "../../utils/axiosInstance";

export const VariationTable = ({ product }: { product: IProduct }) => {
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const invalidate = useInvalidate();
  const variations = product.variation;
  if (!variations || variations.length === 0) {
    return (
      <Typography.Text type="secondary">Không có biến thể</Typography.Text>
    );
  }
  const handleChangeStatus = async (variation: IVariation) => {
    if (!product?._id || !variation?._id) return;

    setLoadingId(variation._id);
    try {
      await axiosInstance.patch(`variation/edit/${variation._id}`, {
        productId: product._id,
        isActive: variation.isActive,
      });

      message.success("Cập nhật trạng thái thành công");

      await invalidate({
        id: product._id,
        resource: "product",
        invalidates: ["list"],
      });
    } catch (error: any) {
      message.error(
        "Cập nhật trạng thái thất bại: " + error.response?.data?.error
      );
    } finally {
      setLoadingId(null);
    }
  };
  return (
    <Table dataSource={variations} pagination={false} rowKey="_id" size="small">
      <Table.Column
        dataIndex="stt"
        title="STT"
        render={(_: unknown, __: IVariation, index: number) => index + 1}
      />
      <Table.Column
        dataIndex="image"
        title="Ảnh"
        render={(_, child: IVariation) => (
          <Image width={55} src={child.image} />
        )}
      />
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {colorAttr ? <ColorDots colors={colorAttr.values} /> : null}
              {otherAttr.length > 0 && (
                <span>
                  {otherAttr.map((attr) => attr.values.join(", ")).join(", ")}
                </span>
              )}
            </div>
          );
        }}
      />
      <Table.Column
        dataIndex="regularPrice"
        title="Giá bán"
        render={(value: number) => formatCurrency(value)}
      />
      <Table.Column
        dataIndex="salePrice"
        title="Giá khuyến mãi"
        render={(value: number) =>
          formatCurrency(value) || <Tag color="yellow">Không có</Tag>
        }
      />
      <Table.Column title="Tồn kho" dataIndex="stock" />
      <Table.Column
        title="Trạng thái"
        dataIndex="isActive"
        render={(isActive: boolean) => (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Có hiệu lực" : "Không có hiệu lực"}
          </Tag>
        )}
      />
      <Table.Column
        dataIndex="actions"
        render={(_, record: IVariation) => (
          <Space>
            <Tooltip title="Cập nhật trạng thái">
              <Popconfirm
                title="Bạn chắc chắn thay đổi hiệu lực không ?"
                onConfirm={() => handleChangeStatus(record)}
                okText="Thay đổi"
                cancelText="Hủy"
                okButtonProps={{ loading: loadingId === record._id }}
              >
                <RetweetOutlined
                  style={{
                    border: "1px solid #404040",
                    borderRadius: "20%",
                    padding: 4,
                    cursor: "pointer",
                    opacity: loadingId === record._id ? 0.5 : 1,
                  }}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        )}
      />
    </Table>
  );
};
