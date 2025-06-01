/* eslint-disable @typescript-eslint/no-explicit-any */
import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Card, Col, Row, Skeleton, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { IAttribute } from "../../interface/attribute";

const { Title, Text } = Typography;

export const AttributeShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data as IAttribute | undefined;

  return (
    <Show title="Chi tiết thuộc tính" isLoading={isLoading} canDelete={false}>
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
    </Show>
  );
};
