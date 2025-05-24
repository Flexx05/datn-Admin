import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const CategoryCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

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
        <Form.Item label={"Danh mục cha"} name={["parentId"]}>
          <Select defaultValue={null}>
            <Select.Option value={null}>Không chọn danh mục cha</Select.Option>
            <Select.Option value={0}>Danh mục cha</Select.Option>
          </Select>
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
