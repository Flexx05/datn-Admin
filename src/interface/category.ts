export interface ICategory {
  _id: string | number;
  name: string;
  description: string;
  parentId: string | number;
  categorySort: number;
  isActive: boolean;
}
