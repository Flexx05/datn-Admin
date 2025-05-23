import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Button, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

export const AttributeCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create title="Tạo thuộc tính" saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Tên thuộc tính"
          name={["name"]}
          rules={[{ required: true, message: "Vui lòng nhập tên thuộc tính" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Giá trị"
          required
          validateTrigger={["onChange", "onBlur"]}
        >
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

                  const trimmed = values
                    .map((v: string) => v?.trim())
                    .filter((v: string) => v);
                  const unique = [...new Set(trimmed)];

                  if (trimmed.length !== values.length) {
                    return Promise.reject(
                      new Error("Không được để trống giá trị")
                    );
                  }

                  if (unique.length !== values.length) {
                    return Promise.reject(
                      new Error("Không được nhập trùng giá trị")
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={[
                        { required: true, message: "Không được để trống" },
                      ]}
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

                {errors?.length > 0 && (
                  <Form.Item>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Create>
  );
};
