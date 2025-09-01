import { nacosApiClient } from '@/lib/nacos-api-client';

// 认证相关API - 使用Nacos客户端
export const authAPI = {
  // 用户登录
  login: (data: { username: string; password: string }) =>
    nacosApiClient.system.auth.login(data),
  
  // 用户注册
  register: (data: any) =>
    nacosApiClient.system.auth.register(data),
  
  // 获取用户信息
  getUserInfo: (userId: number) =>
    nacosApiClient.system.auth.getUserInfo(userId),
  
  // 用户登出
  logout: () =>
    nacosApiClient.system.auth.logout(),
};

// 权限管理API - 使用Nacos客户端
export const permissionAPI = {
  // 获取用户菜单权限
  getUserMenus: (userId: number) =>
    nacosApiClient.system.permission.getUserMenus(userId),
  
  // 获取所有菜单权限
  getAllMenus: () =>
    nacosApiClient.system.permission.getAllMenus(),
  
  // 获取菜单树结构
  getMenuTree: () =>
    nacosApiClient.system.permission.getMenuTree(),
  
  // 根据ID查询权限
  getById: (id: number) =>
    nacosApiClient.system.permission.getById(id),
  
  // 保存权限
  save: (data: any) =>
    nacosApiClient.system.permission.save(data),
  
  // 更新权限
  update: (data: any) =>
    nacosApiClient.system.permission.update(data),
  
  // 删除权限
  delete: (id: number) =>
    nacosApiClient.system.permission.delete(id),
  
  // 根据角色ID获取权限
  getByRoleId: (roleId: number) =>
    nacosApiClient.system.permission.getByRoleId(roleId),
};

// 用户管理API - 使用Nacos客户端
export const userAPI = {
  // 获取用户列表
  getUsers: (params?: any) =>
    nacosApiClient.system.user.getUsers(params),
  
  // 获取用户详情
  getUser: (id: number) =>
    nacosApiClient.system.user.getUser(id),
  
  // 创建用户
  createUser: (data: any) =>
    nacosApiClient.system.user.createUser(data),
  
  // 更新用户
  updateUser: (id: number, data: any) =>
    nacosApiClient.system.user.updateUser(id, data),
  
  // 删除用户
  deleteUser: (id: number) =>
    nacosApiClient.system.user.deleteUser(id),
  
  // 更新用户状态
  updateUserStatus: (id: number, status: number) =>
    nacosApiClient.system.user.updateUserStatus(id, status),
};

// 角色管理API - 使用Nacos客户端
export const roleAPI = {
  // 获取角色列表
  getRoles: (params?: any) =>
    nacosApiClient.system.role.getRoles(params),
  
  // 获取角色详情
  getRole: (id: number) =>
    nacosApiClient.system.role.getRole(id),
  
  // 创建角色
  createRole: (data: any) =>
    nacosApiClient.system.role.createRole(data),
  
  // 更新角色
  updateRole: (id: number, data: any) =>
    nacosApiClient.system.role.updateRole(id, data),
  
  // 删除角色
  deleteRole: (id: number) =>
    nacosApiClient.system.role.deleteRole(id),
};

// 租户管理API - 使用Nacos客户端
export const tenantAPI = {
  // 获取租户列表
  getTenants: (params?: any) =>
    nacosApiClient.system.tenant.getTenants(params),
  
  // 获取租户详情
  getTenant: (id: number) =>
    nacosApiClient.system.tenant.getTenant(id),
  
  // 创建租户
  createTenant: (data: any) =>
    nacosApiClient.system.tenant.createTenant(data),
  
  // 更新租户
  updateTenant: (id: number, data: any) =>
    nacosApiClient.system.tenant.updateTenant(id, data),
  
  // 删除租户
  deleteTenant: (id: number) =>
    nacosApiClient.system.tenant.deleteTenant(id),
};

// 项目管理API - 使用Nacos客户端
export const projectAPI = {
  // 获取项目列表
  getProjects: (params?: any) =>
    nacosApiClient.system.project.getProjects(params),
  
  // 获取项目详情
  getProject: (id: number) =>
    nacosApiClient.system.project.getProject(id),
  
  // 创建项目
  createProject: (data: any) =>
    nacosApiClient.system.project.createProject(data),
  
  // 更新项目
  updateProject: (id: number, data: any) =>
    nacosApiClient.system.project.updateProject(id, data),
  
  // 删除项目
  deleteProject: (id: number) =>
    nacosApiClient.system.project.deleteProject(id),
}; 