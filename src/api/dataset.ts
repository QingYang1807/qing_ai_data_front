import apiClient from './client';
import { Dataset, DatasetFile, DatasetStatistics } from '../types';

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
  } = {}): Promise<PageResponse<Dataset>> {
    const { data } = await apiClient.get('/datasets', { params });
    return data;
  },

  /**
   * 根据ID获取数据集详情
   */
  async GetDataset(id: number): Promise<ApiResponse<Dataset>> {
    const { data } = await apiClient.get(`/datasets/${id}`);
    return data;
  },

  /**
   * 创建数据集
   */
  async CreateDataset(dataset: Omit<Dataset, 'id' | 'createTime' | 'updateTime'>): Promise<ApiResponse<Dataset>> {
    const { data } = await apiClient.post('/datasets', dataset);
    return data;
  },

  /**
   * 更新数据集
   */
  async UpdateDataset(id: number, dataset: Partial<Dataset>): Promise<ApiResponse<Dataset>> {
    const { data } = await apiClient.put(`/datasets/${id}`, dataset);
    return data;
  },

  /**
   * 删除数据集
   */
  async DeleteDataset(id: number): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete(`/datasets/${id}`);
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

    const { data } = await apiClient.post(`/datasets/${datasetId}/files`, formData, {
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
    const { data } = await apiClient.get(`/datasets/${datasetId}/files`, { params });
    return data;
  },

  /**
   * 获取文件下载链接
   */
  async GetFileDownloadUrl(fileId: number): Promise<ApiResponse<{ downloadUrl: string }>> {
    const { data } = await apiClient.get(`/datasets/files/${fileId}/download`);
    return data;
  },

  /**
   * 根据类型获取数据集
   */
  async GetDatasetsByType(type: string): Promise<ApiResponse<Dataset[]>> {
    const { data } = await apiClient.get(`/datasets/type/${type}`);
    return data;
  },

  /**
   * 获取数据集统计信息
   */
  async GetDatasetStatistics(): Promise<ApiResponse<DatasetStatistics>> {
    const { data } = await apiClient.get('/datasets/statistics');
    return data;
  },

  /**
   * 搜索数据集
   */
  async SearchDatasets(keyword: string, params: {
    page?: number;
    size?: number;
  } = {}): Promise<PageResponse<Dataset>> {
    const { data } = await apiClient.get('/datasets', { 
      params: { ...params, keyword } 
    });
    return data;
  },
}; 