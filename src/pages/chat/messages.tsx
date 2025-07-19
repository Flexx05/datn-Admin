/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInvalidate, useList, useOne } from "@refinedev/core";
import {
  Avatar,
  Button,
  Grid,
  Input,
  List,
  message,
  Space,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { ColorModeContext } from "../../contexts/color-mode";
import { IConversation, IMessage } from "../../interface/conversation";
import { INotification } from "../../interface/notification";
import { socket, useChatSocket } from "../../socket";
import { axiosInstance } from "../../utils/axiosInstance";
import CloseConversation from "./CloseConversation";
import { SendOutlined } from "@ant-design/icons";

type DisplayMessage = IMessage & { type?: "user"; senderRole?: string };

// TODO: thêm Icon và xử lý logic thêm ảnh

const Messages = () => {
  const { id } = useParams<string>();
  const [input, setInput] = useState("");
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
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);

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
    } catch (error) {
      message.error("Lỗi khi gửi tin nhắn");
    }
    setInput("");
  };

  const closedConversation = conversation?.status === "closed";

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

      <Tooltip
        title={
          closedConversation
            ? "Không thể nhắn tin khi đoạn chat đã kết thúc"
            : null
        }
      >
        <Space.Compact style={{ width: "100%" }}>
          <Input
            style={{
              width: "100%",
              minWidth: 0,
              fontSize: "clamp(14px, 2.5vw, 16px)",
              padding: screens?.xs ? "5px 7px" : undefined,
              borderRadius: 30,
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            placeholder="Nhập tin nhắn..."
            disabled={closedConversation}
          />
          <Button
            type="link"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={closedConversation}
            style={{
              width: screens?.xs ? 20 : 40,
              fontSize: screens?.xs ? 13 : 16,
            }}
          />
        </Space.Compact>
      </Tooltip>
    </div>
  );
};

export default Messages;
