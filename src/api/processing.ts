import { apiClients } from './client';
import { ApiResponse, PageResponse, DataProcessingTask, ProcessingConfig, ProcessingType, ProcessingStatus, OutputFormat } from '@/types';

// 数据处理任务创建请求
export interface ProcessingTaskCreateRequest {
  name: string;
  description?: string;
  datasetId: string;
  processingType: ProcessingType;
  config: ProcessingConfig;
  outputFormat: OutputFormat;
}

// 数据处理任务更新请求
export interface ProcessingTaskUpdateRequest {
  name?: string;
  description?: string;
  processingType?: ProcessingType;
  config?: ProcessingConfig;
  outputFormat?: OutputFormat;
}

// 数据处理任务查询请求
export interface ProcessingTaskQueryRequest {
  name?: string;
  datasetId?: string;
  processingType?: ProcessingType;
  status?: ProcessingStatus;
  createdBy?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  size?: number;
}

// 数据处理预览请求
export interface ProcessingPreviewRequest {
  datasetId: string;
  processingType: ProcessingType;
  config: ProcessingConfig;
  outputFormat: OutputFormat;
}

// 数据处理API
export const processingApi = {
  // 获取数据处理任务列表
  getTasks: (params?: ProcessingTaskQueryRequest): Promise<ApiResponse<PageResponse<DataProcessingTask>>> =>
    apiClients.process.get('/tasks', { params }),

  // 获取数据处理任务详情
  getTask: (id: string): Promise<ApiResponse<DataProcessingTask>> =>
    apiClients.process.get(`/tasks/${id}`),

  // 创建数据处理任务
  createTask: (data: ProcessingTaskCreateRequest): Promise<ApiResponse<DataProcessingTask>> =>
    apiClients.process.post('/tasks', data),

  // 更新数据处理任务
  updateTask: (id: string, data: ProcessingTaskUpdateRequest): Promise<ApiResponse<DataProcessingTask>> =>
    apiClients.process.put(`/tasks/${id}`, data),

  // 删除数据处理任务
  deleteTask: (id: string): Promise<ApiResponse<void>> =>
    apiClients.process.delete(`/tasks/${id}`),

  // 启动数据处理任务
  startTask: (id: string): Promise<ApiResponse<void>> =>
    apiClients.process.post(`/tasks/${id}/start`),

  // 停止数据处理任务
  stopTask: (id: string): Promise<ApiResponse<void>> =>
    apiClients.process.post(`/tasks/${id}/stop`),

  // 获取处理预览
  getPreview: (data: ProcessingPreviewRequest): Promise<ApiResponse<any>> =>
    apiClients.process.post('/preview', data),

  // 获取处理结果
  getResult: (taskId: string): Promise<ApiResponse<any>> =>
    apiClients.process.get(`/tasks/${taskId}/result`),

  // 下载处理结果
  downloadResult: (taskId: string): Promise<ApiResponse<{ downloadUrl: string }>> =>
    apiClients.process.get(`/tasks/${taskId}/download`),

  // 获取处理日志
  getLogs: (taskId: string): Promise<ApiResponse<Array<{
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    details?: any;
  }>>> =>
    apiClients.process.get(`/tasks/${taskId}/logs`),

  // 获取处理统计
  getStats: (): Promise<ApiResponse<any>> =>
    apiClients.process.get('/stats'),

  // 获取处理模板
  getTemplates: (): Promise<ApiResponse<any[]>> =>
    apiClients.process.get('/templates'),

  // 获取处理工作流
  getWorkflows: (): Promise<ApiResponse<any[]>> =>
    apiClients.process.get('/workflows'),
};

export default processingApi; 