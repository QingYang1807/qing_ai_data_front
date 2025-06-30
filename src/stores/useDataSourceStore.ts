import { create } from 'zustand';
import { DataSource, DataSourceQueryRequest, DataSourceType } from '@/types';
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
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
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
      const currentState = get();
      
      // 如果传入了新的page参数，先更新state
      if (params.page && params.page !== currentState.currentPage) {
        set({ currentPage: params.page });
      }
      
      const requestParams = {
        page: params.page || currentState.currentPage,
        size: params.size || currentState.pageSize,
        ...params,
      };

      // 调用真实API
      const response = await datasourceApi.getList(requestParams);
      
      set({
        dataSources: response.data.records,
        total: response.data.total,
        currentPage: response.data.page,
        pageSize: response.data.size,
        loading: false,
      });
    } catch (error: any) {
      console.error('获取数据源列表失败:', error);
      set({ 
        error: error.message || '获取数据源列表失败', 
        loading: false,
        dataSources: [],
        total: 0,
      });
    }
  },

  createDataSource: async (data) => {
    set({ loading: true, error: null });
    try {
      // 确保必要字段存在
      if (!data.name?.trim()) {
        throw new Error('数据源名称不能为空');
      }
      if (!data.type) {
        throw new Error('数据源类型不能为空');
      }
      if (!data.config || typeof data.config !== 'object') {
        throw new Error('数据源配置不能为空');
      }

      // 调用真实API创建数据源
      await datasourceApi.create(data);
      
      // 创建成功后刷新数据，回到第一页
      set({ currentPage: 1 });
      await get().fetchDataSources({ page: 1 });
    } catch (error: any) {
      console.error('创建数据源失败:', error);
      
      // 解析后端验证错误信息
      let errorMessage = '创建数据源失败';
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        if (backendMessage.includes('数据源配置不能为空')) {
          errorMessage = '请完善数据源连接配置信息';
        } else if (backendMessage.includes('数据源名称不能为空')) {
          errorMessage = '数据源名称不能为空';
        } else if (backendMessage.includes('数据源类型不能为空')) {
          errorMessage = '请选择数据源类型';
        } else {
          errorMessage = backendMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage, 
        loading: false 
      });
      throw new Error(errorMessage);
    }
  },

  updateDataSource: async (id, data) => {
    set({ loading: true, error: null });
    try {
      // 基本字段验证
      if (data.name !== undefined && !data.name?.trim()) {
        throw new Error('数据源名称不能为空');
      }
      if (data.config !== undefined && (!data.config || typeof data.config !== 'object')) {
        throw new Error('数据源配置不能为空');
      }

      // 调用真实API更新数据源
      await datasourceApi.update(id, data);
      
      // 更新成功后刷新当前页数据
      await get().fetchDataSources();
    } catch (error: any) {
      console.error('更新数据源失败:', error);
      
      // 解析后端验证错误信息
      let errorMessage = '更新数据源失败';
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        if (backendMessage.includes('数据源配置不能为空')) {
          errorMessage = '请完善数据源连接配置信息';
        } else if (backendMessage.includes('数据源名称不能为空')) {
          errorMessage = '数据源名称不能为空';
        } else if (backendMessage.includes('数据源不存在')) {
          errorMessage = '数据源不存在或已被删除';
        } else {
          errorMessage = backendMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage, 
        loading: false 
      });
      throw new Error(errorMessage);
    }
  },

  deleteDataSource: async (id) => {
    set({ loading: true, error: null });
    try {
      // 调用真实API删除数据源
      await datasourceApi.delete(id);
      
      const currentState = get();
      
      // 删除成功后重新获取数据
      // 计算删除后应该显示的页码
      const newTotal = currentState.total - 1;
      const totalPages = Math.ceil(newTotal / currentState.pageSize);
      const targetPage = currentState.currentPage > totalPages ? Math.max(1, totalPages) : currentState.currentPage;
      
      if (targetPage !== currentState.currentPage) {
        set({ currentPage: targetPage });
      }
      
      await get().fetchDataSources({ page: targetPage });
    } catch (error: any) {
      console.error('删除数据源失败:', error);
      set({ 
        error: error.message || '删除数据源失败', 
        loading: false 
      });
      throw error;
    }
  },

  testConnection: async (id) => {
    try {
      // 调用真实API测试连接
      const response = await datasourceApi.testConnection(id);
      
      if (response.data.success) {
        // 连接成功后刷新数据源列表，更新状态
        await get().fetchDataSources();
      }
      
      return response.data.success;
    } catch (error: any) {
      console.error('测试连接失败:', error);
      set({ error: error.message || '测试连接失败' });
      return false;
    }
  },

  toggleEnable: async (id, enabled) => {
    set({ loading: true, error: null });
    try {
      // 调用真实API启用/禁用数据源
      if (enabled) {
        await datasourceApi.enable(id);
      } else {
        await datasourceApi.disable(id);
      }
      
      // 操作成功后刷新数据
      await get().fetchDataSources();
    } catch (error: any) {
      console.error('操作失败:', error);
      set({ 
        error: error.message || '操作失败', 
        loading: false 
      });
      throw error;
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ currentPage: page }),
  setPageSize: (pageSize) => set({ pageSize }),
})); 