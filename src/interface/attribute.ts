export interface IAttribute {
  _id: number | string;
  name: string;
  slug: string;
  isColor: boolean;
  values: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
