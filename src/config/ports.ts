/**
 * 全局端口配置管理
 * 统一管理所有后端模块的端口配置
 */

// 模块端口配置
export const MODULE_PORTS = {
  // 数据管理模块
  DATASOURCE: 9102,      // 数据源管理
  DATASET: 9101,         // 数据集管理
  COLLECT: 9103,         // 数据采集
  PROCESS: 9104,         // 数据处理
  
  // 数据标注与增强模块
  ANNOTATION: 9105,      // 数据标注
  AUGMENT: 9106,         // 数据增强
  SYNTHESIS: 9107,       // 数据合成
  
  // 数据质量与评估模块
  QUALITY: 9108,         // 数据质量
  EVALUATION: 9109,      // 数据评估
  
  // 数据安全与操作模块
  SECURITY: 9110,        // 数据安全
  OPERATION: 9111,       // 数据操作
  
  // 数据导出与系统模块
  EXPORT: 9112,          // 数据导出
  SYSTEM: 9113,          // 系统管理
  GATEWAY: 9114,         // 网关服务
} as const;

// 模块名称映射
export const MODULE_NAMES = {
  [MODULE_PORTS.DATASOURCE]: '数据源管理',
  [MODULE_PORTS.DATASET]: '数据集管理',
  [MODULE_PORTS.COLLECT]: '数据采集',
  [MODULE_PORTS.PROCESS]: '数据处理',
  [MODULE_PORTS.ANNOTATION]: '数据标注',
  [MODULE_PORTS.AUGMENT]: '数据增强',
  [MODULE_PORTS.SYNTHESIS]: '数据合成',
  [MODULE_PORTS.QUALITY]: '数据质量',
  [MODULE_PORTS.EVALUATION]: '数据评估',
  [MODULE_PORTS.SECURITY]: '数据安全',
  [MODULE_PORTS.OPERATION]: '数据操作',
  [MODULE_PORTS.EXPORT]: '数据导出',
  [MODULE_PORTS.SYSTEM]: '系统管理',
  [MODULE_PORTS.GATEWAY]: '网关服务',
} as const;

// API路径配置
export const API_PATHS = {
  [MODULE_PORTS.DATASOURCE]: '/api/v1/datasources',
  [MODULE_PORTS.DATASET]: '/api/v1/datasets',
  [MODULE_PORTS.COLLECT]: '/api/v1/collect',
  [MODULE_PORTS.PROCESS]: '/api/v1/process',
  [MODULE_PORTS.ANNOTATION]: '/api/v1/annotation',
  [MODULE_PORTS.AUGMENT]: '/api/v1/augment',
  [MODULE_PORTS.SYNTHESIS]: '/api/v1/synthesis',
  [MODULE_PORTS.QUALITY]: '/api/v1/quality',
  [MODULE_PORTS.EVALUATION]: '/api/v1/evaluation',
  [MODULE_PORTS.SECURITY]: '/api/v1/security',
  [MODULE_PORTS.OPERATION]: '/api/v1/operation',
  [MODULE_PORTS.EXPORT]: '/api/v1/export',
  [MODULE_PORTS.SYSTEM]: '/api/v1/system',
  [MODULE_PORTS.GATEWAY]: '/api/v1/gateway',
} as const;

// 环境变量映射
export const ENV_VAR_MAPPING = {
  [MODULE_PORTS.DATASOURCE]: 'NEXT_PUBLIC_DATASOURCE_API_URL',
  [MODULE_PORTS.DATASET]: 'NEXT_PUBLIC_DATASET_API_URL',
  [MODULE_PORTS.COLLECT]: 'NEXT_PUBLIC_COLLECT_API_URL',
  [MODULE_PORTS.PROCESS]: 'NEXT_PUBLIC_PROCESS_API_URL',
  [MODULE_PORTS.ANNOTATION]: 'NEXT_PUBLIC_ANNOTATION_API_URL',
  [MODULE_PORTS.AUGMENT]: 'NEXT_PUBLIC_AUGMENT_API_URL',
  [MODULE_PORTS.SYNTHESIS]: 'NEXT_PUBLIC_SYNTHESIS_API_URL',
  [MODULE_PORTS.QUALITY]: 'NEXT_PUBLIC_QUALITY_API_URL',
  [MODULE_PORTS.EVALUATION]: 'NEXT_PUBLIC_EVALUATION_API_URL',
  [MODULE_PORTS.SECURITY]: 'NEXT_PUBLIC_SECURITY_API_URL',
  [MODULE_PORTS.OPERATION]: 'NEXT_PUBLIC_OPERATION_API_URL',
  [MODULE_PORTS.EXPORT]: 'NEXT_PUBLIC_EXPORT_API_URL',
  [MODULE_PORTS.SYSTEM]: 'NEXT_PUBLIC_SYSTEM_API_URL',
  [MODULE_PORTS.GATEWAY]: 'NEXT_PUBLIC_GATEWAY_API_URL',
} as const;

// 端口类型
export type ModulePort = typeof MODULE_PORTS[keyof typeof MODULE_PORTS];

// 获取模块URL的工具函数
export function getModuleUrl(port: ModulePort, path: string = ''): string {
  const envVar = ENV_VAR_MAPPING[port];
  const envUrl = (process.env as any)[envVar];
  
  if (envUrl) {
    return `${envUrl}${path}`;
  }
  
  const baseUrl = `http://localhost:${port}/api/v1`;
  return `${baseUrl}${path}`;
}

// 获取模块API客户端配置
export function getModuleApiConfig(port: ModulePort) {
  return {
    baseURL: getModuleUrl(port),
    port,
    moduleName: MODULE_NAMES[port],
    apiPath: API_PATHS[port],
  };
}

// 获取所有模块配置
export function getAllModuleConfigs() {
  return Object.entries(MODULE_PORTS).map(([key, port]) => ({
    key,
    port,
    name: MODULE_NAMES[port],
    apiPath: API_PATHS[port],
    envVar: ENV_VAR_MAPPING[port],
    url: getModuleUrl(port),
  }));
}

// 端口范围检查
export function isValidPort(port: number): boolean {
  return port >= 9101 && port <= 9114;
}

// 批量更新端口配置
export function updateModulePorts(newPorts: Partial<Record<keyof typeof MODULE_PORTS, number>>) {
  Object.entries(newPorts).forEach(([module, port]) => {
    if (isValidPort(port)) {
      (MODULE_PORTS as any)[module] = port;
    } else {
      console.warn(`Invalid port ${port} for module ${module}`);
    }
  });
}

// 导出默认配置
export default {
  MODULE_PORTS,
  MODULE_NAMES,
  API_PATHS,
  ENV_VAR_MAPPING,
  getModuleUrl,
  getModuleApiConfig,
  getAllModuleConfigs,
  isValidPort,
  updateModulePorts,
}; 