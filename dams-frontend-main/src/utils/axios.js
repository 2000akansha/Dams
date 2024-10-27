import axios from "axios";
import Cookies from "js-cookie";

export const BASE_URL = "https://innobles.com:1002";

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1/webUser/`,
  // baseURL: "http://localhost:4000/api/v1/webUser/",
});

apiClient.interceptors.request.use(
  (config) => {
    if (!config.headers["skipAuth"]) {
      const token = Cookies.get("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } else {
      delete config.headers["skipAuth"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
