import { datasetApiClient } from './client';
import { 
  Dataset, 
  DatasetFile, 
  DatasetComment, 
  DatasetCommentCreateRequest, 
  DatasetCommentUpdateRequest, 
  DatasetCommentQueryRequest,
  DatasetVersion,
  VersionComparison,
  ProcessingType,
  ProcessingConfig
} from '../types';

// 数据集统计信息类型
interface DatasetStatistics {
  total: number;
  ready: number;
  creating: number;
  processing: number;
  error: number;
}

// API响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  total?: number;
  page?: number;
  size?: number;
}

// 分页响应类型
interface PageResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  size: number;
}

/**
 * 数据集API服务
 */
export const datasetApi = {
  /**
   * 获取数据集列表
   */
  async GetDatasets(params: {
    page?: number;
    size?: number;
    keyword?: string;
    type?: string;
    status?: string;
    permission?: string;
  } = {}): Promise<PageResponse<Dataset>> {
    const { data } = await datasetApiClient.get('/datasets', { params });
    return data;
  },

  /**
   * 根据ID获取数据集详情
   */
  async GetDataset(id: number): Promise<ApiResponse<Dataset>> {
    const { data } = await datasetApiClient.get(`/datasets/${id}`);
    return data;
  },

  /**
   * 创建数据集
   */
  async CreateDataset(dataset: Omit<Dataset, 'id' | 'createTime' | 'updateTime'>): Promise<ApiResponse<Dataset>> {
    const { data } = await datasetApiClient.post('/datasets', dataset);
    return data;
  },

  /**
   * 更新数据集
   */
  async UpdateDataset(id: number, dataset: Partial<Dataset>): Promise<ApiResponse<Dataset>> {
    const { data } = await datasetApiClient.put(`/datasets/${id}`, dataset);
    return data;
  },

  /**
   * 删除数据集
   */
  async DeleteDataset(id: number): Promise<ApiResponse<void>> {
    const { data } = await datasetApiClient.delete(`/datasets/${id}`);
    return data;
  },

  /**
   * 上传文件到数据集
   */
  async UploadFile(datasetId: number, file: File, creator?: string): Promise<ApiResponse<DatasetFile>> {
    const formData = new FormData();
    formData.append('file', file);
    if (creator) {
      formData.append('creator', creator);
    }

    const { data } = await datasetApiClient.post(`/datasets/${datasetId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * 获取数据集文件列表
   */
  async GetDatasetFiles(datasetId: number, params: {
    page?: number;
    size?: number;
  } = {}): Promise<PageResponse<DatasetFile>> {
    const { data } = await datasetApiClient.get(`/datasets/${datasetId}/files`, { params });
    return data;
  },

  /**
   * 获取文件下载链接
   */
  async GetFileDownloadUrl(fileId: number): Promise<ApiResponse<{ downloadUrl: string }>> {
    const { data } = await datasetApiClient.get(`/datasets/files/${fileId}/download`);
    return data;
  },

  /**
   * 下载数据集
   */
  async DownloadDataset(datasetId: number): Promise<Blob> {
    // 使用独立的axios实例，避免响应拦截器处理blob数据
    const axios = require('axios');
    
    // 使用统一的路径配置
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? '/api/v1/datasets' 
      : `http://localhost:9101/api/v1/datasets`;
    
    const response = await axios.get(`${baseUrl}/${datasetId}/download`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/zip, application/octet-stream',
      },
      timeout: 60000, // 60秒超时，适合大文件下载
    });
    return response.data;
  },

  /**
   * 获取数据集预览数据
   */
  async GetDatasetPreview(datasetId: number): Promise<ApiResponse<{
    id?: number;
    name?: string;
    type?: string;
    description?: string;
    size?: number;
    fileCount?: number;
    format?: string;
    version?: string;
    creator?: string;
    createTime?: string;
    sampleFiles?: DatasetFile[];
    tags?: string;
    metadata?: string;
  }>> {
    const { data } = await datasetApiClient.get(`/datasets/${datasetId}/preview`);
    return data;
  },

  /**
   * 获取数据集README文件内容
   */
  async GetDatasetReadme(datasetId: number): Promise<ApiResponse<{
    hasReadmeFile: boolean;
    readmeContent: string;
    readmeFileName?: string;
    readmeFileSize?: number;
    readmeFileId?: number;
    fallbackReason?: string;
    datasetName: string;
    datasetType: string;
    datasetDescription?: string;
  }>> {
    const { data } = await datasetApiClient.get(`/datasets/${datasetId}/readme`);
    return data;
  },

  /**
   * 删除文件
   */
  async DeleteFile(fileId: number): Promise<ApiResponse<void>> {
    const { data } = await datasetApiClient.delete(`/datasets/files/${fileId}`);
    return data;
  },

  /**
   * 根据类型获取数据集
   */
  async GetDatasetsByType(type: string): Promise<ApiResponse<Dataset[]>> {
    const { data } = await datasetApiClient.get(`/datasets/type/${type}`);
    return data;
  },

  /**
   * 获取数据集统计信息
   */
  async GetDatasetStatistics(): Promise<ApiResponse<DatasetStatistics>> {
    const { data } = await datasetApiClient.get('/datasets/statistics');
    return data;
  },

  /**
   * 搜索数据集
   */
  async SearchDatasets(keyword: string, params: {
    page?: number;
    size?: number;
  } = {}): Promise<PageResponse<Dataset>> {
    const { data } = await datasetApiClient.get('/datasets', { 
      params: { ...params, keyword } 
    });
    return data;
  },

  /**
   * 获取数据集评论列表
   */
  async GetDatasetComments(params: DatasetCommentQueryRequest): Promise<PageResponse<DatasetComment>> {
    const { data } = await datasetApiClient.get('/datasets/comments', { params });
    return data;
  },

  /**
   * 创建数据集评论
   */
  async CreateDatasetComment(comment: DatasetCommentCreateRequest): Promise<ApiResponse<DatasetComment>> {
    const { data } = await datasetApiClient.post('/datasets/comments', comment);
    return data;
  },

  /**
   * 更新数据集评论
   */
  async UpdateDatasetComment(commentId: number, comment: DatasetCommentUpdateRequest): Promise<ApiResponse<DatasetComment>> {
    const { data } = await datasetApiClient.put(`/datasets/comments/${commentId}`, comment);
    return data;
  },

  /**
   * 删除数据集评论
   */
  async DeleteDatasetComment(commentId: number): Promise<ApiResponse<void>> {
    const { data } = await datasetApiClient.delete(`/datasets/comments/${commentId}`);
    return data;
  },

  /**
   * 点赞/取消点赞评论
   */
  async ToggleCommentLike(commentId: number): Promise<ApiResponse<{ isLiked: boolean; likes: number }>> {
    const { data } = await datasetApiClient.post(`/datasets/comments/${commentId}/like`);
    return data;
  },

  // 数据集版本管理API
  /**
   * 获取数据集版本列表
   */
  async GetDatasetVersions(datasetId: number, params: {
    page?: number;
    size?: number;
    isLatest?: boolean;
    isStable?: boolean;
  } = {}): Promise<PageResponse<DatasetVersion>> {
    const { data } = await datasetApiClient.get(`/datasets/${datasetId}/versions`, { params });
    return data;
  },

  /**
   * 获取数据集版本详情
   */
  async GetDatasetVersion(datasetId: number, versionId: string): Promise<ApiResponse<DatasetVersion>> {
    const { data } = await datasetApiClient.get(`/datasets/${datasetId}/versions/${versionId}`);
    return data;
  },

  /**
   * 创建数据集版本
   */
  async CreateDatasetVersion(datasetId: number, version: {
    version: string;
    versionName: string;
    description?: string;
    changeLog?: string;
    processingTaskId?: string;
    processingType?: ProcessingType;
    processingConfig?: ProcessingConfig;
    isStable?: boolean;
    tags?: string[];
  }): Promise<ApiResponse<DatasetVersion>> {
    const { data } = await datasetApiClient.post(`/datasets/${datasetId}/versions`, version);
    return data;
  },

  /**
   * 更新数据集版本
   */
  async UpdateDatasetVersion(datasetId: number, versionId: string, updates: Partial<DatasetVersion>): Promise<ApiResponse<DatasetVersion>> {
    const { data } = await datasetApiClient.put(`/datasets/${datasetId}/versions/${versionId}`, updates);
    return data;
  },

  /**
   * 删除数据集版本
   */
  async DeleteDatasetVersion(datasetId: number, versionId: string): Promise<ApiResponse<void>> {
    const { data } = await datasetApiClient.delete(`/datasets/${datasetId}/versions/${versionId}`);
    return data;
  },

  /**
   * 设置数据集版本为最新版本
   */
  async SetLatestVersion(datasetId: number, versionId: string): Promise<ApiResponse<DatasetVersion>> {
    const { data } = await datasetApiClient.post(`/datasets/${datasetId}/versions/${versionId}/set-latest`);
    return data;
  },

  /**
   * 设置数据集版本为稳定版本
   */
  async SetStableVersion(datasetId: number, versionId: string): Promise<ApiResponse<DatasetVersion>> {
    const { data } = await datasetApiClient.post(`/datasets/${datasetId}/versions/${versionId}/set-stable`);
    return data;
  },

  /**
   * 比较两个数据集版本
   */
  async CompareVersions(datasetId: number, version1Id: string, version2Id: string): Promise<ApiResponse<VersionComparison>> {
    const { data } = await datasetApiClient.get(`/datasets/${datasetId}/versions/compare`, {
      params: { version1: version1Id, version2: version2Id }
    });
    return data;
  },

  /**
   * 获取数据集版本历史
   */
  async GetVersionHistory(datasetId: number, params: {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<PageResponse<DatasetVersion>> {
    const { data } = await datasetApiClient.get(`/datasets/${datasetId}/versions/history`, { params });
    return data;
  },

  /**
   * 回滚到指定版本
   */
  async RollbackToVersion(datasetId: number, versionId: string): Promise<ApiResponse<DatasetVersion>> {
    const { data } = await datasetApiClient.post(`/datasets/${datasetId}/versions/${versionId}/rollback`);
    return data;
  },

  /**
   * 获取数据集版本统计
   */
  async GetVersionStatistics(datasetId: number): Promise<ApiResponse<{
    totalVersions: number;
    latestVersion: DatasetVersion;
    stableVersion?: DatasetVersion;
    versionHistory: Array<{
      version: string;
      createdTime: string;
      fileCount: number;
      totalSize: number;
    }>;
  }>> {
    const { data } = await datasetApiClient.get(`/datasets/${datasetId}/versions/statistics`);
    return data;
  },
}; 