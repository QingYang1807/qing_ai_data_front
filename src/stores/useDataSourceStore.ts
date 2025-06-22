import { create } from 'zustand';
import { DataSource, DataSourceQueryRequest } from '@/types';
import { datasourceApi } from '@/api/datasource';

interface DataSourceState {
  dataSources: DataSource[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
  
  // 操作方法
  fetchDataSources: (params?: DataSourceQueryRequest) => Promise<void>;
  createDataSource: (data: any) => Promise<void>;
  updateDataSource: (id: string, data: any) => Promise<void>;
  deleteDataSource: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<boolean>;
  toggleEnable: (id: string, enabled: boolean) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDataSourceStore = create<DataSourceState>((set, get) => ({
  dataSources: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 10,

  fetchDataSources: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await datasourceApi.getList({
        page: get().currentPage,
        size: get().pageSize,
        ...params,
      });
      
      set({
        dataSources: response.data.records,
        total: response.data.total,
        currentPage: response.data.page,
        loading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || '获取数据源列表失败', 
        loading: false 
      });
    }
  },

  createDataSource: async (data) => {
    set({ loading: true, error: null });
    try {
      await datasourceApi.create(data);
      await get().fetchDataSources();
    } catch (error: any) {
      set({ 
        error: error.message || '创建数据源失败', 
        loading: false 
      });
      throw error;
    }
  },

  updateDataSource: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await datasourceApi.update(id, data);
      await get().fetchDataSources();
    } catch (error: any) {
      set({ 
        error: error.message || '更新数据源失败', 
        loading: false 
      });
      throw error;
    }
  },

  deleteDataSource: async (id) => {
    set({ loading: true, error: null });
    try {
      await datasourceApi.delete(id);
      await get().fetchDataSources();
    } catch (error: any) {
      set({ 
        error: error.message || '删除数据源失败', 
        loading: false 
      });
      throw error;
    }
  },

  testConnection: async (id) => {
    try {
      const response = await datasourceApi.testConnection(id);
      return response.data.success;
    } catch (error: any) {
      set({ error: error.message || '测试连接失败' });
      return false;
    }
  },

  toggleEnable: async (id, enabled) => {
    set({ loading: true, error: null });
    try {
      if (enabled) {
        await datasourceApi.enable(id);
      } else {
        await datasourceApi.disable(id);
      }
      await get().fetchDataSources();
    } catch (error: any) {
      set({ 
        error: error.message || '操作失败', 
        loading: false 
      });
      throw error;
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
})); 