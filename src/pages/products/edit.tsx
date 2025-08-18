/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { Edit, useForm, useSelect } from "@refinedev/antd";
import { HttpError } from "@refinedev/core";
import MDEditor from "@uiw/react-md-editor";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Spin,
  Upload,
  UploadFile,
} from "antd";
import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { CLOUDINARY_URL } from "../../config/dataProvider";
import { ColorModeContext } from "../../contexts/color-mode";
import { IAttribute } from "../../interface/attribute";
import { IBrand } from "../../interface/brand";
import { ICategory } from "../../interface/category";
import { IVariation } from "../../interface/product";
import { axiosInstance } from "../../utils/axiosInstance";
import { AttributeItem } from "./AttributeItem";
import "./variation-animations.css";
import { VariationItem } from "./VariationItem";
import Loader from "../../utils/loading";

export const ProductEdit = () => {
  const { formProps, saveButtonProps, queryResult, formLoading } = useForm({
    successNotification: () => ({
      message: "✅ Cập nhật sản phẩm thành công!",
      description: "Thông tin sản phẩm đã được cập nhật.",
      type: "success",
    }),
    errorNotification: (error?: HttpError) => ({
      message:
        "❌ Cập nhật sản phẩm thất bại! " +
        (error?.response?.data?.error ?? ""),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });

  const productData = queryResult?.data?.data;

  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const { mode } = useContext(ColorModeContext);
  const colorMode = mode === "light" ? "light" : "dark";

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

  const handleUpload = async (newFileList: UploadFile[]) => {
    // Tách file đã có URL (đã upload trước đó)
    const existingFiles = newFileList.filter((file) => file.url);
    // Tách file chưa có URL (tức là mới thêm vào, cần upload)
    const newFiles = newFileList.filter((file) => !file.url);
    // Gán trạng thái "uploading" cho file mới
    const uploadingFiles = newFiles.map((file) => ({
      ...file,
      status: "uploading" as const,
    }));
    // Cập nhật fileList hiển thị (gồm file cũ + file mới đang upload)
    const updatedFileList = [...existingFiles, ...uploadingFiles];
    setFileList(updatedFileList);

    // Cập nhật uploadedImageUrls đúng với fileList hiện tại
    const currentUrls = updatedFileList
      .filter((file) => file.status === "done" && file.url)
      .map((file) => file.url);
    setUploadedImageUrls(
      currentUrls.filter((url): url is string => typeof url === "string")
    );

    for (let i = 0; i < uploadingFiles.length; i++) {
      const file = uploadingFiles[i];
      const originFile = file.originFileObj as File;

      if (!originFile?.type.startsWith("image/")) {
        message.error("Vui lòng chỉ tải lên ảnh.");
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("file", originFile);
        formData.append("upload_preset", "Binova_Upload");

        const { data } = await axios.post(CLOUDINARY_URL, formData);

        let fileUrl = data.secure_url;
        if (originFile.type.startsWith("image/")) {
          fileUrl = fileUrl.replace("/upload/", "/upload/f_webp/");
        }

        updatedFileList[i + existingFiles.length] = {
          ...updatedFileList[i + existingFiles.length],
          url: fileUrl,
          status: "done" as const,
        };

        // Cập nhật lại uploadedImageUrls khi upload xong
        const newUrls = updatedFileList
          .filter((file) => file.status === "done" && file.url)
          .map((file) => file.url);
        setUploadedImageUrls(
          newUrls.filter((url): url is string => typeof url === "string")
        );
      } catch (error) {
        updatedFileList[i + existingFiles.length] = {
          ...updatedFileList[i + existingFiles.length],
          status: "error" as const,
        };
        message.error(`❌ Lỗi khi upload file: ${file.name}`);
      }
    }
  };

  const { queryResult: category } = useSelect({
    resource: "category",
    optionLabel: "name",
    optionValue: "_id",
    pagination: { mode: "off" },
    meta: {
      _limit: "off",
    },
  });

  const { queryResult: brand } = useSelect({
    resource: "brand",
    optionLabel: "name",
    optionValue: "_id",
    pagination: { mode: "off" },
    meta: {
      _limit: "off",
    },
  });

  const { queryResult: attribute } = useSelect({
    resource: "attribute",
    optionLabel: "name",
    optionValue: "_id",
    pagination: { mode: "off" },
    meta: {
      fields: ["isColor", "values", "name", "isActive"],
      _limit: "off",
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
    // Lấy tất cả danh mục con từ subCategories
    const subCategories = allCategories.flatMap(
      (cat) => cat.subCategories || []
    );
    // Gộp tất cả danh mục con vào một mảng
    return subCategories
      .filter((item) => item.isActive)
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

      if (values.attributes && values.attributes.length <= 1) {
        message.error("Vui lòng thêm ít nhất 2 thuộc tính cho sản phẩm.");
        return;
      }

      if (values.name && typeof values.name === "string") {
        values.name = values.name.trim();
      }

      const allSubCategories = allCategories.flatMap(
        (cat) => cat.subCategories || []
      );
      let selectedCategory = allSubCategories.find(
        (cat) => cat._id === values.categoryId
      );

      if (!selectedCategory) {
        selectedCategory = {
          _id: "684b9ab14a1d82d1e454b374",
          name: "Danh mục không xác định",
          isActive: true,
          createdAt: "",
          updatedAt: "",
        };
      }

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

      formProps?.onFinish?.(payload);
    } catch (error) {
      message.error("Lỗi khi cập nhật sản phẩm!");
      console.error(error);
    }
  };

  const [bulkRegularPrice, setBulkRegularPrice] = useState<number | undefined>(
    undefined
  );
  const [bulkSalePrice, setBulkSalePrice] = useState<number | undefined>(
    undefined
  );
  const [bulkStock, setBulkStock] = useState<number | undefined>(undefined);

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      title="Chỉnh sửa sản phẩm"
      canDelete={false}
      isLoading={false}
    >
      <Spin
        spinning={
          formLoading ||
          category?.isLoading ||
          brand?.isLoading ||
          attribute?.isLoading
        }
        indicator={<Loader />}
      >
        <Form {...formProps} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên sản phẩm" },
              {
                max: 100,
                message: "Tên sản phẩm không được quá 100 ký tự",
              },
              {
                min: 3,
                message: "Tên sản phẩm phải có ít nhất 3 ký tự",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Hình ảnh"
            name="image"
            rules={[{ required: true, message: "Vui lòng tải ảnh lên" }]}
          >
            <Upload
              listType="picture-card"
              fileList={Array.isArray(fileList) ? fileList : []}
              onChange={(e) => handleUpload(e.fileList)}
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
            <MDEditor data-color-mode={colorMode} />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select loading={category?.isLoading}>
              <Select.Option value={"684b9ab14a1d82d1e454b374"}>
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
                onClick={async () => {
                  try {
                    const response = await axiosInstance.post(
                      `/product/generate-variations`,
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
                  } catch (error: any) {
                    message.error(
                      "Lỗi khi tạo biến thể! " + error.response.data.error ||
                        error.response.data.message
                    );
                  }
                }}
              >
                Tạo sản phẩm biến thể
              </Button>
            </Form.Item>

            <Form.Item label="Áp dụng hàng loạt cho biến thể">
              <Space.Compact style={{ display: "flex", gap: 12 }}>
                <InputNumber
                  placeholder="Giá gốc"
                  min={1000}
                  style={{ width: 120 }}
                  value={bulkRegularPrice}
                  onChange={(value) =>
                    setBulkRegularPrice(value === null ? undefined : value)
                  }
                />
                <InputNumber
                  placeholder="Giá giảm"
                  min={1000}
                  style={{ width: 120 }}
                  value={bulkSalePrice}
                  onChange={(value) =>
                    setBulkSalePrice(value === null ? undefined : value)
                  }
                />
                <InputNumber
                  placeholder="Tồn kho"
                  min={0}
                  style={{ width: 120 }}
                  value={bulkStock}
                  onChange={(value) =>
                    setBulkStock(value === null ? undefined : value)
                  }
                />
                <Button
                  type="primary"
                  onClick={() => {
                    const variation =
                      formProps.form?.getFieldValue("variation");
                    if (!variation || variation.length === 0) {
                      message.warning("Chưa có biến thể để áp dụng.");
                      return;
                    }
                    const updated = variation.map((item: any) => ({
                      ...item,
                      regularPrice: bulkRegularPrice ?? item.regularPrice,
                      salePrice: bulkSalePrice ?? item.salePrice,
                      stock: bulkStock ?? item.stock,
                    }));
                    formProps.form?.setFieldsValue({ variation: updated });
                    message.success("✅ Đã áp dụng cho tất cả biến thể!");
                  }}
                >
                  Áp dụng
                </Button>
              </Space.Compact>
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
      </Spin>
    </Edit>
  );
};
