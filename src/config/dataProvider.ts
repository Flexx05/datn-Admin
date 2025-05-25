/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataProvider } from "@refinedev/core";
import axios from "axios";

export const API_URL = "http://localhost:8080/api";

const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,
  getList: async ({ resource, filters, pagination, sorters, meta }) => {
    let endpoint = `${API_URL}/${resource}`;
    const params: Record<string, any> = {};

    // Nếu resource hỗ trợ tìm kiếm (ví dụ: "attribute", "product"...)
    const resourcesWithSearchApi = [
      "attribute",
      "product",
      "category",
      "brand",
    ];
    if (resourcesWithSearchApi.includes(resource)) {
      endpoint += "/search";
    }
    endpoint += "";
    const { data } = await axios.get(endpoint, { params });

    return {
      data,
      total: data.length,
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
