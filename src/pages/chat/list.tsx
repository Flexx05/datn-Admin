/* eslint-disable @typescript-eslint/no-explicit-any */
import { useList } from "@refinedev/core";
import { Avatar, Badge, Col, Grid, Menu, Row, Spin, Typography } from "antd";
import dayjs from "dayjs";
import { useContext, useState } from "react";
import { useAuth } from "../../contexts/auth/AuthContext";
import { ColorModeContext } from "../../contexts/color-mode";
import ChatShow from "./show";
import {
  IConversation,
  IMessage,
  IParticipant,
} from "../../interface/conversation";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const ChatList = () => {
  const { mode } = useContext(ColorModeContext);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const screens = useBreakpoint();
  const { user } = useAuth();
  const userId = user?._id;

  // TODO: Hiển thị dữ liệu thực
  const { data, isLoading } = useList<IConversation>({
    resource: "conversation",
    errorNotification: {
      type: "error",
      message: "Lỗi khi tải danh sách hội thoại",
      description: "Vui lòng thử lại sau.",
    },
  });
  const chatData = data?.data || [];

  if (isLoading) {
    return <Spin size="large" />;
  }

  return (
    <Row
      gutter={0}
      style={{
        minHeight: "90vh",
        height: "90vh",
        flexWrap: "nowrap",
      }}
    >
      <Col
        xs={24}
        sm={8}
        md={7}
        lg={6}
        xl={5}
        style={{
          background: "#fff",
          borderRight: `1px solid ${mode === "dark" ? "#1a1a1a" : "#f0f0f0"}`,
          padding: 0,
          height: "90vh",
          minHeight: 300,
          overflowY: "auto",
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[
            selectedConversation ? selectedConversation._id : "empty",
          ]}
          style={{
            height: "100%",
            borderRight: 0,
            overflowY: "auto",
            minWidth: screens.xs ? "100vw" : 0,
          }}
        >
          <Menu.Item
            key="empty"
            disabled
            style={{
              height: 70,
              display: "flex",
              alignItems: "center",
              background: "#fafafa",
              cursor: "default",
            }}
          >
            <Title
              level={4}
              style={{
                margin: 0,
                paddingLeft: 8,
                fontSize: screens.xs ? 18 : 22,
              }}
            >
              Đoạn chat
            </Title>
          </Menu.Item>
          {chatData && chatData.length > 0 ? (
            chatData.map((conversation) => {
              const participants = conversation.participants as IParticipant[];
              const messages = conversation.messages as IMessage[];
              const lastMessage = messages[messages.length - 1];
              const hasBeenRead =
                Array.isArray(lastMessage?.readBy) &&
                lastMessage.readBy.some(
                  (id) => id?.toString() === userId?.toString()
                );
              return (
                <Menu.Item
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  style={{
                    minHeight: 70,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: screens.xs ? "8px 4px" : "8px 16px",
                  }}
                >
                  <Row wrap={false} style={{ width: "100%" }}>
                    <Col flex="48px">
                      <Avatar
                        src={participants[0].avatar || "/avtDefault.png"}
                        alt={participants[0].fullName || "Khách hàng"}
                        style={{
                          width: 48,
                          height: 48,
                          minWidth: 48,
                          minHeight: 48,
                          flexGrow: 1,
                        }}
                      />
                    </Col>
                    <Col flex="auto" style={{ minWidth: 0 }}>
                      <Row>
                        <Col span={24} style={{ maxHeight: 24, minWidth: 0 }}>
                          <Text
                            ellipsis
                            style={{
                              marginBottom: 10,
                              fontWeight: 700,
                              paddingLeft: 8,
                              fontSize: screens.xs ? 14 : 16,
                            }}
                          >
                            {participants[0].fullName || "Khách hàng"}
                          </Text>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={19} style={{ paddingLeft: 8, minWidth: 0 }}>
                          <Text
                            ellipsis
                            type={hasBeenRead ? "secondary" : undefined}
                            style={{
                              marginTop: 5,
                              fontWeight: hasBeenRead ? "normal" : "bold",
                              fontSize: screens.xs ? 12 : 14,
                              width: "100%",
                              display: "block",
                            }}
                          >
                            {(lastMessage.senderRole === "user" ? "" : `Bạn:`) +
                              lastMessage.content.slice(0, 20) +
                              "..." || ""}
                          </Text>
                        </Col>
                        <Col span={5} style={{ textAlign: "right" }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(conversation.lastUpdated).format("HH:mm")}
                          </Text>
                        </Col>
                      </Row>
                    </Col>
                    <Col flex="20px" style={{ textAlign: "right" }}>
                      {!hasBeenRead && <Badge dot color="blue" />}
                    </Col>
                  </Row>
                </Menu.Item>
              );
            })
          ) : (
            <Menu.Item key="no-customer" disabled>
              <Text type="secondary">Chưa có khách hàng nào cần hỗ trợ</Text>
            </Menu.Item>
          )}
        </Menu>
      </Col>
      <Col
        xs={24}
        sm={16}
        md={17}
        lg={18}
        xl={19}
        style={{
          minHeight: 300,
          height: "90vh",
          overflowY: "auto",
          padding: screens.xs ? 8 : 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedConversation ? (
          <ChatShow id={selectedConversation._id} />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Title
              level={2}
              style={{
                color: "#8BC34A",
                marginBottom: 8,
                fontSize: screens.xs ? 22 : 32,
              }}
            >
              B
              <span style={{ color: mode === "light" ? "#222" : "#fff" }}>
                inova
              </span>
              .
            </Title>
            <i style={{ color: "gray", fontSize: screens.xs ? 14 : 16 }}>
              ~ Hãy biến khách hàng thành người hùng trong câu chuyện ~
            </i>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default ChatList;
