/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusOutlined } from "@ant-design/icons";
import { Create, useForm } from "@refinedev/antd";
import { Form, Image, Input, message, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useState } from "react";

export const BrandCreate = () => {
  const { formProps, saveButtonProps } = useForm({});
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    undefined
  );

  const normFile = (e: any) => {
    return e?.fileList?.slice(-1); // giữ lại 1 file duy nhất
  };

  const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
    const latestFile = fileList.slice(-1); // giữ lại file cuối
    setFileList(latestFile);

    // Hiển thị preview ảnh nếu có
    if (latestFile.length > 0) {
      const file = latestFile[0].originFileObj as File;
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(undefined);
    }
  };

  return (
    <Create saveButtonProps={saveButtonProps} title="Tạo thương hiệu">
      <Form
        {...formProps}
        layout="vertical"
        onFinish={async (values: any) => {
          try {
            const file = values.logoUrl[0].originFileObj.name;
            if (!file) return;
            values.logoUrl = file;
            await formProps?.onFinish?.(values);
          } catch (error) {
            message.error("Lỗi xử lý ảnh");
          }
        }}
      >
        <Form.Item
          label="Tên thương hiệu"
          name={["name"]}
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên thương hiệu",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Hình ảnh"
          name={["logoUrl"]}
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
            maxCount={1}
            beforeUpload={() => false}
          >
            {fileList.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>

          {previewImage && (
            <Image
              src={previewImage}
              alt="Preview"
              style={{ marginTop: 16, maxWidth: 300 }}
            />
          )}
        </Form.Item>
      </Form>
    </Create>
  );
};
