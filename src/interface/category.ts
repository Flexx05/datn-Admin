export interface ICategory {
  _id: string | number;
  name: string;
  description: string;
  parentId: string | number;
  subCategories: ICategory[];
  categorySort: number;
  isActive: boolean;
}
