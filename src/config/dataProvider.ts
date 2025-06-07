/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataProvider } from "@refinedev/core";
import axios from "axios";

export const API_URL = "http://localhost:8080/api";

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

    const { data } = await axios.get(`${API_URL}/${resource}`, { params });

    return {
      data: data.docs || data,
      total: data.length || data.totalDocs || 0,
    };
  },

  getOne: async ({ resource, id }) => {
    const { data } = await axios.get(`${API_URL}/${resource}/id/${id}`);
    return { data };
  },
  update: async ({ resource, id, variables }) => {
    const { data } = await axios.patch(
      `${API_URL}/${resource}/edit/${id}`,
      variables
    );
    return { data };
  },
  create: async ({ resource, variables }) => {
    const { data } = await axios.post(`${API_URL}/${resource}/add`, variables);
    return { data };
  },
  deleteOne: async ({ resource, id }) => {
    const { data } = await axios.delete(`${API_URL}/${resource}/delete/${id}`);
    return { data };
  },
};
export default dataProvider;
