export interface INotification {
  _id: string;
  type: number;
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
}
