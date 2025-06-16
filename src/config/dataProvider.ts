/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataProvider } from "@refinedev/core";
import axios from "axios";

export const API_URL = "http://localhost:8080/api";

// Tạo instance axios với config mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,
  getList: async ({ resource, filters, pagination, sorters, meta }) => {
    let endpoint = `${API_URL}/${resource}`;
    const params: Record<string, any> = {};
    
    
    if (filters) {
      filters.forEach((filter) => {
        // filter.field là tên trường, filter.value là giá trị tìm kiếm
        if (filter.operator === "contains") {
          params[filter.field] = filter.value;
        } else if (filter.operator === "eq") {
          params[filter.field] = filter.value;
        }
        // Thêm các operator khác nếu cần
      });
    }

    // Nếu resource hỗ trợ tìm kiếm (ví dụ: "attribute", "product"...)
    const resourcesWithSearchApi = ["attribute", "product", "category"];
    if (resourcesWithSearchApi.includes(resource)) {
      endpoint += "/search";
    }
    endpoint += "";
    const { data } = await axiosInstance.get(endpoint, { params });
  
    // Trả về data theo cấu trúc mà useTable cần
    return {
     data,
      total: data.length, 
    };
  },

  getOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.get(`${API_URL}/${resource}/id/${id}`);
    return { data };
  },
  update: async ({ resource, id, variables }) => {
    let url = "";
    if (resource === "comments/reply") {
        url = `${API_URL}/comments/reply/${id}`;
    } else {
        url = `${API_URL}/${resource}/edit/${id}`;
    }
    const { data } = await axiosInstance.patch(url, variables);
    return { data };
  },
  create: async ({ resource, variables }) => {
    const { data } = await axiosInstance.post(`${API_URL}/${resource}/add`, variables);
    return { data };
  },
  deleteOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.delete(`${API_URL}/${resource}/delete/${id}`);
    return { data };
  },
};
export default dataProvider;
