/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DatePicker,
  Form,
  InputNumber,
  Popconfirm,
  Upload,
  Button,
  message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { ColorDots } from "./ColorDots";

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

    const file = fileList[0];

    if (file && file.originFileObj) {
      const formData = new FormData();
      formData.append("file", file.originFileObj);
      formData.append("upload_preset", "Binova_Upload");

      try {
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dtwm0rpqg/image/upload",
          formData
        );

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
    } else if (!fileList.length) {
      const currentVariations = form.getFieldValue("variation") || [];
      currentVariations[field.name]["image"] = [];
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
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
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
                { type: "number", min: 0, message: "Giá không được âm!" },
              ]}
            >
              <InputNumber placeholder="Nhập giá" />
            </Form.Item>

            <Form.Item
              label="Giá giảm"
              name={[field.name, "salePrice"]}
              rules={[
                { type: "number", min: 0, message: "Giá không được âm!" },
                {
                  validator: (_, value) => {
                    const price = form.getFieldValue([
                      "variation",
                      field.name,
                      "regularPrice",
                    ]);
                    if (value >= price) {
                      return Promise.reject("Giá giảm phải nhỏ hơn giá gốc!");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber placeholder="Nhập giá giảm (nếu có)" />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <Form.Item shouldUpdate>
              {() => {
                const salePrice = form.getFieldValue([
                  "variation",
                  field.name,
                  "salePrice",
                ]);
                const saleTo = form.getFieldValue([
                  "variation",
                  field.name,
                  "saleTo",
                ]);
                return (
                  <Form.Item
                    label="Ngày bắt đầu giảm"
                    name={[field.name, "saleForm"]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="YYYY-MM-DD"
                      placeholder="Chọn ngày bắt đầu"
                      disabled={!salePrice}
                      disabledDate={(current) =>
                        saleTo && current.isAfter(dayjs(saleTo))
                      }
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>

            <Form.Item shouldUpdate>
              {() => {
                const salePrice = form.getFieldValue([
                  "variation",
                  field.name,
                  "salePrice",
                ]);
                const saleForm = form.getFieldValue([
                  "variation",
                  field.name,
                  "saleForm",
                ]);
                return (
                  <Form.Item
                    label="Ngày kết thúc giảm"
                    name={[field.name, "saleTo"]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="YYYY-MM-DD"
                      placeholder="Chọn ngày kết thúc"
                      disabled={!salePrice}
                      disabledDate={(current) =>
                        saleForm && current.isBefore(dayjs(saleForm))
                      }
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </div>
        </div>

        <Form.Item
          label="Tồn kho"
          name={[field.name, "stock"]}
          rules={[{ required: true, message: "Vui lòng nhập tồn kho!" }]}
        >
          <InputNumber placeholder="Nhập tồn kho" />
        </Form.Item>
      </div>
    </div>
  );
};
