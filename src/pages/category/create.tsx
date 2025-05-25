/* eslint-disable @typescript-eslint/no-explicit-any */
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, message } from "antd";
import { useMemo } from "react";
import { ICategory } from "../../interface/category";

export const CategoryCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    successNotification: () => ({
      message: "🎉 Tạo danh mục thành công!",
      description: "Danh mục mới đã được thêm vào hệ thống.",
      type: "success",
    }),
    errorNotification: (error: any) => ({
      message: "❌ Tạo danh mục thất bại! " + error.response?.data?.message,
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });

  // Lấy danh sách danh mục
  const { queryResult } = useSelect({
    resource: "category",
    optionLabel: "name",
    optionValue: "_id",
    pagination: {
      mode: "off",
    },
  });

  const filteredOptions = useMemo(() => {
    return (queryResult?.data?.data || [])
      .filter((item: any) => item.parentId === null && item.isActive === true)
      .map((item: any) => ({
        label: item.name,
        value: item._id,
      }));
  }, [queryResult?.data?.data]);

  // Xử lý khi submit form
  const handleFinish = async (values: any) => {
    const parentId = values.parentId;

    if (parentId) {
      const allCategories = queryResult?.data?.data || [];
      const parent: ICategory | undefined = (allCategories as ICategory[]).find(
        (item: ICategory) => item._id === parentId
      );

      if (!parent || parent.isActive !== true || parent.parentId !== null) {
        message.error("Danh mục cha không hợp lệ hoặc đã bị xoá.");
        return;
      }
    }

    formProps?.onFinish?.(values); // gọi hàm submit Refine nếu hợp lệ
  };

  return (
    <Create saveButtonProps={saveButtonProps} title="Tạo danh mục">
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Tên danh mục"
          name={["name"]}
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Mô tả" name={["description"]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="Danh mục cha"
          name={["parentId"]}
          rules={[{ required: true, message: "Vui lòng chọn danh mục cha" }]}
        >
          <Select
            options={filteredOptions}
            loading={queryResult?.isLoading}
            placeholder="Chọn danh mục cha"
          />
        </Form.Item>

        <Form.Item label="Thứ tự danh mục" name={["categorySort"]}>
          <Select placeholder="Chọn thứ tự">
            <Select.Option value={1}>1</Select.Option>
            <Select.Option value={2}>2</Select.Option>
            <Select.Option value={3}>3</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Create>
  );
};
