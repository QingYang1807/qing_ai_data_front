import { create } from 'zustand';
import { Dataset, DatasetFile } from '@/types';
import { datasetApi } from '@/api/dataset';

interface DatasetStore {
  // 数据集列表状态
  datasets: Dataset[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
  
  // 当前数据集状态
  currentDataset: Dataset | null;
  currentDatasetFiles: DatasetFile[];
  filesLoading: boolean;
  filesTotal: number;
  filesCurrentPage: number;
  filesPageSize: number;

  // 服务器连接状态
  serverConnected: boolean;

  // 操作状态
  operationLoading: boolean;

  // Actions
  fetchDatasets: (params?: any) => Promise<void>;
  refreshDatasets: () => Promise<void>;
  checkServerConnection: () => Promise<boolean>;
  
  // 数据集CRUD操作
  createDataset: (dataset: Partial<Dataset>) => Promise<Dataset>;
  updateDataset: (id: number, dataset: Partial<Dataset>) => Promise<Dataset>;
  deleteDataset: (id: number) => Promise<void>;
  getDataset: (id: number) => Promise<Dataset>;
  
  // 文件操作
  fetchDatasetFiles: (datasetId: number, params?: any) => Promise<void>;
  uploadFiles: (datasetId: number, files: File[], onProgress?: (progress: number) => void) => Promise<DatasetFile[]>;
  deleteFile: (fileId: number) => Promise<void>;
  getFileDownloadUrl: (fileId: number) => Promise<string>;
  
  // 统计信息
  getDatasetStatistics: () => Promise<any>;
  
  // 重置状态
  reset: () => void;
  setCurrentDataset: (dataset: Dataset | null) => void;
  setError: (error: string | null) => void;
}

export const useDatasetStore = create<DatasetStore>((set, get) => ({
  // 初始状态
  datasets: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 12,
  
  currentDataset: null,
  currentDatasetFiles: [],
  filesLoading: false,
  filesTotal: 0,
  filesCurrentPage: 1,
  filesPageSize: 20,

  serverConnected: false,
  operationLoading: false,

  // Actions
  fetchDatasets: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      const { currentPage, pageSize } = get();
      const requestParams = {
        page: currentPage,
        size: pageSize,
        ...params
      };

      const response = await datasetApi.GetDatasets(requestParams);
      
      set({
        datasets: response.data || [],
        total: response.total || 0,
        currentPage: requestParams.page,
        loading: false,
        serverConnected: true
      });
    } catch (error: any) {
      set({
        error: error.message || '获取数据集列表失败',
        loading: false,
        serverConnected: false
      });
    }
  },

  refreshDatasets: async () => {
    const { currentPage, pageSize } = get();
    await get().fetchDatasets({ page: currentPage, size: pageSize });
  },

  checkServerConnection: async () => {
    try {
      // 尝试获取数据集列表来检查连接状态
      const response = await datasetApi.GetDatasets({ page: 1, size: 1 });
      set({ serverConnected: true });
      return true;
    } catch (error) {
      set({ serverConnected: false });
      return false;
    }
  },

  createDataset: async (datasetData: Partial<Dataset>) => {
    set({ operationLoading: true, error: null });
    
    try {
      const response = await datasetApi.CreateDataset(datasetData);
      
      // 刷新数据集列表
      await get().refreshDatasets();
      
      set({ operationLoading: false });
      return response;
    } catch (error: any) {
      set({ 
        error: error.message || '创建数据集失败',
        operationLoading: false 
      });
      throw error;
    }
  },

  updateDataset: async (id: number, datasetData: Partial<Dataset>) => {
    set({ operationLoading: true, error: null });
    
    try {
      const response = await datasetApi.UpdateDataset(id, datasetData);
      
      // 更新当前数据集（如果正在查看）
      const { currentDataset } = get();
      if (currentDataset && currentDataset.id === id) {
        set({ currentDataset: response });
      }
      
      // 更新列表中的数据集
      set(state => ({
        datasets: state.datasets.map(ds => 
          ds.id === id ? { ...ds, ...response } : ds
        ),
        operationLoading: false
      }));
      
      return response;
    } catch (error: any) {
      set({ 
        error: error.message || '更新数据集失败',
        operationLoading: false 
      });
      throw error;
    }
  },

  deleteDataset: async (id: number) => {
    set({ operationLoading: true, error: null });
    
    try {
      await datasetApi.DeleteDataset(id);
      
      // 从列表中移除
      set(state => ({
        datasets: state.datasets.filter(ds => ds.id !== id),
        total: state.total - 1,
        operationLoading: false
      }));
      
      // 如果删除的是当前数据集，清空当前数据集
      const { currentDataset } = get();
      if (currentDataset && currentDataset.id === id) {
        set({ currentDataset: null });
      }
    } catch (error: any) {
      set({ 
        error: error.message || '删除数据集失败',
        operationLoading: false 
      });
      throw error;
    }
  },

  getDataset: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const response = await datasetApi.GetDataset(id);
      set({ 
        currentDataset: response,
        loading: false 
      });
      return response;
    } catch (error: any) {
      set({ 
        error: error.message || '获取数据集详情失败',
        loading: false 
      });
      throw error;
    }
  },

  fetchDatasetFiles: async (datasetId: number, params = {}) => {
    set({ filesLoading: true, error: null });
    
    try {
      const { filesCurrentPage, filesPageSize } = get();
      const requestParams = {
        page: filesCurrentPage,
        size: filesPageSize,
        ...params
      };

      const response = await datasetApi.GetDatasetFiles(datasetId, requestParams);
      
      set({
        currentDatasetFiles: response.data || [],
        filesTotal: response.total || 0,
        filesCurrentPage: requestParams.page,
        filesLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message || '获取文件列表失败',
        filesLoading: false
      });
    }
  },

  uploadFiles: async (datasetId: number, files: File[], onProgress?: (progress: number) => void) => {
    set({ operationLoading: true, error: null });
    
    try {
      const uploadPromises = files.map(file => 
        datasetApi.UploadFile(datasetId, file, 'admin')
      );
      
      // TODO: 实现上传进度跟踪
      const responses = await Promise.all(uploadPromises);
      
      // 刷新文件列表
      await get().fetchDatasetFiles(datasetId);
      
      // 更新数据集信息（文件数量和大小可能已变化）
      await get().getDataset(datasetId);
      
      set({ operationLoading: false });
      return responses;
    } catch (error: any) {
      set({ 
        error: error.message || '文件上传失败',
        operationLoading: false 
      });
      throw error;
    }
  },

  deleteFile: async (fileId: number) => {
    set({ operationLoading: true, error: null });
    
    try {
      await datasetApi.DeleteFile(fileId);
      
      // 从文件列表中移除
      set(state => ({
        currentDatasetFiles: state.currentDatasetFiles.filter(file => file.id !== fileId),
        filesTotal: state.filesTotal - 1,
        operationLoading: false
      }));
      
      // 刷新当前数据集信息
      const { currentDataset } = get();
      if (currentDataset) {
        await get().getDataset(currentDataset.id!);
      }
    } catch (error: any) {
      set({ 
        error: error.message || '删除文件失败',
        operationLoading: false 
      });
      throw error;
    }
  },

  getFileDownloadUrl: async (fileId: number) => {
    try {
      const response = await datasetApi.GetFileDownloadUrl(fileId);
      return response.downloadUrl;
    } catch (error: any) {
      set({ error: error.message || '获取下载链接失败' });
      throw error;
    }
  },

  getDatasetStatistics: async () => {
    try {
      const response = await datasetApi.GetDatasetStatistics();
      return response;
    } catch (error: any) {
      set({ error: error.message || '获取统计信息失败' });
      throw error;
    }
  },

  reset: () => {
    set({
      datasets: [],
      loading: false,
      error: null,
      total: 0,
      currentPage: 1,
      currentDataset: null,
      currentDatasetFiles: [],
      filesLoading: false,
      filesTotal: 0,
      filesCurrentPage: 1,
      operationLoading: false
    });
  },

  setCurrentDataset: (dataset: Dataset | null) => {
    set({ currentDataset: dataset });
  },

  setError: (error: string | null) => {
    set({ error });
  }
})); 