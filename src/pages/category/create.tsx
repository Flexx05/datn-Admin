import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const CategoryCreate = () => {
  const { formProps, saveButtonProps } = useForm({});
  const { selectProps: categorySelectProps } = useSelect({
    resource: "category",
    optionLabel: "name",
    optionValue: "id",
    filters: [
      {
        field: "parentId",
        operator: "eq",
        value: null,
      },
    ],
  });

  return (
    <Create saveButtonProps={saveButtonProps} title={"Tạo danh mục"}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Tên danh mục"}
          name={["name"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={"Mô tả"} name={["description"]}>
          <Input />
        </Form.Item>
        <Form.Item
          label={"Danh mục cha"}
          name={["parentId"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select {...categorySelectProps} />
        </Form.Item>
        <Form.Item label={"Thứ tự danh mục"} name={["categorySort"]}>
          <Select>
            <Select.Option value={1}>1</Select.Option>
            <Select.Option value={2}>2</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Create>
  );
};
