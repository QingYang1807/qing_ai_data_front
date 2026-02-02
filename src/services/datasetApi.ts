import axios from 'axios';

const API_BASE = 'http://localhost:9201/api/v1';

export interface Dataset {
    id: string;
    name: string;
    description?: string;
    source: string;
    total_count: number;
    unique_count: number;
    status: string;
    created: string;
    updated: string;
}

export interface DatasetListResponse {
    total: number;
    page: number;
    size: number;
    items: Dataset[];
}

export const datasetApi = {
    /**
     * 查询数据集列表
     */
    getList: async (params?: {
        page?: number;
        size?: number;
        status?: string;
    }): Promise<{ success: boolean; data: DatasetListResponse }> => {
        const response = await axios.get(`${API_BASE}/datasets`, { params });
        return response.data;
    },

    /**
     * 创建数据集
     */
    create: async (data: {
        name: string;
        description?: string;
        source?: string;
    }): Promise<{ success: boolean; data: Dataset; message: string }> => {
        const response = await axios.post(`${API_BASE}/datasets`, data);
        return response.data;
    },

    /**
     * 查询数据集详情
     */
    getDetail: async (id: string): Promise<{ success: boolean; data: Dataset }> => {
        const response = await axios.get(`${API_BASE}/datasets/${id}`);
        return response.data;
    },

    /**
     * 更新数据集
     */
    update: async (
        id: string,
        data: { name?: string; description?: string }
    ): Promise<{ success: boolean; data: Dataset; message: string }> => {
        const response = await axios.put(`${API_BASE}/datasets/${id}`, data);
        return response.data;
    },

    /**
     * 删除数据集
     */
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await axios.delete(`${API_BASE}/datasets/${id}`);
        return response.data;
    },
};
