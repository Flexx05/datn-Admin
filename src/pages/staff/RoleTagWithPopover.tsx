/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, message, Popconfirm, Popover, Space, Tag } from "antd";
import { useState } from "react";

export const RoleTagWithPopover = ({
  record,
  onRoleChange,
}: {
  record: any;
  onRoleChange: (id: string, newRole: string) => void;
}) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    { value: "admin", label: "Quản trị viên" },
    { value: "staff", label: "Nhân viên" },
    { value: "user", label: "Khách hàng" },
  ];

  const handleSelectRole = (role: string) => {
    if (record.role === "admin" && role === "user") {
      message.error(
        "Không thể chuyển trực tiếp từ Quản trị viên thành Khách hàng"
      );
      return;
    }
    setSelectedRole(role);
    setPopoverVisible(false);
    setConfirmVisible(true);
  };

  const handleConfirm = async () => {
    if (selectedRole) {
      await onRoleChange(record._id, selectedRole);
    }
    setConfirmVisible(false);
  };

  const handleCancel = () => {
    setSelectedRole(null);
    setConfirmVisible(false);
  };

  const currentTag = (
    <Tag
      color={record.role === "admin" ? "green" : "yellow"}
      style={{ cursor: "pointer" }}
      onClick={() => setPopoverVisible(true)}
    >
      {roles.find((r) => r.value === record.role)?.label}
    </Tag>
  );

  return (
    <Popover
      content={
        <Space direction="vertical">
          {roles
            .filter((r) => r.value !== record.role)
            .map((role) => (
              <Button
                key={role.value}
                type="text"
                size="small"
                onClick={() => handleSelectRole(role.value)}
                disabled={record.role === "admin" && role.value === "user"}
              >
                {role.label}
              </Button>
            ))}
        </Space>
      }
      title="Chọn vai trò"
      trigger="click"
      open={popoverVisible}
      onOpenChange={(visible) => setPopoverVisible(visible)}
    >
      <Popconfirm
        title="Bạn có chắc chắn muốn thay đổi vai trò?"
        open={confirmVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      >
        {currentTag}
      </Popconfirm>
    </Popover>
  );
};
