export interface IUser {
  _id: string | number;
  fullName: string;
  avatar?: string;
  email: string;
  phone?: string;
  address?: string;
  countOrderNotSuccess: number;
  role: string;
  isActive: boolean;
  isVerify: boolean;
  createdAt: string;
  updatedAt: string;
}
