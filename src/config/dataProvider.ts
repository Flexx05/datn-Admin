/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataProvider } from "@refinedev/core";
import axios from "axios";

export const API_URL = "http://localhost:8080/api";
export const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/dtwm0rpqg/image/upload";

const axiosInstance = axios.create();

// Thêm interceptor để tự động thêm token vào mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,

  getList: async ({ resource, filters, pagination, sorters, meta }) => {
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

    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      params._sort = sorter.field;
      params._order = sorter.order;
    } else {
      // Nếu không có, dùng mặc định
      params._sort = "createdAt";
      params._order = "desc";
    }

    if (pagination) {
      params._page = pagination.current || 1;
      params._limit = pagination.pageSize || 10;
    }

    const { data } = await axiosInstance.get(`${API_URL}/${resource}`, {
      params,
    });

    return {
      data: data.docs || data,
      total: data.length || data.totalDocs || 0,
    };
  },

  getOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.get(`${API_URL}/${resource}/id/${id}`);
    return { data };
  },
  update: async ({ resource, id, variables }) => {
    const { data } = await axiosInstance.patch(
      `${API_URL}/${resource}/edit/${id}`,
      variables
    );
    return { data };
  },
  create: async ({ resource, variables }) => {
    const { data } = await axiosInstance.post(
      `${API_URL}/${resource}/add`,
      variables
    );
    return { data };
  },
  deleteOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.delete(
      `${API_URL}/${resource}/delete/${id}`
    );
    return { data };
  },
};
export default dataProvider;
