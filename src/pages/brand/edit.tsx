/* eslint-disable @typescript-eslint/no-explicit-any */
import { InboxOutlined } from "@ant-design/icons";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Upload } from "antd";

export const BrandEdit = () => {
  const { formProps, saveButtonProps } = useForm({});

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Tên thương hiệu"}
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
          label={"Hình ảnh"}
          name={["logoURL"]}
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload.Dragger
            name="files"
            multiple={false}
            beforeUpload={() => false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click hoặc kéo thả ảnh vào đây</p>
            <p className="ant-upload-hint">Chỉ hỗ trợ upload 1 ảnh</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Edit>
  );
};
