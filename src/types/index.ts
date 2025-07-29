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
  processingType: string;
  inputPath: string;
  outputPath: string;
  status: TaskStatus;
  progress: number;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
  createdTime: string;
  createdBy: string;
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