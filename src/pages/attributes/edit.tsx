import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Button, Space, Switch, Spin } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

export const AttributeEdit = () => {
  const { formProps, saveButtonProps, formLoading } = useForm({});
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
    <Edit title="Chỉnh sửa thuộc tính" saveButtonProps={saveButtonProps}>
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
              const currentValues =
                formProps.form?.getFieldValue("values") || [];
              formProps.form?.setFieldValue(
                "values",
                currentValues.map(() => (checked ? "#ffffff" : ""))
              );
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
                  onClick={() => add(isColorMode ? "#ffffff" : "")}
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
