/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { HttpError } from "@refinedev/core";
import MDEditor from "@uiw/react-md-editor";
import { Form, Input, Select, Upload, UploadFile, message } from "antd";
import axios from "axios";
import { useMemo, useState } from "react";
import { IBrand } from "../../interface/brand";
import { ICategory } from "../../interface/category";

export const ProductCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    successNotification: () => ({
      message: "🎉 Tạo sản phẩm thành công!",
      description: "Sản phẩm mới đã được thêm vào hệ thống.",
      type: "success",
    }),
    errorNotification: (error?: HttpError) => ({
      message:
        "❌ Tạo sản phẩm thất bại! " + (error?.response?.data?.message ?? ""),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  const normFile = (e: any) => e?.fileList?.slice(0, 5);

  const handleChange = async ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    const updatedFileList = newFileList.slice(0, 5).map((file) => ({
      ...file,
      status: file.status || "uploading",
    }));

    setFileList(updatedFileList);

    const newUploadedUrls: string[] = [];

    for (let i = 0; i < updatedFileList.length; i++) {
      const file = updatedFileList[i];
      const originFile = file.originFileObj as File;

      // Nếu file chưa có URL => cần upload
      if (!file.url && originFile) {
        try {
          const formData = new FormData();
          formData.append("file", originFile);
          formData.append("upload_preset", "Binova_Upload");

          const { data } = await axios.post(
            "https://api.cloudinary.com/v1_1/dtwm0rpqg/image/upload",
            formData
          );

          // Cập nhật trạng thái cho file đó
          updatedFileList[i] = {
            ...updatedFileList[i],
            status: "done",
            url: data.secure_url,
          };
          message.success(`Tải ảnh lên công: ${file.name}`);
          newUploadedUrls.push(data.secure_url);
        } catch (error) {
          updatedFileList[i] = {
            ...updatedFileList[i],
            status: "error",
          };
          message.error(`❌ Lỗi khi upload ảnh: ${file.name}`);
        }
      } else if (file.url) {
        newUploadedUrls.push(file.url);
      }
    }

    setFileList([...updatedFileList]);
    setUploadedImageUrls(newUploadedUrls);
  };

  const { queryResult: category } = useSelect({
    resource: "category",
    optionLabel: "name",
    optionValue: "_id",
    pagination: { mode: "off" },
  });

  const { queryResult: brand } = useSelect({
    resource: "brand",
    optionLabel: "name",
    optionValue: "_id",
    pagination: { mode: "off" },
  });

  const allCategories = useMemo(
    () => (category?.data?.data as ICategory[]) || [],
    [category?.data?.data]
  );
  const allBrands = useMemo(
    () => (brand?.data?.data as IBrand[]) || [],
    [brand?.data?.data]
  );

  const categoryOptions = useMemo(() => {
    return allCategories
      .filter((item: ICategory) => item.parentId !== null && item.isActive)
      .map((item) => ({
        label: item.name,
        value: item._id,
      }));
  }, [allCategories]);

  const brandOptions = useMemo(() => {
    return allBrands
      .filter((item: IBrand) => item.isActive)
      .map((item) => ({
        label: item.name,
        value: item._id,
      }));
  }, [allBrands]);

  const handleFinish = async (values: any) => {
    try {
      if (uploadedImageUrls.length === 0) {
        message.error("Bạn chưa tải ảnh hoặc ảnh chưa upload xong.");
        return;
      }

      const payload = {
        ...values,
        images: uploadedImageUrls,
      };

      await formProps?.onFinish?.(payload);
    } catch (error) {
      message.error("Lỗi khi tạo sản phẩm!");
      console.error(error);
    }
  };

  return (
    <Create saveButtonProps={saveButtonProps} title="Tạo sản phẩm">
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Hình ảnh"
          name="images"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
            maxCount={5}
            beforeUpload={() => false}
          >
            {fileList.length >= 5 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <MDEditor data-color-mode="dark" />
        </Form.Item>

        <Form.Item
          label="Danh mục"
          name="categoryId"
          rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
        >
          <Select loading={category?.isLoading}>
            {categoryOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Thương hiệu"
          name="brandId"
          rules={[{ required: true, message: "Vui lòng chọn thương hiệu" }]}
        >
          <Select loading={brand?.isLoading}>
            {brandOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Create>
  );
};
