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
  
}

export interface IStatisticsData {
  docs: IProductStats[];
  totalDocs: number;
  totalRevenue: number;
  totalQuantity: number;
  limit: number;
  page: number;
  totalPages: number;
}
