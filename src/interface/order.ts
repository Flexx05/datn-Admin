export interface IOrderDetail {
    orderCode: string;
    createdAt: string;
    expectedDeliveryDate: string | null;
    items: Array<{
        productName: string;
        variantAttributes: Array<{
            attributeName: string;
            values: Array<string>;
        }>;
        priceAtOrder: number;
        quantity: number;
        totalPrice: number;
    }>;
}
export interface IOrder{
    orderData: IOrderDetail;
}


export interface Order {
  _id: string;
  completedBy: string | null;
  createdAt: string;
  deliveryDate: string | null;
  discountAmount: number;
  expectedDeliveryDate: string;
  items: OrderItem[];
  note: string | null;
  orderCode: string;
  paymentMethod: string;
  paymentStatus: number;
  recipientInfo: RecipientInfo;
  returnRequest: ReturnRequest;
  shippingAddress: string;
  shippingFee: number;
  status: number;
  subtotal: number;
  totalAmount: number;
  updatedAt: string;
  userId: string;
  voucherId: string[];
}

export interface OrderItem {
  _id: string;
  priceAtOrder: number;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  variationId: string;
  variantId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  regularPrice: number;
  salePrice: number;
  cartItemId?: string;
}

interface RecipientInfo {
  email: string;
  name: string;
  phone: string;
}

interface ReturnRequest {
  adminNote: string | null;
  clientReason: string | null;
  refundMethod: string | null;
  returnStatus: string;
}
  

