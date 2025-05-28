import { PlusCircleOutlined } from "@ant-design/icons";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { useInvalidate } from "@refinedev/core";
import { Input, message, Space, Table } from "antd";
import axios from "axios";
import { useState } from "react";
import { API_URL } from "../../config/dataProvider";
import { IBrand } from "../../interface/brand";

export const BrandList = () => {
  const { tableProps, setFilters } = useTable({
    syncWithLocation: true,
  });

  const invalidate = useInvalidate();
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  const handleChangeStatus = async (record: IBrand) => {
    setLoadingId(record._id);
    try {
      await axios.patch(`${API_URL}/brand/edit/${record._id}`, {
        isActive: !record.isActive,
      });

      message.success("Cập nhật trạng thái thành công");
      await invalidate({
        resource: "brand",
        invalidates: ["list"],
      });
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <List title={"Quản lý thương hiệu"}>
      <Input.Search
        placeholder="Tìm kiếm tên thuộc tính"
        allowClear
        onSearch={(value) =>
          setFilters([{ field: "name_like", operator: "eq", value }], "replace")
        }
        style={{ marginBottom: 16, maxWidth: 300 }}
      />
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
          render={(_, record: IBrand) => (
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
                <PlusCircleOutlined
                  style={{
                    border: "1px solid #404040",
                    borderRadius: "20%",
                    padding: 4,
                    cursor: "pointer",
                    opacity: loadingId === record._id ? 0.5 : 1,
                  }}
                  onClick={() => handleChangeStatus(record)}
                />
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
