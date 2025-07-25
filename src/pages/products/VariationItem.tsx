/* eslint-disable @typescript-eslint/no-explicit-any */
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, InputNumber, message, Popconfirm, Upload } from "antd";
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
  const handleImageChange = async (info: any) => {
    const fileList = Array.isArray(info?.fileList) ? info.fileList : [];

    // Nếu xóa ảnh (fileList rỗng)
    if (!fileList.length) {
      const currentVariations = form.getFieldValue("variation") || [];
      currentVariations[field.name]["image"] = [];
      form.setFieldsValue({ variation: currentVariations });
      return;
    }

    const file = fileList[0];

    if (file && file.originFileObj) {
      const formData = new FormData();
      formData.append("file", file.originFileObj);
      formData.append("upload_preset", "Binova_Upload");

      try {
        const res = await axios.post(CLOUDINARY_URL, formData);

        const url = res.data.secure_url;
        const currentVariations = form.getFieldValue("variation") || [];
        currentVariations[field.name]["image"] = [
          {
            uid: new Date().getTime().toString(),
            name: file.name,
            status: "done",
            url,
          },
        ];
        form.setFieldsValue({ variation: currentVariations });
        message.success("🎉 Tải ảnh biến thể thành công!");
      } catch (error) {
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
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false}
            onChange={handleImageChange}
            fileList={
              form.getFieldValue(["variation", field.name, "image"]) || []
            }
          >
            {(form.getFieldValue(["variation", field.name, "image"]) || [])
              .length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Form.Item
              label="Giá"
              name={[field.name, "regularPrice"]}
              rules={[
                { required: true, message: "Vui lòng nhập giá!" },
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Giá phải là số nguyên dương!",
                },
                {
                  type: "number",
                  min: 1000,
                  message: "Giá phải lớn hơn hoặc bằng 1000!",
                },
                {
                  type: "number",
                  max: 1000000000,
                  message: "Giá không được lớn hơn 1 tỷ!",
                },
              ]}
            >
              <InputNumber placeholder="Nhập giá" />
            </Form.Item>

            <Form.Item
              label="Giá giảm"
              name={[field.name, "salePrice"]}
              rules={[
                {
                  pattern: /^[1-9]\d*$/,
                  message: "Giá phải là số nguyên dương!",
                },
                {
                  type: "number",
                  min: 1000,
                  message: "Giá phải lớn hơn hoặc bằng 1000!",
                },
                {
                  type: "number",
                  max: 1000000000,
                  message: "Giá không được lớn hơn 1 tỷ!",
                },
                {
                  validator: (_, value) => {
                    const price = form.getFieldValue([
                      "variation",
                      field.name,
                      "regularPrice",
                    ]);
                    if (value > price) {
                      return Promise.reject("Giá giảm không lớn hơn giá gốc!");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber placeholder="Nhập giá giảm (nếu có)" />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          label="Tồn kho"
          name={[field.name, "stock"]}
          rules={[
            { required: true, message: "Vui lòng nhập tồn kho!" },
            {
              pattern: /^[0-9]\d*$/,
              message: "Tồn kho phải là số nguyên dương!",
            },
            {
              type: "number",
              max: 10000,
              message: "Tồn kho không được lớn hơn 10.000!",
            },
          ]}
        >
          <InputNumber placeholder="Nhập tồn kho" />
        </Form.Item>
      </div>
    </div>
  );
};
