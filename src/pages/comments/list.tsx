import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { IComment } from "../../interface/comment";
import { Space, Table, Rate, message, Switch } from "antd";
import { useUpdate } from "@refinedev/core";
import { useState } from "react";




export const CommentList = () => {
  const { tableProps } = useTable({
    resource: "comments",
  });
  const { mutate } = useUpdate();
  const [updateStatus, setStatus] = useState<string | null>(null);

  return (
    <List>
      <Table {...tableProps} rowKey="_id">
        <Table.Column dataIndex="_id" title="STT"  render={(_text, _record, index) => index + 1} />
        <Table.Column
            title="Product"
            dataIndex={["productId", "name"]}
            key="productName"
          />

          <Table.Column
            title="User"
            dataIndex={["userId", "fullName"]}
            key="userName"
          />

        <Table.Column dataIndex="content" title="Content" />
        <Table.Column
          dataIndex="rating"
          title="Rating"
          render={(value: number) => <Rate disabled value={value} style={{fontSize: "15px", textAlign: "center"}} />}
        />


        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value: string, record: IComment) => {
            return (
              <Switch
                checked={value === "visible"}
                checkedChildren="Hiện"
                unCheckedChildren="Ẩn"
                loading={updateStatus === String(record._id)}
                onChange={(checked) => {
                  const newStatus = checked ? "visible" : "hidden";
                  setStatus(String(record._id));
                  mutate(
                    {
                      resource: "comments",
                      id: record._id,
                      values: { status: newStatus },
                    },
                    {
                      onSuccess: () => {
                        message.success("Cập nhật trạng thái thành công");
                        setStatus(null);
                      },
                      onError: () => {
                        message.error("Cập nhật trạng thái thất bại");
                        setStatus(null);
                      },
                    }
                  );
                }}
              />
            );
          }}
        />

        <Table.Column dataIndex="replyContent" title="Reply" />
        <Table.Column
          dataIndex="replyAt"
          title="Reply At"
          render={(value: string | null) =>
            value ? new Date(value).toLocaleString() : "-"
          }
        />
        <Table.Column
          dataIndex="createdAt"
          title="Created At"
          render={(value: string) => new Date(value).toLocaleString()}
        />
        <Table.Column<IComment>
          title="Actions"
          dataIndex="actions"
          render={(_, record: IComment) => (
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
