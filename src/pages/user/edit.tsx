/* eslint-disable @typescript-eslint/no-explicit-any */
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import { IUser } from "../../interface/user";

export const UserEdit = () => {
  const { formProps, saveButtonProps } = useForm<IUser>({
    successNotification: () => ({
      message: "🎉 Cập nhật thành công",
      description: "Thương hiệu đã được cập nhật!",
      type: "success" as const,
    }),
    errorNotification: (error: any) => ({
      message: "❌ Cập nhật thất bại! " + error.response?.data?.message,
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });

  return (
    <Edit saveButtonProps={saveButtonProps} title="Chỉnh sửa thương hiệu">
      <Form {...formProps} layout="vertical">
        <Form.Item label="Tên khách hàng" name={["fullName"]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Tên khách hàng"
          name={["email"]}
          rules={[
            { type: "email", message: "Vui lòng nhập địa chỉ email hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name={["phone"]}
          rules={[
            {
              pattern: /^\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
              message: "Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Địa chỉ" name={["address"]}>
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};
