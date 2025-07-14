import { datasourceApiClient } from './client';
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
    datasourceApiClient.get<PageResponse<DataSource>>('/datasources', { params }).then((res: any) => res.data),

  // 获取数据源详情
  getById: (id: string) => 
    datasourceApiClient.get<DataSource>(`/datasources/${id}`).then((res: any) => res.data),

  // 创建数据源
  create: (data: DataSourceCreateRequest) => 
    datasourceApiClient.post<DataSource>('/datasources', data).then((res: any) => res.data),

  // 更新数据源
  update: (id: string, data: DataSourceUpdateRequest) => 
    datasourceApiClient.put<DataSource>(`/datasources/${id}`, data).then((res: any) => res.data),

  // 删除数据源
  delete: (id: string) => 
    datasourceApiClient.delete(`/datasources/${id}`).then((res: any) => res.data),

  // 测试数据源连接
  testConnection: (id: string) => 
    datasourceApiClient.post<{ success: boolean; message: string }>(`/datasources/${id}/test`).then((res: any) => res.data),

  // 启用数据源
  enable: (id: string) => 
    datasourceApiClient.patch(`/datasources/${id}/enable`).then((res: any) => res.data),

  // 禁用数据源
  disable: (id: string) => 
    datasourceApiClient.patch(`/datasources/${id}/disable`).then((res: any) => res.data),

  // 获取数据源统计信息
  getStats: () => 
    datasourceApiClient.get<{
      total: number;
      active: number;
      inactive: number;
      error: number;
    }>('/datasources/stats').then((res: any) => res.data),
}; 