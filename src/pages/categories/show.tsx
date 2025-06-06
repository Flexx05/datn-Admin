/* eslint-disable @typescript-eslint/no-explicit-any */
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import {
  Card,
  Col,
  Divider,
  message,
  Row,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ICategory } from "../../interface/category";
import { API_URL } from "../../config/dataProvider";

const { Title, Text } = Typography;

export const CategoryShow = () => {
  const { queryResult } = useShow({
    errorNotification: (error: any) => ({
      message:
        "❌ Lỗi hệ thống " + (error.response?.data?.message | error.message),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });
  const { data, isLoading, refetch } = queryResult;
  const record = data?.data as ICategory | undefined;
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

  const [parentName, setParentName] = useState<string | null>(null);
  const [parentLoading, setParentLoading] = useState(false);

  // Gọi API để lấy tên danh mục cha nếu có parentId
  useEffect(() => {
    const fetchParentCategory = async () => {
      if (record?.parentId) {
        try {
          setParentLoading(true);
          const { data } = await axios.get(
            `${API_URL}/category/id/${record.parentId}`
          );

          setParentName(data?.name || null);
        } catch (err) {
          setParentName("Không tìm thấy");
        } finally {
          setParentLoading(false);
        }
      }
    };

    fetchParentCategory();
  }, [record?.parentId]);

  return (
    <Show isLoading={isLoading} canDelete={false} title="Chi tiết danh mục">
      <Card bordered style={{ maxWidth: 700, margin: "0 auto" }}>
        {isLoading ? (
          <Skeleton active />
        ) : (
          <Row gutter={[16, 16]}>
            {/* Tên danh mục */}
            <Col span={24}>
              <Title level={5}>Tên danh mục</Title>
              <Text>{record?.name || "Không rõ"}</Text>
            </Col>
            <Col span={24}>
              <Title level={5}>Mô tả</Title>
              <Text>
                {record?.description || (
                  <Text type="secondary">Không có mô tả</Text>
                )}
              </Text>
            </Col>

            {/* Loại danh mục */}
            <Col span={24}>
              <Title level={5}>Loại danh mục</Title>
              <Tag color={record?.parentId === null ? "blue" : "purple"}>
                {record?.parentId === null ? "Danh mục cha" : "Danh mục con"}
              </Tag>
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

            {/* Danh mục con nếu là cha */}
            {record?.parentId === null && (
              <Col span={24}>
                <Divider />
                <Title level={5}>Danh mục con</Title>
                {record?.subCategories?.length ? (
                  <Row gutter={[8, 8]}>
                    {record.subCategories.map((item: ICategory) => (
                      <Col key={item._id}>
                        <Tag color="green">{item.name}</Tag>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Text type="secondary">Chưa có danh mục con</Text>
                )}
              </Col>
            )}

            {/* Danh mục cha nếu là con */}
            {record?.parentId && (
              <Col span={24}>
                <Divider />
                <Title level={5}>Danh mục cha</Title>
                {parentLoading ? (
                  <Text>Đang tải...</Text>
                ) : parentName ? (
                  <Tag color="blue">{parentName}</Tag>
                ) : (
                  <Text type="secondary">Không tìm thấy</Text>
                )}
              </Col>
            )}
          </Row>
        )}
      </Card>
    </Show>
  );
};
