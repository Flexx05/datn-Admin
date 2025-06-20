export interface IComment {
    _id: string | number;
    productId: string | number;
    variationId?: string | number;
    userId: string | number;
    orderId: string | number;
    content: string;
    images: string[];
    rating: number;
    status: "visible" | "hidden";
    adminReply: string;
    replyAt: string | null;
    createdAt: string;
    updatedAt: string;
}