import {
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { IComment } from "../../interface/comment";
import { Space, Table, Rate, message, Switch, Popconfirm } from "antd";
import { useUpdate } from "@refinedev/core";
import { useState } from "react";




export const CommentList = () => {
  const { tableProps } = useTable({
    resource: "comments",
  });
  const { mutate } = useUpdate();
  const [status, setStatus] = useState<string | null>(null);

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

        <Table.Column dataIndex="content" title="Content"  
        render={(text: string) =>
        text && text.length > 50 ? text.slice(0, 50) + "..." : text
         } />

        <Table.Column
          dataIndex="rating"
          title="Rating"
          render={(value: number) => <Rate disabled value={value} style={{fontSize: "15px", textAlign: "center"}} />}
        />



        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value: string, record: IComment) => {
            const isVisible = value === "visible";
            return (
              <Popconfirm
                title="Bạn có chắc muốn ẩn bình luận này không?"
                onConfirm={() => {
                  const newStatus = isVisible ? "hidden" : "visible";
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
                disabled={!isVisible} // Chỉ xác nhận khi chuyển từ hiện sang ẩn
              >
                <Switch
                  checked={isVisible}
                  checkedChildren="Hiện"
                  unCheckedChildren="Ẩn"
                  loading={status === String(record._id)}
                  onChange={(checked) => {
                    if (!checked && isVisible) {
                      // Nếu chuyển từ hiện sang ẩn thì show confirm
                      // Không làm gì ở đây, Popconfirm sẽ xử lý
                    } else {
                      // Chuyển từ ẩn sang hiện thì không cần xác nhận
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
                    }
                  }}
                />
              </Popconfirm>
            );
          }}
        />

        <Table.Column dataIndex="replyContent" title="Reply" 
          render={(text: string) =>
            text && text.length > 50 ? text.slice(0, 50) + "..." : text
          }
        />
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
              <ShowButton hideText size="middle" recordItemId={record._id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
