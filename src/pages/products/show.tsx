import React from "react";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Descriptions, Table, Tag, Image } from "antd";
import { IProductAttribute } from "../../interface/product";

export const ProductShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading} canDelete={false}>
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
            {attr.isColor
              ? attr.values.map((color: string, idx: number) => (
                  <span
                    key={idx}
                    style={{
                      display: "inline-block",
                      width: 20,
                      height: 20,
                      backgroundColor: color,
                      borderRadius: "50%",
                      border: "1px solid #ddd",
                      marginRight: 8,
                    }}
                  />
                ))
              : attr.values.map((val: string, idx: number) => (
                  <Tag key={idx}>{val}</Tag>
                ))}
          </Descriptions.Item>
        ))}
      </Descriptions>

      <br />

      <h3>Biến thể sản phẩm</h3>
      <Table
        dataSource={record?.variation || []}
        rowKey="_id"
        pagination={false}
        bordered
      >
        <Table.Column
          title="Màu sắc"
          dataIndex="attributes"
          key="color"
          render={(attrs: IProductAttribute[]) => {
            const colorAttr = attrs.find(
              (attr) => attr.attributeName === "Màu sắc"
            );
            return colorAttr?.values?.map((color: string, idx: number) => (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  width: 20,
                  height: 20,
                  backgroundColor: color,
                  borderRadius: "50%",
                  border: "1px solid #ccc",
                  marginRight: 5,
                }}
              />
            ));
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
            return sizeAttr?.values?.join(", ");
          }}
        />
        <Table.Column title="Giá gốc" dataIndex="regularPrice" />
        <Table.Column title="Giá khuyến mãi" dataIndex="salePrice" />
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
          title="Hình ảnh"
          dataIndex="image"
          render={(img: string) => <Image src={img} width={60} />}
        />
      </Table>
    </Show>
  );
};
