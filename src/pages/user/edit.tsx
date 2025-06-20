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

  const handleFinish = async (values: any) => {
    const { fullName, phone, address } = values;
    const updatedValues = {
      fullName,
      phone: phone || null, // Chuyển đổi số điện thoại thành null nếu không có
      address: address || null, // Chuyển đổi địa chỉ thành null nếu không có
    };
    if (formProps.onFinish) {
      await formProps.onFinish(updatedValues);
    }
  };

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      title="Chỉnh sửa thông tin khách hàng"
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Tên khách hàng" name={["fullName"]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name={["email"]}>
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name={["phone"]}
          rules={[
            {
              pattern: /^0\d{9}$/,
              message:
                "Vui lòng nhập số điện thoại hợp lệ (10 chữ số, bắt đầu bằng 0)",
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
