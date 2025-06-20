export interface IProduct {
  _id: string | number;
  name: string;
  image: string[];
  brandId: string | number;
  brandName: string;
  categoryId: string | number;
  categoryName: string;
  description: string;
  variation: IVariation[];
  attributes: IProductAttribute[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IVariation {
  _id: string | number;
  attributes: IProductAttribute[];
  regularPrice: number;
  salePrice: number;
  saleForm: string;
  saleTo: string;
  stock: number;
  image: string;
  isActive: boolean;
}

export interface IProductAttribute {
  attributeId: number | string;
  attributeName: string;
  isColor: boolean;
  values: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
