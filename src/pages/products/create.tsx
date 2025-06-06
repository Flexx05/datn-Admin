/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { HttpError } from "@refinedev/core";
import MDEditor from "@uiw/react-md-editor";
import { Button, Form, Input, Select, Upload, UploadFile, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { API_URL } from "../../config/dataProvider";
import { IAttribute } from "../../interface/attribute";
import { IBrand } from "../../interface/brand";
import { ICategory } from "../../interface/category";
import { AttributeItem } from "./AttributeItem";
import { VariationItem } from "./VariationItem";

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

      if (!file.url && originFile) {
        try {
          const formData = new FormData();
          formData.append("file", originFile);
          formData.append("upload_preset", "Binova_Upload");

          const { data } = await axios.post(
            "https://api.cloudinary.com/v1_1/dtwm0rpqg/image/upload",
            formData
          );

          updatedFileList[i] = {
            ...updatedFileList[i],
            status: "done",
            url: data.secure_url,
          };
          message.success(`Tải ảnh lên thành công: ${file.name}`);
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

  const { queryResult: attribute } = useSelect({
    resource: "attribute",
    optionLabel: "name",
    optionValue: "_id",
    pagination: { mode: "off" },
    meta: {
      fields: ["isColor"],
    },
  });

  const allCategories = useMemo(
    () => (category?.data?.data as ICategory[]) || [],
    [category?.data?.data]
  );

  const allBrands = useMemo(
    () => (brand?.data?.data as IBrand[]) || [],
    [brand?.data?.data]
  );

  const allAttributes = useMemo(
    () => (attribute?.data?.data as IAttribute[]) || [],
    [attribute?.data?.data]
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

      // Kiểm tra ngày kết thúc không trước ngày bắt đầu
      const hasInvalidDateRange = values.variation?.some((variation: any) => {
        const start = variation.saleForm ? dayjs(variation.saleForm) : null;
        const end = variation.saleTo ? dayjs(variation.saleTo) : null;
        return start && end && end.isBefore(start);
      });

      if (hasInvalidDateRange) {
        message.error("Ngày kết thúc giảm giá không được trước ngày bắt đầu.");
        return;
      }

      // Chuẩn hóa dữ liệu biến thể
      const normalizedVariations = (values.variation || []).map(
        (variation: any) => {
          let imageUrl: string | undefined;

          const imageFile = variation.image?.[0];
          if (imageFile) {
            imageUrl = imageFile.url;
          }

          return {
            ...variation,
            image: imageUrl,
            saleForm: variation.saleForm
              ? dayjs(variation.saleForm).format("YYYY-MM-DD")
              : undefined,
            saleTo: variation.saleTo
              ? dayjs(variation.saleTo).format("YYYY-MM-DD")
              : undefined,
          };
        }
      );

      const payload = {
        ...values,
        image: uploadedImageUrls,
        variation: normalizedVariations,
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
          name="image"
          valuePropName="fileList"
          rules={[{ required: true, message: "Vui chọn hình ảnh" }]}
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
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
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
          <Select loading={category?.isLoading} options={categoryOptions} />
        </Form.Item>

        <Form.Item
          label="Thương hiệu"
          name="brandId"
          rules={[{ required: true, message: "Vui lòng chọn thương hiệu" }]}
        >
          <Select loading={brand?.isLoading} options={brandOptions} />
        </Form.Item>

        <Form.Item
          label="Thuộc tính"
          rules={[{ required: true, message: "Thuộc tính bắt buộc nhập" }]}
        >
          <Form.List name="attributes">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <AttributeItem
                    key={field.key}
                    field={field}
                    remove={remove}
                    allAttributes={allAttributes}
                    form={formProps.form}
                  />
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    block
                  >
                    Thêm thuộc tính
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item label={null}>
            <Button
              onClick={async () => {
                try {
                  const response = await axios.post(
                    `${API_URL}/product/generate-variations`,
                    {
                      attributes: formProps.form?.getFieldValue("attributes"),
                    }
                  );

                  const generatedVariations = response.data.variation.map(
                    (item: any) => ({
                      attributes: item.attributes || [],
                      regularPrice: 0,
                      stock: 0,
                    })
                  );

                  await formProps.form?.setFieldsValue({
                    variation: generatedVariations,
                  });

                  message.success("Tạo biến thể thành công!");
                } catch (error) {
                  message.error("Lỗi khi tạo biến thể!");
                }
              }}
            >
              Tạo sản phẩm biến thể
            </Button>
          </Form.Item>

          <Form.List name="variation">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <VariationItem
                    key={field.key}
                    field={field}
                    remove={remove}
                    form={formProps.form}
                  />
                ))}
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Create>
  );
};
