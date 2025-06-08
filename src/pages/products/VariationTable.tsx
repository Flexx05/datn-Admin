import { Image, Table, Tag, Typography } from "antd";
import { IVariation, IProductAttribute } from "../../interface/product";
import { ColorDots } from "./ColorDots";

export const VariationTable = ({
  variations,
}: {
  variations: IVariation[];
}) => {
  if (!variations || variations.length === 0) {
    return (
      <Typography.Text type="secondary">Không có biến thể</Typography.Text>
    );
  }
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
      <Table.Column dataIndex="regularPrice" title="Giá bán" />
      <Table.Column dataIndex="salePrice" title="Giá sale" />
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
    </Table>
  );
};
