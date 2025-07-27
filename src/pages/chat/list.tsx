/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashOutlined } from "@ant-design/icons";
import { useInvalidate, useList } from "@refinedev/core";
import {
  Avatar,
  Badge,
  Button,
  Col,
  Dropdown,
  Grid,
  Layout,
  message,
  Popover,
  Row,
  Tag,
  Typography,
} from "antd";
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
import { socket } from "../../socket";
import { axiosInstance } from "../../utils/axiosInstance";
import Loader from "../../utils/loading";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;
const { Sider, Content } = Layout;

const ChatList = () => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [filterChatType, setFilterChatType] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(
    null
  );
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const screens = useBreakpoint();
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const userId = user?._id;
  const { mode } = useContext(ColorModeContext);
  const colorMode = mode === "dark" ? "#1a1a1a" : "white";
  const selectedMode = mode === "dark" ? "#2e2e2eff" : "#e8e8e858";

  const { data, isLoading, refetch } = useList<IConversation>({
    resource: "conversation",
    errorNotification: {
      type: "error",
      message: "Lỗi khi tải danh sách hội thoại",
      description: "Vui lòng thử lại sau.",
    },
    filters: [
      {
        field: "chatType",
        operator: "eq",
        value: filterChatType,
      },
      {
        field: "status",
        operator: "eq",
        value: filterStatus,
      },
    ],
  });
  const invalidate = useInvalidate();
  const chatData = data?.data.filter((item) => item.messages.length > 1) || [];

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

  const handleChangeChatType = async (chatType: number) => {
    try {
      await axiosInstance.patch(`conversation/chat-type/${id}`, {
        chatType,
      });
      invalidate({
        resource: "conversation",
        id,
        invalidates: ["list", "detail"],
      });
    } catch (error) {
      message.error("Lỗi khi thay đổi trạng thái đoạn chat");
    }
  };

  const chatTypeMap: Record<number, { label: string; color: string }> = {
    1: { label: "Hỗ trợ", color: "#1890ff" },
    2: { label: "Đơn hàng", color: "#52c41a" },
    3: { label: "Phản hồi", color: "#faad14" },
    4: { label: "Khác", color: "#ffbcbcff" },
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "Hoạt động", color: "green" },
    waiting: { label: "Đang chờ", color: "yellow" },
    closed: { label: "Đã đóng", color: "red" },
  };

  const getPopoverStatusContent = (
    typeMap: Record<string, { label: string; color: string }> = statusMap
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Object.entries(typeMap).map(([key, { label, color }]) => (
        <Button
          key={key}
          type="link"
          style={{
            color: "white",
            backgroundColor: color,
            textAlign: "left",
          }}
          onClick={() => setFilterStatus(key)}
        >
          {label}
        </Button>
      ))}
    </div>
  );

  const getPopoverContent = (
    onChange: (type: number) => void,
    typeMap: Record<number, { label: string; color: string }> = chatTypeMap
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Object.entries(typeMap).map(([key, { label, color }]) => (
        <Button
          key={key}
          type="link"
          style={{
            color: "white",
            backgroundColor: color,
            textAlign: "left",
          }}
          onClick={() => onChange(Number(key))}
        >
          {label}
        </Button>
      ))}
    </div>
  );

  if (isLoading) return <Loader />;

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
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Đoạn chat
          </Title>
        </div>
        {/* Phân loại kiểu đoạn chat */}
        <Popover
          trigger={"click"}
          content={getPopoverContent(setFilterChatType, {
            0: { label: "Tất cả", color: "#a4a4a4ff" },
            ...chatTypeMap,
          })}
        >
          <Button>Phân loại</Button>
        </Popover>
        {/* Phân loại trạng thái đoạn chat */}
        <Popover
          trigger={"click"}
          content={getPopoverStatusContent({
            all: { label: "Tất cả", color: "#a4a4a4ff" },
            ...statusMap,
          })}
        >
          <Button>Trạng thái</Button>
        </Popover>

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
              participants.find((p) => p.userId.role === "user") ||
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
                      src={customer.userId.avatar || "/avtDefault.png"}
                      alt={
                        customer.userId.fullName || "Khách hàng không xác định"
                      }
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
                          {customer.userId.fullName ||
                            "Khách hàng không xác định"}
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
                            (lastMessage?.files?.length > 0
                              ? "đã gửi files"
                              : lastMessage?.content
                              ? lastMessage.content.slice(0, 20) + "..."
                              : "Đã gửi tin nhắn")}
                        </Text>
                      </Col>
                      <Col span={5} style={{ textAlign: "right" }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(conversation.lastUpdated).format("HH:mm")}
                        </Text>
                      </Col>
                      <Tag
                        color={statusMap[conversation.status].color}
                        style={{
                          fontSize: 12,
                          width: "fit-content",
                          marginLeft: 8,
                        }}
                      >
                        {statusMap[conversation.status].label}
                      </Tag>
                    </Row>
                  </Col>
                  <Col flex="20px">
                    {!hasBeenRead && <Badge dot color="blue" />}
                  </Col>
                  <Badge.Ribbon
                    text={chatTypeMap[conversation.chatType].label}
                    style={{
                      fontSize: 12,
                      position: "absolute",
                      top: -45,
                      right: -15,
                    }}
                    color={chatTypeMap[conversation.chatType].color}
                  />
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
                    <Dropdown
                      trigger={["click"]}
                      onOpenChange={(visible) => setPopoverOpen(visible)}
                      popupRender={() => (
                        <div
                          style={{
                            padding: 10,
                            backgroundColor: colorMode,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Button
                            style={{ color: mode === "dark" ? "#fff" : "#000" }}
                            type="link"
                            onClick={(e) => {
                              e.stopPropagation();
                              nav(`/conversation/id/${conversation._id}`);
                              setSelectedConversation(conversation._id);
                            }}
                          >
                            Xem chi tiết
                          </Button>

                          <Popover
                            content={getPopoverContent(handleChangeChatType)}
                            title="Phân loại"
                            trigger="click"
                            placement="rightTop"
                            open={popoverOpen}
                            onOpenChange={(visible) => setPopoverOpen(visible)}
                          >
                            <Button
                              style={{
                                color: mode === "dark" ? "#fff" : "#000",
                                marginTop: 8,
                              }}
                              type="link"
                            >
                              Phân loại
                            </Button>
                          </Popover>
                        </div>
                      )}
                    >
                      <Button icon={<DashOutlined />} shape="circle" />
                    </Dropdown>
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
