export interface IVoucher {
    _id: string; 
    voucherType: 'product' | 'shipping';
    code: string;
    link: string;
    description: string;
    discountType: 'fixed' | 'percent';
    discountValue: number;
    minOrderValues: number;
    maxDiscount: number;
    quantity: number;
    used: number;
    startDate: Date; 
    endDate: Date; 
    voucherStatus: 'active' | 'inactive' | 'expired';
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}