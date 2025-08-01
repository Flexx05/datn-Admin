/* eslint-disable @typescript-eslint/no-explicit-any */
import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Spin, message } from "antd";
import { useMemo } from "react";
import { ICategory } from "../../interface/category";
import { HttpError } from "@refinedev/core";
import Loader from "../../utils/loading";

export const CategoryCreate = () => {
  const { formProps, saveButtonProps, formLoading } = useForm({
    successNotification: () => ({
      message: "🎉 Tạo danh mục thành công!",
      description: "Danh mục mới đã được thêm vào hệ thống.",
      type: "success",
    }),
    errorNotification: (error?: HttpError) => ({
      message: "❌ Tạo danh mục thất bại! " + error?.response?.data?.error,
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

  // Tối ưu hóa dữ liệu danh mục
  const allCategories = useMemo(
    () => (queryResult?.data?.data as ICategory[]) || [],
    [queryResult?.data?.data]
  );

  // Lọc ra các danh mục cha hợp lệ
  const filteredOptions = useMemo(() => {
    return allCategories
      .filter(
        (item: ICategory) =>
          item.parentId === null &&
          item.isActive &&
          item.slug !== "danh-muc-khong-xac-dinh"
      )
      .map((item) => ({
        label: item.name,
        value: item._id,
      }));
  }, [allCategories]);

  // Xử lý khi submit form
  const handleFinish = async (values: any) => {
    try {
      const parentId = values.parentId;
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
    <Create
      saveButtonProps={saveButtonProps}
      title="Tạo danh mục"
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

          <Form.Item label="Danh mục cha" name={["parentId"]}>
            <Select
              loading={queryResult?.isLoading}
              placeholder="Chọn danh mục cha (nếu có)"
              allowClear
              defaultValue={null}
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
    </Create>
  );
};
