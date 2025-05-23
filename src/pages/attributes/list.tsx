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
          render={(_: unknown, record: IAttribute) => {
            return record.isColor ? (
              <div style={{ display: "flex", gap: 4 }}>
                {record.values.map((item: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: item,
                      borderRadius: "50%",
                    }}
                  ></div>
                ))}
              </div>
            ) : (
              record.values.map((item: string) => item).join(", ")
            );
          }}
        />
        <Table.Column
          dataIndex="isActive"
          title={"Trạng thái"}
          render={(value: boolean) =>
            value ? "Có hiệu lực" : "Không có hiệu lực"
          }
        />
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: IAttribute) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record._id} />
              <ShowButton hideText size="small" recordItemId={record._id} />
              {record.isActive ? (
                <DeleteButton hideText size="small" recordItemId={record._id} />
              ) : null}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
