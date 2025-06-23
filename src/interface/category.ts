export interface ICategory {
  _id: string | number;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | number;
  subCategories?: ICategory[];
  isActive: boolean;
  countProduct?: number;
  createdAt: string;
  updatedAt: string;
}
