import { apiClients } from './client';
import { ApiResponse, PageResponse } from '@/types';

// 数据采集任务类型
export interface DataCollectionTask {
  id: string;
  name: string;
  description?: string;
  dataSourceId: string;
  dataSourceName?: string;
  collectionType: 'manual' | 'scheduled' | 'real_time';
  schedule?: string; // cron表达式
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
  createdTime: string;
  createdBy: string;
  updatedTime?: string;
  
  // 采集配置
  config: {
    query?: string;
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
    fields?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  
  // 采集结果
  result?: {
    recordCount: number;
    fileSize: number;
    outputPath: string;
    outputFormat: string;
    downloadUrl?: string;
  };
}

// 数据采集任务创建请求
export interface DataCollectionTaskCreateRequest {
  name: string;
  description?: string;
  dataSourceId: string;
  collectionType: 'manual' | 'scheduled' | 'real_time';
  schedule?: string;
  config: {
    query?: string;
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
    fields?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

// 数据采集任务更新请求
export interface DataCollectionTaskUpdateRequest {
  name?: string;
  description?: string;
  collectionType?: 'manual' | 'scheduled' | 'real_time';
  schedule?: string;
  config?: {
    query?: string;
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
    fields?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

// 数据采集任务查询请求
export interface DataCollectionTaskQueryRequest {
  name?: string;
  dataSourceId?: string;
  collectionType?: 'manual' | 'scheduled' | 'real_time';
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  createdBy?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  size?: number;
}

// 数据采集统计信息
export interface DataCollectionStats {
  totalTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalRecordsCollected: number;
  totalFileSize: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  recentTasks: DataCollectionTask[];
}

// 数据采集预览
export interface DataCollectionPreview {
  dataSourceId: string;
  dataSourceName: string;
  estimatedRecords: number;
  estimatedSize: number;
  sampleData: any[];
  fieldInfo: Array<{
    name: string;
    type: string;
    nullCount: number;
    uniqueCount: number;
    sampleValues: any[];
  }>;
  availableFields: string[];
}

// 数据采集API
export const dataCollectionApi = {
  // 获取数据采集任务列表
  getTasks: (params?: DataCollectionTaskQueryRequest): Promise<ApiResponse<PageResponse<DataCollectionTask>>> =>
    apiClients.collect.get('/tasks', { params }),

  // 获取数据采集任务详情
  getTask: (id: string): Promise<ApiResponse<DataCollectionTask>> =>
    apiClients.collect.get(`/tasks/${id}`),

  // 创建数据采集任务
  createTask: (data: DataCollectionTaskCreateRequest): Promise<ApiResponse<DataCollectionTask>> =>
    apiClients.collect.post('/tasks', data),

  // 更新数据采集任务
  updateTask: (id: string, data: DataCollectionTaskUpdateRequest): Promise<ApiResponse<DataCollectionTask>> =>
    apiClients.collect.put(`/tasks/${id}`, data),

  // 删除数据采集任务
  deleteTask: (id: string): Promise<ApiResponse<void>> =>
    apiClients.collect.delete(`/tasks/${id}`),

  // 启动数据采集任务
  startTask: (id: string): Promise<ApiResponse<void>> =>
    apiClients.collect.post(`/tasks/${id}/start`),

  // 停止数据采集任务
  stopTask: (id: string): Promise<ApiResponse<void>> =>
    apiClients.collect.post(`/tasks/${id}/stop`),

  // 获取数据采集统计信息
  getStats: (): Promise<ApiResponse<DataCollectionStats>> =>
    apiClients.collect.get('/stats'),

  // 获取数据采集预览
  getPreview: (dataSourceId: string, config?: any): Promise<ApiResponse<DataCollectionPreview>> =>
    apiClients.collect.post('/preview', { dataSourceId, config }),

  // 下载采集结果
  downloadResult: (taskId: string): Promise<ApiResponse<{ downloadUrl: string }>> =>
    apiClients.collect.get(`/tasks/${taskId}/download`),

  // 获取采集日志
  getLogs: (taskId: string): Promise<ApiResponse<Array<{
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    details?: any;
  }>>> =>
    apiClients.collect.get(`/tasks/${taskId}/logs`),
};

export default dataCollectionApi; 