export interface IUser {
  _id: string | number;
  fullName: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: string;
}
