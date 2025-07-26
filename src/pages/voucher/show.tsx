import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Descriptions, Spin, Tag } from "antd";
import Loader from "../../utils/loading";

const VoucherShow = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const voucher = data?.data?.data;

  return (
    <Show title="Chi tiết voucher" canDelete={false} isLoading={false}>
      <Spin spinning={isLoading} indicator={<Loader />}>
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

          <Descriptions.Item label="Link áp dụng">
            {voucher?.link && voucher.link.trim() !== "" ? (
              <a href={voucher.link} target="_blank" rel="noopener noreferrer">
                {voucher.link}
              </a>
            ) : (
              <i style={{ color: "gray" }}>Không có link áp dụng</i>
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
      </Spin>
    </Show>
  );
};

export default VoucherShow;
