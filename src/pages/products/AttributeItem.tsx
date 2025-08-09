/* eslint-disable @typescript-eslint/no-explicit-any */
import { MinusCircleOutlined } from "@ant-design/icons";
import { Form, Select, Space, Checkbox, message } from "antd";
import { IAttribute } from "../../interface/attribute";
import { ColorDots } from "./ColorDots";
import { useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../../contexts/color-mode";

interface AttributeItemProps {
  field: any;
  remove: (name: number) => void;
  allAttributes: IAttribute[];
  form: any;
}

export const AttributeItem = ({
  field,
  remove,
  allAttributes,
  form,
}: AttributeItemProps) => {
  const [isValueSelectDisabled, setIsValueSelectDisabled] = useState(true);
  const { mode } = useContext(ColorModeContext);
  const selectedAttributeIds =
    form
      .getFieldValue("attributes")
      ?.filter((_: any, idx: number) => idx !== field.name)
      ?.map((attr: any) => attr?.attributeId)
      .filter(Boolean) || [];

  const availableAttributes = allAttributes
    .filter((attr) => attr.isActive && !selectedAttributeIds.includes(attr._id))
    .map((attr) => ({
      label: attr.name,
      value: attr._id,
    }));

  if (availableAttributes.length === 0) {
    availableAttributes.push({
      label: "Thuộc tính không xác định",
      value: "",
    });
  }

  const currentAttributeId = form.getFieldValue([
    "attributes",
    field.name,
    "attributeId",
  ]);

  const currentAttribute = allAttributes.find(
    (attr) => attr._id === currentAttributeId
  );

  const isColor = currentAttribute?.isColor;
  const rawValues = currentAttribute?.values || [];
  const valueOptions = rawValues.map((val) => ({
    label: isColor ? <ColorDots colors={[val]} /> : val,
    value: val,
  }));

  // Khi mount hoặc khi currentAttributeId thay đổi, cập nhật trạng thái disabled
  useEffect(() => {
    setIsValueSelectDisabled(!currentAttributeId);
  }, [currentAttributeId]);

  return (
    <Space
      key={field.key}
      style={{ display: "flex", marginBottom: 8 }}
      align="baseline"
    >
      <Form.Item
        {...field}
        name={[field.name, "attributeId"]}
        rules={[
          {
            required: true,
            message: "Vui lòng chọn thuộc tính",
          },
        ]}
      >
        <Select
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          placeholder={"Chọn thuộc tính"}
          options={availableAttributes}
          onChange={async (selectedId) => {
            const selectedAttr = allAttributes.find(
              (attr) => attr._id === selectedId
            );
            // Kiểm tra trùng isColor
            const selectedIsColor = selectedAttr?.isColor;
            const attributes = form.getFieldValue("attributes") || [];
            const duplicate = attributes.some(
              (attr: any, idx: number) =>
                idx !== field.name &&
                attr?.attributeId &&
                allAttributes.find((a) => a._id === attr.attributeId)
                  ?.isColor === selectedIsColor
            );
            if (duplicate) {
              message.error(
                `Không được chọn 2 thuộc tính cùng kiểu ${
                  selectedIsColor ? "màu sắc" : "kích thước"
                }`
              );
              // Reset lại giá trị vừa chọn
              await form.setFieldValue(
                ["attributes", field.name, "attributeId"],
                undefined
              );
              await form.setFieldValue(
                ["attributes", field.name, "values"],
                []
              );
              await form.setFieldValue(
                ["attributes", field.name, "isColor"],
                false
              );
              await Promise.resolve();
              return;
            }
            await form.setFieldValue(
              ["attributes", field.name, "values"],
              selectedAttr?.values || []
            );
            await form.setFieldValue(
              ["attributes", field.name, "isColor"],
              selectedAttr?.isColor ?? false
            );
            await form.setFieldValue(
              ["attributes", field.name, "attributeId"],
              selectedId
            );
            await Promise.resolve();
            setIsValueSelectDisabled(!selectedId);
          }}
        />
      </Form.Item>

      <Form.Item
        shouldUpdate={(prev, cur) =>
          prev.attributes?.[field.name]?.values !==
          cur.attributes?.[field.name]?.values
        }
        noStyle
      >
        {() => {
          const values =
            form.getFieldValue(["attributes", field.name, "values"]) || [];
          const hasDuplicate = values && new Set(values).size !== values.length;
          const error = hasDuplicate
            ? "Giá trị không được trùng lặp"
            : undefined;

          return (
            <Form.Item
              {...field}
              name={[field.name, "values"]}
              validateStatus={error ? "error" : ""}
              help={error}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập ít nhất 1 giá trị",
                },
                {
                  validator: (_, value) => {
                    if (!value || !Array.isArray(value) || value.length === 0)
                      return Promise.resolve();
                    const hasDuplicate = new Set(value).size !== value.length;
                    return hasDuplicate
                      ? Promise.reject("Giá trị không được trùng lặp")
                      : Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn hoặc thêm giá trị mới"
                options={valueOptions}
                style={{ minWidth: "250px" }}
                disabled={isValueSelectDisabled}
                tagRender={
                  isColor
                    ? (props) => {
                        const { value, closable, onClose } = props;
                        return (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              marginRight: 4,
                              padding: "4px",
                              borderRadius: 8,
                              backgroundColor:
                                mode === "light" ? "#f0f0f0" : "#333",
                            }}
                          >
                            <ColorDots colors={[value]} />
                            {closable && (
                              <span
                                onClick={onClose}
                                style={{
                                  cursor: "pointer",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "grey",
                                }}
                              >
                                ✕
                              </span>
                            )}
                          </div>
                        );
                      }
                    : undefined
                }
              />
            </Form.Item>
          );
        }}
      </Form.Item>

      <Form.Item
        {...field}
        name={[field.name, "isColor"]}
        valuePropName="checked"
        style={{ margin: 0 }}
        hidden
      >
        <Checkbox></Checkbox>
      </Form.Item>

      <MinusCircleOutlined onClick={() => remove(field.name)} />
    </Space>
  );
};
