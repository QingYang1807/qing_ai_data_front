export enum CollectionType {
    DATABASE = 'DATABASE',
    API = 'API',
    OBJECT_STORAGE = 'OBJECT_STORAGE',
    LOCAL_FILE = 'LOCAL_FILE',
    CRAWLER = 'CRAWLER'
}

export enum CollectionStatus {
    PENDING = 'PENDING',     // 等待中
    RUNNING = 'RUNNING',     // 运行中
    COMPLETED = 'COMPLETED', // 已完成
    FAILED = 'FAILED',       // 失败
    PAUSED = 'PAUSED'        // 已暂停
}

export interface CollectionTaskConfig {
    // Common
    targetTable?: string;
    batchSize?: number;

    // Database
    datasourceId?: string;
    query?: string;
    tables?: string[];

    // API
    url?: string;
    method?: 'GET' | 'POST' | 'PUT';
    headers?: Record<string, string>;
    params?: Record<string, string>;

    // Object Storage
    bucket?: string;
    prefix?: string;
    filePatterns?: string[];

    // Local File
    fileType?: 'CSV' | 'JSON' | 'TXT';
    filePath?: string;

    // Crawler
    startUrls?: string[];
    maxDepth?: number;
    maxPages?: number;
    rules?: any;
}

export interface CollectionTask {
    id: string;
    name: string;
    description?: string;
    type: CollectionType;
    status: CollectionStatus;
    config: CollectionTaskConfig;
    schedule?: string; // Cron expression
    lastRunTime?: string;
    nextRunTime?: string;
    createdAt: string;
    updatedAt: string;

    // Runtime stats
    metrics?: {
        processedCount: number;
        successCount: number;
        failedCount: number;
        duration: number; // seconds
        throughput: number; // items/sec
    };
}

export interface CollectionTaskCreateRequest {
    name: string;
    description?: string;
    type: CollectionType;
    config: CollectionTaskConfig;
    schedule?: string;
}

export interface CollectionTaskUpdateRequest {
    name?: string;
    description?: string;
    config?: CollectionTaskConfig;
    schedule?: string;
}

export interface CollectionStats {
    total: number;
    running: number;
    completed: number;
    failed: number;
    pending: number;
}

export interface CollectionLog {
    id: string;
    taskId: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    timestamp: string;
}

export enum CollectionExecutionStatus {
    RUNNING = 'RUNNING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

export interface CollectionExecution {
    id: string;
    taskId: string;
    status: CollectionExecutionStatus;
    startTime: string;
    endTime?: string;
    duration?: number; // seconds
    rowCount: number;
    error?: string;
    triggerType: 'MANUAL' | 'SCHEDULED';
}
