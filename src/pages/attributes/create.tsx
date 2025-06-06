/* eslint-disable @typescript-eslint/no-explicit-any */
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Button, Space, Switch } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";

export const AttributeCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    successNotification: () => ({
      message: "🎉 Thêm mới thành công",
      description: "Thuộc tính đã được thêm mới!",
      type: "success" as const,
    }),
    errorNotification: (error: any) => ({
      message: "❌ Thêm mới thất bại! " + error.response?.data?.message,
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });
  const [isColorMode, setIsColorMode] = useState(false);

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

        <Form.Item label="Chế độ nhập" name={["isColor"]} initialValue={false}>
          <Switch
            checkedChildren="Mã màu"
            unCheckedChildren="Giá trị văn bản"
            checked={isColorMode}
            onChange={(checked) => {
              setIsColorMode(checked);
              formProps.form?.setFieldValue("isColor", checked);
            }}
          />
        </Form.Item>

        <Form.List
          name={["values"]}
          rules={[
            {
              validator: async (_, values) => {
                console.log(values);

                if (!Array.isArray(values) || values.length < 1) {
                  return Promise.reject(
                    new Error("Vui lòng nhập ít nhất một giá trị")
                  );
                }

                const trimmed = values.map((v) =>
                  typeof v === "string" ? v.trim() : v
                );
                if (trimmed.some((v) => !v)) {
                  return Promise.reject(
                    new Error("Không được để trống giá trị")
                  );
                }

                const unique = new Set(trimmed);
                if (unique.size !== trimmed.length) {
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
              <label>{isColorMode ? "Mã màu" : "Giá trị"}</label>
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
                    getValueFromEvent={(e) => e.target.value}
                  >
                    {isColorMode ? (
                      <input
                        type="color"
                        style={{
                          width: 30,
                          height: 30,
                          border: "none",
                          borderRadius: "20%",
                          padding: 0,
                        }}
                      />
                    ) : (
                      <Input placeholder="Giá trị thuộc tính" />
                    )}
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
                  Thêm {isColorMode ? "mã màu" : "giá trị"}
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
      </Form>
    </Create>
  );
};
