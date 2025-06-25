import { DeleteButton, EditButton, List, ShowButton, useTable } from "@refinedev/antd";
import { Input, Space, Table, Tag, Tooltip } from "antd";
import { IVoucher } from "../../interface/voucher";
import { useState } from "react";
import { useNotification } from "@refinedev/core";

const VoucherList = () => {
    const [search, setSearch] = useState("");
    const { open } = useNotification();
    const { tableProps, setFilters } = useTable<IVoucher>({
      resource: "vouchers",
      filters: {
        permanent: [],
        defaultBehavior: "merge",
      },
    });
  
    const handleSearch = (value: string) => {
      setFilters(
        value
          ? [{ field: "code", operator: "contains", value }]
          : [],
        "replace"
      );
    };

  return (
    <List title="Quản lý Voucher">
        <Input.Search
        placeholder="Tìm kiếm voucher"
        allowClear
        value={search}
        onChange={e => setSearch(e.target.value)}
        onSearch={handleSearch}
        style={{ marginBottom: 16, maxWidth: 300 }}
      />
      <Table {...tableProps} rowKey="_id">
        <Table.Column
          title="STT"
          render={(_, __, index) => index + 1}
        />
        <Table.Column
          title="Mã giảm giá"
          dataIndex="code"
        />
  
      <Table.Column
            title="Trạng thái"
            dataIndex="voucherStatus"
            filters={[
                { text: "Có hiệu lực", value: "active" },
                { text: "Không có hiệu lực", value: "inactive" },
                { text: "Hết hạn", value: "expired" },
            ]}
            onFilter={(value, record) => record.voucherStatus === value}
            render={(status: string) => {
                if (status === "active")
                return <Tag color="green">Có hiệu lực</Tag>;
                if (status === "inactive")
                return <Tag color="yellow">Không có hiệu lực</Tag>;
                if (status === "expired")
                return <Tag color="red">Hết hạn</Tag>;
                return status;
            }}
      />
      <Table.Column
            title="Loại voucher"
            dataIndex="voucherType"
            filters={[
                { text: "Dành cho sản phẩm", value: "product" },
                { text: "Dành cho phí vận chuyển", value: "shipping" },
            ]}
            onFilter={(value, record) => record.voucherType === value}
            render={(type: string) => {
                if (type === "product")
                return <Tag color="purple">Dành cho sản phẩm</Tag>;
                if (type === "shipping")
                return <Tag color="blue">Dành cho phí vận chuyển</Tag>;
                return type;
            }}
      />


        <Table.Column<IVoucher>
                title="Thao tác"
                dataIndex="actions"
                render={(_, record: IVoucher) => {
                    const isDeletable = record.voucherStatus === "inactive";
                    const deleteButton = (
                        <DeleteButton
                            hideText
                            size="middle"
                            recordItemId={record._id}
                            disabled={!isDeletable}
                            confirmTitle="Bạn có chắc muốn xóa voucher này vĩnh viễn không?"
                        />
                    );
                    return (
                        <Space>
                            <EditButton hideText size="middle" recordItemId={record._id} />
                            <ShowButton hideText size="middle" recordItemId={record._id} />
                            {isDeletable ? (
                                deleteButton
                            ) : (
                                <Tooltip title="Chỉ có thể xóa voucher ở trạng thái 'Không có hiệu lực'">
                                    <span>{deleteButton}</span>
                                </Tooltip>
                            )}
                        </Space>
                    );
                }}
                />
      </Table>

     
      
    </List>
  );
};

export default VoucherList;