import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Card, Col, Row, Skeleton, Typography, Tag, Divider } from "antd";
import { ICategory } from "../../interface/category";

const { Title, Text } = Typography;

export const CategoryShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data as ICategory | undefined;

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

            {/* Loại danh mục */}
            <Col span={24}>
              <Title level={5}>Loại danh mục</Title>
              <Tag color={record?.parentId === null ? "blue" : "purple"}>
                {record?.parentId === null ? "Danh mục cha" : "Danh mục con"}
              </Tag>
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
          </Row>
        )}
      </Card>
    </Show>
  );
};
