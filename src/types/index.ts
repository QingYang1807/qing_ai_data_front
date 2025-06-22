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

// 数据源类型枚举
export enum DataSourceType {
  MYSQL = "MYSQL",
  POSTGRESQL = "POSTGRESQL", 
  ORACLE = "ORACLE",
  HIVE = "HIVE",
  FTP = "FTP",
  SFTP = "SFTP",
  KAFKA = "KAFKA",
  HDFS = "HDFS",
}

// 数据源状态枚举
export enum DataSourceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
}

// 数据源实体类型
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  host: string;
  port: number;
  database?: string;
  username: string;
  password: string;
  connectionUrl: string;
  description?: string;
  status: DataSourceStatus;
  isEnabled: boolean;
  createdTime: string;
  updatedTime: string;
  createdBy: string;
  updatedBy: string;
}

// 数据源创建DTO
export interface DataSourceCreateRequest {
  name: string;
  type: DataSourceType;
  host: string;
  port: number;
  database?: string;
  username: string;
  password: string;
  description?: string;
}

// 数据源更新DTO
export interface DataSourceUpdateRequest {
  name?: string;
  type?: DataSourceType;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  description?: string;
}

// 数据源查询DTO
export interface DataSourceQueryRequest {
  name?: string;
  type?: DataSourceType;
  status?: DataSourceStatus;
  isEnabled?: boolean;
  page?: number;
  size?: number;
}

// 数据类型枚举
export enum DataType {
  TEXT = "TEXT",
  IMAGE = "IMAGE", 
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  STRUCTURED = "STRUCTURED",
}

// 数据集状态枚举
export enum DatasetStatus {
  CREATING = "CREATING",
  ACTIVE = "ACTIVE",
  PROCESSING = "PROCESSING",
  ARCHIVED = "ARCHIVED",
  ERROR = "ERROR",
}

// 数据集实体类型
export interface Dataset {
  id: string;
  name: string;
  description?: string;
  dataType: DataType;
  sourceId: string;
  sourcePath: string;
  targetPath: string;
  totalSize: number;
  fileCount: number;
  status: DatasetStatus;
  version: string;
  tags?: string[];
  isPublic: boolean;
  createdTime: string;
  updatedTime: string;
  createdBy: string;
  updatedBy: string;
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
export interface SystemStats {
  totalDatasets: number;
  runningTasks: number;
  completedTasks: number;
  storageUsage: number;
  storageTotal: number;
} 