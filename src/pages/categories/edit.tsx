/* eslint-disable @typescript-eslint/no-explicit-any */
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Spin, message } from "antd";
import { useMemo } from "react";
import { ICategory } from "../../interface/category";
import Loader from "../../utils/loading";
import { SaveButton } from "../../utils/ButtonForManagement";

export const CategoryEdit = () => {
  const {
    formProps,
    saveButtonProps,
    queryResult: editQueryResult,
    formLoading,
  } = useForm({
    successNotification: () => ({
      message: "🎉 Cập nhật danh mục thành công!",
      description: "Danh mục đã được cập nhật trong hệ thống.",
      type: "success",
    }),
    errorNotification: (error: any) => ({
      message: "❌ Cập nhật danh mục thất bại! " + error.response?.data?.error,
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
          item.isActive === true &&
          item.slug !== "danh-muc-khong-xac-dinh"
      )
      .map((item) => ({
        label: item.name,
        value: item._id,
      }));
  }, [allCategories, editingRecord]);

  const handleFinish = async (values: any) => {
    try {
      const parentId = values.parentId ?? null;
      if (parentId) {
        const parent = allCategories.find((item) => item._id === parentId);
        if (!parent || !parent.isActive || parent.parentId !== null) {
          message.error("Danh mục cha không hợp lệ hoặc đã bị xoá.");
          return;
        }
      }

      if (values.name && typeof values.name === "string") {
        values.name = values.name.trim();
      }

      formProps?.onFinish?.({ ...values, parentId });
    } catch (error) {
      message.error("Có lỗi xảy ra trong quá trình xử lý.");
    }
  };

  return (
    <Edit
      saveButtonProps={SaveButton("Cập nhật danh mục", saveButtonProps)}
      title="Cập nhật danh mục"
      canDelete={false}
      isLoading={false}
    >
      <Spin spinning={formLoading} indicator={<Loader />}>
        <Form {...formProps} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Tên danh mục"
            name={["name"]}
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục" },
              { max: 30, message: "Tên danh mục không được quá 30 ký tự" },
              { min: 3, message: "Tên danh mục phải có ít nhất 3 ký tự" },
              {
                pattern: /^[\p{L}0-9\s&]+$/u,
                message: "Tên danh mục không được chứa ký tự đặc biệt",
              },
            ]}
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
              <Select.Option value={null}>Không có</Select.Option>
              {filteredOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Edit>
  );
};
