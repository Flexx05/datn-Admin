import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, DatePicker, Select, message } from "antd";
import { Edit, useForm } from "@refinedev/antd";
import dayjs from "dayjs";
import { axiosInstance } from "../../utils/axiosInstance";

const { RangePicker } = DatePicker;

const VoucherEdit = () => {
  const [discountType, setDiscountType] = useState("fixed");
  const [fixedValue, setFixedValue] = useState<number | undefined>();
  const [percentValue, setPercentValue] = useState<number | undefined>();
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>();

  const {
    formProps,
    saveButtonProps,
    queryResult,
  } = useForm({
    successNotification: () => ({
      message: "Cập nhật voucher thành công!",
      description: "Voucher đã được cập nhật.",
      type: "success",
    }),
    errorNotification: (error) => ({
      message: "Cập nhật voucher thất bại!",
      description:
        error?.response?.data?.message ??
        "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
    redirect: "list",
  });

  const record = queryResult?.data?.data?.data;

  useEffect(() => {
     if (record) {
      setDiscountType(record.discountType);
      if (record.discountType === "fixed") {
        setFixedValue(record.discountValue);
      } else {
        setPercentValue(record.discountValue);
        setMaxDiscount(record.maxDiscount);
      }

      formProps.form?.setFieldsValue({
        ...record,
        dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
      });
    }
  
  }, [record, formProps.form]);

  const handleFinish = (values: any) => {
    const [startDate, endDate] = values.dateRange || [];
    const now = new Date();

    if (startDate && endDate) {
      if (startDate > endDate) {
        formProps.form?.setFields([
          {
            name: "dateRange",
            errors: ["Ngày bắt đầu phải nhỏ hơn ngày kết thúc"],
          },
        ]);
        return;
      }
    }

    const payload = {
      ...values,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    };
    delete payload.dateRange;

    formProps.onFinish?.(payload);
  };

  return (
    <Edit saveButtonProps={saveButtonProps} title="Cập nhật Voucher">
      <Form {...formProps} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Loại voucher"
          name="voucherType"
          rules={[{ required: true, message: "Vui lòng chọn loại voucher" }]}
        >
          <Select placeholder="Chọn loại voucher">
            <Select.Option value="product">Dành cho sản phẩm</Select.Option>
            <Select.Option value="shipping">Dành cho phí vận chuyển</Select.Option>
          </Select>
        </Form.Item>

          <Form.Item
                  label="Mã giảm giá"
                  name="code"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã giảm giá" },
                  
                    {
                      validator: (_, value) => {
                        if (value && value.trim().length === 0) {
                          return Promise.reject("Mã giảm giá không được chỉ chứa khoảng trắng");
                        }
                        return Promise.resolve();
                      },
                    },
                  
                    {
                      pattern: /^[A-Za-z0-9_\-\s]+$/,
                      message: "Mã giảm giá chỉ được chứa chữ cái không dấu, số, dấu gạch ngang hoặc gạch dưới",
                    },
                  
                    {
                      validator: async (_, value) => {
                        if (!value || value.trim().length === 0) {
                          // Đã có các rule khác xử lý, không cần kiểm tra trùng
                          return Promise.resolve();
                        }

                        if (value === record?.code) {
                          return Promise.resolve();
                        }
                  
                        try {
                          const response = await axiosInstance(`/vouchers?code=${value.trim()}`);
                          const data = response.data;
                  
                          if (data?.docs?.length > 0 && data.docs[0].code !== record?.code) {
                            return Promise.reject("Mã giảm giá đã tồn tại");
                          }
                        } catch (error) {
                          console.error("Lỗi kiểm tra mã:", error);
                        }
                  
                        return Promise.resolve();
                      },
                    },
                  ]}
                  
                >
             <Input placeholder="Nhập mã giảm giá" />
        </Form.Item>

        <Form.Item label="Link" name="link">
          <Input placeholder="Link sản phẩm/danh mục (không bắt buộc)" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả" },
            { min: 5, message: "Mô tả phải dài ít nhất 5 ký tự" },
            {
              validator: (_, value) => {
                if (value && value.trim().length === 0) {
                  return Promise.reject(
                    "Mô tả không được chỉ chứa khoảng trắng"
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Ví dụ: Giảm 50K đơn từ 300K" />
        </Form.Item>

        <Form.Item
          label="Kiểu giảm giá"
          name="discountType"
          rules={[{ required: true, message: "Vui lòng chọn kiểu giảm giá" }]}
        >

        <Select
            onChange={(value) => {
              setDiscountType(value);
              if (value === "fixed") {
                formProps.form?.setFieldsValue({
                  discountValue: fixedValue,
                  maxDiscount: undefined,
                });
              } else {
                formProps.form?.setFieldsValue({
                  discountValue: percentValue,
                  maxDiscount: maxDiscount,
                });
              }
            }}
            placeholder="Chọn kiểu giảm giá"
          >
            <Select.Option value="fixed">Giảm cố định</Select.Option>
            <Select.Option value="percent">Giảm phần trăm</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={
            discountType === "fixed"
              ? "Số tiền giảm (VNĐ)"
              : "Phần trăm giảm (%)"
          }
          name="discountValue"
          rules={[
            { required: true, message: "Vui lòng nhập giá trị giảm" },
            {
              type: "number",
              min: 1,
              message:
                discountType === "fixed"
                  ? "Số tiền giảm phải lớn hơn hoặc bằng 1"
                  : "Phần trăm giảm phải lớn hơn hoặc bằng 1",
            },
            ...(discountType === "percent"
              ? [
                  {
                    type: "number" as const,
                    max: 100,
                    message: "Phần trăm giảm không được vượt quá 100%",
                  },
                ]
              : []),
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder={
              discountType === "fixed"
                ? "Nhập số tiền giảm"
                : "Nhập % giảm"
            }
          />
        </Form.Item>

        {discountType === "percent" && (
          <Form.Item
            label="Giảm tối đa (VNĐ)"
            name="maxDiscount"
            rules={[
              { required: true, message: "Vui lòng nhập giảm tối đa" },
              {
                type: "number",
                min: 1,
                message: "Giảm tối đa phải lớn hơn hoặc bằng 1",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Nhập số tiền giảm tối đa"
            />
          </Form.Item>
        )}

        <Form.Item
          label="Đơn tối thiểu (VNĐ)"
          name="minOrderValues"
          rules={[
            { required: true, message: "Vui lòng nhập giá trị đơn tối thiểu" },
            {
              type: "number",
              min: 0,
              message: "Giá trị đơn tối thiểu phải lớn hơn hoặc bằng 0",
            },
            {
              validator: (_, value) => {
                const discountType = formProps.form?.getFieldValue("discountType");
                const discountValue = formProps.form?.getFieldValue("discountValue");
        
                if (discountType === "fixed") {
                  if (
                    typeof value === "number" &&
                    typeof discountValue === "number" &&
                    value <= discountValue
                  ) {
                    return Promise.reject(
                      "Giá trị đơn tối thiểu phải lớn hơn số tiền giảm"
                    );
                  }
                }
        
                return Promise.resolve();
              },
            },    
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Nhập giá trị đơn tối thiểu"
          />
        </Form.Item>

        <Form.Item
          label="Số lượng voucher"
          name="quantity"
          rules={[
            { required: true, message: "Vui lòng nhập số lượng" },
            {
              type: "number",
              min: 1,
              message: "Số lượng voucher phải lớn hơn hoặc bằng 1",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Nhập số lượng voucher"
          />
        </Form.Item>

                

        <Form.Item
          label="Thời gian áp dụng"
          name="dateRange"
          rules={[{ required: true, message: "Vui lòng chọn thời gian áp dụng" }]}
        >
          <RangePicker
            showTime
            style={{ width: "100%" }}
            format="YYYY-MM-DD HH:mm"
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            disabledDate={(current) =>
              current && current < dayjs().startOf("day")
            }
            disabledTime={(date) => {
              if (!date) return {};
              const isToday = date.isSame(dayjs(), "day");
              if (isToday) {
                const currentHour = dayjs().hour();
                const currentMinute = dayjs().minute();
                return {
                  disabledHours: () =>
                    Array.from({ length: 24 }, (_, i) => i).filter(
                      (h) => h < currentHour
                    ),
                  disabledMinutes: (selectedHour) =>
                    selectedHour === currentHour
                      ? Array.from({ length: 60 }, (_, i) => i).filter(
                          (m) => m <= currentMinute
                        )
                      : [],
                };
              }
              return {};
            }}
            // Chỉ cho chỉnh ngày bắt đầu nếu voucher chưa active và ngày bắt đầu chưa qua
            disabled={[ 
              record?.voucherStatus === "active" || dayjs(record?.startDate).isBefore(dayjs(), "minute"), // disable startDate
              false // endDate vẫn cho chỉnh
            ]}
        />
        </Form.Item>
      </Form>
    </Edit>
  );
};

export default VoucherEdit;
