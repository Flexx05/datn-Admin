/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SendOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useInvalidate, useList, useOne } from "@refinedev/core";
import {
  Avatar,
  Button,
  Dropdown,
  Grid,
  Input,
  List,
  Menu,
  message,
  Popover,
  Space,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { ColorModeContext } from "../../contexts/color-mode";
import {
  IConversation,
  IMessage,
  IQuickChat,
} from "../../interface/conversation";
import { INotification } from "../../interface/notification";
import { socket, useChatSocket } from "../../socket";
import { axiosInstance } from "../../utils/axiosInstance";
import CloseConversation from "./CloseConversation";

type DisplayMessage = IMessage & { type?: "user"; senderRole?: string };

// TODO: thêm Icon và xử lý logic thêm ảnh
// TODO: Tích hợp chat nhanh

const Messages = () => {
  const { id } = useParams<string>();
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [filterCategory, setFilterCategory] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mode } = useContext(ColorModeContext);
  const colorMode = mode === "dark" ? "#1a1a1a" : "white";
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const invalidate = useInvalidate();

  const { data, isLoading } = useOne<IConversation>({
    resource: "conversation",
    id,
    errorNotification: {
      type: "error",
      message: "Lỗi khi tải hội thoại",
      description: "Vui lòng thử lại sau.",
    },
  });

  const conversation = data?.data;

  // ✅ Gán displayMessages ban đầu từ conversation
  useEffect(() => {
    if (!conversation) return;

    const userMessages: DisplayMessage[] = conversation.messages.map((m) => {
      const sender = conversation.participants.find(
        (p) => p.userId === m.senderId
      );
      return {
        ...m,
        senderRole: m.senderRole || sender?.role,
        type: "user",
      };
    });

    setDisplayMessages(userMessages);
  }, [conversation]);

  useEffect(() => {
    if (id) {
      socket.emit("join-conversation", id);
    }
  }, [id]);

  // ✅ Lắng nghe tin nhắn realtime
  useChatSocket(id || "", (msg: { message: IMessage }) => {
    const realMessage = msg.message;
    const sender = conversation?.participants.find(
      (p) => p.userId === realMessage.senderId
    );
    setDisplayMessages((prev) => [
      ...prev,
      {
        ...realMessage,
        senderRole: sender?.role ?? "user",
        type: "user",
      },
    ]);
    invalidate({
      resource: "conversation",
      id,
      invalidates: ["list", "detail"],
    });
  });

  // ✅ Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const { data: notification } = useList<INotification>({
    resource: "notification",
    filters: [
      {
        field: "link",
        operator: "eq",
        value: id,
      },
    ],
    pagination: {
      mode: "off",
    },
  });

  // ✅ Hành động gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await axiosInstance.post("/send-message", {
        content: input,
        conversationId: id,
      });
      if (notification?.data && Array.isArray(notification?.data)) {
        const unreadNotifications = notification?.data.filter(
          (n) => n.isRead === false
        );

        await Promise.all(
          unreadNotifications.map((n) =>
            axiosInstance.patch(`/notification/${n._id}`, { isRead: true })
          )
        );

        invalidate({
          resource: "notification",
          invalidates: ["list"],
        });
      }
      invalidate({
        resource: "conversation",
        id,
        invalidates: ["list", "detail"],
      });
    } catch (error: any) {
      message.error("Lỗi khi gửi tin nhắn" + error.message);
    }
    setInput("");
  };

  const closedConversation = conversation?.status === "closed";

  // ✅ Hành động gửi tin nhắn nhanh
  const {
    data: quickChat,
    refetch,
    isLoading: isLoadingQuickChat,
    isFetching,
  } = useList<IQuickChat>({
    resource: "quick-chat",
    meta: {
      _limit: "off",
    },
    filters: [
      {
        field: "search",
        operator: "contains",
        value: searchTerm,
      },
      {
        field: "category",
        operator: "eq",
        value: filterCategory,
      },
    ],
    pagination: { mode: "off" },
    queryOptions: {
      // 👇 dùng searchTerm làm key để trigger lại
      queryKey: ["quick-chat", "search", searchTerm],
      enabled: !!searchTerm || searchTerm === "", // để cho phép fetch khi search
    },
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      refetch();
    }, 400); // debounce 400ms

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterCategory, refetch]);

  const categoryMap: Record<number, string> = {
    0: "Tất cả",
    1: "Chung",
    2: "Đơn hàng",
    3: "Thanh toán",
    4: "Vận chuyển",
    5: "Hóa đơn",
    6: "Khác",
  };

  const getPopoverCategoryContent = (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 8, zIndex: 100 }}
    >
      {Object.entries(categoryMap).map(([key, label]) => (
        <Button
          key={key}
          type="link"
          style={{
            color: mode === "dark" ? "white" : "black",
            textAlign: "left",
          }}
          onClick={() => setFilterCategory(Number(key))}
        >
          {label}
        </Button>
      ))}
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: "auto", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Typography.Title
          level={5}
          style={{
            fontSize: "clamp(18px, 3vw, 24px)",
            marginBottom: 16,
          }}
        >
          Khách hàng:{" "}
          <Tooltip title="Xem thông tin khách hàng">
            <Link to={`/users/show/${conversation?.participants[0]?.userId}`}>
              {conversation?.participants[0]?.fullName}
            </Link>
          </Tooltip>
        </Typography.Title>
        <CloseConversation
          conversationId={id || ""}
          hiddenStatus={closedConversation}
        />
      </div>

      <div
        style={{
          height: "calc(100vh - 210px)",
          minHeight: 250,
          maxHeight: 600,
          overflowY: "auto",
          border: `1px solid ${mode === "dark" ? "#575757" : "#f0f0f0"}`,
          borderRadius: 8,
          padding: 8,
          marginBottom: 12,
          background: colorMode,
          transition: "background 0.2s",
        }}
      >
        <List
          dataSource={displayMessages}
          loading={isLoading}
          renderItem={(message) => {
            const isUser = message.senderRole === "user";

            return (
              <List.Item
                key={message._id}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-start" : "flex-end",
                  border: "none",
                  padding: 0,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 8,
                    flexDirection: isUser ? "row" : "row-reverse",
                    maxWidth: "70%",
                    width: "auto",
                  }}
                >
                  {isUser && (
                    <div style={{ flexShrink: 0, marginRight: 8 }}>
                      <Avatar
                        size={28}
                        src={
                          conversation?.participants.find(
                            (p) => p.userId === message.senderId
                          )?.avatar || "/avtDefault.png"
                        }
                      />
                    </div>
                  )}
                  <Tooltip
                    title={dayjs(message.createdAt).format("HH:mm")}
                    placement="left"
                  >
                    <div
                      style={{
                        background: isUser
                          ? mode === "dark"
                            ? "#575757"
                            : "#f0f0f0"
                          : "#1269EB",
                        color: isUser ? undefined : "#fff",
                        borderRadius: 16,
                        padding: screens?.xs ? "6px 10px" : "8px 16px",
                        maxWidth: screens?.xs ? 220 : 320,
                        wordBreak: "break-word",
                        fontSize: screens?.xs ? 13 : 15,
                        textAlign: "left",
                      }}
                    >
                      {message.content}
                    </div>
                  </Tooltip>
                </div>
              </List.Item>
            );
          }}
        />
        <div ref={messagesEndRef} />
      </div>

      <Space.Compact style={{ width: "100%" }}>
        <Tooltip title={"Tin nhắn nhanh"}>
          <Dropdown
            placement="topLeft"
            trigger={["click"]}
            popupRender={() => (
              <>
                {isLoadingQuickChat && isFetching ? (
                  <Spin />
                ) : (
                  <Menu
                    items={quickChat?.data?.map((item: IQuickChat) => ({
                      key: item._id,
                      label: item.content,
                    }))}
                    onClick={({ key }) => {
                      const selected = quickChat?.data?.find(
                        (item: IQuickChat) => item._id === key
                      );
                      if (selected) setInput(selected.content);
                    }}
                  />
                )}
                <div style={{ padding: 8, display: "flex", gap: 10 }}>
                  <Input
                    placeholder="Tìm tin nhắn nhanh..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setInput(e.target.value);
                    }}
                  />
                  <Popover
                    content={getPopoverCategoryContent}
                    trigger="click"
                    getPopupContainer={(trigger) => trigger.parentElement!}
                  >
                    <Button>Mục</Button>
                  </Popover>
                </div>
              </>
            )}
          >
            <Button icon={<ThunderboltOutlined />} type="link" />
          </Dropdown>
        </Tooltip>

        <Input
          style={{
            width: "100%",
            minWidth: 0,
            fontSize: "clamp(14px, 2.5vw, 16px)",
            padding: screens?.xs ? "5px 7px" : undefined,
            borderRadius: "20px",
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Nhập tin nhắn..."
        />
        <Button
          type="link"
          icon={<SendOutlined />}
          onClick={handleSend}
          style={{
            borderTopRightRadius: 30,
            borderBottomRightRadius: 30,
            width: screens?.xs ? 20 : 40,
            fontSize: screens?.xs ? 13 : 16,
          }}
        />
      </Space.Compact>
    </div>
  );
};

export default Messages;
