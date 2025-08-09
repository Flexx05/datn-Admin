import React, { useEffect, useState } from "react";
import { useShow } from "@refinedev/core";
import { Descriptions, Tag, Spin, Typography, Divider } from "antd";
import { Show } from "@refinedev/antd";
import { axiosInstance } from "../../utils/axiosInstance";

const { Title, Text } = Typography;

const VoucherShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const voucher = data?.data?.data;

  const [userList, setUserList] = useState<any[]>([]);

  useEffect(() => {
    if (voucher?.userIds && voucher.userIds.length > 0) {
      axiosInstance
        .get("/admin/users?isActive=true")
        .then((res) => {
          const allUsers = res.data?.docs || res.data || [];
          const voucherUserIds = voucher.userIds.map((id: any) =>
            id.toString()
          );
          const selectedUsers = allUsers.filter((u: any) =>
            voucherUserIds.includes(u._id)
          );

          setUserList(selectedUsers);
        })
        .catch(() => setUserList([]));
    } else {
      setUserList([]);
    }
  }, [voucher?.userIds]);

  if (isLoading)
    return (
      <Spin tip="Đang tải chi tiết voucher..." style={{ marginTop: 40 }} />
    );

  return (
    <Show>
      <Title level={4}>Chi tiết Voucher</Title>
      <Divider />
      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, width: "250px" }}
        contentStyle={{ whiteSpace: "pre-wrap" }}
      >
        <Descriptions.Item label="Mã giảm giá">
          <strong>{voucher?.code}</strong>
        </Descriptions.Item>

        <Descriptions.Item label="Người dùng áp dụng">
          {userList.length > 0 ? (
            userList.map((u) => {
              const label =
                (u.fullName || "").trim() || (u.email || "").trim()
                  ? `${u.fullName || u.email} (${u.email || "no-email"})`
                  : u._id;
              return (
                <Tag color="orange" key={u._id}>
                  {label}
                </Tag>
              );
            })
          ) : voucher?.userIds?.length > 0 ? (
            voucher.userIds.map((id: any) => (
              <Tag color="orange" key={id}>
                {id}
              </Tag>
            ))
          ) : (
            <i style={{ color: "gray" }}>Không có người dùng cụ thể</i>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Mô tả">
          {voucher?.description}
        </Descriptions.Item>

        <Descriptions.Item label="Loại voucher">
          {voucher?.voucherType === "product" && (
            <Tag color="purple">Dành cho sản phẩm</Tag>
          )}
          {voucher?.voucherType === "shipping" && (
            <Tag color="blue">Dành cho phí vận chuyển</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Kiểu giảm giá">
          {voucher?.discountType === "fixed" && (
            <Tag color="geekblue">Giảm cố định</Tag>
          )}
          {voucher?.discountType === "percent" && (
            <Tag color="volcano">Giảm phần trăm</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Giá trị giảm">
          {voucher?.discountType === "fixed"
            ? `${voucher?.discountValue?.toLocaleString()}đ`
            : voucher?.discountType === "percent"
            ? `${voucher?.discountValue}%`
            : ""}
        </Descriptions.Item>

        <Descriptions.Item label="Đơn tối thiểu">
          {voucher?.minOrderValues?.toLocaleString()}đ
        </Descriptions.Item>

        {voucher?.discountType === "percent" && (
          <Descriptions.Item label="Giảm tối đa">
            {voucher?.maxDiscount?.toLocaleString()}đ
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Số lượng tổng cộng">
          {voucher?.quantity}
        </Descriptions.Item>

        <Descriptions.Item label="Đã sử dụng">
          {voucher?.used}
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          {voucher?.voucherStatus === "active" && (
            <Tag color="green">Có hiệu lực</Tag>
          )}
          {voucher?.voucherStatus === "inactive" && (
            <Tag color="yellow">Không có hiệu lực</Tag>
          )}
          {voucher?.voucherStatus === "expired" && (
            <Tag color="red">Hết hạn</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày bắt đầu">
          {voucher?.startDate && new Date(voucher.startDate).toLocaleString()}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày kết thúc">
          {voucher?.endDate && new Date(voucher.endDate).toLocaleString()}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tạo">
          {voucher?.createdAt && new Date(voucher.createdAt).toLocaleString()}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày cập nhật">
          {voucher?.updatedAt && new Date(voucher.updatedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    </Show>
  );
};

export default VoucherShow;
