/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataProvider } from "@refinedev/core";
import axios from "axios";
import { TOKEN_KEY } from "./authProvider";

export const API_URL = "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Request interceptor để thêm token vào mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor để xử lý lỗi authentication
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,

  getList: async ({ resource, filters, pagination, sorters, meta }) => {
    let endpoint = `/${resource}`;
    const params: Record<string, any> = {};

    if (filters) {
      filters.forEach((filter) => {
        if (filter.operator === "contains" || filter.operator === "eq") {
          params[filter.field] = filter.value;
        }
      });
    }

    const resourcesWithSearchApi = [
      "attribute",
      "product",
      "category",
      "brand",
    ];
    if (resourcesWithSearchApi.includes(resource)) {
      endpoint += "/search";
    }

    const { data } = await axiosInstance.get(endpoint, { params });

    return {
      data,
      total: data.length,
    };
  },

  getOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.get(`/${resource}/id/${id}`);
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const { data } = await axiosInstance.patch(
      `/${resource}/edit/${id}`,
      variables
    );
    return { data };
  },

  create: async ({ resource, variables }) => {
    const { data } = await axiosInstance.post(`/${resource}/add`, variables);
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const { data } = await axiosInstance.delete(`/${resource}/delete/${id}`);
    return { data };
  },
};

export default dataProvider;
