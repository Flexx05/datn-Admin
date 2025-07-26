/* eslint-disable @typescript-eslint/no-explicit-any */
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Descriptions, Image, Spin, Tag } from "antd";
import React from "react";
import { IProduct, IProductAttribute } from "../../interface/product";
import { ColorDots } from "./ColorDots";
import { VariationTable } from "./VariationTable";
import Loader from "../../utils/loading";

export const ProductShow: React.FC = () => {
  const { queryResult } = useShow({
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " +
        (error.response?.data?.message || error.response?.data?.error),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });
  const { data, isLoading } = queryResult;
  const record = data?.data as IProduct;

  return (
    <Show isLoading={false} canDelete={false} title="Chi tiết sản phẩm">
      <Spin spinning={isLoading} indicator={<Loader />}>
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
          <Descriptions.Item label="Đã bán">{record?.selled}</Descriptions.Item>
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
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {record?.image?.map((img: string, index: number) => (
                <Image
                  key={index}
                  src={img}
                  width={100}
                  style={{ marginRight: 8 }}
                />
              ))}
            </div>
          </Descriptions.Item>
        </Descriptions>

        <br />

        <Descriptions title="Thuộc tính" bordered column={1}>
          {record?.attributes?.map((attr: IProductAttribute) => (
            <Descriptions.Item
              key={attr.attributeId}
              label={attr.attributeName}
            >
              {attr.values.map((val: string, idx: number) =>
                /^#([0-9A-Fa-f]{3}){1,2}$/.test(val) ||
                /^rgb(a)?\(/.test(val) ? (
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
        {record && <VariationTable product={record} />}
      </Spin>
    </Show>
  );
};
