/* eslint-disable @typescript-eslint/no-explicit-any */
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Upload,
  UploadFile,
} from "antd";
import axios from "axios";
import { ColorDots } from "./ColorDots";
import { CLOUDINARY_URL } from "../../config/dataProvider";

interface VariationItemProps {
  field: any;
  remove: (name: number) => void;
  form: any;
}

export const VariationItem: React.FC<VariationItemProps> = ({
  field,
  remove,
  form,
}) => {
  const handleImageChange = async (newFileList: UploadFile[]) => {
    // Giới hạn 1 ảnh
    const fileList = newFileList.slice(0, 1).map((file: any) => ({
      ...file,
      status: file.status || "uploading",
    }));
    // Nếu xóa ảnh (fileList rỗng)
    if (!fileList.length) {
      const currentVariations = form.getFieldValue("variation") || [];
      currentVariations[field.name]["image"] = [];
      form.setFieldsValue({ variation: currentVariations });
      return;
    }
    const file = fileList[0];
    if (file && file.originFileObj && !file.url) {
      if (!file.originFileObj.type.startsWith("image/"))
        message.error("Vui lòng tải lên ảnh hợp lệ.");
      try {
        const formData = new FormData();
        formData.append("file", file.originFileObj);
        formData.append("upload_preset", "Binova_Upload");
        const { data } = await axios.post(CLOUDINARY_URL, formData);
        let fileUrl = data.secure_url;
        if (file.originFileObj.type.startsWith("image/")) {
          fileUrl = fileUrl.replace("/upload/", "/upload/f_webp/");
        }
        fileList[0] = {
          ...fileList[0],
          url: fileUrl,
          status: "done",
        };
        const currentVariations = form.getFieldValue("variation") || [];
        currentVariations[field.name]["image"] = fileList;
        form.setFieldsValue({ variation: currentVariations });
        message.success("🎉 Tải ảnh biến thể thành công!");
      } catch (error) {
        fileList[0] = {
          ...fileList[0],
          status: "error",
        };
        const currentVariations = form.getFieldValue("variation") || [];
        currentVariations[field.name]["image"] = fileList;
        form.setFieldsValue({ variation: currentVariations });
        message.error("❌ Lỗi khi upload ảnh biến thể.");
      }
    } else {
      // Nếu chỉ chọn ảnh đã có (không phải upload mới)
      const currentVariations = form.getFieldValue("variation") || [];
      currentVariations[field.name]["image"] = fileList;
      form.setFieldsValue({ variation: currentVariations });
    }
  };

  return (
    <div
      key={field.key}
      style={{
        marginBottom: 24,
        padding: 16,
        border: "1px solid #d9d9d9",
        borderRadius: 8,
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 8, right: 8 }}>
        <Popconfirm
          title="Xoá biến thể"
          onConfirm={() => remove(field.name)}
          okText="Xoá"
          cancelText="Hủy"
        >
          <Button danger type="text">
            <MinusCircleOutlined style={{ fontSize: 25 }} />
          </Button>
        </Popconfirm>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        {(
          form?.getFieldValue(["variation", field.name, "attributes"]) || []
        ).map((attr: any, idx: number) => {
          const isColor = /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(attr.values?.[0]); // kiểm tra nếu là mã màu hex
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <strong>{attr.attributeName}:</strong>
              {attr.values.map((val: string, i: number) =>
                isColor ? (
                  <ColorDots colors={[val]} />
                ) : (
                  <span key={i}>{val}</span>
                )
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <Form.Item
          label="Ảnh biến thể"
          name={[field.name, "image"]}
          rules={[{ required: true, message: "Vui lòng chọn ảnh" }]}
        >
          {(() => {
            const images = form.getFieldValue([
              "variation",
              field.name,
              "image",
            ]);
            const imageList = Array.isArray(images) ? images : [];
            const isUploading = imageList.some(
              (img: any) => img.status === "uploading"
            );
            return (
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                onChange={(e) => handleImageChange(e.fileList)}
                fileList={imageList}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
                disabled={isUploading}
              >
                {isUploading || imageList.length >= 1 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                )}
              </Upload>
            );
          })()}
        </Form.Item>

        <div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Form.Item
              label="Giá"
              name={[field.name, "regularPrice"]}
              rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
            >
              <InputNumber placeholder="Nhập giá" min={1000} max={1000000000} />
            </Form.Item>

            <Form.Item
              label="Giá giảm"
              name={[field.name, "salePrice"]}
              rules={[
                {
                  validator: (_, value) => {
                    const price = form.getFieldValue([
                      "variation",
                      field.name,
                      "regularPrice",
                    ]);
                    if (value >= price) {
                      return Promise.reject("Giá giảm không lớn hơn giá gốc!");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="Nhập giá giảm"
                min={1000}
                max={1000000000}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          label="Tồn kho"
          name={[field.name, "stock"]}
          rules={[{ required: true, message: "Vui lòng nhập tồn kho!" }]}
        >
          <InputNumber placeholder="Nhập tồn kho" min={0} max={10000} />
        </Form.Item>
      </div>
    </div>
  );
};
