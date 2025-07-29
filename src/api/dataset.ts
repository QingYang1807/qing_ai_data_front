import { datasetApiClient } from './client';
import { Dataset, DatasetFile, DatasetComment, DatasetCommentCreateRequest, DatasetCommentUpdateRequest, DatasetCommentQueryRequest } from '../types';

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
    const response = await axios.get(`http://localhost:9101/api/v1/datasets/${datasetId}/download`, {
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
}; 