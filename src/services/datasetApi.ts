import axios from 'axios';

// API 实际运行在 5000 端口
const API_BASE = 'http://127.0.0.1:5000/api/v1';

// API响应中的原始数据结构（后端返回的字段名是大写的）
export interface DatasetRaw {
    ID: any;
    Name: string;
    Items: any[];
    TotalCount: number;
    UniqueCount: number;
    Status: string;
    Created: string;
    Updated: string;
}

// 前端使用的数据结构（转换为小写字段名）
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

// 将后端数据转换为前端格式
function transformDataset(raw: DatasetRaw): Dataset {
    // 打印原始数据查看ID结构
    console.log('Raw dataset from backend:', raw);
    console.log('ID field:', raw.ID);
    console.log('ID type:', typeof raw.ID);
    console.log('ID JSON:', JSON.stringify(raw.ID));

    // 尝试从ID对象中提取实际ID值
    let actualId: string;
    if (raw.ID && typeof raw.ID === 'object') {
        // MongoDB ObjectID可能有 $oid 或 _id 字段
        actualId = raw.ID.$oid || raw.ID._id || raw.ID.id || JSON.stringify(raw.ID);
    } else if (raw.ID) {
        actualId = String(raw.ID);
    } else {
        // 如果没有ID，使用名称生成hash
        actualId = generateDatasetId(raw.Name || `dataset_${Date.now()}`);
    }

    console.log('Extracted ID:', actualId);

    return {
        id: actualId,
        name: raw.Name || '',
        description: '', // API中没有这个字段
        source: 'manual', // API中没有这个字段，默认为manual
        total_count: raw.TotalCount || 0,
        unique_count: raw.UniqueCount || 0,
        status: raw.Status || 'PENDING',
        created: raw.Created || '',
        updated: raw.Updated || '',
    };
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

        // 处理后端返回的数据结构
        const apiData = response.data;

        // 转换数据格式
        const transformedItems = apiData.data.items.map((item: DatasetRaw) => transformDataset(item));

        return {
            success: apiData.success,
            data: {
                total: apiData.data.total,
                page: apiData.data.page,
                size: apiData.data.size,
                items: transformedItems
            }
        };
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
