/* eslint-disable @typescript-eslint/no-explicit-any */
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Card, Col, Row, Spin, Tag, Typography } from "antd";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { IUser } from "../../interface/user";
import Loader from "../../utils/loading";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;

export const StaffShow = () => {
  const { queryResult } = useShow<IUser>({
    resource: "staffs",
    errorNotification: (error: any) => ({
      message: "❌ Lỗi hệ thống " + error.response?.data?.error,
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show
      isLoading={false}
      title={`Thông tin ${
        record?.role === "admin" ? "Quản trị viên" : "Nhân viên"
      }`}
      canEdit={false}
    >
      <Spin spinning={isLoading} indicator={<Loader />}>
        <Card bordered style={{ maxWidth: 600, margin: "0 auto" }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Title level={5}>
                Tên {record?.role === "admin" ? "Quản trị viên" : "Nhân viên"}
              </Title>
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
              <Title level={5}>Trạng thái</Title>
              <Tag color={record?.isActive ? "green" : "red"}>
                {record?.isActive ? "Hoạt động" : "Khoá"}
              </Tag>
            </Col>
          </Row>
        </Card>
      </Spin>
    </Show>
  );
};
