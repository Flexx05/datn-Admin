export interface IUser {
  _id: string | number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: string;
}
