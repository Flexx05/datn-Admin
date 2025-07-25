/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { Create, useForm, useSelect } from "@refinedev/antd";
import { HttpError } from "@refinedev/core";
import MDEditor from "@uiw/react-md-editor";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Upload,
  UploadFile,
  message,
} from "antd";
import axios from "axios";
import { useContext, useMemo, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { CLOUDINARY_URL } from "../../config/dataProvider";
import { ColorModeContext } from "../../contexts/color-mode";
import { IAttribute } from "../../interface/attribute";
import { IBrand } from "../../interface/brand";
import { ICategory } from "../../interface/category";
import { axiosInstance } from "../../utils/axiosInstance";
import LoadingShoes from "../../utils/loading";
import { AttributeItem } from "./AttributeItem";
import { VariationItem } from "./VariationItem";
import "./variation-animations.css";

export const ProductCreate = () => {
  const { formProps, saveButtonProps, formLoading } = useForm({
    successNotification: () => ({
      message: "🎉 Tạo sản phẩm thành công!",
      description: "Sản phẩm mới đã được thêm vào hệ thống.",
      type: "success",
    }),
    errorNotification: (error?: HttpError) => ({
      message:
        "❌ Tạo sản phẩm thất bại! " +
        ((error?.response?.data?.message || error?.response?.data?.error) ??
          ""),
      description: "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
  });

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const { mode } = useContext(ColorModeContext);
  const colorMode = mode === "light" ? "light" : "dark";

  const handleUpload = async (newFileList: UploadFile[]) => {
    const updatedFileList = newFileList.slice(0, 5).map((file) => ({
      ...file,
      status: file.status || "uploading",
    }));
    setFileList(updatedFileList);

    const newUploadedUrls: string[] = [];

    for (let i = 0; i < updatedFileList.length; i++) {
      const file = updatedFileList[i];
      const originFile = file.originFileObj as File;

      if (!originFile.type.startsWith("image/")) {
        message.error("Vui lòng chỉ tải lên ảnh.");
        return;
      }

      if (!file.url && originFile) {
        try {
          const formData = new FormData();
          formData.append("file", originFile);
          formData.append("upload_preset", "Binova_Upload");

          const { data } = await axios.post(CLOUDINARY_URL, formData);

          let fileUrl = data.secure_url;

          if (originFile.type.startsWith("image/")) {
            // Chuyển URL sang định dạng WebP bằng cách thêm `.webp` và /upload/f_auto/ nếu cần
            fileUrl = fileUrl.replace("/upload/", "/upload/f_webp/");
          }

          updatedFileList[i] = {
            ...updatedFileList[i],
            url: fileUrl,
            status: "done",
          };
          newUploadedUrls.push(fileUrl);
        } catch (error) {
          updatedFileList[i] = {
            ...updatedFileList[i],
            status: "error",
          };
          message.error(`❌ Lỗi khi upload file: ${file.name}`);
        }
      } else if (file.url) {
        newUploadedUrls.push(file.url);
      }
    }
    setFileList(updatedFileList);
    setUploadedImageUrls(newUploadedUrls);
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

      if (values.variation && values.variation.length === 0) {
        message.error("Bạn chưa tạo biến thể sản phẩm.");
        return;
      }

      if (values.name && typeof values.name === "string") {
        values.name = values.name.trim();
      }

      // Kiểm tra danh mục còn hoạt động
      const allSubCategories = allCategories.flatMap(
        (cat) => cat.subCategories || []
      );
      const selectedCategory = allSubCategories.find(
        (cat) => cat._id === values.categoryId
      );
      if (!selectedCategory || !selectedCategory.isActive) {
        message.error("Danh mục đã bị vô hiệu hóa. Vui lòng chọn lại.");
        return;
      }

      // Kiểm tra thương hiệu còn hoạt động
      const selectedBrand = allBrands.find((b) => b._id === values.brandId);
      if (!selectedBrand || !selectedBrand.isActive) {
        message.error("Thương hiệu đã bị vô hiệu hóa. Vui lòng chọn lại.");
        return;
      }

      // Kiểm tra tất cả thuộc tính đều còn hoạt động
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
            // Đã xóa xử lý saleFrom và saleTo
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

  if (category?.isLoading || brand?.isLoading || attribute?.isLoading) {
    return <LoadingShoes />;
  }

  return (
    <Create
      saveButtonProps={saveButtonProps}
      title="Tạo sản phẩm"
      isLoading={formLoading}
    >
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập tên sản phẩm" },
            { min: 3, message: "Tên sản phẩm phải có ít nhất 3 ký tự" },
            {
              max: 100,
              message: "Tên sản phẩm không được vượt quá 100 ký tự",
            },
            {
              pattern: /^[\p{L}0-9\s]+$/u,
              message: "Tên sản phẩm không được chứa ký tự đặc biệt",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Hình ảnh"
          name="image"
          rules={[{ required: true, message: "Vui chọn hình ảnh" }]}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={(e) => handleUpload(e.fileList)}
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
          <MDEditor data-color-mode={colorMode} />
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
          name="attributes"
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
                  const attributes =
                    formProps.form?.getFieldValue("attributes");

                  if (!attributes || attributes.length === 0) {
                    message.error("Vui lòng thêm thuộc tính trước!");
                    return;
                  }
                  const response = await axiosInstance.post(
                    `/product/generate-variations`,
                    {
                      attributes,
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
              <Form.Item name="defaultPrice" noStyle>
                <InputNumber
                  placeholder="Giá gốc"
                  min={1000}
                  style={{ width: 120 }}
                />
              </Form.Item>
              <Form.Item name="defaultSalePrice" noStyle>
                <InputNumber
                  placeholder="Giá giảm"
                  min={1000}
                  style={{ width: 120 }}
                />
              </Form.Item>
              <Form.Item name="defaultStock" noStyle>
                <InputNumber
                  placeholder="Tồn kho"
                  min={0}
                  style={{ width: 120 }}
                />
              </Form.Item>
              <Button
                type="primary"
                onClick={() => {
                  const values = formProps.form?.getFieldsValue([
                    "defaultPrice",
                    "defaultSalePrice",
                    "defaultStock",
                    "variation",
                  ]);

                  const {
                    defaultPrice,
                    defaultSalePrice,
                    defaultStock,
                    variation,
                  } = values;

                  if (!variation || variation.length === 0) {
                    message.warning("Chưa có biến thể để áp dụng.");
                    return;
                  }

                  const updated = variation.map((item: any) => ({
                    ...item,
                    regularPrice: defaultPrice ?? item.regularPrice,
                    salePrice: defaultSalePrice ?? item.salePrice,
                    stock: defaultStock ?? item.stock,
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
    </Create>
  );
};
