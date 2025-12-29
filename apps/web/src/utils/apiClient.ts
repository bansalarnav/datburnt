import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});
