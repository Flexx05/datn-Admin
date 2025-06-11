import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Card, Col, Row, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { IUser } from "../../interface/user";

const { Title, Text } = Typography;

export const UserShow = () => {
  const { queryResult } = useShow<IUser>({
    resource: "admin/users",
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show isLoading={isLoading} title="Chi tiết người dùng">
      <Card bordered style={{ maxWidth: 600, margin: "0 auto" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5}>Tên người dùng</Title>
            <Text>{record?.fullName}</Text>
          </Col>
          <Col span={24}>
            <Title level={5}>Email</Title>
            <Text>{record?.email}</Text>
          </Col>
          <Col span={24}>
            <Title level={5}>Số điện thoại</Title>
            <Text>
              {record?.phone || <Tag color={"default"}>Chưa cập nhật</Tag>}
            </Text>
          </Col>
          <Col span={24}>
            <Title level={5}>Địa chỉ</Title>
            <Text>
              {record?.address || <Tag color={"default"}>Chưa cập nhật</Tag>}
            </Text>
          </Col>
          <Col span={24}>
            <Title level={5}>Trạng thái</Title>
            <Tag color={record?.isActive ? "green" : "red"}>
              {record?.isActive ? "Hoạt động" : "Khoá"}
            </Tag>
          </Col>
          <Col span={24}>
            <Title level={5}>Ngày Đăng ký</Title>
            <Text>
              {record?.createdAt
                ? dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")
                : ""}
            </Text>
          </Col>
        </Row>
      </Card>
    </Show>
  );
};
