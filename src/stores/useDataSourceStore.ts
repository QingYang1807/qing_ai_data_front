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
  serverConnected: boolean;

  // 统计信息
  stats: {
    total: number;
    active: number;
    inactive: number;
    error: number;
    enabled: number;
  };

  // 操作方法
  fetchDataSources: (params?: DataSourceQueryRequest) => Promise<void>;
  fetchStats: () => Promise<void>;
  refreshDataSources: (params?: DataSourceQueryRequest) => Promise<void>;
  checkServerConnection: () => Promise<boolean>;
  createDataSource: (data: any) => Promise<void>;
  updateDataSource: (id: string, data: any) => Promise<void>;
  deleteDataSource: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<boolean>;
  toggleEnable: (id: string, enabled: boolean) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setServerConnected: (connected: boolean) => void;
}

export const useDataSourceStore = create<DataSourceState>((set, get) => ({
  dataSources: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  pageSize: 10,
  serverConnected: false, // 初始设为false，等API调用成功后再设为true

  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    error: 0,
    enabled: 0,
  },

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
        serverConnected: true,
      });

      // 并行获取统计信息
      get().fetchStats();
    } catch (error: any) {
      console.error('获取数据源列表失败:', error);

      // 检查是否是网络错误（服务器未启动或宕机）
      const isNetworkError =
        error.code === 'ECONNREFUSED' ||
        error.message === 'Network Error' ||
        error.message?.includes('网络连接失败') ||
        error.request || // axios request 存在但没有响应
        !error.response; // 没有响应对象说明网络问题

      if (isNetworkError) {
        // 网络错误时，静默处理，显示空列表并标记服务器未连接
        set({
          loading: false,
          dataSources: [],
          total: 0,
          serverConnected: false,
          error: null, // 不设置error，避免显示错误提示
        });
      } else {
        // 其他错误（如业务错误、权限错误等）仍然正常显示错误信息
        set({
          error: error.message || '获取数据源列表失败',
          loading: false,
          dataSources: [],
          total: 0,
          serverConnected: true, // 能收到响应说明服务器是连接的
        });
      }
    }
  },

  refreshDataSources: async (params = {}) => {
    // 静默刷新，不触发loading状态变化
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

      // 只更新数据，不更新loading状态
      set({
        dataSources: response.data.records,
        total: response.data.total,
        currentPage: response.data.page,
        pageSize: response.data.size,
        error: null, // 清除之前的错误
      });

      // 刷新统计信息
      get().fetchStats();
    } catch (error: any) {
      console.error('刷新数据源列表失败:', error);

      // 检查是否是网络错误（服务器未启动或宕机）
      const isNetworkError =
        error.code === 'ECONNREFUSED' ||
        error.message === 'Network Error' ||
        error.message?.includes('网络连接失败') ||
        error.request || // axios request 存在但没有响应
        !error.response; // 没有响应对象说明网络问题

      if (isNetworkError) {
        // 网络错误时，只更新服务器连接状态
        set({
          serverConnected: false,
        });
        throw new Error('无法连接到服务器，请检查服务器状态');
      } else {
        // 其他错误抛出，让调用者处理
        set({
          serverConnected: true, // 能收到响应说明服务器是连接的
        });
        throw error;
      }
    }
  },

  checkServerConnection: async () => {
    try {
      // 调用一个轻量级API来检查服务器连接状态
      const response = await datasourceApi.getList({ page: 1, size: 1 });
      set({ serverConnected: true });
      return true;
    } catch (error: any) {
      console.log('服务器连接检查失败:', error.message);

      // 检查是否是网络错误
      const isNetworkError =
        error.code === 'ECONNREFUSED' ||
        error.message === 'Network Error' ||
        error.message?.includes('网络连接失败') ||
        error.request ||
        !error.response;

      if (isNetworkError) {
        set({ serverConnected: false });
        return false;
      } else {
        // 即使是业务错误，也说明服务器是连接的
        set({ serverConnected: true });
        return true;
      }
    }
  },

  fetchStats: async () => {
    try {
      const response = await datasourceApi.getStats();
      if (response && response.data) {
        set({ stats: response.data });
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
      // 不抛出错误，以免影响主列表显示
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
      set({ currentPage: 1, serverConnected: true });
      await get().fetchDataSources({ page: 1 });
    } catch (error: any) {
      console.error('创建数据源失败:', error);

      // 检查是否是网络错误
      const isNetworkError =
        error.code === 'ECONNREFUSED' ||
        error.message === 'Network Error' ||
        error.message?.includes('网络连接失败') ||
        error.request ||
        !error.response;

      if (isNetworkError) {
        set({
          loading: false,
          serverConnected: false,
          error: null,
        });
        throw new Error('无法连接到服务器，请检查服务器状态');
      } else {
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
          loading: false,
          serverConnected: true,
        });
        throw new Error(errorMessage);
      }
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

      // 更新成功后静默刷新当前页数据
      set({ loading: false, serverConnected: true });
      await get().refreshDataSources();
    } catch (error: any) {
      console.error('更新数据源失败:', error);

      // 检查是否是网络错误
      const isNetworkError =
        error.code === 'ECONNREFUSED' ||
        error.message === 'Network Error' ||
        error.message?.includes('网络连接失败') ||
        error.request ||
        !error.response;

      if (isNetworkError) {
        set({
          loading: false,
          serverConnected: false,
          error: null,
        });
        throw new Error('无法连接到服务器，请检查服务器状态');
      } else {
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
          loading: false,
          serverConnected: true,
        });
        throw new Error(errorMessage);
      }
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
        set({ currentPage: targetPage, loading: false, serverConnected: true });
      } else {
        set({ loading: false, serverConnected: true });
      }

      await get().refreshDataSources({ page: targetPage });
    } catch (error: any) {
      console.error('删除数据源失败:', error);

      // 检查是否是网络错误
      const isNetworkError =
        error.code === 'ECONNREFUSED' ||
        error.message === 'Network Error' ||
        error.message?.includes('网络连接失败') ||
        error.request ||
        !error.response;

      if (isNetworkError) {
        set({
          loading: false,
          serverConnected: false,
          error: null,
        });
        throw new Error('无法连接到服务器，请检查服务器状态');
      } else {
        set({
          error: error.message || '删除数据源失败',
          loading: false,
          serverConnected: true,
        });
        throw error;
      }
    }
  },

  testConnection: async (id) => {
    try {
      // 调用真实API测试连接
      const response = await datasourceApi.testConnection(id);

      if (response.data.success) {
        // 连接成功后静默刷新数据源列表，更新状态
        set({ serverConnected: true });
        await get().refreshDataSources();
      }

      return response.data.success;
    } catch (error: any) {
      console.error('测试连接失败:', error);

      // 检查是否是网络错误
      const isNetworkError =
        error.code === 'ECONNREFUSED' ||
        error.message === 'Network Error' ||
        error.message?.includes('网络连接失败') ||
        error.request ||
        !error.response;

      if (isNetworkError) {
        set({ serverConnected: false });
        throw new Error('无法连接到服务器，请检查服务器状态');
      } else {
        set({ serverConnected: true });
        throw error;
      }
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

      // 操作成功后静默刷新数据
      set({ loading: false, serverConnected: true });
      await get().refreshDataSources();
    } catch (error: any) {
      console.error('操作失败:', error);

      // 检查是否是网络错误
      const isNetworkError =
        error.code === 'ECONNREFUSED' ||
        error.message === 'Network Error' ||
        error.message?.includes('网络连接失败') ||
        error.request ||
        !error.response;

      if (isNetworkError) {
        set({
          loading: false,
          serverConnected: false,
          error: null,
        });
        throw new Error('无法连接到服务器，请检查服务器状态');
      } else {
        set({
          error: error.message || '操作失败',
          loading: false,
          serverConnected: true,
        });
        throw error;
      }
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ currentPage: page }),
  setPageSize: (pageSize) => set({ pageSize }),
  setServerConnected: (connected: boolean) => set({ serverConnected: connected }),
})); 