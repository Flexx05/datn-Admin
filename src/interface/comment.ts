export interface IComment {
    _id: number | string;
    productId: string;
    userId: string;
    content: string;
    rating: number;
    createdAt: string;
    status: "visible" | "hidden";
    replyContent: string;
    replyAt: string | null;
}