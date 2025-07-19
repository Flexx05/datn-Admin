export interface IProductStats {
  id: string;
  name: string;
  image: string | null;
  category: string | null;
  brand: string | null;
  quantity: number;
  revenue: number;
  unitPrice: number;
  orderCount: number;
  soldPercentage: number;
  price: number;
  totalStock: number;
}

export interface IStatisticsData {
  docs: IProductStats[];
  totalDocs: number;
  totalQuantity: number;
  totalRevenue: number;
  totalOrderCount: number;
  page: number;
  limit: number;
  totalPages: number;
  allDocs?: IProductStats[];
}
