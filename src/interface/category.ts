export interface ICategory {
  _id: string | number;
  name: string;
  slug: string;
  description: string;
  parentId: string | number;
  subCategories: ICategory[];
  categorySort: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
