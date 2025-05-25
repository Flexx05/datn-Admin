import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";
import { IBrand } from "../../interface/brand";

export const BrandList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List title={"Quản lý thương hiệu"}>
      <Table {...tableProps} rowKey="_id">
        <Table.Column
          dataIndex="stt"
          title={"STT"}
          render={(_: unknown, __: IBrand, index: number) => index + 1}
        />
        <Table.Column
          dataIndex="logoURL"
          title={"Ảnh thương hiệu"}
          render={(value: string) => (
            <img
              src={value}
              width={50}
              height={50}
              style={{ objectFit: "contain" }}
            />
          )}
        />
        <Table.Column dataIndex="name" title={"Tên thương hiệu"} />
        <Table.Column
          title={"Hành động"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton
                hideText
                size="small"
                recordItemId={record.id}
                confirmTitle="Bạn chắc chắn xóa không ?"
                confirmCancelText="Hủy"
                confirmOkText="Xóa"
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
