/* eslint-disable @typescript-eslint/no-explicit-any */
import { useShow } from "@refinedev/core";
import {
  Avatar,
  Button,
  Grid,
  Input,
  List,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/auth/AuthContext";
import { ColorModeContext } from "../../contexts/color-mode";
import { socket } from "../../socket/socket";
import { IConversation, IParticipant } from "../../interface/conversation";
import { Link } from "react-router";
import dayjs from "dayjs";

interface ChatShowProps {
  id?: string;
}

const ChatShow = (props: ChatShowProps) => {
  // Ưu tiên lấy id từ props, fallback về useParams nếu không có
  const paramId =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : undefined;
  const id = props.id || paramId;
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mode } = useContext(ColorModeContext);
  const colorMode = mode === "dark" ? "#1a1a1a" : "white";

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const { queryResult } = useShow<IConversation>({
    resource: "conversation",
    id,
    errorNotification: {
      type: "error",
      message: "Lỗi khi tải hội thoại",
      description: "Vui lòng thử lại sau.",
    },
  });

  const { data: conversation, isLoading } = queryResult;

  // Lắng nghe tin nhắn realtime
  // useChatSocket((msg) => {
  //   if (msg.senderId === id || msg.senderId === user?._id) {
  //     setMessages((prev) => [...prev, msg]);
  //   }
  // });

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSend = () => {
    if (!input.trim()) return;
    socket.emit("chat-message", {
      senderId: user?._id,
      reciverId: id,
      message: input,
    });
    setInput("");
  };

  return (
    <div style={{ width: "100%", maxWidth: "auto", margin: "0 auto" }}>
      <Typography.Title
        level={5}
        style={{
          fontSize: "clamp(18px, 3vw, 24px)",
          marginBottom: 16,
        }}
      >
        Khách hàng:{" "}
        <Tooltip title="Xem thông tin khách hàng">
          <Link
            to={`/users/show/${conversation?.data?.participants[0]?.userId}`}
          >
            {conversation?.data?.participants[0]?.fullName}
          </Link>
        </Tooltip>
      </Typography.Title>
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
          dataSource={conversation?.data ? [conversation.data] : []}
          loading={isLoading}
          renderItem={(msg) => {
            const sender =
              msg.participants.find(
                (p: any) => p.userId === msg.messages[0]?.senderId
              ) || ({} as IParticipant);

            return msg.messages.map((message) => {
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
                      <Avatar
                        size={28}
                        src={sender.avatar || "/avtDefault.png"}
                      />
                    )}

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
                      <div
                        style={{
                          fontSize: 10,
                          color: "#bdbdbd",
                          marginTop: 2,
                          textAlign: isUser ? "left" : "right",
                        }}
                      >
                        {dayjs(message.createdAt).format("HH:mm")}
                      </div>
                    </div>
                  </div>
                </List.Item>
              );
            });
          }}
        />

        <div ref={messagesEndRef} />
      </div>
      <Space.Compact style={{ width: "100%" }}>
        <Input
          style={{
            width: "100%",
            minWidth: 0,
            fontSize: "clamp(14px, 2.5vw, 16px)",
            padding: screens?.xs ? "6px 8px" : undefined,
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
          placeholder="Nhập tin nhắn..."
        />
        <Button
          type="primary"
          onClick={handleSend}
          style={{
            width: screens?.xs ? 60 : 80,
            fontSize: screens?.xs ? 13 : 16,
          }}
        >
          Gửi
        </Button>
      </Space.Compact>
    </div>
  );
};

export default ChatShow;
