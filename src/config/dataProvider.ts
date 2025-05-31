/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataProvider } from "@refinedev/core";
import axios from "axios";

export const API_URL = "http://localhost:8080/api";

const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,
  getList: async ({ resource, filters, pagination, sorters, meta }) => {
    let endpoint = `${API_URL}/${resource}`;
    const params: Record<string, any> = {};
    
// Lấy các filter từ frontend và gán vào params để gửi lên backend API.
// Mỗi filter sẽ được truyền thành một query param tương ứng
    if (filters && Array.isArray(filters)) {
      filters.forEach((filter) => {
        if ("field" in filter && filter.value) {
          if (filter.field === "productName") {
            params.productName = filter.value;
          }
          if (filter.field === "userName") {
            params.userName = filter.value;
          }
          if (filter.field === "status") {
            params.status = filter.value;
          }
          if (filter.field === "rating") {
            params.rating = filter.value;
          }
          if (filter.field === "startDate") {
            params.startDate = filter.value;
          }
          if (filter.field === "endDate") {
            params.endDate = filter.value;
          }
        }
      });
    }

    // Nếu resource hỗ trợ tìm kiếm (ví dụ: "attribute", "product"...)
    const resourcesWithSearchApi = ["attribute", "product", "category"];
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
    let url = "";
    if (resource === "comments/reply") {
        url = `${API_URL}/comments/reply/${id}`;
    } else {
        url = `${API_URL}/${resource}/edit/${id}`;
    }
    const { data } = await axios.patch(url, variables);
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
