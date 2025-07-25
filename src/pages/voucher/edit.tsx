import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Tag,
} from "antd";
import { Edit, useForm } from "@refinedev/antd";
import dayjs from "dayjs";
import { axiosInstance } from "../../utils/axiosInstance";
import debounce from "lodash/debounce";

const { RangePicker } = DatePicker;

const VoucherEdit = () => {
  const [discountType, setDiscountType] = useState("fixed");
  const [fixedValue, setFixedValue] = useState<number | undefined>();
  const [percentValue, setPercentValue] = useState<number | undefined>();
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>();
  const [voucherScope, setVoucherScope] = useState<"shared" | "private">(
    "shared"
  );
  const [userIds, setUserIds] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [fetching, setFetching] = useState(false);

  const { formProps, saveButtonProps, queryResult } = useForm({
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
      setVoucherScope(record.voucherScope); // ✅ giữ nguyên backend
      console.log("record", record);
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

      // 1. Gán trước danh sách userId
      const currentUserIds =
        record.userIds?.map((id: any) => id.toString()) || [];
      setUserIds(currentUserIds);

      // 2. Gọi danh sách user như ở create
      axiosInstance.get("/admin/users?isActive=true").then((res) => {
        const users = res.data?.docs || res.data || [];
        const mapped = users.map((u: any) => ({
          label: `${u.fullName || u.email} (${u.email})`,
          value: u._id,
        }));

        // 3. Nếu user đang được chọn không nằm trong danh sách này → fetch thêm
        const currentUserIdsSet = new Set(currentUserIds);
        const mappedIds = new Set(mapped.map((u:any) => u.value));
        const missingIds = [...currentUserIdsSet].filter(
          (id) => !mappedIds.has(id)
        );

        if (missingIds.length > 0) {
          axiosInstance
            .get("/admin/users/byIds", {
              params: { ids: missingIds.join(",") },
            })
            .then((extraRes) => {
              const extraUsers = extraRes.data || [];
              const extraMapped = extraUsers.map((u: any) => ({
                label: `${u.fullName || u.email} (${u.email})`,
                value: u._id,
              }));
              setUserOptions([...mapped, ...extraMapped]);
            })
            .catch(() => {
              setUserOptions(mapped); // fallback
            });
        } else {
          setUserOptions(mapped);
        }
      });
    }
  }, [record, formProps.form]);

  // Hàm fetch user theo search
  const fetchUser = debounce((search: string) => {
    setFetching(true);
    axiosInstance
      .get(
        `/admin/users?search=${encodeURIComponent(
          search
        )}&isActive=true&limit=10`
      )
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

  const handleFinish = (values: any) => {
    const [startDate, endDate] = values.dateRange || [];
    const now = new Date();

    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const now = dayjs();

      // 1. Ngày bắt đầu > ngày kết thúc
      if (start.isAfter(end)) {
        formProps.form?.setFields([
          {
            name: "dateRange",
            errors: ["Ngày bắt đầu phải nhỏ hơn ngày kết thúc"],
          },
        ]);
        return;
      }

      // 2. Thời gian kết thúc không sau ít nhất 1 phút
      if (end.diff(start, "minute") < 1) {
        formProps.form?.setFields([
          {
            name: "dateRange",
            errors: [
              "Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 1 phút",
            ],
          },
        ]);
        return;
      }

      // 3. Nếu được chỉnh ngày bắt đầu, không cho phép chỉnh về quá khứ
      const isStartDateEditable = !(
        record?.voucherStatus === "active" ||
        dayjs(record?.startDate).isBefore(now, "minute")
      );
      if (isStartDateEditable && start.isBefore(now)) {
        formProps.form?.setFields([
          {
            name: "dateRange",
            errors: ["Ngày bắt đầu không được ở quá khứ"],
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

    if (voucherScope === "private") {
      payload.userIds = userIds;
      payload.quantity = userIds.length;
    } else {
      payload.userIds = [];
    }
    payload.voucherScope = voucherScope;

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
              pattern: /^[A-Z0-9]+$/,
              message:
                "Mã giảm giá chỉ chứa chữ in hoa và số (Không bao gồm khoảng trắng)",
            },

            {
              validator: async (_, value) => {
                if (!value || value.trim().length === 0) {
                  return Promise.resolve();
                }

                // Cho phép giữ nguyên nếu không thay đổi mã
                if (
                  value.trim().toLowerCase() ===
                  record?.code?.trim().toLowerCase()
                ) {
                  return Promise.resolve();
                }

                try {
                  const response = await axiosInstance(
                    `/vouchers?code=${value.trim()}&isDeleted=all`
                  );
                  const data = response?.data?.docs || [];

                  const duplicate = data.find(
                    (v: any) =>
                      v.code.trim().toLowerCase() ===
                        value.trim().toLowerCase() && v._id !== record?._id // Không phải chính voucher đang sửa
                  );

                  if (duplicate) {
                    if (duplicate.isDeleted) {
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

        <Form.Item label="Phạm vi voucher" required>
          <Select value={voucherScope} onChange={setVoucherScope}>
            <Select.Option value="shared">Công khai (cho tất cả)</Select.Option>
            <Select.Option value="private">
              Riêng tư (cho cá nhân)
            </Select.Option>
          </Select>
        </Form.Item>
        {voucherScope === "private" && (
          <Form.Item
            label="Danh sách người dùng"
            name={"userIds"}
            rules={[
              {
                required: voucherScope === "private", // ✅ ràng buộc chỉ khi riêng tư
                message: "Vui lòng chọn người dùng cho voucher riêng tư",
                type: "array", // 🟢 kiểu dữ liệu là mảng
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
                formProps.form?.setFieldsValue({ userIds: value });
              }}
              placeholder="Tìm kiếm theo tên hoặc email"
              style={{ width: "100%" }}
            />
            <div style={{ marginTop: 8 }}>
              {userIds.length > 0 && (
                <Tag color="blue">Số người dùng: {userIds.length}</Tag>
              )}
            </div>
          </Form.Item>
        )}

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
                const discountType =
                  formProps.form?.getFieldValue("discountType");
                const discountValue =
                  formProps.form?.getFieldValue("discountValue");

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

        {/* Số lượng chỉ nhập khi dùng chung */}
        {voucherScope === "shared" && (
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
              {
                validator: (_, value) => {
                  if (record?.voucherStatus === "active") {
                    if (typeof value === "number" && value < record.quantity) {
                      return Promise.reject(
                        new Error(
                          `Không thể giảm số lượng khi voucher đang hoạt động (hiện tại là ${record.quantity})`
                        )
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
              placeholder="Nhập số lượng voucher"
            />
          </Form.Item>
        )}

        {/* Nếu dùng riêng, hiển thị số lượng tự động */}
        {voucherScope === "private" && (
          <Form.Item label="Số lượng voucher">
            <InputNumber
              value={userIds.length}
              disabled
              style={{ width: "100%" }}
            />
          </Form.Item>
        )}

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
              record?.voucherStatus === "active" ||
                dayjs(record?.startDate).isBefore(dayjs(), "minute"), // disable startDate
              false, // endDate vẫn cho chỉnh
            ]}
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};

export default VoucherEdit;
