/* eslint-disable @typescript-eslint/no-explicit-any */
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Create, useForm } from "@refinedev/antd";
import { Button, Form, Input, Space, Switch, message } from "antd";
import { useState } from "react";

export const AttributeCreate = () => {
  const { formProps, saveButtonProps, formLoading } = useForm({
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
    <Create
      title="Tạo thuộc tính"
      saveButtonProps={saveButtonProps}
      isLoading={formLoading}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: any) => {
          try {
            if (values.name && typeof values.name === "string") {
              values.name = values.name.trim();
            }
            values.values.map((v: any) => (v = v.trim()));
            await formProps.onFinish?.(values);
          } catch (error) {
            message.error("Có lỗi xảy ra trong quá trình xử lý.");
          }
        }}
      >
        <Form.Item
          label="Tên thuộc tính"
          name={["name"]}
          rules={[
            { required: true, message: "Vui lòng nhập tên thuộc tính" },
            { min: 3, message: "Tên thuộc tính phải có ít nhất 3 ký tự" },
            { max: 50, message: "Tên thuộc tính không được vượt quá 50 ký tự" },
            {
              pattern: /^[\p{L}0-9\s]+$/u,
              message: "Tên thuộc tính không được chứa ký tự đặc biệt",
            },
          ]}
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
              formProps.form?.setFieldsValue({ values: [] }); // Reset values khi đổi chế độ
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
                    rules={[
                      { required: true, message: "Không được để trống" },
                      { min: 1, message: "Giá trị phải có ít nhất 1 ký tự" },
                      {
                        max: 20,
                        message: "Giá trị không được vượt quá 20 ký tự",
                      },
                      {
                        pattern: /^[\p{L}0-9\s#]+$/u,
                        message: "Giá trị không được chứa ký tự đặc biệt",
                      },
                    ]}
                    valuePropName={isColorMode ? "value" : undefined} // Thêm dòng này
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
                  onClick={() => add(isColorMode ? "#000000" : "")} // Thêm giá trị mặc định
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
