import { DataProvider } from "@refinedev/core";
import axios from "axios";

const API_URL = "http://localhost:8080/api";

const dataProvider: DataProvider = {
  getApiUrl: () => API_URL,
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const { data } = await axios.get(`${API_URL}/${resource}`);
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
      `${API_URL}/${resource}/${id}`,
      variables
    );
    return { data };
  },
  create: async ({ resource, variables }) => {
    const { data } = await axios.post(`${API_URL}/${resource}`, variables);
    return { data };
  },
  deleteOne: async ({ resource, id }) => {
    const { data } = await axios.delete(`${API_URL}/${resource}/${id}`);
    return { data };
  },
};
export default dataProvider;
