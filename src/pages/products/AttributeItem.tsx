/* eslint-disable @typescript-eslint/no-explicit-any */
import { MinusCircleOutlined } from "@ant-design/icons";
import { Form, Select, Space, Checkbox } from "antd";
import { IAttribute } from "../../interface/attribute";
import { ColorDots } from "./ColorDots";

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

  const currentAttributeId = form.getFieldValue([
    "attributes",
    field.name,
    "attributeId",
  ]);

  const isColor = form.getFieldValue(["attributes", field.name, "isColor"]);

  const rawValues =
    allAttributes.find((attr) => attr._id === currentAttributeId)?.values || [];

  const valueOptions = rawValues.map((val) => ({
    label: isColor ? <ColorDots colors={[val]} /> : val,
    value: val,
  }));

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
          placeholder="Chọn thuộc tính"
          options={availableAttributes}
          onChange={(selectedId) => {
            const selectedAttr = allAttributes.find(
              (attr) => attr._id === selectedId
            );
            form.setFieldValue(
              ["attributes", field.name, "values"],
              selectedAttr?.values || []
            );
            form.setFieldValue(
              ["attributes", field.name, "isColor"],
              selectedAttr?.isColor ?? false
            );
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
                disabled={!currentAttributeId}
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
                              padding: "0 6px",
                              border: "1px solid #ccc",
                              borderRadius: 12,
                              backgroundColor: "white",
                            }}
                          >
                            <ColorDots colors={[value]} />
                            {closable && (
                              <span
                                onClick={onClose}
                                style={{ cursor: "pointer", fontSize: 12 }}
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
        hidden
        {...field}
        name={[field.name, "isColor"]}
        valuePropName="checked"
        style={{ margin: 0 }}
      >
        <Checkbox>Có phải màu sắc?</Checkbox>
      </Form.Item>

      <MinusCircleOutlined onClick={() => remove(field.name)} />
    </Space>
  );
};
