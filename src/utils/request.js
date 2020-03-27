import axios from "axios";
import { message } from "antd";

message.config({
  // 自动关闭延时
  duration: 3,
  // 最大显示数
  maxCount: 1
});

const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "http://192.168.253.253/:8000";

const service = axios.create({
  baseURL,
  timeout: 8000
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    console.log(error);
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => response,
  error => {
    message.error(`error: ${error.message}, please check you network server`);
    return Promise.reject(error);
  }
);

export default service;
