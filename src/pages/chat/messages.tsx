/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Loading3QuartersOutlined,
  PlusOutlined,
  SendOutlined,
  SmileOutlined,
  ThunderboltOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useInvalidate, useList, useOne } from "@refinedev/core";
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Grid,
  Image,
  Input,
  List,
  Menu,
  message,
  Popover,
  Space,
  Tooltip,
  Typography,
  Upload,
  UploadFile,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { CLOUDINARY_URL } from "../../config/dataProvider";
import { ColorModeContext } from "../../contexts/color-mode";
import {
  IConversation,
  IMessage,
  IParticipant,
  IQuickChat,
} from "../../interface/conversation";
import { INotification } from "../../interface/notification";
import { socket, useChatSocket } from "../../socket";
import { axiosInstance } from "../../utils/axiosInstance";
import CloseConversation from "./CloseConversation";
import AssignConversation from "./AssignConversation";
import { useAuth } from "../../contexts/auth/AuthContext";
import AssignConversationToStaff from "./AssignConversationToStaff";
import UnAssignConversation from "./UnAssignConversation";

type DisplayMessage = IMessage & { type?: "user"; senderRole?: string };

const Messages = () => {
  const { id } = useParams<string>();
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [filterCategory, setFilterCategory] = useState<number>(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [sending, setSending] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mode } = useContext(ColorModeContext);
  const colorMode = mode === "dark" ? "#1a1a1a" : "white";
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const invalidate = useInvalidate();
  const { user } = useAuth();

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
        (p) => p.userId?._id === m.senderId
      );
      return {
        ...m,
        senderRole: m.senderRole || sender?.userId.role,
        type: "user",
      };
    });

    setDisplayMessages(userMessages);
  }, [conversation]);

  useEffect(() => {
    if (id) {
      socket.emit("join-conversation", id);
      socket.on("conversation-updated", () => {
        invalidate({
          resource: "conversation",
          id,
          invalidates: ["list", "detail"],
        });
      });
    }
  }, [id, invalidate]);

  // ✅ Lắng nghe tin nhắn realtime
  useChatSocket(id || "", (msg: { message: IMessage }) => {
    const realMessage = msg.message;
    const sender = conversation?.participants.find(
      (p) => p.userId._id === realMessage.senderId
    );
    setDisplayMessages((prev) => [
      ...prev,
      {
        ...realMessage,
        senderRole: sender?.userId?.role ?? "user",
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
    let mediaElements: (HTMLImageElement | HTMLVideoElement)[] = [];

    // Lấy tất cả ảnh & video đang có trên trang
    const imgs = Array.from(document.querySelectorAll("img"));
    const videos = Array.from(document.querySelectorAll("video"));

    mediaElements = [...imgs, ...videos];

    let loadedCount = 0;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === mediaElements.length) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    if (mediaElements.length === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    mediaElements.forEach((el) => {
      if (
        (el instanceof HTMLImageElement && el.complete) ||
        (el instanceof HTMLVideoElement && el.readyState >= 3)
      ) {
        checkAllLoaded();
      } else {
        el.addEventListener("load", checkAllLoaded);
        el.addEventListener("loadeddata", checkAllLoaded);
      }
    });

    // Dọn sự kiện
    return () => {
      mediaElements.forEach((el) => {
        el.removeEventListener("load", checkAllLoaded);
        el.removeEventListener("loadeddata", checkAllLoaded);
      });
    };
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

  const handleUpload = async (newFileList: UploadFile[]) => {
    const updatedFileList = newFileList.slice(0, 10).map((file) => ({
      ...file,
      status: file.status || "uploading",
    }));
    setFileList(updatedFileList);

    const newUploadedUrls: string[] = [];

    for (let i = 0; i < updatedFileList.length; i++) {
      const file = updatedFileList[i];
      const originFile = file.originFileObj as File;

      // Kiểm tra định dạng file
      if (
        !originFile.type.startsWith("image/") &&
        !originFile.type.startsWith("video/")
      ) {
        message.error("Vui lòng chỉ tải lên ảnh hoặc video.");
        updatedFileList[i] = {
          ...updatedFileList[i],
          status: "error",
        };
        continue; // bỏ qua file này
      }

      // Kiểm tra kích thước file (giới hạn 32MB)
      const maxSize = 32 * 1024 * 1024;
      if (originFile.size > maxSize) {
        message.error(`❌ File "${file.name}" vượt quá 32MB.`);
        updatedFileList[i] = {
          ...updatedFileList[i],
          status: "error",
        };
        continue; // bỏ qua file này
      }

      // Upload nếu file hợp lệ và chưa có URL
      if (!file.url && originFile) {
        try {
          const formData = new FormData();
          formData.append("file", originFile);
          formData.append("upload_preset", "Binova_Upload");

          const { data } = await axios.post(CLOUDINARY_URL, formData);

          let fileUrl = data.secure_url;
          if (originFile.type.startsWith("image/")) {
            fileUrl = fileUrl.replace("/upload/", "/upload/f_webp/");
          }

          updatedFileList[i] = {
            ...updatedFileList[i],
            url: fileUrl,
            status: "done",
          };
          newUploadedUrls.push(fileUrl);
        } catch (error) {
          updatedFileList[i] = {
            ...updatedFileList[i],
            status: "error",
          };
          message.error(`❌ Lỗi khi upload file: ${file.name}`);
        }
      } else if (file.url) {
        newUploadedUrls.push(file.url);
      }
    }

    setFileList(updatedFileList);
    setUploadedImageUrls(newUploadedUrls);
  };

  // ✅ Hành động gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim() && uploadedImageUrls.length === 0) return;

    try {
      setSending(true);
      await axiosInstance.post("/send-message", {
        content: input,
        conversationId: id,
        files: uploadedImageUrls, // 🟡 Gửi kèm mảng đường dẫn ảnh đã upload
      });

      // ✅ Đánh dấu thông báo là đã đọc nếu có
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

      // 🟢 Reset input và danh sách ảnh
      setInput("");
      setUploadedImageUrls([]);
      setFileList([]);
    } catch (error: any) {
      message.error("Lỗi khi gửi tin nhắn " + error.response?.data?.error);
    } finally {
      setSending(false);
    }
  };

  const closedConversation = conversation?.status === "closed";
  const customer =
    conversation?.participants.find((p) => p.userId.role === "user") ||
    ({} as IParticipant);

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography.Title
          level={5}
          style={{
            fontSize: "clamp(18px, 3vw, 24px)",
            marginBottom: 16,
          }}
        >
          Khách hàng:{" "}
          {customer?.userId?.isActive ? (
            <Tooltip title="Xem thông tin khách hàng">
              <Link to={`/users/show/${customer?.userId?._id}`}>
                {customer?.userId?.fullName || "Không xác định"}
              </Link>
            </Tooltip>
          ) : (
            customer.userId?.fullName
          )}
        </Typography.Title>
        <div style={{ display: "flex", gap: 8 }}>
          <CloseConversation
            conversationId={id || ""}
            disableStatus={closedConversation}
            buttonType="dashed"
          />
          {conversation?.assignedTo === null ? (
            user?.role === "admin" ? (
              <AssignConversationToStaff
                conversationId={id || ""}
                disabledStatus={conversation?.status === "closed"}
                buttonType="dashed"
              />
            ) : (
              <AssignConversation
                conversationId={id || ""}
                disabledStatus={conversation?.status === "closed"}
                buttonType="dashed"
              />
            )
          ) : (
            <UnAssignConversation
              conversationId={id || ""}
              buttonType="dashed"
              staffId={conversation?.assignedTo?._id || ""}
            />
          )}
        </div>
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
                    maxWidth: "90%",
                    width: "auto",
                  }}
                >
                  {isUser && (
                    <div style={{ flexShrink: 0, marginRight: 8 }}>
                      <Avatar
                        size={28}
                        src={
                          conversation?.participants.find(
                            (p) => p.userId._id === message.senderId
                          )?.userId.avatar || "/avtDefault.png"
                        }
                      />
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isUser ? "flex-start" : "flex-end", // ✅ bubble căn theo phía đúng
                    }}
                  >
                    {!isUser && (
                      <div
                        style={{
                          textAlign: "right",
                          fontSize: 10,
                          color: "lightgray",
                          marginBottom: 4,
                          maxWidth: screens?.xs ? 220 : 700,
                        }}
                      >
                        {conversation?.participants.find(
                          (p) => p.userId._id === message.senderId
                        )?.userId.fullName || "Hệ thống"}
                      </div>
                    )}
                    <Tooltip
                      title={dayjs(message.createdAt).format("HH:mm")}
                      placement={isUser ? "right" : "left"}
                    >
                      {/* Bubble tin nhắn */}
                      {message.content && (
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
                            maxWidth: screens?.xs ? 220 : 900,
                            wordBreak: "break-word",
                            fontSize: screens?.xs ? 13 : 15,
                            textAlign: "left",
                            display: "inline-block", // giữ chiều rộng phù hợp nội dung
                          }}
                        >
                          {message.content}
                        </div>
                      )}

                      {message.files?.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                            flexDirection: "row-reverse",
                            marginTop: 6,
                            maxWidth: screens?.xs ? 220 : 700,
                          }}
                        >
                          {message.files.map((url, index) =>
                            url.endsWith(".mp4") ? (
                              <Card
                                key={index}
                                style={{ width: 200 }}
                                cover={
                                  <video
                                    src={url}
                                    controls
                                    style={{ width: "100%", borderRadius: 8 }}
                                  />
                                }
                              />
                            ) : (
                              <Image key={index} width={200} src={url} />
                            )
                          )}
                        </div>
                      )}
                    </Tooltip>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
        <div ref={messagesEndRef} />
      </div>

      <Tooltip
        title={
          !customer?.userId?.isActive
            ? "Khách hàng này đã bị khóa tài khoản"
            : conversation?.status === "closed"
            ? "Đoạn chat này đã kết thúc"
            : ""
        }
      >
        <Space.Compact style={{ width: "100%" }}>
          {/* Tin nhắn nhanh */}
          <Tooltip title={"Tin nhắn nhanh"}>
            <Dropdown
              disabled={
                !customer?.userId?.isActive ||
                isLoadingQuickChat ||
                conversation?.status === "closed"
              }
              placement="topLeft"
              trigger={["click"]}
              popupRender={() => (
                <>
                  {isLoadingQuickChat && isFetching ? (
                    <Loading3QuartersOutlined />
                  ) : (
                    <Menu
                      style={{ maxHeight: 200, overflowY: "auto" }}
                      items={quickChat?.data?.map((item: IQuickChat) => ({
                        key: item._id,
                        label:
                          item.content.length > 100
                            ? item.content.slice(0, 100) + "..."
                            : item.content,
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
                      disabled={!customer?.userId?.isActive}
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

          {/* Icon */}
          <Tooltip title="Emoji">
            <Popover
              content={
                <Picker
                  data={emojiData}
                  onEmojiSelect={(emoji: any) => setInput(input + emoji.native)}
                  theme={mode === "dark" ? "dark" : "light"}
                  previewPosition="none"
                />
              }
              trigger="click"
            >
              <Button
                icon={<SmileOutlined />}
                type="link"
                disabled={
                  !customer?.userId?.isActive ||
                  conversation?.status === "closed"
                }
              />
            </Popover>
          </Tooltip>

          <Tooltip title="Đính kèm file ảnh hoặc video">
            <Popover
              trigger={["click"]}
              placement="bottom"
              content={
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={(e) => handleUpload(e.fileList)}
                  disabled={
                    !customer?.userId?.isActive ||
                    conversation?.status === "closed"
                  }
                  beforeUpload={() => false}
                >
                  {fileList.length >= 10 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              }
            >
              <Button
                icon={<UploadOutlined />}
                type="link"
                disabled={
                  !customer?.userId?.isActive ||
                  conversation?.status === "closed"
                }
              />
            </Popover>
          </Tooltip>

          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 5 }}
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
            disabled={
              !customer?.userId?.isActive ||
              sending ||
              conversation?.status === "closed"
            }
          />

          <Button
            type="link"
            icon={
              sending ? <Loading3QuartersOutlined spin /> : <SendOutlined />
            }
            onClick={handleSend}
            disabled={
              !customer?.userId?.isActive ||
              sending ||
              conversation?.status === "closed"
            }
            style={{
              borderTopRightRadius: 30,
              borderBottomRightRadius: 30,
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
