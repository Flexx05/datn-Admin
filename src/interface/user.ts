export interface IUser {
  _id: string | number;
  fullName: string;
  avatar?: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  isActive: boolean;
  isVerify: boolean;
  createdAt: string;
  updatedAt: string;
}
