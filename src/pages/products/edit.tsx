/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { HttpError } from "@refinedev/core";
import MDEditor from "@uiw/react-md-editor";
import {
  Button,
  Form,
  Input,
  Select,
  Upload,
  UploadFile,
  message,
  Spin,
} from "antd";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../config/dataProvider";
import { IAttribute } from "../../interface/attribute";
import { IBrand } from "../../interface/brand";
import { ICategory } from "../../interface/category";
import { IVariation } from "../../interface/product";
import { AttributeItem } from "./AttributeItem";
import { VariationItem } from "./VariationItem";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./variation-animations.css";

export const ProductEdit = () => {
  const { formProps, saveButtonProps, queryResult } = useForm({
    successNotification: () => ({
      message: "✅ Cập nhật sản phẩm thành công!",
      description: "Thông tin sản phẩm đã được cập nhật.",
      type: "success",
    }),
    errorNotification: (error?: HttpError) => ({
      message:
        "❌ Cập nhật sản phẩm thất bại! " +
        (error?.response?.data?.message ?? ""),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });

  const productData = queryResult?.data?.data;

  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (productData) {
      const images = Array.isArray(productData.image) ? productData.image : [];
      const imageList = images
        .filter((url: string) => typeof url === "string" && url)
        .map((url: string, index: number) => ({
          uid: `${index}`,
          name: url.substring(url.lastIndexOf("/") + 1),
          status: "done" as const,
          url,
        })) as UploadFile<any>[];
      setFileList(imageList);
      setUploadedImageUrls(images);
      formProps.form?.setFieldsValue({
        ...productData,
        image: imageList,
      });
    } else {
      setFileList([]);
      setUploadedImageUrls([]);
    }
  }, [productData, formProps.form]);

  const normFile = (e: any) => e?.fileList?.slice(0, 5);

  const formattedVariations = productData?.variation.map((v: IVariation) => ({
    ...v,
    image: v.image
      ? [
          {
            uid: Date.now().toString(),
            name: "Ảnh đã có",
            status: "done",
            url: v.image,
          },
        ]
      : [],
  }));

  if (formProps.form) {
    formProps.form.setFieldsValue({ variation: formattedVariations });
  }

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
      if (file.type !== "image/jpeg" && file.type !== "image/png") {
        message.error("Vui lòng chỉ tải lên ảnh định dạng JPEG hoặc PNG.");
        return;
      }

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
      fields: ["isColor", "values", "name", "isActive"],
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
      .filter((item) => item.parentId !== null && item.isActive)
      .map((item) => ({
        label: item.name,
        value: item._id,
      }));
  }, [allCategories]);

  const brandOptions = useMemo(() => {
    return allBrands
      .filter((item) => item.isActive)
      .map((item) => ({
        label: item.name,
        value: item._id,
      }));
  }, [allBrands]);

  const handleFinish = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (uploadedImageUrls.length === 0) {
        message.error("Bạn chưa tải ảnh hoặc ảnh chưa upload xong.");
        return;
      }

      if (values.variation && values.variation.length === 0) {
        message.error("Bạn chưa tạo biến thể sản phẩm.");
        return;
      }

      if (values.attributes && values.attributes.length === 0) {
        message.error("Bạn chưa thêm thuộc tính cho sản phẩm.");
        return;
      }

      const selectedCategory = allCategories.find(
        (cat) => cat._id === values.categoryId
      );
      if (!selectedCategory || !selectedCategory.isActive) {
        message.error("Danh mục đã bị vô hiệu hóa. Vui lòng chọn lại.");
        return;
      }

      const selectedBrand = allBrands.find((b) => b._id === values.brandId);
      if (!selectedBrand || !selectedBrand.isActive) {
        message.error("Thương hiệu đã bị vô hiệu hóa. Vui lòng chọn lại.");
        return;
      }

      const invalidAttribute = (values.attributes || []).find((attr: any) => {
        const found = allAttributes.find((a) => a._id === attr.attributeId);
        return !found || !found.isActive;
      });

      if (invalidAttribute) {
        const found = allAttributes.find(
          (a) => a._id === invalidAttribute.attributeId
        );
        const attrName = found?.name || "Không xác định";
        message.error(
          `Thuộc tính "${attrName}" đã bị vô hiệu hóa. Vui lòng kiểm tra lại.`
        );
        return;
      }

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
      message.error("Lỗi khi cập nhật sản phẩm!");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (queryResult?.isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      title="Chỉnh sửa sản phẩm"
      canDelete={false}
    >
      <Spin spinning={isSubmitting} tip="Đang xử lý..."></Spin>
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
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "Vui lòng tải ảnh lên" }]}
        >
          <Upload
            listType="picture-card"
            fileList={Array.isArray(fileList) ? fileList : []}
            onChange={handleChange}
            maxCount={5}
            beforeUpload={() => false}
          >
            {Array.isArray(fileList) && fileList.length >= 5 ? null : (
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
          <Select loading={category?.isLoading}>
            <Select.Option value={"684b90f74a1d82d1e454b373"}>
              Danh mục không xác định
            </Select.Option>
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
          <Select loading={brand?.isLoading} options={brandOptions} />
        </Form.Item>

        <Form.Item label="Thuộc tính" rules={[{ required: true }]}>
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
              loading={isGenerating}
              onClick={async () => {
                setIsGenerating(true);
                setIsSubmitting(true);
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
                } finally {
                  setIsGenerating(false);
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              Tạo sản phẩm biến thể
            </Button>
          </Form.Item>

          <Form.List name="variation">
            {(fields, { remove }) => (
              <TransitionGroup>
                {fields.map((field) => (
                  <CSSTransition
                    key={field.key}
                    timeout={400}
                    classNames="variation-fade"
                  >
                    <VariationItem
                      field={field}
                      remove={remove}
                      form={formProps.form}
                    />
                  </CSSTransition>
                ))}
              </TransitionGroup>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Edit>
  );
};
