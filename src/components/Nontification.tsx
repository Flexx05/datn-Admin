import { BellFilled, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useInvalidate, useList } from "@refinedev/core";
import {
  Badge,
  Button,
  Dropdown,
  List,
  Space,
  Tabs,
  Tooltip,
  Typography,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { API_URL } from "../config/dataProvider";
import { ColorModeContext } from "../contexts/color-mode";
import { INotification } from "../interface/notification";
import { socket } from "../socket";

// ! Thêm chức năng xóa hàng loạt và đánh dấu tất cả đã đọc

const ListNotification = ({ item }: { item: INotification }) => {
  const handleChangReadingStatus = async () => {
    await axios.patch(`${API_URL}/notification/${item._id}`);
    await invalidate({
      resource: "notification",
      invalidates: ["list"],
    });
  };
  const invalidate = useInvalidate();
  return (
    <List.Item
      key={item._id}
      actions={[
        item.isRead || (
          <Tooltip title="Đánh dấu là đã đọc">
            <Button
              loading={item.isRead}
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
            onClick={async () => {
              await axios.delete(`${API_URL}/notification/${item._id}`);
              await invalidate({
                resource: "notification",
                invalidates: ["list"],
              });
            }}
          />
        </Tooltip>,
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
                : ""
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

const Nontification = () => {
  const [tabKey, setTabKey] = useState("unread");
  const { mode } = useContext(ColorModeContext);
  const colorMode = mode === "dark" ? "#1a1a1a" : "white";
  const shadowMode =
    mode === "dark" ? "rgba(255, 255, 255, 0.21)" : "rgba(0, 0, 0, 0.1)";
  const { data, isLoading } = useList<INotification>({
    resource: "notification",
  });
  const invalidate = useInvalidate();
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

  const read = data?.data.filter((item: INotification) => item.isRead === true);
  const unread = data?.data.filter(
    (item: INotification) => item.isRead === false
  );

  return (
    <>
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
            <Typography.Text strong>Thông báo</Typography.Text>
            <Tabs
              activeKey={tabKey}
              onChange={setTabKey}
              defaultActiveKey="unread"
            >
              <Tabs.TabPane tab="Chưa đọc" key="unread">
                <List
                  loading={isLoading}
                  dataSource={unread}
                  renderItem={(item: INotification) => (
                    <ListNotification item={item} />
                  )}
                ></List>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Đã đọc" key="read">
                <List
                  loading={isLoading}
                  dataSource={read}
                  renderItem={(item: INotification) => (
                    <ListNotification item={item} />
                  )}
                ></List>
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      >
        <Space>
          <Badge
            count={unread?.length || 0}
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
    </>
  );
};

export default Nontification;
