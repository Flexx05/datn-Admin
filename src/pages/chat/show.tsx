/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Button, Grid, Input, List, Space, Typography } from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/auth/AuthContext";
import { ColorModeContext } from "../../contexts/color-mode";
import { socket } from "../../socket/socket";
import { useChatSocket } from "../../socket/useChatSocket";

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
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mode } = useContext(ColorModeContext);
  const colorMode = mode === "dark" ? "#1a1a1a" : "white";

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  // Lấy tin nhắn từ API thực tế ở đây, hiện tại dùng mock
  useEffect(() => {
    setLoading(true);
    // TODO: Thay bằng API lấy tin nhắn theo id
    setTimeout(() => {
      setMessages([
        {
          _id: "m1",
          senderId: "1",
          message: "Xin chào, tôi cần hỗ trợ!",
          createdAt: "2024-06-28T10:00:00Z",
        },
        {
          _id: "m2",
          senderId: "admin",
          message: "Chào bạn, shop có thể giúp gì cho bạn?",
          createdAt: "2024-06-28T10:01:00Z",
        },
      ]);
      setLoading(false);
    }, 300);
  }, [id]);

  // Lắng nghe tin nhắn realtime
  useChatSocket((msg) => {
    if (msg.senderId === id || msg.senderId === user?._id) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        level={4}
        style={{
          fontSize: "clamp(18px, 3vw, 24px)",
          marginBottom: 16,
        }}
      >
        Khách hàng
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
          dataSource={messages}
          loading={loading}
          renderItem={(item) => (
            <List.Item
              style={{
                justifyContent:
                  item.senderId === user?._id ? "flex-end" : "flex-start",
                border: "none",
                padding: 0,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {item.senderId !== user?._id && (
                  <Avatar size={28} style={{ background: "#eee" }}>
                    U
                  </Avatar>
                )}
                <div
                  style={{
                    background:
                      item.senderId === user?._id
                        ? "#1269EB"
                        : mode === "dark"
                        ? "#575757"
                        : "#f0f0f0",
                    color: item.senderId === user?._id ? "#fff" : undefined,
                    borderRadius: 16,
                    padding: screens?.xs ? "6px 10px" : "8px 16px",
                    margin: "2px 0",
                    maxWidth: screens?.xs ? 220 : 320,
                    wordBreak: "break-word",
                    fontSize: screens?.xs ? 13 : 15,
                  }}
                >
                  {item.message}
                  <div
                    style={{
                      fontSize: 10,
                      color: "#bdbdbd",
                      marginTop: 2,
                      textAlign: "right",
                    }}
                  >
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                {item.senderId === user?._id && (
                  <Avatar
                    size={28}
                    style={{ background: "#1677ff", color: "#fff" }}
                  >
                    A
                  </Avatar>
                )}
              </div>
            </List.Item>
          )}
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
