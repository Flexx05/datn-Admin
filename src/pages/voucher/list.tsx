import { DeleteButton, EditButton, List, ShowButton, useTable } from "@refinedev/antd";
import { Input, Space, Table, Tag, Tooltip } from "antd";
import { IVoucher } from "../../interface/voucher";
import { useState } from "react";
import dayjs from "dayjs";


const VoucherList = () => {
    const [search, setSearch] = useState("");
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

      <Table.Column
        title="Giảm"
        render={(_, record) =>
          record.discountType === "fixed"
            ? `${record.discountValue.toLocaleString()}đ`
            : `${record.discountValue}%`
        }
      />

      <Table.Column
        title="Dùng / SL"
        render={(_, record) => `${record.used} / ${record.quantity}`}
      />

      <Table.Column
        title="Hiệu lực"
        render={(_, record) => (
          <div>
            {dayjs(record.startDate).format("HH:mm DD/MM/YYYY")}
            <br />
            {dayjs(record.endDate).format("HH:mm DD/MM/YYYY")}
          </div>
        )}
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
     


    <Table.Column<IVoucher>
    render={(_, record: IVoucher) => {
        const isDeletable = record.voucherStatus === "inactive" || record.voucherStatus === "expired";
        const isEditable = record.voucherStatus === "inactive";
        const deleteButton = (
            <DeleteButton
                hideText
                size="middle"
                recordItemId={record._id}
                disabled={!isDeletable}
                confirmTitle="Bạn có chắc muốn xóa voucher này vĩnh viễn không?"
            />
        );
        const editButton = isEditable ? (
            <EditButton hideText size="middle" recordItemId={record._id} />
        ) : (
            <Tooltip title="Chỉ có thể chỉnh sửa voucher ở trạng thái 'Không có hiệu lực'">
                <span>
                    <EditButton hideText size="middle" recordItemId={record._id} disabled />
                </span>
            </Tooltip>
        );
        return (
            <Space>
                {editButton}
                <ShowButton hideText size="middle" recordItemId={record._id} />
                {isDeletable ? (
                    deleteButton
                ) : (
                    <Tooltip title="Chỉ có thể xóa voucher ở trạng thái 'Không có hiệu lực' hoặc 'Hết hạn'">
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