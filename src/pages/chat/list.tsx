/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Layout,
  Avatar,
  Badge,
  Button,
  Col,
  Grid,
  Row,
  Spin,
  Typography,
} from "antd";
import { EyeFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { useAuth } from "../../contexts/auth/AuthContext";
import { ColorModeContext } from "../../contexts/color-mode";
import {
  IConversation,
  IMessage,
  IParticipant,
} from "../../interface/conversation";
import { useInvalidate, useList } from "@refinedev/core";
import { socket } from "../../socket";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;
const { Sider, Content } = Layout;

const ChatList = () => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(
    null
  );
  const screens = useBreakpoint();
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const userId = user?._id;
  const { mode } = useContext(ColorModeContext);
  const selectedMode = mode === "dark" ? "#2e2e2eff" : "#e8e8e858";

  const { data, isLoading, refetch } = useList<IConversation>({
    resource: "conversation",
    errorNotification: {
      type: "error",
      message: "Lỗi khi tải danh sách hội thoại",
      description: "Vui lòng thử lại sau.",
    },
  });

  const invalidate = useInvalidate();

  useEffect(() => {
    if (id) socket.emit("join-conversation", id);
  }, [id]);

  useEffect(() => {
    const handleChange = () => {
      invalidate({ resource: "conversation", invalidates: ["list"] });
      refetch();
    };
    socket.on("conversation-updated", handleChange);
    return () => {
      socket.off("conversation-updated", handleChange);
    };
  }, [invalidate, refetch]);

  const chatData = data?.data.filter((item) => item.messages.length > 0) || [];

  if (isLoading) return <Spin size="large" />;

  return (
    <Layout style={{ minHeight: "90vh", height: "90vh" }}>
      <Sider
        width={screens.xs ? "100%" : 300}
        breakpoint="sm"
        collapsedWidth="0"
        theme="light"
        style={{
          borderRight: `1px solid ${mode === "dark" ? "#1a1a1a" : "#f0f0f0"}`,
          padding: "0 0 16px 0",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            height: 70,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            // background: "#fafafa",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Đoạn chat
          </Title>
        </div>

        {chatData.length > 0 ? (
          chatData.map((conversation) => {
            const participants = conversation.participants as IParticipant[];
            const messages = conversation.messages as IMessage[];
            const lastMessage = messages[messages.length - 1];

            const hasBeenRead =
              Array.isArray(lastMessage?.readBy) &&
              lastMessage.readBy.some(
                (id) => id?.toString() === userId?.toString()
              );

            const customer =
              participants.find((p) => p.role === "user") ||
              ({} as IParticipant);

            const isSelected = selectedConversation === conversation._id;

            return (
              <div
                key={conversation._id}
                onClick={() => {
                  nav(`/conversation/message/${conversation._id}`);
                  setSelectedConversation(conversation._id);
                }}
                onMouseEnter={() => setHoveredConversation(conversation._id)}
                onMouseLeave={() => setHoveredConversation(null)}
                style={{
                  cursor: "pointer",
                  background: isSelected ? selectedMode : "transparent",
                  padding: "10px 16px",
                  position: "relative",
                }}
              >
                <Row wrap={false} align="middle">
                  <Col flex="48px">
                    <Avatar
                      src={customer.avatar || "/avtDefault.png"}
                      alt={customer.fullName || "Khách hàng"}
                      size={48}
                    />
                  </Col>
                  <Col flex="auto" style={{ paddingLeft: 8 }}>
                    <Row>
                      <Col span={24}>
                        <Text
                          strong
                          ellipsis
                          style={{
                            display: "block",
                            fontSize: screens.xs ? 14 : 16,
                          }}
                        >
                          {customer.fullName || "Khách hàng"}
                        </Text>
                      </Col>
                      <Col span={19}>
                        <Text
                          ellipsis
                          type={hasBeenRead ? "secondary" : undefined}
                          style={{
                            fontWeight: hasBeenRead ? "normal" : "bold",
                            fontSize: 14,
                          }}
                        >
                          {(lastMessage.senderRole === "user" ? "" : "Bạn: ") +
                            (lastMessage?.content?.slice(0, 20) || "") +
                            "..."}
                        </Text>
                      </Col>
                      <Col span={5} style={{ textAlign: "right" }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(conversation.lastUpdated).format("HH:mm")}
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                  <Col flex="20px">
                    {!hasBeenRead && <Badge dot color="blue" />}
                  </Col>
                </Row>

                {hoveredConversation === conversation._id && (
                  <div
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                    }}
                  >
                    <Button
                      icon={<EyeFilled />}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        nav(`/conversation/id/${conversation._id}`);
                        setSelectedConversation(conversation._id);
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ padding: 16 }}>
            <Text type="secondary">Chưa có khách hàng nào cần hỗ trợ</Text>
          </div>
        )}
      </Sider>

      <Content
        style={{
          height: "90vh",
          overflowY: "auto",
          padding: screens.xs ? 8 : 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedConversation ? (
          <Outlet />
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
      </Content>
    </Layout>
  );
};

export default ChatList;
