import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Input, Popconfirm, Space, Table, message } from "antd";
import { IAttribute } from "../../interface/attribute";
import { PlusCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import { API_URL } from "../../config/dataProvider";
import { useState } from "react";
import { useInvalidate } from "@refinedev/core";

export const AttributeList = () => {
  const { tableProps, setFilters } = useTable({
    syncWithLocation: true,
  });
  const invalidate = useInvalidate();
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  const handleChangeStatus = async (record: IAttribute) => {
    setLoadingId(record._id);
    try {
      await axios.patch(`${API_URL}/attribute/edit/${record._id}`, {
        values: record.values,
        name: record.name,
        isActive: !record.isActive,
      });

      message.success("Cập nhật trạng thái thành công");
      await invalidate({
        resource: "attribute",
        invalidates: ["list"],
      });
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <List title={"Quản lý thuộc tính"}>
      <Input.Search
        placeholder="Tìm kiếm tên thuộc tính"
        allowClear
        onSearch={(value) =>
          setFilters([{ field: "name", operator: "eq", value }], "replace")
        }
        style={{ marginBottom: 16, maxWidth: 300 }}
      />
      <Table {...tableProps} rowKey="_id">
        <Table.Column
          dataIndex="stt"
          title={"STT"}
          render={(_: unknown, __: IAttribute, index: number) => index + 1}
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
              record.values.join(", ")
            );
          }}
        />
        <Table.Column
          dataIndex="isActive"
          title={"Trạng thái"}
          filters={[
            { text: "Có hiệu lực", value: true },
            { text: "Không có hiệu lực", value: false },
          ]}
          onFilter={(value, record) => record.isActive === value}
          render={(value: boolean) =>
            value ? "Có hiệu lực" : "Không có hiệu lực"
          }
        />
        <Table.Column
          title={"Hành động"}
          dataIndex="actions"
          render={(_, record: IAttribute) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record._id} />
              <ShowButton hideText size="small" recordItemId={record._id} />
              {record.isActive ? (
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={record._id}
                  confirmTitle="Bạn chắc chắn xóa không ?"
                  confirmCancelText="Hủy"
                  confirmOkText="Xóa"
                  loading={loadingId === record._id}
                />
              ) : (
                <Popconfirm
                  title="Bạn chắc chắn kích hoạt hiệu lực không ?"
                  onConfirm={() => handleChangeStatus(record)}
                  okText="Kích hoạt"
                  cancelText="Hủy"
                  okButtonProps={{ loading: loadingId === record._id }}
                >
                  <PlusCircleOutlined
                    style={{
                      border: "1px solid #404040",
                      borderRadius: "20%",
                      padding: 4,
                      cursor: "pointer",
                      opacity: loadingId === record._id ? 0.5 : 1,
                    }}
                  />
                </Popconfirm>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
