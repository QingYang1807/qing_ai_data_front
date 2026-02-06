import {
    CollectionTask,
    CollectionTaskCreateRequest,
    CollectionTaskUpdateRequest,
    CollectionType,
    CollectionStatus,
    CollectionStats
} from '@/types/collection';
import { PageResponse } from '@/types';

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟数据
let mockTasks: CollectionTask[] = [
    {
        id: '1',
        name: '电商商品数据抓取',
        description: '抓取主要电商平台的3C类目商品数据',
        type: CollectionType.CRAWLER,
        status: CollectionStatus.RUNNING,
        config: {
            startUrls: ['https://example.com/category/3c'],
            maxDepth: 3,
            maxPages: 1000
        },
        schedule: '0 0 * * *',
        metrics: {
            processedCount: 15420,
            successCount: 15400,
            failedCount: 20,
            duration: 3600,
            throughput: 4.2
        },
        lastRunTime: '2023-11-15T10:00:00Z',
        createdAt: '2023-11-01T08:00:00Z',
        updatedAt: '2023-11-15T10:00:00Z'
    },
    {
        id: '2',
        name: '用户行为日志同步',
        description: '从S3同步每日用户行为日志到数仓',
        type: CollectionType.OBJECT_STORAGE,
        status: CollectionStatus.COMPLETED,
        config: {
            bucket: 'user-logs',
            prefix: 'daily/2023/',
            filePatterns: ['*.json.gz']
        },
        schedule: '0 2 * * *',
        metrics: {
            processedCount: 5200000,
            successCount: 5200000,
            failedCount: 0,
            duration: 1800,
            throughput: 2888.8
        },
        lastRunTime: '2023-11-16T02:30:00Z',
        createdAt: '2023-10-20T09:00:00Z',
        updatedAt: '2023-11-16T02:30:00Z'
    },
    {
        id: '3',
        name: 'CRM数据全量同步',
        description: '从MySQL主库同步客户数据',
        type: CollectionType.DATABASE,
        status: CollectionStatus.PENDING,
        config: {
            datasourceId: 'ds_mysql_01',
            tables: ['users', 'orders', 'order_items']
        },
        lastRunTime: '2023-11-14T01:00:00Z',
        createdAt: '2023-11-10T11:00:00Z',
        updatedAt: '2023-11-10T11:00:00Z'
    },
    {
        id: '4',
        name: '天气API数据获取',
        description: '每小时获取一次城市天气数据',
        type: CollectionType.API,
        status: CollectionStatus.FAILED,
        config: {
            url: 'https://api.weather.com/v3/aggregate',
            method: 'GET',
            params: { cities: 'all', detailed: 'true' }
        },
        schedule: '0 * * * *',
        metrics: {
            processedCount: 0,
            successCount: 0,
            failedCount: 1,
            duration: 5,
            throughput: 0
        },
        lastRunTime: '2023-11-16T09:00:00Z',
        createdAt: '2023-11-12T14:00:00Z',
        updatedAt: '2023-11-16T09:00:00Z'
    },
    {
        id: '5',
        name: '历史订单CSV导入',
        description: '导入2022年之前的归档订单数据',
        type: CollectionType.LOCAL_FILE,
        status: CollectionStatus.COMPLETED,
        config: {
            filePath: '/data/archive/orders_2022.csv',
            fileType: 'CSV',
            batchSize: 5000
        },
        metrics: {
            processedCount: 850000,
            successCount: 850000,
            failedCount: 0,
            duration: 1200,
            throughput: 708.3
        },
        lastRunTime: '2023-11-05T16:00:00Z',
        createdAt: '2023-11-05T15:00:00Z',
        updatedAt: '2023-11-05T16:00:00Z'
    }
];

export const collectionApi = {
    // 获取任务列表
    getList: async (params: any): Promise<PageResponse<CollectionTask>> => {
        await delay(500);
        // 简单的前端过滤和分页
        const filtered = mockTasks.filter(task => {
            if (params.type && params.type !== 'all' && task.type !== params.type) return false;
            if (params.status && params.status !== 'all' && task.status !== params.status) return false;
            if (params.search && !task.name.toLowerCase().includes(params.search.toLowerCase())) return false;
            return true;
        });

        // 简单的分页逻辑
        const page = params.page || 1;
        const size = params.size || 10;
        const start = (page - 1) * size;
        const end = start + size;

        return {
            records: filtered.slice(start, end),
            total: filtered.length,
            size: size,
            current: page,
            pages: Math.ceil(filtered.length / size)
        } as any; // 临时强转适配PageResponse
    },

    // 获取统计信息
    getStats: async (): Promise<CollectionStats> => {
        await delay(300);
        return {
            total: mockTasks.length,
            running: mockTasks.filter(t => t.status === CollectionStatus.RUNNING).length,
            completed: mockTasks.filter(t => t.status === CollectionStatus.COMPLETED).length,
            failed: mockTasks.filter(t => t.status === CollectionStatus.FAILED).length,
            pending: mockTasks.filter(t => t.status === CollectionStatus.PENDING).length
        };
    },

    // 获取任务详情
    getById: async (id: string): Promise<CollectionTask> => {
        await delay(300);
        const task = mockTasks.find(t => t.id === id);
        if (!task) throw new Error('Task not found');
        return task;
    },

    // 创建任务
    create: async (data: CollectionTaskCreateRequest): Promise<CollectionTask> => {
        await delay(800);
        const newTask: CollectionTask = {
            id: Math.random().toString(36).substr(2, 9),
            ...data,
            status: CollectionStatus.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        mockTasks.unshift(newTask);
        return newTask;
    },

    // 更新任务
    update: async (id: string, data: CollectionTaskUpdateRequest): Promise<CollectionTask> => {
        await delay(600);
        const index = mockTasks.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Task not found');

        mockTasks[index] = {
            ...mockTasks[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        return mockTasks[index];
    },

    // 删除任务
    delete: async (id: string): Promise<void> => {
        await delay(400);
        mockTasks = mockTasks.filter(t => t.id !== id);
    },

    // 启动任务
    start: async (id: string): Promise<void> => {
        await delay(500);
        const task = mockTasks.find(t => t.id === id);
        if (task) {
            task.status = CollectionStatus.RUNNING;
            task.lastRunTime = new Date().toISOString();
        }
    },

    // 停止任务
    stop: async (id: string): Promise<void> => {
        await delay(500);
        const task = mockTasks.find(t => t.id === id);
        if (task) {
            task.status = CollectionStatus.PAUSED;
        }
    },

    // 获取任务日志
    getLogs: async (id: string): Promise<any[]> => {
        await delay(400);
        return [
            { id: '1', level: 'INFO', message: 'Task started successfully', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
            { id: '2', level: 'INFO', message: 'Connected to source', timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
            { id: '3', level: 'INFO', message: 'Processing batch 1 (500 items)', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
            { id: '4', level: 'WARN', message: 'Rate limit warning', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
            { id: '5', level: 'INFO', message: 'Processing batch 2 (500 items)', timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString() }
        ];
    },

    // 获取任务执行历史
    getHistory: async (id: string): Promise<any[]> => {
        await delay(600);
        const now = Date.now();
        return [
            {
                id: 'exec_1',
                taskId: id,
                status: 'SUCCESS',
                startTime: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
                endTime: new Date(now - 1000 * 60 * 50).toISOString(),
                duration: 600,
                rowCount: 5420,
                triggerType: 'SCHEDULED'
            },
            {
                id: 'exec_2',
                taskId: id,
                status: 'FAILED',
                startTime: new Date(now - 1000 * 60 * 60 * 25).toISOString(),
                endTime: new Date(now - 1000 * 60 * 60 * 24.9).toISOString(),
                duration: 45,
                rowCount: 0,
                error: 'Connection timeout',
                triggerType: 'SCHEDULED'
            },
            {
                id: 'exec_3',
                taskId: id,
                status: 'SUCCESS',
                startTime: new Date(now - 1000 * 60 * 60 * 49).toISOString(),
                endTime: new Date(now - 1000 * 60 * 60 * 48.5).toISOString(),
                duration: 1800,
                rowCount: 12500,
                triggerType: 'MANUAL'
            }
        ];
    }
};
