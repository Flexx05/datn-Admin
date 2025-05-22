import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Space, Table } from "antd";
import { IAttribute } from "../../interface/attribute";

export const AttributeList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List title={"Quản lý thuộc tính"}>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="stt"
          title={"STT"}
          render={(_: unknown, record: IAttribute, index: number) => index + 1}
        />
        <Table.Column dataIndex="name" title={"Tên thuộc tính"} />
        <Table.Column
          dataIndex="values"
          title={"Giá trị"}
          render={(value) =>
            value?.map((item: { name: string }) => item.name).join(", ")
          }
        />
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: IAttribute) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record._id} />
              <ShowButton hideText size="small" recordItemId={record._id} />
              <DeleteButton hideText size="small" recordItemId={record._id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
