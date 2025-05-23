import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Button, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

export const AttributeEdit = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Edit title="Chỉnh sửa thuộc tính" saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Tên thuộc tính"
          name={["name"]}
          rules={[{ required: true, message: "Vui lòng nhập tên thuộc tính" }]}
        >
          <Input />
        </Form.Item>

        <Form.List
          name={["values"]}
          rules={[
            {
              validator: async (_, values) => {
                if (!values || values.length < 1) {
                  return Promise.reject(
                    new Error("Vui lòng nhập ít nhất một giá trị")
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <>
              <label>Giá trị</label>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={name}
                    rules={[{ required: true, message: "Không được để trống" }]}
                  >
                    <Input placeholder="Giá trị thuộc tính" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm giá trị
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Edit>
  );
};
