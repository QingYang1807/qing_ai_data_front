import { apiClients } from './client';
import { 
  DataProcessingTask, 
  ProcessingConfig, 
  ProcessingPreview, 
  ProcessingResult, 
  ProcessingStats, 
  ProcessingTemplate, 
  ProcessingHistory,
  ProcessingType,
  OutputFormat,
  KnowledgeBaseFormat,
  TrainingFormat
} from '@/types';

// 获取数据处理API客户端
const client = apiClients.process;

// 数据处理任务API
export const processingApi = {
  // 创建数据处理任务
  createTask: (task: {
    name: string;
    description?: string;
    datasetId: string;
    processingType: ProcessingType;
    config: ProcessingConfig;
  }) => {
    return client.post<DataProcessingTask>('/api/processing/tasks', task);
  },

  // 获取任务列表
  getTasks: (params?: {
    datasetId?: string;
    processingType?: ProcessingType;
    status?: string;
    page?: number;
    size?: number;
  }) => {
    return client.get<{ records: DataProcessingTask[]; total: number }>('/api/processing/tasks', { params });
  },

  // 获取任务详情
  getTask: (taskId: string) => {
    return client.get<DataProcessingTask>(`/api/processing/tasks/${taskId}`);
  },

  // 更新任务
  updateTask: (taskId: string, updates: Partial<DataProcessingTask>) => {
    return client.put<DataProcessingTask>(`/api/processing/tasks/${taskId}`, updates);
  },

  // 删除任务
  deleteTask: (taskId: string) => {
    return client.delete(`/api/processing/tasks/${taskId}`);
  },

  // 启动任务
  startTask: (taskId: string) => {
    return client.post(`/api/processing/tasks/${taskId}/start`);
  },

  // 停止任务
  stopTask: (taskId: string) => {
    return client.post(`/api/processing/tasks/${taskId}/stop`);
  },

  // 取消任务
  cancelTask: (taskId: string) => {
    return client.post(`/api/processing/tasks/${taskId}/cancel`);
  },

  // 获取任务进度
  getTaskProgress: (taskId: string) => {
    return client.get<{ progress: number; status: string }>(`/api/processing/tasks/${taskId}/progress`);
  },

  // 获取任务结果
  getTaskResult: (taskId: string) => {
    return client.get<ProcessingResult>(`/api/processing/tasks/${taskId}/result`);
  },

  // 下载处理结果
  downloadResult: (taskId: string) => {
    return client.get(`/api/processing/tasks/${taskId}/download`, { responseType: 'blob' });
  },

  // 预览数据处理
  previewProcessing: (datasetId: string, config: ProcessingConfig) => {
    return client.post<ProcessingPreview>('/api/processing/preview', { datasetId, config });
  },

  // 获取处理统计
  getStats: () => {
    return client.get<ProcessingStats>('/api/processing/stats');
  },

  // 获取处理历史
  getHistory: (params?: {
    datasetId?: string;
    processingType?: ProcessingType;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }) => {
    return client.get<{ records: ProcessingHistory[]; total: number }>('/api/processing/history', { params });
  },

  // 创建处理模板
  createTemplate: (template: {
    name: string;
    description?: string;
    processingType: ProcessingType;
    config: ProcessingConfig;
    isPublic?: boolean;
    tags?: string[];
  }) => {
    return client.post<ProcessingTemplate>('/api/processing/templates', template);
  },

  // 获取模板列表
  getTemplates: (params?: {
    processingType?: ProcessingType;
    isPublic?: boolean;
    page?: number;
    size?: number;
  }) => {
    return client.get<{ records: ProcessingTemplate[]; total: number }>('/api/processing/templates', { params });
  },

  // 获取模板详情
  getTemplate: (templateId: string) => {
    return client.get<ProcessingTemplate>(`/api/processing/templates/${templateId}`);
  },

  // 更新模板
  updateTemplate: (templateId: string, updates: Partial<ProcessingTemplate>) => {
    return client.put<ProcessingTemplate>(`/api/processing/templates/${templateId}`, updates);
  },

  // 删除模板
  deleteTemplate: (templateId: string) => {
    return client.delete(`/api/processing/templates/${templateId}`);
  },

  // 从模板创建任务
  createTaskFromTemplate: (templateId: string, task: {
    name: string;
    description?: string;
    datasetId: string;
    config?: Partial<ProcessingConfig>;
  }) => {
    return client.post<DataProcessingTask>(`/api/processing/templates/${templateId}/create-task`, task);
  },

  // 批量处理
  batchProcess: (requests: Array<{
    name: string;
    description?: string;
    datasetId: string;
    processingType: ProcessingType;
    config: ProcessingConfig;
  }>) => {
    return client.post<DataProcessingTask[]>('/api/processing/batch', { tasks: requests });
  },

  // 获取支持的处理类型
  getSupportedTypes: () => {
    return client.get<ProcessingType[]>('/api/processing/supported-types');
  },

  // 获取支持的输出格式
  getSupportedFormats: () => {
    return client.get<OutputFormat[]>('/api/processing/supported-formats');
  },

  // 获取知识库格式
  getKnowledgeBaseFormats: () => {
    return client.get<KnowledgeBaseFormat[]>('/api/processing/knowledge-base-formats');
  },

  // 获取训练格式
  getTrainingFormats: () => {
    return client.get<TrainingFormat[]>('/api/processing/training-formats');
  },

  // 验证处理配置
  validateConfig: (config: ProcessingConfig) => {
    return client.post<{ valid: boolean; errors: string[] }>('/api/processing/validate-config', config);
  },

  // 估算处理时间
  estimateProcessingTime: (datasetId: string, config: ProcessingConfig) => {
    return client.post<{ estimatedTime: number; estimatedSize: number }>('/api/processing/estimate', { datasetId, config });
  },

  // 获取数据集字段信息
  getDatasetFields: (datasetId: string) => {
    return client.get<Array<{
      name: string;
      type: string;
      nullCount: number;
      uniqueCount: number;
      sampleValues: any[];
    }>>(`/api/processing/datasets/${datasetId}/fields`);
  },

  // 获取数据集样本数据
  getDatasetSample: (datasetId: string, limit: number = 10) => {
    return client.get<{ records: any[]; total: number }>(`/api/processing/datasets/${datasetId}/sample`, { 
      params: { limit } 
    });
  },

  // 测试处理配置
  testConfig: (datasetId: string, config: ProcessingConfig) => {
    return client.post<{ success: boolean; sampleOutput: any[]; errors: string[] }>('/api/processing/test-config', { 
      datasetId, 
      config 
    });
  },

  // 获取处理日志
  getTaskLogs: (taskId: string, params?: {
    level?: 'INFO' | 'WARN' | 'ERROR';
    startTime?: string;
    endTime?: string;
    page?: number;
    size?: number;
  }) => {
    return client.get<{ records: Array<{
      timestamp: string;
      level: string;
      message: string;
      details?: any;
    }>; total: number }>(`/api/processing/tasks/${taskId}/logs`, { params });
  },

  // 重新运行任务
  rerunTask: (taskId: string, config?: Partial<ProcessingConfig>) => {
    return client.post<DataProcessingTask>(`/api/processing/tasks/${taskId}/rerun`, { config });
  },

  // 克隆任务
  cloneTask: (taskId: string, name: string, description?: string) => {
    return client.post<DataProcessingTask>(`/api/processing/tasks/${taskId}/clone`, { name, description });
  },

  // 导出任务配置
  exportTaskConfig: (taskId: string) => {
    return client.get(`/api/processing/tasks/${taskId}/export-config`, { responseType: 'blob' });
  },

  // 导入任务配置
  importTaskConfig: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<ProcessingConfig>('/api/processing/import-config', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 获取处理建议
  getProcessingSuggestions: (datasetId: string) => {
    return client.get<Array<{
      type: ProcessingType;
      description: string;
      config: Partial<ProcessingConfig>;
      priority: 'high' | 'medium' | 'low';
      reason: string;
    }>>(`/api/processing/datasets/${datasetId}/suggestions`);
  },

  // 自动处理
  autoProcess: (datasetId: string, options?: {
    includeCleaning?: boolean;
    includeValidation?: boolean;
    includeEnrichment?: boolean;
    outputFormat?: OutputFormat;
  }) => {
    return client.post<DataProcessingTask>('/api/processing/auto', { datasetId, options });
  }
}; 