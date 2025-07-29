/* eslint-disable @typescript-eslint/no-explicit-any */
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, message, Select, Spin } from "antd";
import { IQuickChat } from "../../interface/conversation";
import Loader from "../../utils/loading";

const QuickChatCreate = () => {
  const { formProps, saveButtonProps, formLoading } = useForm<IQuickChat>({
    successNotification: () => ({
      message: "🎉 Cập nhật thành công",
      description: "Tin nhắn đã được cập nhật!",
      type: "success" as const,
    }),
    errorNotification: (error: any) => ({
      message: "❌ Cập nhật thất bại! " + error.response?.data?.error,
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error" as const,
    }),
  });

  const categoryOption = [
    { value: 1, label: "Chung" },
    { value: 2, label: "Đơn hàng" },
    { value: 3, label: "Thanh toán" },
    { value: 4, label: "Vận chuyển" },
    { value: 5, label: "Hóa đơn" },
    { value: 6, label: "Khác" },
  ];

  return (
    <Create
      title="Tạo tin nhắn nhanh"
      saveButtonProps={saveButtonProps}
      isLoading={false}
    >
      <Spin spinning={formLoading} indicator={<Loader />}>
        <Form
          {...formProps}
          layout="vertical"
          onFinish={async (values: any) => {
            try {
              if (values.content && typeof values.content === "string") {
                values.content = values.content.trim();
              }
              await formProps.onFinish?.(values);
            } catch (error: any) {
              message.error("Có lỗi xảy ra trong quá trình xử lý");
            }
          }}
        >
          <Form.Item
            label="Nội dung tin nhắn"
            name={["content"]}
            rules={[
              { required: true, message: "Vui lòng nhập nội dung tin nhắn" },
              { min: 3, message: "Nội dung phải có ít nhất 3 ký tự" },
              { max: 500, message: "Nội dung không vượt quá 200 ký tự" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Danh mục"
            name={["category"]}
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select options={categoryOption} />
          </Form.Item>
        </Form>
      </Spin>
    </Create>
  );
};

export default QuickChatCreate;
