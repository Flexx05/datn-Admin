import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, DatePicker, Select, Spin, Tag } from "antd";
import { HttpError } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import dayjs from "dayjs";
import { axiosInstance } from "../../utils/axiosInstance";
import debounce from "lodash/debounce";
import { SaveButton } from "../../utils/ButtonForManagement";

const { RangePicker } = DatePicker;

const VoucherCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    successNotification: () => ({
      message: "Tạo voucher thành công!",
      description: "Voucher mới đã được thêm vào hệ thống.",
      type: "success",
    }),
    errorNotification: (error?: HttpError) => ({
      message: "Tạo voucher thất bại!",
      description:
        error?.response?.data?.message ??
        "Có lỗi xảy ra trong quá trình xử lý.",
      type: "error",
    }),
    redirect: "list",
  });

  const [discountType, setDiscountType] = useState("fixed");
  const [fixedValue, setFixedValue] = useState<number | undefined>(undefined);
  const [percentValue, setPercentValue] = useState<number | undefined>(
    undefined
  );
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(undefined);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [fetching, setFetching] = useState(false);

  const fetchUser = debounce((search: string) => {
    setFetching(true);
    axiosInstance
      .get(`/admin/users?search=${encodeURIComponent(search)}&isActive=true`)
      .then((res) => {
        const users = res.data?.docs || res.data || [];
        setUserOptions(
          users.map((u: any) => ({
            label: `${u.fullName || u.email} (${u.email})`,
            value: u._id,
          }))
        );
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, 400);

  useEffect(() => {
    axiosInstance.get("/admin/users?isActive=true").then((res) => {
      const users = res.data?.docs || res.data || [];
      setUserOptions(
        users.map((u: any) => ({
          label: `${u.fullName || u.email} (${u.email})`,
          value: u._id,
        }))
      );
    });
  }, []);

  const { form } = formProps;

  const handleFinish = (values: any) => {
    const [startDate, endDate] = values.dateRange || [];
    const now = dayjs();

    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      if (start.isAfter(end)) {
        form?.setFields([
          {
            name: "dateRange",
            errors: ["Ngày bắt đầu phải nhỏ hơn ngày kết thúc"],
          },
        ]);
        return;
      }

      if (end.diff(start, "minute") < 5) {
        form?.setFields([
          {
            name: "dateRange",
            errors: [
              "Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 5 phút",
            ],
          },
        ]);
        return;
      }

      if (start.isBefore(now, "minute")) {
        form?.setFields([
          {
            name: "dateRange",
            errors: ["Ngày bắt đầu không được ở quá khứ"],
          },
        ]);
        return;
      }

      values.startDate = start.toISOString();
      values.endDate = end.toISOString();
      delete values.dateRange;

      values.userIds = userIds;
      values.quantity = userIds.length > 0 ? userIds.length : values.quantity;

      formProps.onFinish?.(values);
    }
  };

  useEffect(() => {
    if (userIds.length > 0) {
      form?.setFieldsValue({
        quantity: userIds.length,
      });
    }
  }, [userIds, form]);

  const isLoading = saveButtonProps.loading;

  return (
    <Create
      saveButtonProps={SaveButton("Lưu Voucher", saveButtonProps)}
      title="Thêm mới Voucher"
    >
      <Spin spinning={!!isLoading}>
        <Form
          {...formProps}
          layout="vertical"
          onFinish={handleFinish}
          disabled={!!saveButtonProps.loading}
        >
          <Form.Item
            label="Loại voucher"
            name="voucherType"
            rules={[{ required: true, message: "Vui lòng chọn loại voucher" }]}
          >
            <Select placeholder="Chọn loại voucher">
              <Select.Option value="product">Dành cho sản phẩm</Select.Option>
              <Select.Option value="shipping">
                Dành cho phí vận chuyển
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Mã giảm giá"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã giảm giá" },
              { min: 3, message: "Mã giảm giá phải có ít nhất 3 ký tự" },
              {
                pattern: /^[A-Z0-9\-_]+$/,
                message:
                  "Mã giảm giá chỉ gồm chữ in hoa, số, dấu gạch ngang (-), và gạch dưới (_)",
              },

              {
                validator: async (_, value) => {
                  if (!value || value.trim().length === 0) {
                    return Promise.resolve();
                  }

                  try {
                    const response = await axiosInstance(
                      `/vouchers?code=${value.trim()}&isDeleted=all`
                    );
                    const data = response?.data?.docs || [];

                    const duplicateVoucher = data.find(
                      (v: any) =>
                        v.code.trim().toLowerCase() ===
                        value.trim().toLowerCase()
                    );

                    if (duplicateVoucher) {
                      if (duplicateVoucher.isDeleted) {
                        return Promise.reject(
                          "Mã giảm giá này đã từng tồn tại (hiện đang bị xóa). Vui lòng dùng mã khác hoặc khôi phục mã cũ."
                        );
                      }
                      return Promise.reject("Mã giảm giá đã tồn tại");
                    }
                  } catch (error) {
                    console.error("Lỗi kiểm tra mã:", error);
                    return Promise.reject(
                      "Không thể kiểm tra mã giảm giá. Vui lòng thử lại."
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập mã giảm giá" />
          </Form.Item>

          <Form.Item
            label="Danh sách người dùng"
            name="userIds"
            rules={[
              {
                validator: (_, value) => {
                  if (Array.isArray(value) && value.length > 10000) {
                    return Promise.reject(
                      new Error(
                        "Danh sách người dùng không được vượt quá 10.000"
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              mode="multiple"
              showSearch
              filterOption={false}
              onSearch={fetchUser}
              notFoundContent={
                fetching ? "Đang tìm..." : "Không có user phù hợp"
              }
              options={userOptions}
              value={userIds}
              onChange={(value) => {
                setUserIds(value);
                form?.setFieldsValue({ userIds: value });

                // Nếu danh sách userIds rỗng thì reset lại danh sách mặc định
                if (value.length === 0) {
                  axiosInstance
                    .get("/admin/users?isActive=true")
                    .then((res) => {
                      const users = res.data?.docs || res.data || [];
                      setUserOptions(
                        users.map((u: any) => ({
                          label: `${u.fullName || u.email} (${u.email})`,
                          value: u._id,
                        }))
                      );
                    });
                }
              }}
              placeholder="Nhập theo tên hoặc email"
              style={{ width: "100%" }}
            />
            {userIds.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">Số người dùng: {userIds.length}</Tag>
              </div>
            )}
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
                // Lưu giá trị hiện tại trước khi chuyển
                const currentDiscountValue =
                  form?.getFieldValue("discountValue");
                const currentMaxDiscount = form?.getFieldValue("maxDiscount");

                if (discountType === "fixed") {
                  setFixedValue(currentDiscountValue);
                } else {
                  setPercentValue(currentDiscountValue);
                  setMaxDiscount(currentMaxDiscount);
                }
                // Chuyển loại và set lại form
                setDiscountType(value);
                form?.setFieldsValue({
                  discountValue: value === "fixed" ? fixedValue : percentValue,
                  maxDiscount: value === "percent" ? maxDiscount : undefined,
                });
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
                : [
                    {
                      type: "number" as const,
                      max: 10000000,
                      message: "Số tiền giảm không được vượt quá 10.000.000VNĐ",
                    },
                  ]),
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={
                discountType === "fixed" ? "Nhập số tiền giảm" : "Nhập % giảm"
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
                {
                  type: "number",
                  max: 10000000,
                  message: "Giảm tối đa không được vượt quá 10.000.000VNĐ",
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
              {
                required: true,
                message: "Vui lòng nhập giá trị đơn tối thiểu",
              },
              {
                type: "number",
                min: 0,
                message: "Giá trị đơn tối thiểu phải lớn hơn hoặc bằng 0",
              },
              {
                type: "number",
                max: 100000000,
                message:
                  "Giá trị đơn tối thiểu không được vượt quá 100.000.000VNĐ",
              },
              {
                validator: (_, value) => {
                  const discountType = form?.getFieldValue("discountType");
                  const discountValue = form?.getFieldValue("discountValue");
                  const maxDiscount = form?.getFieldValue("maxDiscount");

                  if (discountType === "fixed") {
                    if (
                      typeof value === "number" &&
                      typeof discountValue === "number"
                    ) {
                      if (value <= discountValue) {
                        return Promise.reject(
                          "Giá trị đơn tối thiểu phải lớn hơn số tiền giảm"
                        );
                      }
                    }
                  }

                  if (discountType === "percent") {
                    if (
                      typeof value === "number" &&
                      typeof maxDiscount === "number"
                    ) {
                      if (value < maxDiscount) {
                        return Promise.reject(
                          "Giá trị đơn tối thiểu phải lớn hơn hoặc bằng mức giảm tối đa"
                        );
                      }
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
              {
                required: userIds.length === 0,
                message: "Vui lòng nhập số lượng",
              },
              {
                type: "number",
                min: 1,
                message: "Số lượng voucher phải lớn hơn hoặc bằng 1",
              },
              {
                type: "number",
                max: 100000,
                message: "Số lượng voucher không được vượt quá 100000",
              },
            ]}
          >
            <InputNumber
              disabled={userIds.length > 0}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng voucher"
            />
          </Form.Item>

          <Form.Item
            label="Thời gian áp dụng"
            name="dateRange"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian áp dụng" },
            ]}
          >
            <RangePicker
              showTime
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm"
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              disabledDate={(current) => {
                // Disable ngày trước hôm nay
                return current && current < dayjs().startOf("day");
              }}
              disabledTime={(date, type) => {
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
                            (m) => m < currentMinute
                          )
                        : [],
                  };
                }
                return {};
              }}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Create>
  );
};

export default VoucherCreate;
