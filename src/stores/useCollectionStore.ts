import { create } from 'zustand';
import {
    CollectionTask,
    CollectionTaskCreateRequest,
    CollectionTaskUpdateRequest,
    CollectionStats,
    CollectionLog,
    CollectionExecution
} from '@/types/collection';
import { collectionApi } from '@/api/collection';

interface CollectionState {
    tasks: CollectionTask[];
    stats: CollectionStats;
    loading: boolean;
    error: string | null;
    total: number;
    currentPage: number;
    pageSize: number;

    // Actions
    fetchTasks: (params?: any) => Promise<void>;
    fetchStats: () => Promise<void>;
    createTask: (data: CollectionTaskCreateRequest) => Promise<void>;
    updateTask: (id: string, data: CollectionTaskUpdateRequest) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    startTask: (id: string) => Promise<void>;
    stopTask: (id: string) => Promise<void>;
    stopTask: (id: string) => Promise<void>;
    getLogs: (id: string) => Promise<CollectionLog[]>;
    getHistory: (id: string) => Promise<CollectionExecution[]>;

    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
    tasks: [],
    stats: {
        total: 0,
        running: 0,
        completed: 0,
        failed: 0,
        pending: 0
    },
    loading: false,
    error: null,
    total: 0,
    currentPage: 1,
    pageSize: 10,

    fetchTasks: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const { currentPage, pageSize } = get();
            const requestParams = {
                page: params.page || currentPage,
                size: params.size || pageSize,
                ...params
            };

            const response = await collectionApi.getList(requestParams);

            set({
                tasks: response.records,
                total: response.total,
                currentPage: response.current,
                pageSize: response.size,
                loading: false
            });

            // Also fetch stats
            get().fetchStats();
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || '获取任务列表失败'
            });
        }
    },

    fetchStats: async () => {
        try {
            const stats = await collectionApi.getStats();
            set({ stats });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    },

    createTask: async (data) => {
        set({ loading: true, error: null });
        try {
            await collectionApi.create(data);
            set({ loading: false });
            get().fetchTasks({ page: 1 });
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || '创建任务失败'
            });
            throw error;
        }
    },

    updateTask: async (id, data) => {
        set({ loading: true, error: null });
        try {
            await collectionApi.update(id, data);
            set({ loading: false });
            get().fetchTasks();
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || '更新任务失败'
            });
            throw error;
        }
    },

    deleteTask: async (id) => {
        set({ loading: true, error: null });
        try {
            await collectionApi.delete(id);
            set({ loading: false });
            get().fetchTasks();
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || '删除任务失败'
            });
            throw error;
        }
    },

    startTask: async (id) => {
        try {
            await collectionApi.start(id);
            get().fetchTasks(); // Refresh list to show new status
        } catch (error: any) {
            set({ error: error.message || '启动任务失败' });
            throw error;
        }
    },

    stopTask: async (id) => {
        try {
            await collectionApi.stop(id);
            get().fetchTasks(); // Refresh list to show new status
        } catch (error: any) {
            set({ error: error.message || '停止任务失败' });
            throw error;
        }
    },

    getLogs: async (id) => {
        try {
            return await collectionApi.getLogs(id);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            return [];
        }
    },

    getHistory: async (id) => {
        try {
            return await collectionApi.getHistory(id);
        } catch (error) {
            console.error('Failed to fetch history:', error);
            return [];
        }
    },

    setPage: (page) => set({ currentPage: page }),
    setPageSize: (size) => set({ pageSize: size })
}));
