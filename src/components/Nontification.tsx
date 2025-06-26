import { BellFilled } from "@ant-design/icons";
import { Badge, Button, Dropdown, Space, Tabs, Typography } from "antd";
import { useContext } from "react";
import { ColorModeContext } from "../contexts/color-mode";

const Nontification = () => {
  const { mode } = useContext(ColorModeContext);
  const colorMode = mode === "dark" ? "#1a1a1a" : "white";
  const shadowMode =
    mode === "dark" ? "rgba(255, 255, 255, 0.21)" : "rgba(0, 0, 0, 0.1)";
  const unread = [
    { key: "1", label: "Bạn có 5 thông báo mới" },
    { key: "2", label: "Thông báo chưa đọc 2" },
  ];
  const read = [
    { key: "3", label: "Thông báo đã đọc 1" },
    { key: "4", label: "Thông báo đã đọc 2" },
  ];
  return (
    <>
      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        popupRender={() => (
          <div
            style={{
              width: 300,
              padding: 12,
              backgroundColor: colorMode,
              boxShadow: `${shadowMode} 0px 8px 24px`,
              borderRadius: 10,
            }}
          >
            <Typography.Text strong>Thông báo</Typography.Text>
            <Tabs defaultActiveKey="unread">
              <Tabs.TabPane tab={`Chưa đọc (${unread.length})`} key="unread">
                {unread.length > 0 ? (
                  unread.map((item) => (
                    <div key={item.key} style={{ padding: "6px 0" }}>
                      {item.label}
                    </div>
                  ))
                ) : (
                  <div>Không có thông báo chưa đọc</div>
                )}
              </Tabs.TabPane>
              <Tabs.TabPane tab={`Đã đọc`} key="read">
                {read.length > 0 ? (
                  read.map((item) => (
                    <div
                      key={item.key}
                      style={{ padding: "6px 0", color: "#888" }}
                    >
                      {item.label}
                    </div>
                  ))
                ) : (
                  <div>Không có thông báo đã đọc</div>
                )}
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      >
        <Space>
          <Badge
            count={unread.length}
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
