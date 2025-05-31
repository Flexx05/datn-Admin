import {
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { IComment } from "../../interface/comment";
import { Space, Table, Rate, message, Switch, Popconfirm, Form, Input, Button, Select, DatePicker } from "antd";
import { useUpdate } from "@refinedev/core";
import { useState } from "react";
import { LogicalFilter } from "@refinedev/core";


const {RangePicker} = DatePicker;

export const CommentList = () => {
  const [form] = Form.useForm();
  const { tableProps, setFilters } = useTable({
    resource: "comments",
  });
  const { mutate } = useUpdate();
  const [status, setStatus] = useState<string | null>(null);

   // Hàm xử lý lọc theo tên sản phẩm
   const handleSearch = () => {
    const productName = form.getFieldValue("productName")?.trim();
    const userName = form.getFieldValue("userName")?.trim();
    const status = form.getFieldValue("status");
    const rating = form.getFieldValue("rating");
    const createdAt = form.getFieldValue("createdAt");


    const filters:LogicalFilter[] = [];
    if (productName) {
      filters.push({
        field: "productName",
        operator: "contains",
        value: productName,
      });
    }
    if (userName) {
      filters.push({
        field: "userName",
        operator: "contains",
        value: userName,
      });
    }
    if (status) {
      filters.push({
        field: "status",
        operator: "eq",
        value: status,
      });
    }
    if (rating) {
      filters.push({
        field: "rating",
        operator: "eq",
        value: rating,
      });
    }

    if (createdAt && createdAt.length === 2) {
      filters.push({
        field: "startDate",
        operator: "eq",
        value: createdAt[0].format("YYYY-MM-DD"),
      });
      filters.push({
        field: "endDate",
        operator: "eq",
        value: createdAt[1].format("YYYY-MM-DD"),
      });
    }
    setFilters(filters, "replace");
  };

  return (
    <List>
       <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="productName" label="Tên sản phẩm">
          <Input
            placeholder="Nhập tên sản phẩm"
            allowClear
            onPressEnter={handleSearch}
            onChange={(e) => {
              if (e.target.value === "") handleSearch();
            }}
          />
        </Form.Item>

        <Form.Item name="userName" label="Tên người dùng">
          <Input
            placeholder="Nhập tên người dùng"
            allowClear
            onPressEnter={handleSearch}
            onChange={(e) => {
              if (e.target.value === "") handleSearch();
            }}
          />
        </Form.Item>

        <Form.Item name="status" label="Trạng thái">
          <Select
            allowClear
            placeholder="Chọn trạng thái"
            style={{ width: 140 }}
            options={[
              { label: "Đã duyệt", value: "visible" },
              { label: "Chưa duyệt", value: "hidden" },
            ]}
            onChange={(value) => {
              if (!value) handleSearch();
            }}
          />
        </Form.Item>

        <Form.Item name="rating" label="Đánh giá">
          <Select
            allowClear
            placeholder="Chọn đánh giá"
            style={{ width: 140 }}
            options={[
              { label: "1 sao", value: 1 },
              { label: "2 sao", value: 2 },
              { label: "3 sao", value: 3 },
              { label: "4 sao", value: 4 },
              { label: "5 sao", value: 5 },
            ]}
            onChange={(value) => {
              if (!value) handleSearch();
            }}
          />
        </Form.Item>

        <Form.Item name="createdAt" label="Thời gian">
          <RangePicker
            format="YYYY-MM-DD"
            allowClear
            onChange={(value) => {
              if (!value) handleSearch();
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleSearch}>
            Lọc
          </Button>
        </Form.Item>
        <Form.Item>
        <Button
          onClick={() => {
            form.resetFields();
            setFilters([], "replace");
          }}
        >
          Xóa lọc
        </Button>
      </Form.Item>
      </Form>
      
      <Table {...tableProps} rowKey="_id"  locale={{
          emptyText: "Không tìm thấy bình luận nào phù hợp với điều kiện lọc",
        }}>
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
          render={(value: number) => <Rate disabled value={value} style={{fontSize: "15px"}} />}
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
