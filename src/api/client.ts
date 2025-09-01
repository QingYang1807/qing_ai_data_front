import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';
import { MODULE_PORTS, getModuleUrl, getModuleApiConfig } from '@/config/ports';

// 创建不同模块的API客户端
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  client.interceptors.request.use(
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
  client.interceptors.response.use(
    (response: AxiosResponse<any>) => {
      const { data } = response;
      
      // 检查是否是标准的Spring Boot响应格式
      if (data && typeof data === 'object') {
        // 如果后端返回的是 { code: 200, message: "xxx", data: {...} } 格式
        if (data.code !== undefined) {
          if (data.code === 200) {
            return response;
          } else {
            // 处理业务错误
            const error = new Error(data.message || '请求失败');
            return Promise.reject(error);
          }
        } else {
          // 如果后端直接返回数据，直接通过
          return response;
        }
      }
      
      // 其他情况直接返回
      return response;
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

  return client;
};

// 动态创建模块API客户端
const createModuleApiClient = (port: number): AxiosInstance => {
  const baseURL = getModuleUrl(port as any);
  return createApiClient(baseURL);
};

// 各模块API客户端实例
export const apiClients = {
  // 数据源API客户端 (端口: 9102)
  datasource: createModuleApiClient(MODULE_PORTS.DATASOURCE),
  
  // 数据集API客户端 (端口: 9101)
  dataset: createModuleApiClient(MODULE_PORTS.DATASET),
  
  // 数据采集API客户端 (端口: 9103)
  collect: createModuleApiClient(MODULE_PORTS.COLLECT),
  
  // 数据处理API客户端 (端口: 9104)
  process: createModuleApiClient(MODULE_PORTS.PROCESS),
  
  // 数据标注API客户端 (端口: 9105)
  annotation: createModuleApiClient(MODULE_PORTS.ANNOTATION),
  
  // 数据增强API客户端 (端口: 9106)
  augment: createModuleApiClient(MODULE_PORTS.AUGMENT),
  
  // 数据合成API客户端 (端口: 9107)
  synthesis: createModuleApiClient(MODULE_PORTS.SYNTHESIS),
  
  // 数据质量API客户端 (端口: 9108)
  quality: createModuleApiClient(MODULE_PORTS.QUALITY),
  
  // 数据评估API客户端 (端口: 9109)
  evaluation: createModuleApiClient(MODULE_PORTS.EVALUATION),
  
  // 数据安全API客户端 (端口: 9110)
  security: createModuleApiClient(MODULE_PORTS.SECURITY),
  
  // 数据操作API客户端 (端口: 9111)
  operation: createModuleApiClient(MODULE_PORTS.OPERATION),
  
  // 数据导出API客户端 (端口: 9112)
  export: createModuleApiClient(MODULE_PORTS.EXPORT),
  
  // 系统管理API客户端 (端口: 9113)
  system: createModuleApiClient(MODULE_PORTS.SYSTEM),
  
  // 网关API客户端 (端口: 9114)
  gateway: createModuleApiClient(MODULE_PORTS.GATEWAY),
};

// 兼容性导出 (保持向后兼容)
export const datasourceApiClient = apiClients.datasource;
export const datasetApiClient = apiClients.dataset;

// 默认API客户端 (兼容旧代码)
const apiClient: AxiosInstance = datasourceApiClient;

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

// 获取指定模块的API客户端
export function getApiClient(moduleName: keyof typeof apiClients): AxiosInstance {
  return apiClients[moduleName];
}

// 获取模块配置信息
export function getModuleInfo(moduleName: keyof typeof apiClients) {
  const port = MODULE_PORTS[moduleName.toUpperCase() as keyof typeof MODULE_PORTS];
  return getModuleApiConfig(port as any);
}

export default apiClient; 