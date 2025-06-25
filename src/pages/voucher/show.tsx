import React from "react";
import { useShow } from "@refinedev/core";
import { Descriptions, Tag, Spin, Typography, Divider } from "antd";
import { IVoucher } from "../../interface/voucher";
import { Show } from "@refinedev/antd";

const { Title } = Typography;

const VoucherShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const voucher = data?.data?.data;

  if (isLoading) return <Spin tip="Đang tải chi tiết voucher..." style={{ marginTop: 40 }} />;
  
  return (
    <Show>
      <Title level={4} >
        Chi tiết Voucher
      </Title>
      <Divider />
      <Descriptions   bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, width: "250px" }}
        contentStyle={{ whiteSpace: "pre-wrap" }}>

        <Descriptions.Item label="Mã giảm giá">
          <strong>{voucher?.code}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Link áp dụng">
          <a href={voucher?.link} target="_blank" rel="noopener noreferrer">{voucher?.link}</a>
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả">
          {voucher?.description}
        </Descriptions.Item>
        <Descriptions.Item label="Loại voucher">
          {voucher?.voucherType === "product" && <Tag color="purple">Dành cho sản phẩm</Tag>}
          {voucher?.voucherType === "shipping" && <Tag color="blue">Dành cho phí vận chuyển</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Kiểu giảm giá">
          {voucher?.discountType === "fixed" ? "Giảm cố định" : "Giảm phần trăm"}
        </Descriptions.Item>
        <Descriptions.Item label="Giá trị giảm">
          {voucher?.discountValue?.toLocaleString()}đ
        </Descriptions.Item>
        <Descriptions.Item label="Đơn tối thiểu">
          {voucher?.minOrderValues?.toLocaleString()}đ
        </Descriptions.Item>
        <Descriptions.Item label="Giảm tối đa">
          {voucher?.maxDiscount?.toLocaleString()}đ
        </Descriptions.Item>
        <Descriptions.Item label="Số lượng tổng cộng">
          {voucher?.quantity}
        </Descriptions.Item>
        <Descriptions.Item label="Đã sử dụng">
          {voucher?.used}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {voucher?.voucherStatus === "active" && <Tag color="green">Có hiệu lực</Tag>}
          {voucher?.voucherStatus === "inactive" && <Tag color="yellow">Không có hiệu lực</Tag>}
          {voucher?.voucherStatus === "expired" && <Tag color="red">Hết hạn</Tag>}
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
