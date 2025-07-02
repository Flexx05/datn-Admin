/* eslint-disable @typescript-eslint/no-explicit-any */
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Button, Space, Switch, Spin } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { IAttribute } from "../../interface/attribute";

export const AttributeEdit = () => {
  const { formProps, saveButtonProps, formLoading } = useForm<IAttribute>({
    successNotification: () => ({
      message: "🎉 Cập nhật thành công",
      description: "Thuộc tính đã được cập nhật!",
      type: "success" as const,
    }),
    errorNotification: (error: any) => ({
      message: "❌ Cập nhật thất bại! " + error.response?.data?.message,
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });
  const [isColorMode, setIsColorMode] = useState(false);

  useEffect(() => {
    const isColor = formProps?.initialValues?.isColor;
    if (typeof isColor === "boolean") {
      setIsColorMode(isColor);
      formProps.form?.setFieldValue("isColor", isColor);
    }
  }, [formProps.initialValues, formProps.form]);

  if (formLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Edit
      title="Chỉnh sửa thuộc tính"
      saveButtonProps={saveButtonProps}
      canDelete={false}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(values: any) => {
          // Trim name
          if (values.name && typeof values.name === "string") {
            values.name = values.name.trim();
          }
          // Trim each value in values
          if (Array.isArray(values.values)) {
            values.values = values.values.map((v: any) =>
              typeof v === "string" ? v.trim() : v
            );
          }
          // Gọi onFinish gốc nếu có
          if (formProps.onFinish) {
            return formProps.onFinish(values);
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
              pattern: /^[\p{L}0-9\s#]+$/u,
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
                    getValueFromEvent={(e) => e.target.value}
                    valuePropName={isColorMode ? "value" : undefined}
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
                  onClick={() => add(isColorMode ? "#000000" : "")}
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
    </Edit>
  );
};
