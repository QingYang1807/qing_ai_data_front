// 通用响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

// 分页响应类型
export interface PageResponse<T> {
  records: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// 数据源类型枚举 - 扩展更多类型
export enum DataSourceType {
  // 关系型数据库
  MYSQL = "MYSQL",
  POSTGRESQL = "POSTGRESQL", 
  ORACLE = "ORACLE",
  SQLSERVER = "SQLSERVER",
  SQLITE = "SQLITE",
  
  // 大数据存储
  HIVE = "HIVE",
  HDFS = "HDFS",
  CLICKHOUSE = "CLICKHOUSE",
  
  // NoSQL数据库
  MONGODB = "MONGODB",
  REDIS = "REDIS",
  CASSANDRA = "CASSANDRA",
  ELASTICSEARCH = "ELASTICSEARCH",
  
  // 消息队列
  KAFKA = "KAFKA",
  RABBITMQ = "RABBITMQ",
  ROCKETMQ = "ROCKETMQ",
  PULSAR = "PULSAR",
  
  // 文件系统
  FTP = "FTP",
  SFTP = "SFTP",
  S3 = "S3",
  OSS = "OSS",
  MINIO = "MINIO",
  
  // 云数据库
  AMAZON_RDS = "AMAZON_RDS",
  ALIYUN_RDS = "ALIYUN_RDS",
  TENCENT_CDB = "TENCENT_CDB",
  
  // API数据源
  REST_API = "REST_API",
  GRAPHQL = "GRAPHQL",
  SOAP = "SOAP",
  
  // 其他
  CSV = "CSV",
  EXCEL = "EXCEL",
  JSON = "JSON",
  XML = "XML",
}

// 数据源分类
export enum DataSourceCategory {
  DATABASE = "DATABASE",        // 关系型数据库
  NOSQL = "NOSQL",             // NoSQL数据库  
  BIG_DATA = "BIG_DATA",       // 大数据
  MESSAGE_QUEUE = "MESSAGE_QUEUE", // 消息队列
  FILE_SYSTEM = "FILE_SYSTEM", // 文件系统
  CLOUD = "CLOUD",             // 云服务
  API = "API",                 // API接口
  FILE = "FILE",               // 文件格式
}

// 数据源分类映射
export const DataSourceCategoryMapping: Record<DataSourceType, DataSourceCategory> = {
  [DataSourceType.MYSQL]: DataSourceCategory.DATABASE,
  [DataSourceType.POSTGRESQL]: DataSourceCategory.DATABASE,
  [DataSourceType.ORACLE]: DataSourceCategory.DATABASE,
  [DataSourceType.SQLSERVER]: DataSourceCategory.DATABASE,
  [DataSourceType.SQLITE]: DataSourceCategory.DATABASE,
  
  [DataSourceType.MONGODB]: DataSourceCategory.NOSQL,
  [DataSourceType.REDIS]: DataSourceCategory.NOSQL,
  [DataSourceType.CASSANDRA]: DataSourceCategory.NOSQL,
  [DataSourceType.ELASTICSEARCH]: DataSourceCategory.NOSQL,
  
  [DataSourceType.HIVE]: DataSourceCategory.BIG_DATA,
  [DataSourceType.HDFS]: DataSourceCategory.BIG_DATA,
  [DataSourceType.CLICKHOUSE]: DataSourceCategory.BIG_DATA,
  
  [DataSourceType.KAFKA]: DataSourceCategory.MESSAGE_QUEUE,
  [DataSourceType.RABBITMQ]: DataSourceCategory.MESSAGE_QUEUE,
  [DataSourceType.ROCKETMQ]: DataSourceCategory.MESSAGE_QUEUE,
  [DataSourceType.PULSAR]: DataSourceCategory.MESSAGE_QUEUE,
  
  [DataSourceType.FTP]: DataSourceCategory.FILE_SYSTEM,
  [DataSourceType.SFTP]: DataSourceCategory.FILE_SYSTEM,
  [DataSourceType.S3]: DataSourceCategory.FILE_SYSTEM,
  [DataSourceType.OSS]: DataSourceCategory.FILE_SYSTEM,
  [DataSourceType.MINIO]: DataSourceCategory.FILE_SYSTEM,
  
  [DataSourceType.AMAZON_RDS]: DataSourceCategory.CLOUD,
  [DataSourceType.ALIYUN_RDS]: DataSourceCategory.CLOUD,
  [DataSourceType.TENCENT_CDB]: DataSourceCategory.CLOUD,
  
  [DataSourceType.REST_API]: DataSourceCategory.API,
  [DataSourceType.GRAPHQL]: DataSourceCategory.API,
  [DataSourceType.SOAP]: DataSourceCategory.API,
  
  [DataSourceType.CSV]: DataSourceCategory.FILE,
  [DataSourceType.EXCEL]: DataSourceCategory.FILE,
  [DataSourceType.JSON]: DataSourceCategory.FILE,
  [DataSourceType.XML]: DataSourceCategory.FILE,
};

// 数据源状态枚举
export enum DataSourceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
}

// 数据源配置类型
export interface DataSourceConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  url?: string;
  accessKey?: string;
  secretKey?: string;
  region?: string;
  bucket?: string;
  endpoint?: string;
  apiKey?: string;
  token?: string;
  headers?: Record<string, string>;
  timeout?: number;
  ssl?: boolean;
  [key: string]: any;
}

// 数据源实体类型
export interface DataSource {
  id: number | string;
  name: string;
  type: DataSourceType;
  category?: DataSourceCategory;
  level: DataSourceLevel; // 新增：数据源分级
  config: DataSourceConfig;
  description?: string;
  status: number | string; // 0-未连接，1-连接成功，2-连接失败
  enabled: number | boolean; // 0-禁用，1-启用
  lastConnectTime?: string;
  creator?: string;
  createTime: string;
  updater?: string;
  updateTime: string;
  
  // 兼容字段（从config中解析）
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  connectionUrl?: string;
  
  // 新增字段
  connections?: DataSourceConnection[];
  tables?: DatabaseTable[];
  tableCount?: number;
  connectionCount?: number;
}

// 数据源创建DTO
export interface DataSourceCreateRequest {
  name: string;
  type: DataSourceType;
  config: DataSourceConfig;
  description?: string;
}

// 数据源更新DTO
export interface DataSourceUpdateRequest {
  name?: string;
  type?: DataSourceType;
  config?: DataSourceConfig;
  description?: string;
}

// 数据源查询DTO
export interface DataSourceQueryRequest {
  name?: string;
  type?: DataSourceType;
  category?: DataSourceCategory;
  status?: DataSourceStatus;
  enabled?: boolean;
  page?: number;
  size?: number;
}

// 数据源分级枚举
export enum DataSourceLevel {
  PUBLIC = "PUBLIC",           // 公开级 - 所有用户可访问
  INTERNAL = "INTERNAL",       // 内部级 - 内部用户可访问
  CONFIDENTIAL = "CONFIDENTIAL", // 机密级 - 指定用户可访问
  SECRET = "SECRET",           // 秘密级 - 仅管理员可访问
}

// 数据源权限枚举
export enum DataSourcePermission {
  READ = "READ",               // 只读权限
  WRITE = "WRITE",             // 读写权限
  ADMIN = "ADMIN",             // 管理权限
}

// 数据库表信息
export interface DatabaseTable {
  id?: number;
  dataSourceId: number;
  tableName: string;
  tableComment?: string;
  tableType: 'TABLE' | 'VIEW' | 'MATERIALIZED_VIEW';
  rowCount?: number;
  size?: number;
  columns?: TableColumn[];
  createTime?: string;
  updateTime?: string;
}

// 表字段信息
export interface TableColumn {
  columnName: string;
  dataType: string;
  columnComment?: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  defaultValue?: string;
  columnSize?: number;
  precision?: number;
  scale?: number;
}

// 数据源用户连接
export interface DataSourceConnection {
  id?: number;
  dataSourceId: number;
  userId: number;
  username: string;
  permission: DataSourcePermission;
  isActive: boolean;
  lastConnectTime?: string;
  connectCount: number;
  createTime?: string;
  updateTime?: string;
}

// 数据源连接历史
export interface ConnectionHistory {
  id?: number;
  dataSourceId: number;
  userId: number;
  username: string;
  action: 'CONNECT' | 'DISCONNECT' | 'QUERY' | 'ERROR';
  status: 'SUCCESS' | 'FAILED';
  message?: string;
  ipAddress?: string;
  userAgent?: string;
  createTime: string;
}

// 数据源表管理
export interface TableManagement {
  id?: number;
  dataSourceId: number;
  tableName: string;
  isEnabled: boolean;
  syncEnabled: boolean;
  lastSyncTime?: string;
  syncInterval?: number; // 同步间隔（分钟）
  description?: string;
  tags?: string;
  createTime?: string;
  updateTime?: string;
}

// 数据源统计扩展
export interface DataSourceStatsVO {
  totalCount: number;
  enabledCount: number;
  activeCount: number;
  errorCount: number;
  byCategory: Record<DataSourceCategory, number>;
  byType: Record<DataSourceType, number>;
  byLevel: Record<DataSourceLevel, number>;
  connectionStats: {
    totalConnections: number;
    activeConnections: number;
    todayConnections: number;
  };
  tableStats: {
    totalTables: number;
    enabledTables: number;
    syncedTables: number;
  };
}

// 数据类型枚举
export enum DataType {
  TEXT = "TEXT",
  IMAGE = "IMAGE", 
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  STRUCTURED = "STRUCTURED",
}

// 数据集类型枚举
export enum DatasetType {
  TEXT = "TEXT",
  IMAGE = "IMAGE", 
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  STRUCTURED = "STRUCTURED",
}

// 数据集状态枚举
export enum DatasetStatus {
  CREATING = "CREATING",
  READY = "READY",
  PROCESSING = "PROCESSING",
  ERROR = "ERROR",
}

// 数据集权限枚举
export enum DatasetPermission {
  PRIVATE = "PRIVATE",
  PUBLIC = "PUBLIC",
  TEAM = "TEAM",
}

// 文件状态枚举
export enum FileStatus {
  UPLOADING = "UPLOADING",
  COMPLETED = "COMPLETED", 
  PROCESSING = "PROCESSING",
  ERROR = "ERROR",
  DELETED = "DELETED",
}

// 数据集实体类型
export interface Dataset {
  id?: number;
  name: string;
  type: DatasetType;
  description?: string;
  format?: string;
  version?: string;
  status?: DatasetStatus;
  size?: number;
  fileCount?: number;
  storagePath?: string;
  bucketName?: string;
  labelConfig?: string;
  permission?: DatasetPermission;
  isPublic?: boolean;
  tags?: string;
  metadata?: string;
  thumbnailPath?: string;
  creator?: string;
  createTime?: string;
  updater?: string;
  updateTime?: string;
  deleted?: boolean;
}

// 数据集文件实体类型
export interface DatasetFile {
  id?: number;
  datasetId: number;
  fileName: string;
  originalName: string;
  objectPath: string;
  bucketName: string;
  contentType?: string;
  fileSize: number;
  fileHash: string;
  status: FileStatus;
  previewUrl?: string;
  createTime?: string;
  updateTime?: string;
}



// 文件统计信息
export interface FileStatistics {
  fileCount: number;
  totalSize: number;
}

// 任务状态枚举
export enum TaskStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

// 数据处理任务类型
export interface DataProcessingTask {
  id: string;
  name: string;
  description?: string;
  datasetId: string;
  datasetName?: string;
  processingType: ProcessingType;
  config: ProcessingConfig;
  inputPath: string;
  outputPath: string;
  status: ProcessingStatus;
  progress: number;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
  createdTime: string;
  createdBy: string;
  updatedTime?: string;
  fileSize?: number;
  recordCount?: number;
  processingTime?: number;
  outputFormat?: OutputFormat;
  tags?: string[];
}

// 用户信息类型
export interface User {
  id: string;
  username: string;
  email: string;
  realName: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdTime: string;
}

// 系统统计信息
// 数据集评论类型
export interface DatasetComment {
  id?: number;
  datasetId: number;
  userId: number;
  username: string;
  userAvatar?: string;
  content: string;
  parentId?: number;
  replyTo?: string;
  likes: number;
  isLiked?: boolean;
  createTime: string;
  updateTime?: string;
  replies?: DatasetComment[];
}

// 数据集评论创建请求
export interface DatasetCommentCreateRequest {
  datasetId: number;
  content: string;
  parentId?: number;
  replyTo?: string;
}

// 数据集评论更新请求
export interface DatasetCommentUpdateRequest {
  content: string;
}

// 数据集评论查询请求
export interface DatasetCommentQueryRequest {
  datasetId: number;
  parentId?: number;
  page?: number;
  size?: number;
}

export interface SystemStats {
  totalDatasets: number;
  runningTasks: number;
  completedTasks: number;
  storageUsage: number;
  storageTotal: number;
} 

// 数据处理相关类型定义
export enum ProcessingType {
  CLEANING = "CLEANING",           // 数据清洗
  FILTERING = "FILTERING",         // 数据过滤
  DEDUPLICATION = "DEDUPLICATION", // 数据去重
  PRIVACY_REMOVAL = "PRIVACY_REMOVAL", // 隐私信息移除
  FORMAT_CONVERSION = "FORMAT_CONVERSION", // 格式转换
  NORMALIZATION = "NORMALIZATION", // 数据标准化
  ENRICHMENT = "ENRICHMENT",       // 数据增强
  VALIDATION = "VALIDATION",       // 数据验证
  TRANSFORMATION = "TRANSFORMATION", // 数据转换
  SAMPLING = "SAMPLING",           // 数据采样
  MERGING = "MERGING",             // 数据合并
  SPLITTING = "SPLITTING",         // 数据分割
  AGGREGATION = "AGGREGATION",     // 数据聚合
  FEATURE_EXTRACTION = "FEATURE_EXTRACTION", // 特征提取
  ANONYMIZATION = "ANONYMIZATION", // 数据匿名化
  ENCRYPTION = "ENCRYPTION",       // 数据加密
  COMPRESSION = "COMPRESSION",     // 数据压缩
  EXPORT = "EXPORT",               // 数据导出
}

export enum ProcessingStatus {
  PENDING = "PENDING",             // 等待中
  RUNNING = "RUNNING",             // 运行中
  SUCCESS = "SUCCESS",             // 成功
  FAILED = "FAILED",               // 失败
  CANCELLED = "CANCELLED",         // 已取消
  PAUSED = "PAUSED",               // 已暂停
}

export enum OutputFormat {
  JSON = "JSON",
  JSONL = "JSONL",
  CSV = "CSV",
  EXCEL = "EXCEL",
  PARQUET = "PARQUET",
  XML = "XML",
  YAML = "YAML",
  TXT = "TXT",
  MARKDOWN = "MARKDOWN",
  HTML = "HTML",
  PDF = "PDF",
}

export enum KnowledgeBaseFormat {
  QA_PAIR = "QA_PAIR",             // 问答对格式
  DOCUMENT = "DOCUMENT",           // 文档格式
  CHUNK = "CHUNK",                 // 分块格式
  EMBEDDING = "EMBEDDING",         // 向量格式
  GRAPH = "GRAPH",                 // 图谱格式
}

export enum TrainingFormat {
  INSTRUCTION = "INSTRUCTION",     // 指令微调格式
  CONVERSATION = "CONVERSATION",   // 对话格式
  COMPLETION = "COMPLETION",       // 补全格式
  CLASSIFICATION = "CLASSIFICATION", // 分类格式
  GENERATION = "GENERATION",       // 生成格式
}

// 数据处理配置
export interface ProcessingConfig {
  // 通用配置
  outputFormat: OutputFormat;
  encoding?: string;
  delimiter?: string;
  includeHeader?: boolean;
  
  // 清洗配置
  cleaning?: {
    removeNulls?: boolean;
    removeDuplicates?: boolean;
    trimWhitespace?: boolean;
    normalizeCase?: boolean;
    fixEncoding?: boolean;
    removeSpecialChars?: boolean;
    replacePatterns?: Array<{
      pattern: string;
      replacement: string;
      regex?: boolean;
    }>;
  };
  
  // 过滤配置
  filtering?: {
    conditions: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null';
      value: any;
      value2?: any; // 用于between操作
    }>;
    logic?: 'AND' | 'OR';
  };
  
  // 去重配置
  deduplication?: {
    fields: string[];
    keepFirst?: boolean;
    caseSensitive?: boolean;
    fuzzyMatch?: boolean;
    similarityThreshold?: number;
  };
  
  // 隐私移除配置
  privacyRemoval?: {
    fields: string[];
    patterns: Array<{
      pattern: string;
      replacement: string;
      regex?: boolean;
    }>;
    hashFields?: string[];
    maskFields?: string[];
    anonymizeFields?: string[];
  };
  
  // 格式转换配置
  formatConversion?: {
    dateFormats?: Record<string, string>;
    numberFormats?: Record<string, string>;
    booleanFormats?: Record<string, boolean>;
    customMappings?: Record<string, any>;
  };
  
  // 标准化配置
  normalization?: {
    textNormalization?: boolean;
    numberNormalization?: boolean;
    dateNormalization?: boolean;
    unitConversion?: Record<string, string>;
  };
  
  // 数据增强配置
  enrichment?: {
    addFields?: Record<string, any>;
    calculateFields?: Array<{
      name: string;
      expression: string;
      type: string;
    }>;
    joinData?: Array<{
      source: string;
      joinKey: string;
      fields: string[];
    }>;
  };
  
  // 验证配置
  validation?: {
    rules: Array<{
      field: string;
      rule: string;
      message?: string;
      params?: any;
    }>;
    strictMode?: boolean;
  };
  
  // 转换配置
  transformation?: {
    renameFields?: Record<string, string>;
    selectFields?: string[];
    excludeFields?: string[];
    sortBy?: Array<{
      field: string;
      order: 'asc' | 'desc';
    }>;
    limit?: number;
    offset?: number;
  };
  
  // 采样配置
  sampling?: {
    method: 'random' | 'systematic' | 'stratified' | 'cluster';
    size: number;
    percentage?: number;
    seed?: number;
    strata?: Record<string, any>;
  };
  
  // 合并配置
  merging?: {
    datasets: string[];
    joinType: 'inner' | 'left' | 'right' | 'outer';
    joinKeys: string[];
    conflictResolution?: 'first' | 'last' | 'merge' | 'custom';
  };
  
  // 分割配置
  splitting?: {
    method: 'random' | 'stratified' | 'time' | 'custom';
    ratios: number[];
    field?: string;
    seed?: number;
  };
  
  // 聚合配置
  aggregation?: {
    groupBy: string[];
    aggregations: Array<{
      field: string;
      function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'std' | 'var';
      alias?: string;
    }>;
  };
  
  // 特征提取配置
  featureExtraction?: {
    textFeatures?: {
      extractKeywords?: boolean;
      extractEntities?: boolean;
      extractSentiment?: boolean;
      extractTopics?: boolean;
      language?: string;
    };
    imageFeatures?: {
      extractColors?: boolean;
      extractObjects?: boolean;
      extractFaces?: boolean;
      extractText?: boolean;
    };
    audioFeatures?: {
      extractMFCC?: boolean;
      extractSpectrogram?: boolean;
      extractPitch?: boolean;
    };
  };
  
  // 匿名化配置
  anonymization?: {
    method: 'k_anonymity' | 'l_diversity' | 't_closeness' | 'differential_privacy';
    k?: number;
    l?: number;
    t?: number;
    epsilon?: number;
    sensitiveFields: string[];
    quasiIdentifiers: string[];
  };
  
  // 加密配置
  encryption?: {
    algorithm: 'AES' | 'RSA' | 'DES' | '3DES';
    key?: string;
    fields: string[];
    mode?: 'encrypt' | 'decrypt';
  };
  
  // 压缩配置
  compression?: {
    algorithm: 'gzip' | 'bzip2' | 'lz4' | 'snappy';
    level?: number;
  };
  
  // 知识库格式配置（基础）
  knowledgeBaseBasic?: {
    format: KnowledgeBaseFormat;
    chunkSize?: number;
    overlap?: number;
    metadata?: Record<string, any>;
    qaTemplate?: {
      questionField: string;
      answerField: string;
      contextField?: string;
    };
  };
  
  // 训练格式配置（基础）
  trainingBasic?: {
    format: TrainingFormat;
    instructionTemplate?: string;
    conversationTemplate?: {
      system: string;
      user: string;
      assistant: string;
    };
    completionTemplate?: string;
    classificationLabels?: string[];
  };
  
  // AI处理配置
  aiProcessing?: AIProcessingConfig;
  
  // 知识库配置
  knowledgeBase?: KnowledgeBaseConfig;
  
  // 训练数据集配置
  training?: TrainingDatasetConfig;
  
  // 智能配置
  intelligentConfig?: IntelligentConfig;
  
  // AI助手交互
  aiAssistant?: AIAssistantInteraction;
  
  // 质量评估配置
  qualityAssessment?: {
    enabled: boolean;
    metrics: string[];
    threshold: number;
    autoCorrection?: boolean;
    detailedReport?: boolean;
  };
}



// 数据处理历史
export interface ProcessingHistory {
  id: string;
  taskId: string;
  taskName: string;
  description?: string;
  datasetId: string;
  datasetName: string;
  processingType: ProcessingType;
  status: ProcessingStatus;
  progress: number;
  startTime: string;
  endTime?: string;
  completedTime?: string;
  duration?: number;
  processingTime?: number;
  fileSize?: number;
  recordCount?: number;
  createdBy: string;
  outputPath?: string;
  errorMessage?: string;
}

// 数据处理结果
export interface ProcessingResult {
  taskId: string;
  outputPath: string;
  outputFormat: OutputFormat;
  recordCount: number;
  fileSize: number;
  processingTime: number;
  qualityReport?: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
    issues: Array<{
      type: string;
      count: number;
      description: string;
    }>;
  };
  metadata?: Record<string, any>;
  downloadUrl?: string;
  previewUrl?: string;
} 

// 数据集版本管理相关类型
export interface DatasetVersion {
  id: string;
  datasetId: number;
  version: string;
  versionName: string;
  description?: string;
  changeLog?: string;
  fileCount: number;
  totalSize: number;
  processingTaskId?: string; // 关联的处理任务
  processingType?: ProcessingType; // 处理类型
  processingConfig?: ProcessingConfig; // 处理配置
  isLatest: boolean;
  isStable: boolean;
  tags?: string[];
  createdBy: string;
  createdTime: string;
  files?: DatasetFile[];
  metadata?: Record<string, any>;
  qualityMetrics?: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
  };
}

// 数据集版本比较结果
export interface VersionComparison {
  version1: DatasetVersion;
  version2: DatasetVersion;
  differences: {
    fileCount: number;
    sizeDifference: number;
    newFiles: DatasetFile[];
    removedFiles: DatasetFile[];
    modifiedFiles: Array<{
      file: DatasetFile;
      sizeChange: number;
      changeType: 'modified' | 'upgraded' | 'downgraded';
    }>;
    qualityChanges: {
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
      validity: number;
    };
  };
}

// 数据处理结果详情
export interface ProcessingResultDetail {
  taskId: string;
  taskName: string;
  datasetId: number;
  datasetName: string;
  processingType: ProcessingType;
  status: ProcessingStatus;
  
  // 输入数据信息
  inputData: {
    fileCount: number;
    totalSize: number;
    recordCount: number;
    sampleFiles: DatasetFile[];
    qualityMetrics: {
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
      validity: number;
    };
  };
  
  // 输出数据信息
  outputData: {
    fileCount: number;
    totalSize: number;
    recordCount: number;
    outputFiles: DatasetFile[];
    qualityMetrics: {
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
      validity: number;
    };
    outputFormat: OutputFormat;
    downloadUrl?: string;
    previewUrl?: string;
  };
  
  // 处理统计
  processingStats: {
    startTime: string;
    endTime?: string;
    duration?: number;
    progress: number;
    recordsProcessed: number;
    recordsSkipped: number;
    recordsFailed: number;
    processingSpeed: number; // 记录/秒
  };
  
  // 处理日志
  logs: Array<{
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    details?: any;
    file?: string;
    line?: number;
  }>;
  
  // 错误信息
  errors: Array<{
    timestamp: string;
    level: 'ERROR' | 'WARNING';
    message: string;
    details?: any;
    file?: string;
    line?: number;
    recordId?: string;
  }>;
  
  // 处理建议
  suggestions: Array<{
    type: 'quality' | 'performance' | 'optimization';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action?: string;
  }>;
  
  // 后续操作
  nextSteps: Array<{
    action: 'download' | 'preview' | 'analyze' | 'export' | 'version' | 'share';
    title: string;
    description: string;
    url?: string;
    enabled: boolean;
  }>;
}

// 数据处理工作流
export interface ProcessingWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: Array<{
    id: string;
    name: string;
    type: ProcessingType;
    config: ProcessingConfig;
    order: number;
    isRequired: boolean;
    estimatedTime: number;
    dependencies?: string[]; // 依赖的步骤ID
  }>;
  createdBy: string;
  createdTime: string;
  updatedTime?: string;
  isPublic: boolean;
  usageCount: number;
  tags?: string[];
}

// 数据处理模板
export interface ProcessingTemplate {
  id: string;
  name: string;
  description?: string;
  processingType: ProcessingType;
  config: ProcessingConfig;
  isPublic: boolean;
  createdBy: string;
  createdTime: string;
  updatedTime?: string;
  usageCount: number;
  tags?: string[];
  // 新增字段
  category?: 'cleaning' | 'transformation' | 'enrichment' | 'export' | 'custom';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;
  sampleInput?: any;
  sampleOutput?: any;
  documentation?: string;
}

// 数据处理统计
export interface ProcessingStats {
  totalTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalProcessingTime: number;
  totalRecordsProcessed: number;
  totalFileSize: number;
  byType: Record<ProcessingType, number>;
  byStatus: Record<ProcessingStatus, number>;
  byFormat: Record<OutputFormat, number>;
  recentTasks: DataProcessingTask[];
}

// 数据处理预览
export interface ProcessingPreview {
  totalRecords: number;
  sampleRecords: any[];
  fieldInfo: Array<{
    name: string;
    type: string;
    nullCount: number;
    uniqueCount: number;
    sampleValues: any[];
  }>;
  qualityMetrics: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
  };
  estimatedOutputSize: number;
  estimatedProcessingTime: number;
} 

// AI智能处理相关类型定义
export enum AIProcessingType {
  INTELLIGENT_CLEANING = "INTELLIGENT_CLEANING",     // 智能清洗
  SEMANTIC_FILTERING = "SEMANTIC_FILTERING",       // 语义过滤
  CONTENT_GENERATION = "CONTENT_GENERATION",       // 内容生成
  QUALITY_ASSESSMENT = "QUALITY_ASSESSMENT",       // 质量评估
  ENTITY_RECOGNITION = "ENTITY_RECOGNITION",       // 实体识别
  SENTIMENT_ANALYSIS = "SENTIMENT_ANALYSIS",       // 情感分析
  TOPIC_MODELING = "TOPIC_MODELING",               // 主题建模
  KEYWORD_EXTRACTION = "KEYWORD_EXTRACTION",       // 关键词提取
  QUESTION_GENERATION = "QUESTION_GENERATION",     // 问题生成
  ANSWER_GENERATION = "ANSWER_GENERATION",         // 答案生成
  SUMMARY_GENERATION = "SUMMARY_GENERATION",       // 摘要生成
  PARAPHRASE_GENERATION = "PARAPHRASE_GENERATION", // 改写生成
}

// AI模型类型
export enum AIModelType {
  CHATGLM = "CHATGLM",
  GPT = "GPT",
  CLAUDE = "CLAUDE",
  CUSTOM = "CUSTOM",
}

// AI处理配置
export interface AIProcessingConfig {
  modelType: AIModelType;
  modelName?: string;
  apiKey?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  
  // 智能清洗配置
  intelligentCleaning?: {
    semanticAnomalyDetection?: boolean;
    patternAnomalyDetection?: boolean;
    contextAnomalyDetection?: boolean;
    missingValueImputation?: boolean;
    errorCorrection?: boolean;
    formatStandardization?: boolean;
    semanticDeduplication?: boolean;
    fuzzyMatching?: boolean;
    contextAwareDedup?: boolean;
  };
  
  // 语义处理配置
  semanticProcessing?: {
    entityRecognition?: boolean;
    sentimentAnalysis?: boolean;
    topicModeling?: boolean;
    keywordExtraction?: boolean;
    language?: string;
    confidenceThreshold?: number;
  };
  
  // 内容生成配置
  contentGeneration?: {
    questionGeneration?: boolean;
    answerGeneration?: boolean;
    summaryGeneration?: boolean;
    paraphraseGeneration?: boolean;
    generationTemplate?: string;
    maxQuestions?: number;
    questionTypes?: Array<'factual' | 'inferential' | 'open_ended'>;
  };
  
  // 质量评估配置
  qualityAssessment?: {
    relevanceScoring?: boolean;
    coherenceScoring?: boolean;
    completenessScoring?: boolean;
    accuracyScoring?: boolean;
    scoringThreshold?: number;
    qualityMetrics?: string[];
  };
}

// 知识库问答数据集配置
export interface KnowledgeBaseConfig {
  format: KnowledgeBaseFormat;
  chunkSize: number;
  overlap: number;
  metadata?: Record<string, any>;
  
  // 文档解析配置
  documentParsing?: {
    supportedFormats: Array<'pdf' | 'docx' | 'xlsx' | 'html' | 'md' | 'txt'>;
    extractImages?: boolean;
    extractTables?: boolean;
    extractHeaders?: boolean;
    preserveFormatting?: boolean;
  };
  
  // 智能分块配置
  intelligentChunking?: {
    method: 'semantic' | 'fixed' | 'adaptive';
    semanticThreshold?: number;
    maxChunkSize?: number;
    minChunkSize?: number;
    preserveContext?: boolean;
  };
  
  // 问答生成配置
  qaGeneration?: {
    questionTypes: Array<'factual' | 'inferential' | 'open_ended' | 'multiple_choice'>;
    answerTypes: Array<'extractive' | 'generative' | 'hybrid'>;
    questionTemplates?: string[];
    answerTemplates?: string[];
    maxQuestionsPerChunk?: number;
    qualityThreshold?: number;
  };
  
  // 向量化配置
  vectorization?: {
    model: string;
    dimension: number;
    normalize?: boolean;
    batchSize?: number;
  };
}

// 模型训练数据集配置
export interface TrainingDatasetConfig {
  format: TrainingFormat;
  
  // 指令学习配置
  instructionTuning?: {
    instructionTemplate: string;
    inputTemplate?: string;
    outputTemplate?: string;
    systemPrompt?: string;
    maxLength?: number;
    truncation?: boolean;
  };
  
  // 对话训练配置
  conversation?: {
    systemTemplate: string;
    userTemplate: string;
    assistantTemplate: string;
    maxTurns?: number;
    includeSystemMessage?: boolean;
  };
  
  // 文本生成配置
  textGeneration?: {
    promptTemplate: string;
    completionTemplate?: string;
    maxLength?: number;
    temperature?: number;
  };
  
  // 分类任务配置
  classification?: {
    labels: string[];
    labelMapping?: Record<string, string>;
    multiLabel?: boolean;
    confidenceThreshold?: number;
  };
  
  // 数据增强配置
  dataAugmentation?: {
    enabled: boolean;
    methods: Array<'paraphrase' | 'back_translation' | 'synonym_replacement' | 'sentence_insertion' | 'sentence_deletion'>;
    augmentationRatio?: number;
    preserveOriginal?: boolean;
  };
}

// 智能配置界面类型
export interface IntelligentConfig {
  // 自然语言配置
  naturalLanguage?: {
    intent: string;
    parameters: Record<string, any>;
    confidence: number;
    suggestions?: string[];
  };
  
  // 可视化配置
  visualConfig?: {
    flowSteps: Array<{
      id: string;
      type: ProcessingType | AIProcessingType;
      config: ProcessingConfig | AIProcessingConfig;
      position: { x: number; y: number };
      connections: string[];
    }>;
    layout: 'horizontal' | 'vertical' | 'grid';
  };
  
  // 智能推荐
  recommendations?: Array<{
    type: 'config' | 'template' | 'best_practice';
    title: string;
    description: string;
    confidence: number;
    action: string;
    config?: ProcessingConfig | AIProcessingConfig;
  }>;
}

// AI助手交互类型
export interface AIAssistantInteraction {
  // 对话式配置
  conversation?: {
    messages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
      timestamp: string;
      metadata?: any;
    }>;
    context: Record<string, any>;
    intent?: string;
  };
  
  // 智能指导
  guidance?: {
    currentStep: string;
    nextSteps: string[];
    suggestions: string[];
    warnings?: string[];
    tips?: string[];
  };
  
  // 学习与适应
  learning?: {
    userPreferences: Record<string, any>;
    behaviorPatterns: Array<{
      pattern: string;
      frequency: number;
      lastUsed: string;
    }>;
    personalizedSettings: Record<string, any>;
  };
}

// 数据质量评估结果
export interface QualityAssessmentResult {
  // 完整性评估
  completeness: {
    score: number;
    missingValueRate: number;
    fieldCompleteness: Record<string, number>;
    recordCompleteness: number;
    issues: Array<{
      field: string;
      missingCount: number;
      missingRate: number;
    }>;
  };
  
  // 准确性评估
  accuracy: {
    score: number;
    semanticAccuracy: number;
    factualAccuracy: number;
    logicalConsistency: number;
    issues: Array<{
      type: string;
      count: number;
      description: string;
      examples: any[];
    }>;
  };
  
  // 一致性评估
  consistency: {
    score: number;
    formatConsistency: number;
    valueConsistency: number;
    temporalConsistency: number;
    issues: Array<{
      type: string;
      field: string;
      inconsistencyCount: number;
      examples: any[];
    }>;
  };
  
  // 相关性评估
  relevance: {
    score: number;
    domainRelevance: number;
    taskRelevance: number;
    contextRelevance: number;
    issues: Array<{
      type: string;
      count: number;
      description: string;
    }>;
  };
  
  // 可用性评估
  usability: {
    score: number;
    readability: number;
    accessibility: number;
    interpretability: number;
    issues: Array<{
      type: string;
      count: number;
      description: string;
    }>;
  };
  
  // 总体评分
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
    expectedImprovement: number;
  }>;
}



// 扩展DataProcessingTask以支持AI处理
export interface DataProcessingTask {
  id: string;
  name: string;
  description?: string;
  datasetId: string;
  datasetName?: string;
  processingType: ProcessingType;
  config: ProcessingConfig;
  inputPath: string;
  outputPath: string;
  status: ProcessingStatus;
  progress: number;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
  createdTime: string;
  createdBy: string;
  updatedTime?: string;
  fileSize?: number;
  recordCount?: number;
  processingTime?: number;
  outputFormat?: OutputFormat;
  tags?: string[];
  
  // AI处理相关字段
  aiProcessingType?: AIProcessingType;
  aiModelType?: AIModelType;
  qualityAssessment?: QualityAssessmentResult;
  intelligentConfig?: IntelligentConfig;
  aiAssistant?: AIAssistantInteraction;
  
  // 知识库相关字段
  knowledgeBaseConfig?: KnowledgeBaseConfig;
  trainingConfig?: TrainingDatasetConfig;
  
  // 处理结果扩展
  aiProcessingResults?: {
    semanticAnalysis?: any;
    contentGeneration?: any;
    qualityAssessment?: QualityAssessmentResult;
    recommendations?: string[];
  };
}

// 扩展ProcessingResult以支持AI处理结果
export interface ProcessingResult {
  taskId: string;
  outputPath: string;
  outputFormat: OutputFormat;
  recordCount: number;
  fileSize: number;
  processingTime: number;
  qualityReport?: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
    issues: Array<{
      type: string;
      count: number;
      description: string;
    }>;
  };
  metadata?: Record<string, any>;
  downloadUrl?: string;
  previewUrl?: string;
  
  // AI处理结果
  aiProcessingResults?: {
    semanticAnalysis?: any;
    contentGeneration?: any;
    qualityAssessment?: QualityAssessmentResult;
    recommendations?: string[];
  };
  
  // 知识库结果
  knowledgeBaseResults?: {
    chunks: Array<{
      id: string;
      content: string;
      metadata: Record<string, any>;
      embeddings?: number[];
    }>;
    qaPairs: Array<{
      question: string;
      answer: string;
      context: string;
      confidence: number;
    }>;
    vectorIndex?: string;
  };
  
  // 训练数据集结果
  trainingResults?: {
    samples: any[];
    format: TrainingFormat;
    statistics: {
      totalSamples: number;
      validSamples: number;
      invalidSamples: number;
      byType: Record<string, number>;
    };
  };
} 

// 数据处理结果详情
export interface ProcessingResultDetail {
  taskId: string;
  taskName: string;
  datasetId: number;
  datasetName: string;
  processingType: ProcessingType;
  status: ProcessingStatus;
  
  // 输入数据信息
  inputData: {
    fileCount: number;
    totalSize: number;
    recordCount: number;
    sampleFiles: DatasetFile[];
    qualityMetrics: {
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
      validity: number;
    };
  };
  
  // 输出数据信息
  outputData: {
    fileCount: number;
    totalSize: number;
    recordCount: number;
    outputFiles: DatasetFile[];
    qualityMetrics: {
      completeness: number;
      accuracy: number;
      consistency: number;
      timeliness: number;
      validity: number;
    };
    outputFormat: OutputFormat;
    downloadUrl?: string;
    previewUrl?: string;
  };
  
  // 处理统计
  processingStats: {
    startTime: string;
    endTime?: string;
    duration?: number;
    progress: number;
    recordsProcessed: number;
    recordsSkipped: number;
    recordsFailed: number;
    processingSpeed: number; // 记录/秒
  };
  
  // 处理日志
  logs: Array<{
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    details?: any;
    file?: string;
    line?: number;
  }>;
  
  // 错误信息
  errors: Array<{
    timestamp: string;
    level: 'ERROR' | 'WARNING';
    message: string;
    details?: any;
    file?: string;
    line?: number;
    recordId?: string;
  }>;
  
  // 处理建议
  suggestions: Array<{
    type: 'quality' | 'performance' | 'optimization';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action?: string;
  }>;
  
  // 后续操作
  nextSteps: Array<{
    action: 'download' | 'preview' | 'analyze' | 'export' | 'version' | 'share';
    title: string;
    description: string;
    url?: string;
    enabled: boolean;
  }>;
}

// 数据处理工作流
export interface ProcessingWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: Array<{
    id: string;
    name: string;
    type: ProcessingType;
    config: ProcessingConfig;
    order: number;
    isRequired: boolean;
    estimatedTime: number;
    dependencies?: string[]; // 依赖的步骤ID
  }>;
  createdBy: string;
  createdTime: string;
  updatedTime?: string;
  isPublic: boolean;
  usageCount: number;
  tags?: string[];
}

// 数据处理模板
export interface ProcessingTemplate {
  id: string;
  name: string;
  description?: string;
  processingType: ProcessingType;
  config: ProcessingConfig;
  isPublic: boolean;
  createdBy: string;
  createdTime: string;
  updatedTime?: string;
  usageCount: number;
  tags?: string[];
  // 新增字段
  category?: 'cleaning' | 'transformation' | 'enrichment' | 'export' | 'custom';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;
  sampleInput?: any;
  sampleOutput?: any;
  documentation?: string;
}

// 数据处理统计
export interface ProcessingStats {
  totalTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalProcessingTime: number;
  totalRecordsProcessed: number;
  totalFileSize: number;
  byType: Record<ProcessingType, number>;
  byStatus: Record<ProcessingStatus, number>;
  byFormat: Record<OutputFormat, number>;
  recentTasks: DataProcessingTask[];
}

// 数据处理预览
export interface ProcessingPreview {
  totalRecords: number;
  sampleRecords: any[];
  fieldInfo: Array<{
    name: string;
    type: string;
    nullCount: number;
    uniqueCount: number;
    sampleValues: any[];
  }>;
  qualityMetrics: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
  };
  estimatedOutputSize: number;
  estimatedProcessingTime: number;
} 