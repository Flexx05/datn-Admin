/* eslint-disable @typescript-eslint/no-explicit-any */
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, message } from "antd";
import { useMemo } from "react";
import { ICategory } from "../../interface/category";

export const ProductEdit = () => {
  const {
    formProps,
    saveButtonProps,
    queryResult: editQueryResult,
  } = useForm({
    successNotification: () => ({
      message: "🎉 Cập nhật danh mục thành công!",
      description: "Danh mục đã được cập nhật trong hệ thống.",
      type: "success",
    }),
    errorNotification: (error: any) => ({
      message:
        "❌ Cập nhật danh mục thất bại! " + error.response?.data?.message,
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });

  const editingRecord = editQueryResult?.data?.data as ICategory | undefined;

  const { queryResult } = useSelect({
    resource: "category",
    optionLabel: "name",
    optionValue: "_id",
    pagination: {
      mode: "off",
    },
  });

  const allCategories = useMemo(
    () => (queryResult?.data?.data as ICategory[]) || [],
    [queryResult?.data?.data]
  );

  // Nếu danh mục hiện tại là danh mục cha (parentId === null) thì không cho chỉnh sửa parentId
  const isParentCategory = editingRecord?.parentId === null;

  const filteredOptions = useMemo(() => {
    if (!editingRecord) return [];

    return allCategories
      .filter(
        (item: ICategory) =>
          item._id !== editingRecord._id &&
          item.parentId === null &&
          item.isActive === true
      )
      .map((item) => ({
        label: item.name,
        value: item._id,
      }));
  }, [allCategories, editingRecord]);

  const handleFinish = async (values: any) => {
    const parentId = values.parentId ?? null;

    if (parentId) {
      const parent = allCategories.find((item) => item._id === parentId);
      if (!parent || !parent.isActive || parent.parentId !== null) {
        message.error("Danh mục cha không hợp lệ hoặc đã bị xoá.");
        return;
      }
    }

    formProps?.onFinish?.({ ...values, parentId });
  };

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      title="Cập nhật danh mục"
      canDelete={false}
    >
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
          normalize={(value) =>
            value === "" || value === undefined ? null : value
          }
        >
          <Select
            loading={queryResult?.isLoading}
            placeholder="Chọn danh mục cha"
            disabled={isParentCategory} // ❗ Disable nếu đang là danh mục cha
            allowClear
          >
            <Select.Option value="">Không có</Select.Option>
            {filteredOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Thứ tự danh mục" name={["categorySort"]}>
          <Select placeholder="Chọn thứ tự">
            <Select.Option value={1}>1</Select.Option>
            <Select.Option value={2}>2</Select.Option>
            <Select.Option value={3}>3</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Edit>
  );
};
