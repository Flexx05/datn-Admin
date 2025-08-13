export interface IVoucher {
  _id: string;
  voucherType: "product" | "shipping";
  code: string;
  description: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  minOrderValues: number;
  maxDiscount: number;
  quantity: number;
  used: number;
  startDate: Date;
  endDate: Date;
  voucherStatus: "active" | "inactive" | "expired";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  userIds?: string[]; // Thêm trường này để hỗ trợ voucher dùng riêng
  isAuto: boolean; // Thêm trường này để đánh dấu voucher tự động
}
