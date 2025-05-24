import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";
import { ICategory } from "../../interface/category";

export const CategoryList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List title={"Quản lý danh mục"}>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="stt"
          title={"STT"}
          render={(_: unknown, __: ICategory, index: number) => index + 1}
        />
        <Table.Column dataIndex="name" title={"Tên danh mục"} />
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
