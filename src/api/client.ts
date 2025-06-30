import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: (process.env as any).NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9102/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: any) => {
    // 从本地存储获取token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    
    // 如果是业务成功响应
    if (data.code === 200) {
      return response;
    }
    
    // 处理业务错误
    const error = new Error(data.message || '请求失败');
    return Promise.reject(error);
  },
  (error: any) => {
    // 处理HTTP错误
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('权限不足');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error('请求失败:', data?.message || error.message);
      }
    } else if (error.request) {
      console.error('网络连接失败');
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 通用API请求方法
export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.get(url, config).then((res: any) => res.data),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.post(url, data, config).then((res: any) => res.data),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.put(url, data, config).then((res: any) => res.data),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.delete(url, config).then((res: any) => res.data),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data, config).then((res: any) => res.data),
};

export default apiClient; 