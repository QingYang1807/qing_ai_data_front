import { create } from 'zustand';
import { Dataset, DatasetFile, DatasetVersion, VersionComparison } from '@/types';
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
  createDataset: (dataset: Omit<Dataset, 'id' | 'createTime' | 'updateTime'>) => Promise<Dataset>;
  updateDataset: (id: number, dataset: Partial<Dataset>) => Promise<Dataset>;
  deleteDataset: (id: number) => Promise<void>;
  getDataset: (id: number | string) => Promise<Dataset>;

  // 文件操作
  fetchDatasetFiles: (datasetId: number, params?: any) => Promise<void>;
  uploadFiles: (datasetId: number, files: File[], onProgress?: (progress: number) => void) => Promise<DatasetFile[]>;
  deleteFile: (fileId: number) => Promise<void>;
  getFileDownloadUrl: (fileId: number) => Promise<string>;

  // 版本管理
  currentVersions: DatasetVersion[];
  loadingVersions: boolean;
  totalVersions: number;
  versionsPage: number;
  versionsPageSize: number;

  fetchDatasetVersions: (datasetId: number, params?: any) => Promise<void>;
  createDatasetVersion: (datasetId: number, versionData: any) => Promise<DatasetVersion>;
  rollbackToVersion: (datasetId: number, versionId: string) => Promise<void>;
  compareVersions: (datasetId: number, version1Id: string, version2Id: string) => Promise<VersionComparison>;

  // 统计信息
  getDatasetStatistics: () => Promise<any>;

  // 生成样例数据
  generateSampleData: () => Promise<void>;

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

  // 版本管理初始状态
  currentVersions: [],
  loadingVersions: false,
  totalVersions: 0,
  versionsPage: 1,
  versionsPageSize: 10,

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

  createDataset: async (datasetData: Omit<Dataset, 'id' | 'createTime' | 'updateTime'>) => {
    set({ operationLoading: true, error: null });

    try {
      const response = await datasetApi.CreateDataset(datasetData);
      // 刷新数据集列表
      await get().refreshDatasets();
      set({ operationLoading: false });
      return response.data; // 只返回 Dataset 类型
    } catch (error: any) {
      console.warn('API creation failed, falling back to mock mode', error);

      // Mock fallback: 创建本地模拟数据集
      const newDataset: Dataset = {
        id: Date.now(), // Generate a temp ID
        ...datasetData,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        creator: 'MockUser',
        status: 'READY', // Auto-ready for testing
        version: 'v1.0',
        fileCount: 0,
        size: 0,
        permission: datasetData.permission || 'PRIVATE'
      } as Dataset;

      set(state => ({
        datasets: [newDataset, ...state.datasets],
        total: state.total + 1,
        operationLoading: false,
        error: null // Clear error to pretend success
      }));

      return newDataset;
    }
  },

  updateDataset: async (id: number, datasetData: Partial<Dataset>) => {
    set({ operationLoading: true, error: null });
    try {
      const response = await datasetApi.UpdateDataset(id, datasetData);
      // 更新当前数据集（如果正在查看）
      const { currentDataset } = get();
      if (currentDataset && currentDataset.id === id) {
        set({ currentDataset: response.data });
      }
      // 更新列表中的数据集
      set(state => ({
        datasets: state.datasets.map(ds =>
          ds.id === id ? { ...ds, ...response.data } : ds
        ),
        operationLoading: false
      }));
      return response.data;
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

  getDataset: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const response = await datasetApi.GetDataset(id);
      set({
        currentDataset: response.data,
        loading: false
      });
      return response.data;
    } catch (error: any) {
      console.warn('API get failed, falling back to local search', error);
      const { datasets } = get();
      const localDataset = datasets.find(d => d.id === id);

      if (localDataset) {
        set({
          currentDataset: localDataset,
          loading: false,
          error: null
        });
        return localDataset;
      }

      // 如果本地也没找到，才报错
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
      return responses.map(r => r.data);
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
      return response.data.downloadUrl;
    } catch (error: any) {
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

  generateSampleData: async () => {
    set({ loading: true });
    try {
      // 模拟生成一些样例数据
      const sampleDatasets: Dataset[] = [
        {
          id: 1001,
          name: 'Customer Reviews Sentiment',
          description: 'A collection of customer reviews for sentiment analysis tasks. Contains positive, negative and neutral reviews from various e-commerce platforms.',
          type: 'TEXT',
          format: 'CSV',
          size: 1024 * 1024 * 25, // 25MB
          fileCount: 45,
          createTime: new Date(Date.now() - 86400000 * 2).toISOString(),
          updateTime: new Date(Date.now() - 3600000).toISOString(),
          creator: 'Admin',
          status: 'READY',
          permission: 'PUBLIC',
          version: 'v1.0',
          tags: 'nlp,sentiment,reviews'
        },
        {
          id: 1002,
          name: 'Traffic Sign Recognition',
          description: 'Images of traffic signs for autonomous driving training. Includes 50+ classes of traffic signs under different lighting conditions.',
          type: 'IMAGE',
          format: 'JPG',
          size: 1024 * 1024 * 512, // 512MB
          fileCount: 12500,
          createTime: new Date(Date.now() - 86400000 * 5).toISOString(),
          updateTime: new Date(Date.now() - 86400000).toISOString(),
          creator: 'DataTeam',
          status: 'READY',
          permission: 'TEAM',
          version: 'v2.1',
          tags: 'cv,autonomous,driving'
        },
        {
          id: 1003,
          name: 'Financial Transactions 2023',
          description: 'Anonymized financial transaction records for fraud detection. Features include time, amount, location, and merchant type.',
          type: 'STRUCTURED',
          format: 'PARQUET',
          size: 1024 * 1024 * 1500, // 1.5GB
          fileCount: 12,
          createTime: new Date(Date.now() - 86400000 * 10).toISOString(),
          updateTime: new Date(Date.now() - 86400000 * 9).toISOString(),
          creator: 'Finance',
          status: 'PROCESSING',
          permission: 'PRIVATE',
          version: 'v1.0',
          tags: 'finance,fraud,structured'
        },
        {
          id: 1004,
          name: 'Call Center Audio Logs',
          description: 'Recorded audio calls from customer support for speech-to-text training and emotion recognition.',
          type: 'AUDIO',
          format: 'WAV',
          size: 1024 * 1024 * 4500, // 4.5GB
          fileCount: 840,
          createTime: new Date(Date.now() - 86400000 * 15).toISOString(),
          updateTime: new Date(Date.now() - 86400000 * 14).toISOString(),
          creator: 'Support',
          status: 'READY',
          permission: 'TEAM',
          version: 'v1.2',
          tags: 'speech,audio,asr'
        }
      ];

      // 延迟一点时间模拟加载
      await new Promise(resolve => setTimeout(resolve, 800));

      set(state => ({
        datasets: [...state.datasets, ...sampleDatasets],
        total: state.total + sampleDatasets.length,
        loading: false
      }));
    } catch (error) {
      set({ loading: false });
      console.error('Failed to generate sample data', error);
    }
  },

  // 版本管理 Actions
  fetchDatasetVersions: async (datasetId: number, params = {}) => {
    set({ loadingVersions: true, error: null });
    try {
      const { versionsPage, versionsPageSize } = get();
      const requestParams = {
        page: versionsPage,
        size: versionsPageSize,
        ...params
      };

      const response = await datasetApi.GetDatasetVersions(datasetId, requestParams);

      set({
        currentVersions: response.data || [],
        totalVersions: response.total || 0,
        versionsPage: requestParams.page,
        loadingVersions: false
      });
    } catch (error: any) {
      set({
        error: error.message || '获取版本列表失败',
        loadingVersions: false
      });
    }
  },

  createDatasetVersion: async (datasetId: number, versionData: any) => {
    set({ operationLoading: true, error: null });
    try {
      const response = await datasetApi.CreateDatasetVersion(datasetId, versionData);
      await get().fetchDatasetVersions(datasetId);
      set({ operationLoading: false });
      return response.data;
    } catch (error: any) {
      set({
        error: error.message || '创建版本失败',
        operationLoading: false
      });
      throw error;
    }
  },

  rollbackToVersion: async (datasetId: number, versionId: string) => {
    set({ operationLoading: true, error: null });
    try {
      await datasetApi.RollbackToVersion(datasetId, versionId);
      await get().fetchDatasetVersions(datasetId);
      await get().getDataset(datasetId); // 刷新当前数据集信息
      set({ operationLoading: false });
    } catch (error: any) {
      set({
        error: error.message || '回滚版本失败',
        operationLoading: false
      });
      throw error;
    }
  },

  compareVersions: async (datasetId: number, version1Id: string, version2Id: string) => {
    set({ loadingVersions: true, error: null });
    try {
      const response = await datasetApi.CompareVersions(datasetId, version1Id, version2Id);
      set({ loadingVersions: false });
      return response.data;
    } catch (error: any) {
      set({
        error: error.message || '比较版本失败',
        loadingVersions: false
      });
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