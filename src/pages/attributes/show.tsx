/* eslint-disable @typescript-eslint/no-explicit-any */
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Card, Col, message, Row, Skeleton, Spin, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { IAttribute } from "../../interface/attribute";
import { useEffect, useRef, useState } from "react";
import Loader from "../../utils/loading";

const { Title, Text } = Typography;

export const AttributeShow = () => {
  const { queryResult } = useShow({
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " +
        (error.response?.data?.message || error.response?.data?.error),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });
  const { data, isLoading, refetch } = queryResult;

  const record = data?.data as IAttribute | undefined;

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
    <Show title="Chi tiết thuộc tính" isLoading={false} canDelete={false}>
      <Spin spinning={isLoading} indicator={<Loader />}>
        <Card bordered style={{ maxWidth: 700, margin: "0 auto" }}>
          {isLoading ? (
            <Skeleton active />
          ) : (
            <Row gutter={[16, 16]}>
              {/* Tên thuộc tính */}
              <Col span={24}>
                <Title level={5}>Tên thuộc tính</Title>
                <Text>{record?.name || "Không rõ"}</Text>
              </Col>

              {/* Loại thuộc tính */}
              <Col span={24}>
                <Title level={5}>Loại thuộc tính</Title>
                <Tag color={record?.isColor ? "purple" : "blue"}>
                  {record?.isColor ? "Màu sắc" : "Văn bản"}
                </Tag>
              </Col>

              <Col span={24}>
                <Title level={5}>Đường dẫn: </Title>
                <Text>{record?.slug || "Không rõ"}</Text>
              </Col>

              {/* Giá trị thuộc tính */}
              <Col span={24}>
                <Title level={5}>Giá trị thuộc tính</Title>
                {record?.isColor ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {record?.values?.map((color: string, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: color,
                          borderRadius: "50%",
                          border: "1px solid #ccc",
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                ) : record?.values?.length ? (
                  record.values.map((value: string, idx: number) => (
                    <Tag key={idx} color="geekblue">
                      {value}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">Không có giá trị</Text>
                )}
              </Col>

              {/* Trạng thái hiệu lực */}
              <Col span={24}>
                <Title level={5}>Trạng thái hiệu lực</Title>
                <Tag color={record?.isActive ? "green" : "red"}>
                  {record?.isActive ? "Có hiệu lực" : "Không hiệu lực"}
                </Tag>
              </Col>

              {/* Ngày tạo */}
              <Col span={24}>
                <Title level={5}>Ngày tạo</Title>
                <Text>
                  {record?.createdAt
                    ? dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")
                    : "Không rõ"}
                </Text>
              </Col>

              {/* Ngày cập nhật */}
              <Col span={24}>
                <Title level={5}>Ngày cập nhật</Title>
                <Text>
                  {record?.updatedAt
                    ? dayjs(record.updatedAt).format("DD/MM/YYYY HH:mm")
                    : "Không rõ"}
                </Text>
              </Col>
            </Row>
          )}
        </Card>
      </Spin>
    </Show>
  );
};
