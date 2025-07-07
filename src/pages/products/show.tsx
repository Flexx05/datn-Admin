/* eslint-disable @typescript-eslint/no-explicit-any */
import { RetweetOutlined } from "@ant-design/icons";
import { Show } from "@refinedev/antd";
import { useInvalidate, useShow } from "@refinedev/core";
import {
  Descriptions,
  Image,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import axios from "axios";
import React, { useState } from "react";
import { API_URL } from "../../config/dataProvider";
import { IProductAttribute, IVariation } from "../../interface/product";
import { ColorDots } from "./ColorDots";
import { formatCurrency } from "../order/formatCurrency";

export const ProductShow: React.FC = () => {
  const { queryResult } = useShow({
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " + (error.response?.data?.message || error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;
  const [loadingId, setLoadingId] = useState<string | number | null>(null);
  const invalidate = useInvalidate();
  const handleChangeStatus = async (variation: IVariation) => {
    if (!record?._id || !variation?._id) return;

    setLoadingId(variation._id);
    try {
      await axios.patch(
        `${API_URL}/product/edit/${record._id}/${variation._id}`,
        {
          isActive: variation.isActive,
        }
      );

      message.success("Cập nhật trạng thái thành công");

      await invalidate({
        id: record._id,
        resource: "product",
        invalidates: ["detail"],
      });
    } catch (error: any) {
      message.error(
        "Cập nhật trạng thái thất bại: " + error.response?.data?.message
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Show isLoading={isLoading} canDelete={false} title="Chi tiết sản phẩm">
      <Descriptions title="Thông tin sản phẩm" bordered column={1}>
        <Descriptions.Item label="Tên sản phẩm">
          {record?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Thương hiệu">
          {record?.brandName}
        </Descriptions.Item>
        <Descriptions.Item label="Danh mục">
          {record?.categoryName}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả">
          {record?.description}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {record?.isActive ? (
            <Tag color="green">Có hiệu lực</Tag>
          ) : (
            <Tag color="red">Không có hiệu lực</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Hình ảnh">
          {record?.image?.map((img: string, index: number) => (
            <Image
              key={index}
              src={img}
              width={100}
              style={{ marginRight: 8 }}
            />
          ))}
        </Descriptions.Item>
      </Descriptions>

      <br />

      <Descriptions title="Thuộc tính" bordered column={1}>
        {record?.attributes?.map((attr: IProductAttribute) => (
          <Descriptions.Item key={attr.attributeId} label={attr.attributeName}>
            {attr.values.map((val: string, idx: number) =>
              /^#([0-9A-Fa-f]{3}){1,2}$/.test(val) || /^rgb(a)?\(/.test(val) ? (
                <ColorDots key={idx} colors={[val]} />
              ) : (
                <Tag key={idx}>{val}</Tag>
              )
            )}
          </Descriptions.Item>
        ))}
      </Descriptions>

      <br />

      <h3>Biến thể sản phẩm</h3>
      <Table dataSource={record?.variation || []} rowKey="_id" bordered>
        <Table.Column
          title="Hình ảnh"
          dataIndex="image"
          render={(img: string) => <Image src={img} width={60} />}
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
          title="Giá gốc"
          dataIndex="regularPrice"
          render={(value: number) => formatCurrency(value)}
        />
        <Table.Column
          title="Giá khuyến mãi"
          dataIndex="salePrice"
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
            </Space>
          )}
        />
      </Table>
    </Show>
  );
};
