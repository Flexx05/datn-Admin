/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, message, Popconfirm, Popover, Space } from "antd";
import { useEffect, useState } from "react";

type RoleTagWithPopoverProps = {
  record: any;
  onRoleChange: (id: string, newRole: string) => void;
  renderTag: (
    role: string,
    label: string,
    onClick: () => void
  ) => React.ReactNode;
};

export const RoleTagWithPopover = ({
  record,
  onRoleChange,
  renderTag,
}: RoleTagWithPopoverProps) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string>(record.role);

  useEffect(() => {
    setCurrentRole(record.role);
  }, [record.role]);

  const roles = [
    { value: "admin", label: "Quản trị viên" },
    { value: "staff", label: "Nhân viên" },
    { value: "user", label: "Khách hàng" },
  ];

  const handleSelectRole = (role: string) => {
    if (currentRole === "admin" && role === "user") {
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
      setCurrentRole(selectedRole);
    }
    setConfirmVisible(false);
  };

  const handleCancel = () => {
    setSelectedRole(null);
    setConfirmVisible(false);
  };

  const currentRoleLabel =
    roles.find((r) => r.value === currentRole)?.label || currentRole;

  return (
    <Popover
      content={
        <Space direction="vertical">
          {roles
            .filter((r) => r.value !== currentRole)
            .map((role) => (
              <Button
                key={role.value}
                type="text"
                size="small"
                onClick={() => handleSelectRole(role.value)}
                disabled={currentRole === "admin" && role.value === "user"}
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
        {renderTag(currentRole, currentRoleLabel, () =>
          setPopoverVisible(true)
        )}
      </Popconfirm>
    </Popover>
  );
};
