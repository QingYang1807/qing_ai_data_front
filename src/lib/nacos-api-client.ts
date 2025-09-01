/**
 * 基于Nacos的统一API客户端
 * 提供类型安全的API调用接口
 */

import { nacosClient, SERVICE_NAMES, type ApiResponse } from './nacos-client';

// 通用分页参数
interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}

// 通用分页响应
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 用户登录参数
interface LoginParams {
  username: string;
  password: string;
}

// 用户登录响应
interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    roles: string[];
  };
}

// 数据源信息
interface DatasourceInfo {
  id: number;
  name: string;
  type: string;
  url: string;
  status: string;
  createTime: string;
}

// 数据集信息
interface DatasetInfo {
  id: number;
  name: string;
  description: string;
  size: number;
  status: string;
  createTime: string;
}

/**
 * 系统管理模块API
 */
const systemApi = {
  // 认证相关
  auth: {
    // 用户登录
    login: (data: LoginParams): Promise<ApiResponse<LoginResponse>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/auth/login', {
        method: 'POST',
        body: data,
      }),

    // 用户注册
    register: (data: any): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/auth/register', {
        method: 'POST',
        body: data,
      }),

    // 获取用户信息
    getUserInfo: (userId: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/auth/user-info/${userId}`),

    // 用户登出
    logout: (): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/auth/logout', {
        method: 'POST',
      }),
  },

  // 权限管理
  permission: {
    // 获取用户菜单权限
    getUserMenus: (userId: number): Promise<ApiResponse<any[]>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/permission/user-menus/${userId}`),

    // 获取所有菜单权限
    getAllMenus: (): Promise<ApiResponse<any[]>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/permission/all-menus'),

    // 获取菜单树结构
    getMenuTree: (): Promise<ApiResponse<any[]>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/permission/menu-tree'),

    // 根据ID查询权限
    getById: (id: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/permission/${id}`),

    // 保存权限
    save: (data: any): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/permission', {
        method: 'POST',
        body: data,
      }),

    // 更新权限
    update: (data: any): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/permission', {
        method: 'PUT',
        body: data,
      }),

    // 删除权限
    delete: (id: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/permission/${id}`, {
        method: 'DELETE',
      }),

    // 根据角色ID获取权限
    getByRoleId: (roleId: number): Promise<ApiResponse<any[]>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/permission/role/${roleId}`),
  },

  // 用户管理
  user: {
    // 获取用户列表
    getUsers: (params?: PageParams): Promise<ApiResponse<PageResponse<any>>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/user/list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: params,
      }),

    // 获取用户详情
    getUser: (id: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/user/${id}`),

    // 创建用户
    createUser: (data: any): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/user', {
        method: 'POST',
        body: data,
      }),

    // 更新用户
    updateUser: (id: number, data: any): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/user/${id}`, {
        method: 'PUT',
        body: data,
      }),

    // 删除用户
    deleteUser: (id: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/user/${id}`, {
        method: 'DELETE',
      }),

    // 更新用户状态
    updateUserStatus: (id: number, status: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/user/${id}/status`, {
        method: 'PUT',
        body: { status },
      }),
  },

  // 角色管理
  role: {
    // 获取角色列表
    getRoles: (params?: PageParams): Promise<ApiResponse<PageResponse<any>>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/role/list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: params,
      }),

    // 获取角色详情
    getRole: (id: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/role/${id}`),

    // 创建角色
    createRole: (data: any): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/role', {
        method: 'POST',
        body: data,
      }),

    // 更新角色
    updateRole: (id: number, data: any): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/role/${id}`, {
        method: 'PUT',
        body: data,
      }),

    // 删除角色
    deleteRole: (id: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/role/${id}`, {
        method: 'DELETE',
      }),
  },

  // 租户管理
  tenant: {
    // 获取租户列表
    getTenants: (params?: PageParams): Promise<ApiResponse<PageResponse<any>>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/tenant/list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: params,
      }),

    // 获取租户详情
    getTenant: (id: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/tenant/${id}`),

    // 创建租户
    createTenant: (data: any): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/tenant', {
        method: 'POST',
        body: data,
      }),

    // 更新租户
    updateTenant: (id: number, data: any): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/tenant/${id}`, {
        method: 'PUT',
        body: data,
      }),

    // 删除租户
    deleteTenant: (id: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/tenant/${id}`, {
        method: 'DELETE',
      }),
  },

  // 项目管理
  project: {
    // 获取项目列表
    getProjects: (params?: PageParams): Promise<ApiResponse<PageResponse<any>>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/project/list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: params,
      }),

    // 获取项目详情
    getProject: (id: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/project/${id}`),

    // 创建项目
    createProject: (data: any): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, '/api/v1/project', {
        method: 'POST',
        body: data,
      }),

    // 更新项目
    updateProject: (id: number, data: any): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/project/${id}`, {
        method: 'PUT',
        body: data,
      }),

    // 删除项目
    deleteProject: (id: number): Promise<ApiResponse<any>> =>
      nacosClient.call(SERVICE_NAMES.SYSTEM, `/api/v1/project/${id}`, {
        method: 'DELETE',
      }),
  },
};

/**
 * 数据源管理模块API
 */
const datasourceApi = {
  // 获取数据源列表
  list: (params?: PageParams): Promise<ApiResponse<PageResponse<DatasourceInfo>>> =>
    nacosClient.call(SERVICE_NAMES.DATASOURCE, '/api/v1/datasource/list', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: params,
    }),

  // 获取数据源详情
  get: (id: number): Promise<ApiResponse<DatasourceInfo>> =>
    nacosClient.call(SERVICE_NAMES.DATASOURCE, `/api/v1/datasource/${id}`),

  // 创建数据源
  create: (data: any): Promise<ApiResponse<DatasourceInfo>> =>
    nacosClient.call(SERVICE_NAMES.DATASOURCE, '/api/v1/datasource', {
      method: 'POST',
      body: data,
    }),

  // 更新数据源
  update: (id: number, data: any): Promise<ApiResponse<DatasourceInfo>> =>
    nacosClient.call(SERVICE_NAMES.DATASOURCE, `/api/v1/datasource/${id}`, {
      method: 'PUT',
      body: data,
    }),

  // 删除数据源
  delete: (id: number): Promise<ApiResponse<any>> =>
    nacosClient.call(SERVICE_NAMES.DATASOURCE, `/api/v1/datasource/${id}`, {
      method: 'DELETE',
    }),

  // 测试数据源连接
  testConnection: (data: any): Promise<ApiResponse<any>> =>
    nacosClient.call(SERVICE_NAMES.DATASOURCE, '/api/v1/datasource/test-connection', {
      method: 'POST',
      body: data,
    }),
};

/**
 * 数据集管理模块API
 */
const datasetApi = {
  // 获取数据集列表
  list: (params?: PageParams): Promise<ApiResponse<PageResponse<DatasetInfo>>> =>
    nacosClient.call(SERVICE_NAMES.DATASET, '/api/v1/dataset/list', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: params,
    }),

  // 获取数据集详情
  get: (id: number): Promise<ApiResponse<DatasetInfo>> =>
    nacosClient.call(SERVICE_NAMES.DATASET, `/api/v1/dataset/${id}`),

  // 创建数据集
  create: (data: any): Promise<ApiResponse<DatasetInfo>> =>
    nacosClient.call(SERVICE_NAMES.DATASET, '/api/v1/dataset', {
      method: 'POST',
      body: data,
    }),

  // 更新数据集
  update: (id: number, data: any): Promise<ApiResponse<DatasetInfo>> =>
    nacosClient.call(SERVICE_NAMES.DATASET, `/api/v1/dataset/${id}`, {
      method: 'PUT',
      body: data,
    }),

  // 删除数据集
  delete: (id: number): Promise<ApiResponse<any>> =>
    nacosClient.call(SERVICE_NAMES.DATASET, `/api/v1/dataset/${id}`, {
      method: 'DELETE',
    }),

  // 上传数据集
  upload: (data: FormData): Promise<ApiResponse<any>> =>
    nacosClient.call(SERVICE_NAMES.DATASET, '/api/v1/dataset/upload', {
      method: 'POST',
      body: data,
      headers: {}, // 让浏览器自动设置Content-Type
    }),
};

/**
 * 统一API客户端
 */
export const nacosApiClient = {
  system: systemApi,
  datasource: datasourceApi,
  dataset: datasetApi,
  // 可以继续添加其他模块的API
};

// 导出类型
export type {
  LoginParams,
  LoginResponse,
  DatasourceInfo,
  DatasetInfo,
  PageParams,
  PageResponse,
}; 