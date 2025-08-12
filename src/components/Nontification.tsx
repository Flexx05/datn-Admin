/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BellFilled,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useInvalidate, useList } from "@refinedev/core";
import {
  Badge,
  Button,
  Checkbox,
  Dropdown,
  List,
  Space,
  Tabs,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/auth/AuthContext";
import { ColorModeContext } from "../contexts/color-mode";
import { INotification } from "../interface/notification";
import { socket } from "../socket";
import { axiosInstance } from "../utils/axiosInstance";

const ListNotification = ({
  item,
  selected,
  onSelect,
}: {
  item: INotification;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
}) => {
  const invalidate = useInvalidate();

  const handleChangReadingStatus = async () => {
    await axiosInstance.patch(`/notification/${item._id}`);
    await invalidate({ resource: "notification", invalidates: ["list"] });
  };

  const handleDelete = async () => {
    await axiosInstance.delete(`/notification/${item._id}`);
    await invalidate({ resource: "notification", invalidates: ["list"] });
  };

  return (
    <List.Item
      key={item._id}
      actions={[
        !item.isRead && (
          <Tooltip title="Đánh dấu là đã đọc">
            <Button
              type="default"
              size="small"
              shape="circle"
              icon={<CheckOutlined />}
              onClick={handleChangReadingStatus}
            />
          </Tooltip>
        ),
        <Tooltip title="Xóa thông báo">
          <Button
            type="default"
            size="small"
            shape="circle"
            icon={<CloseOutlined />}
            onClick={handleDelete}
          />
        </Tooltip>,
        <Checkbox
          checked={selected}
          onChange={(e) => onSelect(item._id, e.target.checked)}
        />,
      ]}
    >
      <List.Item.Meta
        title={
          <a
            href={
              item.type === 0 || item.type === 1
                ? `/orders/show/${item.link}`
                : item.type === 3
                ? `/conversation/message/${item.link}`
                : "#"
            }
            onClick={handleChangReadingStatus}
          >
            {item.message}
          </a>
        }
        description={dayjs(item.createdAt).format("HH:mm - DD/MM/YYYY")}
      />
    </List.Item>
  );
};

const Notification = () => {
  const [tabKey, setTabKey] = useState<"unread" | "read">("unread");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { mode } = useContext(ColorModeContext);
  const { user } = useAuth();
  const invalidate = useInvalidate();

  const { data, isLoading } = useList<INotification>({
    resource: "notification",
    meta: { recipientId: user?._id },
    queryOptions: { enabled: !!user?._id },
  });

  const notifications = data?.data || ([] as INotification[]);

  const filtered = useMemo(() => {
    return notifications.filter((item) =>
      tabKey === "unread" ? !item.isRead : item.isRead
    );
  }, [tabKey, notifications]);

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((_id) => _id !== id)
    );
  };

  const handleDeleteSelected = async () => {
    await Promise.all(
      selectedIds.map((id) => axiosInstance.delete(`/notification/${id}`))
    );
    setSelectedIds([]);
    await invalidate({ resource: "notification", invalidates: ["list"] });
  };

  const handleSelectAll = (checked: boolean) => {
    const ids = checked ? filtered.map((n) => n._id) : [];
    setSelectedIds(ids);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = filtered.map((n) => n._id);
      if (unreadIds.length === 0) return;

      await axiosInstance.patch(`/notification/mark-many-read`, {
        ids: unreadIds,
      });

      await invalidate({ resource: "notification", invalidates: ["list"] });
      setSelectedIds((prev) => prev.filter((id) => !unreadIds.includes(id)));
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả là đã đọc", error);
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      invalidate({
        resource: "notification",
        invalidates: ["list"],
      });
    };
    socket.on("notification-updated", handleUpdate);
    return () => {
      socket.off("notification-updated", handleUpdate);
    };
  }, [invalidate]);

  const colorMode = mode === "dark" ? "#1a1a1a" : "white";
  const shadowMode =
    mode === "dark" ? "rgba(255, 255, 255, 0.21)" : "rgba(0, 0, 0, 0.1)";

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => (
        <div
          style={{
            width: 400,
            height: 555,
            overflow: "auto",
            padding: 12,
            backgroundColor: colorMode,
            boxShadow: `${shadowMode} 0px 8px 24px`,
            borderRadius: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography.Text strong>Thông báo</Typography.Text>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Tooltip
                title={
                  selectedIds.length > 0 &&
                  `Xóa ${selectedIds.length} thông báo đã chọn`
                }
              >
                <Badge count={selectedIds.length}>
                  <Button
                    danger
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0}
                    icon={<DeleteOutlined />}
                  />
                </Badge>
              </Tooltip>
              <Tooltip title="Đánh dấu là tất cả đã đọc">
                <Button
                  icon={<CheckOutlined />}
                  disabled={tabKey === "read" || filtered.length === 0}
                  onClick={handleMarkAllAsRead}
                />
              </Tooltip>
            </div>
          </div>

          <Tabs activeKey={tabKey} onChange={(key) => setTabKey(key as any)}>
            {["unread", "read"].map((key) => (
              <Tabs.TabPane
                tab={key === "unread" ? "Chưa đọc" : "Đã đọc"}
                key={key}
              >
                <Checkbox
                  indeterminate={
                    selectedIds.length > 0 &&
                    selectedIds.length < filtered.length
                  }
                  checked={
                    filtered.length > 0 &&
                    selectedIds.length === filtered.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  Chọn tất cả
                </Checkbox>

                <List
                  loading={isLoading}
                  dataSource={filtered}
                  renderItem={(item) => (
                    <ListNotification
                      item={item}
                      selected={selectedIds.includes(item._id)}
                      onSelect={handleSelect}
                    />
                  )}
                />
              </Tabs.TabPane>
            ))}
          </Tabs>
        </div>
      )}
    >
      <Space>
        <Badge
          count={notifications.filter((item) => !item.isRead).length || 0}
          color="red"
          size="default"
          offset={[-2, 2]}
          style={{ cursor: "pointer" }}
        >
          <Button
            type="text"
            shape="circle"
            icon={<BellFilled style={{ fontSize: "25px" }} />}
          />
        </Badge>
      </Space>
    </Dropdown>
  );
};

export default Notification;
