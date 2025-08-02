/* eslint-disable @typescript-eslint/no-explicit-any */
import { List, ShowButton, useTable } from "@refinedev/antd";
import { CrudFilters, useInvalidate } from "@refinedev/core";
import {
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  message,
} from "antd";
import { useCallback, useState } from "react";
import { IUser } from "../../interface/user";
import { axiosInstance } from "../../utils/axiosInstance";
import Loader from "../../utils/loading";
import { RoleTagWithPopover } from "./RoleTagWithPopover";

export const StaffList = () => {
  const [filterActive, setFilterActive] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [loadingLock, setLoadingLock] = useState(false);
  const invalidate = useInvalidate();
  const { tableProps, setFilters } = useTable<IUser>({
    resource: "staffs",
    syncWithLocation: true,
    permanentFilter: [
      {
        field: "isActive",
        operator: "eq",
        value: filterActive,
      },
    ],
    errorNotification: (error: any) => ({
      message: "❌ Lỗi hệ thống " + error.response?.data?.error,
      description: "Có lỗi xảy ra trong quá trình xử lý",
      type: "error" as const,
    }),
  });

  const setFiltersTyped = setFilters as (
    filters: CrudFilters,
    behavior?: string
  ) => void;

  const handleOpenLockModal = (user: IUser) => {
    setSelectedUser(user);
    setLockReason("");
    setModalVisible(true);
  };

  const handleLockUser = async () => {
    if (!selectedUser) return;
    if (!lockReason.trim()) {
      message.warning("Vui lòng nhập lý do khóa tài khoản!");
      return;
    }
    setLoadingLock(true);
    try {
      await axiosInstance.patch(`/admin/users/${selectedUser._id}/status`, {
        isActive: false,
        reason: lockReason,
      });
      message.success("Khóa tài khoản thành công");
      setModalVisible(false);
      setSelectedUser(null);
      setLockReason("");
      await invalidate({ resource: "staffs", invalidates: ["list"] });
    } catch (error: any) {
      message.error("Khóa tài khoản thất bại " + error?.response?.data?.error);
    } finally {
      setLoadingLock(false);
    }
  };

  const handleChangeStatus = async (record: IUser) => {
    try {
      await axiosInstance.patch(`/admin/users/${record._id}/status`, {
        isActive: !record.isActive,
      });
      message.success("Cập nhật trạng thái thành công");
      await invalidate({ resource: "staffs", invalidates: ["list"] });
    } catch (error: any) {
      message.error(
        "Cập nhật trạng thái thất bại " + error?.response?.data?.error
      );
    }
  };

  const handleChangeRole = async (id: string, role: string) => {
    try {
      await axiosInstance.patch(`/staffs/${id}/role`, {
        role,
      });
      message.success("Cập nhật vai trò thành công");
      invalidate({ resource: "staffs", invalidates: ["list"] });
    } catch (error: any) {
      message.error(
        "Cập nhật trạng thái thất bại " + error?.response?.data?.error
      );
    }
  };

  const handleTabChange = useCallback(
    (key: string) => {
      const isActiveFilter = key === "active";
      setFilterActive(isActiveFilter);

      // Cập nhật lại filter mới
      setFilters(
        [
          {
            field: "isActive",
            operator: "eq",
            value: isActiveFilter,
          },
        ],
        "replace"
      );
    },
    [setFilters]
  );

  return (
    <List>
      <Modal
        title="Nhập lý do khóa tài khoản"
        open={modalVisible}
        onOk={handleLockUser}
        onCancel={() => setModalVisible(false)}
        okText="Xác nhận khóa"
        cancelText="Hủy"
        confirmLoading={loadingLock}
      >
        <Form layout="vertical">
          <Form.Item
            label="Lý do khóa"
            required
            validateStatus={!lockReason.trim() ? "error" : ""}
            help={!lockReason.trim() ? "Vui lòng nhập lý do" : ""}
          >
            <Input.TextArea
              rows={4}
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              placeholder="Nhập lý do khóa tài khoản..."
            />
          </Form.Item>
        </Form>
      </Modal>
      <Tabs
        activeKey={filterActive ? "active" : "trash"}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      >
        <Tabs.TabPane tab="Tài khoản đang hoạt động" key="active" />
        <Tabs.TabPane tab="Tài khoản bị khóa" key="trash" />
      </Tabs>
      <Input.Search
        placeholder="Tìm kiếm khách hàng"
        allowClear
        onSearch={(value: string) =>
          setFiltersTyped(
            [{ field: "search", operator: "contains", value }],
            "merge"
          )
        }
        style={{ marginBottom: 16, maxWidth: 300 }}
      />
      <Table
        {...tableProps}
        loading={tableProps.loading ? { indicator: <Loader /> } : false}
        rowKey={"_id"}
      >
        <Table.Column
          dataIndex="stt"
          title="STT"
          render={(_: unknown, __: IUser, index: number) => index + 1}
        />
        <Table.Column
          dataIndex="avatar"
          title="Avatar"
          render={(value: string) => (
            <Avatar src={value ? value : "../../../avtDefault.png"} />
          )}
        />
        <Table.Column dataIndex="fullName" title="Tên người dùng" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column
          dataIndex="phone"
          title="Số điện thoại"
          render={(value: string) =>
            value || <Tag color={"default"}>Chưa cập nhật</Tag>
          }
        />
        <Table.Column
          dataIndex={"role"}
          title="Vai trò"
          render={(_: unknown, record) => (
            <RoleTagWithPopover
              record={record}
              onRoleChange={handleChangeRole}
            />
          )}
          filters={[
            {
              text: "Quản trị viên",
              value: "admin",
            },
            {
              text: "Nhân viên",
              value: "staff",
            },
          ]}
          onFilter={(value, record) => record.role === value}
        />
        <Table.Column
          title="Hành động"
          dataIndex="actions"
          render={(_, record: IUser) => (
            <Space>
              <Tooltip title="Xem chi tiết" key="show">
                <ShowButton hideText size="small" recordItemId={record._id} />
              </Tooltip>
              {record.isActive ? (
                <Button
                  danger
                  size="small"
                  type="default"
                  disabled={record.countOrderNotSuccess > 0}
                  onClick={() => handleOpenLockModal(record)}
                >
                  Khóa
                </Button>
              ) : (
                <Popconfirm
                  title="Bạn chắc chắn muốn mở khoá tài khoản này?"
                  onConfirm={() => handleChangeStatus(record)}
                  okText="Mở khoá"
                  cancelText="Huỷ"
                >
                  <Button size="small" type="primary">
                    Mở khoá
                  </Button>
                </Popconfirm>
              )}
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
