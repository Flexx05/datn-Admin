/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashOutlined } from "@ant-design/icons";
import { CrudFilters, useInvalidate, useList } from "@refinedev/core";
import {
  Avatar,
  Badge,
  Button,
  Col,
  Divider,
  Dropdown,
  Grid,
  Input,
  Layout,
  message,
  Popover,
  Row,
  Spin,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useMemo, useState } from "react";
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
import AssignConversation from "./AssignConversation";
import AssignConversationToStaff from "./AssignConversationToStaff";
import UnAssignConversation from "./UnAssignConversation";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;
const { Sider, Content } = Layout;

const ChatList = () => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [filterChatType, setFilterChatType] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(
    null
  );
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [staffAssigned, setStaffAssigned] = useState<
    string | number | undefined
  >("");
  const screens = useBreakpoint();
  const [searchValue, setSearchValue] = useState("");
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const userId = user?._id;
  const { mode } = useContext(ColorModeContext);
  const colorMode = mode === "dark" ? "#1a1a1a" : "white";
  const selectedMode = mode === "dark" ? "#2e2e2eff" : "#e8e8e858";

  const filters = useMemo(() => {
    const result = [];

    if (filterChatType) {
      result.push({
        field: "chatType",
        operator: "eq",
        value: filterChatType,
      });
    }

    if (filterStatus) {
      result.push({
        field: "status",
        operator: "eq",
        value: filterStatus,
      });
    }

    if (staffAssigned) {
      result.push({
        field: "assignedTo",
        operator: "eq",
        value: staffAssigned,
      });
    }

    if (searchValue.trim()) {
      result.push({
        field: "search",
        operator: "contains",
        value: searchValue.trim(),
      });
    }

    return result as CrudFilters;
  }, [filterChatType, filterStatus, staffAssigned, searchValue]);

  const { data, isLoading, refetch } = useList<IConversation>({
    resource: "conversation",
    errorNotification: {
      type: "error",
      message: "Lỗi khi tải danh sách hội thoại",
      description: "Vui lòng thử lại sau.",
    },
    filters: filters,
    queryOptions: {
      onSettled: () => setFilterLoading(false),
    },
  });

  const invalidate = useInvalidate();
  const chatData =
    data?.data.filter(
      (item) =>
        item.messages.length > 1 || item.messages[0].senderRole !== "system"
    ) || [];

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
    } catch (error: any) {
      message.error(
        "Lỗi khi thay đổi trạng thái đoạn chat\n" + error.response?.data?.error
      );
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
    waiting: { label: "Đang chờ", color: "orange" },
    closed: { label: "Đã đóng", color: "red" },
  };

  const handleSetFilterStatus = (status: string) => {
    setFilterLoading(true);
    setFilterStatus(status);
  };

  const handleSetFilterChatType = (type: number) => {
    setFilterLoading(true);
    setFilterChatType(type);
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
            textAlign: "left",
            backgroundColor: color,
          }}
          onClick={() => handleSetFilterStatus(key)}
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
          onClick={() => handleSetFilterChatType(Number(key))}
        >
          {label}
        </Button>
      ))}
    </div>
  );

  return (
    <Layout
      style={{
        minHeight: "calc(90vh - 24px)",
        height: "calc(90vh - 24px)",
      }}
    >
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
        <Spin spinning={isLoading || filterLoading}>
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
          {user?.role !== "admin" ? (
            staffAssigned !== userId ? (
              <Button onClick={() => setStaffAssigned(userId)}>
                Đă đăng ký
              </Button>
            ) : (
              <Button onClick={() => setStaffAssigned("all")}>Tất cả</Button>
            )
          ) : null}
          <Input.Search
            placeholder="Tìm theo tên khách hàng..."
            allowClear
            onSearch={(value) => setSearchValue(value)}
            style={{ marginTop: 16 }}
          />
          <Divider style={{ margin: "10px 0" }} />

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
                          customer.userId.fullName ||
                          "Khách hàng không xác định"
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
                            {(lastMessage.senderRole === "user"
                              ? ""
                              : "Bạn: ") +
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
                            marginRight: 8,
                          }}
                        >
                          {statusMap[conversation.status].label}
                        </Tag>
                        {conversation?.assignedTo && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Đăng ký:{" "}
                            {conversation.assignedTo?.fullName ||
                              conversation.assignedTo?.email}
                          </Text>
                        )}
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
                        onOpenChange={(open) => {
                          if (!open) return;
                          setPopoverOpen(open);
                        }}
                        popupRender={() => (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{
                              padding: 10,
                              backgroundColor: colorMode,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Button
                              style={{
                                color: mode === "dark" ? "#fff" : "#000",
                              }}
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
                              onOpenChange={(visible) =>
                                setPopoverOpen(visible)
                              }
                            >
                              <Button
                                style={{
                                  color: mode === "dark" ? "#fff" : "#000",
                                  marginTop: 8,
                                }}
                                type="link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                Phân loại
                              </Button>
                            </Popover>

                            <Divider style={{ margin: "8px 0" }} />

                            {conversation?.assignedTo === null ? (
                              user?.role === "admin" ? (
                                <AssignConversationToStaff
                                  conversationId={id || ""}
                                  placeMent="rightTop"
                                  disabledStatus={
                                    conversation?.status === "closed"
                                  }
                                  buttonType="link"
                                />
                              ) : (
                                <AssignConversation
                                  conversationId={id || ""}
                                  disabledStatus={
                                    conversation?.status === "closed"
                                  }
                                  buttonType="link"
                                />
                              )
                            ) : (
                              <UnAssignConversation
                                conversationId={id || ""}
                                buttonType="dashed"
                                staffId={conversation?.assignedTo?._id || ""}
                                lastUpdated={conversation?.lastUpdated || ""}
                                assignedTo={conversation?.assignedTo?._id || ""}
                              />
                            )}
                          </div>
                        )}
                      >
                        <Button
                          icon={<DashOutlined />}
                          shape="circle"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopoverOpen((prev) => !prev);
                          }}
                        />
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
        </Spin>
      </Sider>

      <Content
        style={{
          height: "90vh",
          overflowY: "auto",
          padding: screens.xs ? "0 8px" : "0 24px",
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
