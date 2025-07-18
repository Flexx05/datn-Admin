/* eslint-disable @typescript-eslint/no-explicit-any */
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import {
  Card,
  Col,
  Image,
  Row,
  Skeleton,
  Typography,
  Tag,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { IBrand } from "../../interface/brand";

const { Title, Text } = Typography;

export const BrandShow = () => {
  const { queryResult } = useShow({
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " + (error.response?.data?.message | error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });
  const { data, isLoading, refetch } = queryResult;

  const record = data?.data as IBrand | undefined;
  const [lastStatus, setLastStatus] = useState<boolean | undefined>(
    record?.isActive
  );
  const isInitialLoad = useRef(true);

  // Cập nhật giá trị trạng thái ban đầu sau khi load dữ liệu lần đầu
  useEffect(() => {
    if (!isInitialLoad.current) return;
    if (record?.isActive !== undefined) {
      setLastStatus(record.isActive);
      isInitialLoad.current = false;
    }
  }, [record]);

  // Thiết lập polling để kiểm tra sự thay đổi trạng thái
  useEffect(() => {
    const interval = setInterval(async () => {
      const refreshed = await refetch();
      const newStatus = refreshed?.data?.data?.isActive;

      // So sánh trạng thái mới và cũ
      if (lastStatus !== undefined && newStatus !== lastStatus) {
        message.info("⚠️ Trạng thái hiệu lực đã bị thay đổi.");
        setLastStatus(newStatus);
      }
    }, 10000); // Kiểm tra mỗi 10 giây

    return () => clearInterval(interval); // Dọn dẹp interval khi component bị hủy
  }, [lastStatus, refetch]);

  return (
    <Show isLoading={isLoading} canDelete={false} title="Chi tiết thương hiệu">
      <Card bordered style={{ maxWidth: 600, margin: "0 auto" }}>
        {isLoading ? (
          <Skeleton active />
        ) : (
          <Row gutter={[16, 16]} justify="center">
            <Col span={24} style={{ textAlign: "center" }}>
              <Image
                src={record?.logoUrl}
                alt="Logo thương hiệu"
                width={120}
                height={120}
                style={{
                  borderRadius: 12,
                  objectFit: "cover",
                  border: "1px solid #f0f0f0",
                }}
              />
            </Col>

            <Col span={24}>
              <Title level={4} style={{ textAlign: "center" }}>
                {record?.name}
              </Title>
            </Col>

            <Col span={24}>
              <Text strong>Trạng thái: </Text>
              {record?.isActive ? (
                <Tag color="green">Có hiệu lực</Tag>
              ) : (
                <Tag color="red">Không hiệu lực</Tag>
              )}
            </Col>

            <Col span={24}>
              <Text strong>Đường dẫn: </Text>
              <Text>{record?.slug || "Không rõ"}</Text>
            </Col>

            <Col span={24}>
              <Text strong>Ngày tạo: </Text>
              <Text>
                {record?.createdAt
                  ? dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")
                  : "Không rõ"}
              </Text>
            </Col>

            <Col span={24}>
              <Text strong>Ngày cập nhật: </Text>
              <Text>
                {record?.updatedAt
                  ? dayjs(record.updatedAt).format("DD/MM/YYYY HH:mm")
                  : "Không rõ"}
              </Text>
            </Col>
          </Row>
        )}
      </Card>
    </Show>
  );
};
