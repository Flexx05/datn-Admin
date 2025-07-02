/* eslint-disable @typescript-eslint/no-explicit-any */

export type OrderStatus =
  | "Cho xac nhan"
  | "Da xac nhan"
  | "Dang giao hang"
  | "Da giao hang"
  | "Da huy";

type PaymentMethod = "COD" | "VNPAY";

export interface IOrder {
  _id: string;
  orderCode: string; // Đổi từ orderNumber
  userId: string;
  voucherId: string[];
  items: {
    variationId: string;
    productName: string;
    quantity: number;
    priceAtOrder: number;
    totalPrice: number;
    variantAttributes: any[];
  }[];
  shippingAddress: {
    country: string;
    city: string;
    address: string;
  };
  shippingFee: number;
  discountAmount: number;
  status: OrderStatus;
  paymentStatus:
    | "Chua thanh toan"
    | "Da thanh toan"
    | "That bai"
    | "Da hoan tien"; // Cập nhật theo API
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  totalAmount: number;
}

// Interface cho địa chỉ giao hàng
interface IShippingAddress {
  country: string;
  city: string;
  address: string;
}

// Interface cho sản phẩm trong đơn hàng
interface IOrderItem {
  _id: string;
  variationId: string;
  productName: string;
  quantity: number;
  priceAtOrder: number;
  totalPrice: number;
  variantAttributes: any[];
}
// Interface chính cho đơn hàng
export interface IOrderDetail {
  _id: string;
  userId: string;
  orderCode: string;
  voucherId: string[];
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: PaymentMethod;
  expectedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: IShippingAddress;
}
