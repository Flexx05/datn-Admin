import { Image, Table, Tag, Typography } from "antd";
import { IVariation, IProductAttribute } from "../../interface/product";
import { ColorDots } from "./ColorDots";
import { formatCurrency } from "../order/formatCurrency";

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
    </Table>
  );
};
