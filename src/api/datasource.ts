import { request } from './client';
import { 
  DataSource, 
  DataSourceCreateRequest, 
  DataSourceUpdateRequest, 
  DataSourceQueryRequest,
  PageResponse 
} from '@/types';

// 数据源API接口
export const datasourceApi = {
  // 获取数据源列表
  getList: (params?: DataSourceQueryRequest) => 
    request.get<PageResponse<DataSource>>('/datasources', { params }),

  // 获取数据源详情
  getById: (id: string) => 
    request.get<DataSource>(`/datasources/${id}`),

  // 创建数据源
  create: (data: DataSourceCreateRequest) => 
    request.post<DataSource>('/datasources', data),

  // 更新数据源
  update: (id: string, data: DataSourceUpdateRequest) => 
    request.put<DataSource>(`/datasources/${id}`, data),

  // 删除数据源
  delete: (id: string) => 
    request.delete(`/datasources/${id}`),

  // 测试数据源连接
  testConnection: (id: string) => 
    request.post<{ success: boolean; message: string }>(`/datasources/${id}/test`),

  // 启用数据源
  enable: (id: string) => 
    request.patch(`/datasources/${id}/enable`),

  // 禁用数据源
  disable: (id: string) => 
    request.patch(`/datasources/${id}/disable`),

  // 获取数据源统计信息
  getStats: () => 
    request.get<{
      total: number;
      active: number;
      inactive: number;
      error: number;
    }>('/datasources/stats'),
}; 