/**
 * 前端Nacos客户端
 * 支持服务发现和统一的API调用
 */

// 服务名称映射
export const SERVICE_NAMES = {
  DATASOURCE: 'qing-ai-data-datasource',
  DATASET: 'qing-ai-data-dataset',
  COLLECT: 'qing-ai-data-collect',
  PROCESS: 'qing-ai-data-process',
  ANNOTATION: 'qing-ai-data-annotation',
  AUGMENT: 'qing-ai-data-augment',
  SYNTHESIS: 'qing-ai-data-synthesis',
  QUALITY: 'qing-ai-data-quality',
  EVALUATION: 'qing-ai-data-evaluation',
  SECURITY: 'qing-ai-data-security',
  OPERATION: 'qing-ai-data-operation',
  EXPORT: 'qing-ai-data-export',
  SYSTEM: 'qing-ai-data-system',
  GATEWAY: 'qing-ai-data-gateway',
} as const;

// 服务类型
export type ServiceName = typeof SERVICE_NAMES[keyof typeof SERVICE_NAMES];

// 服务实例信息
interface ServiceInstance {
  instanceId: string;
  ip: string;
  port: number;
  healthy: boolean;
  weight: number;
  metadata: Record<string, string>;
}

// Nacos客户端配置
interface NacosConfig {
  serverAddr: string;
  namespace: string;
  group: string;
  timeout?: number;
}

// API请求配置
interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// API响应格式
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 自定义错误类
class NacosError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'NacosError';
  }
}

/**
 * Nacos客户端类
 */
class NacosClient {
  private config: NacosConfig;
  private serviceCache: Map<string, ServiceInstance[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 30000; // 30秒缓存

  constructor(config: NacosConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  /**
   * 获取服务实例列表
   */
  private async getServiceInstances(serviceName: ServiceName): Promise<ServiceInstance[]> {
    const now = Date.now();
    const cacheKey = serviceName;
    const cached = this.serviceCache.get(cacheKey);
    const expiry = this.cacheExpiry.get(cacheKey) || 0;

    // 检查缓存是否有效
    if (cached && now < expiry) {
      return cached.filter(instance => instance.healthy);
    }

    try {
      // 调用Nacos API获取服务实例
      const response = await fetch(
        `${this.config.serverAddr}/nacos/v1/ns/instance/list?serviceName=${serviceName}&namespaceId=${this.config.namespace}&groupName=${this.config.group}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(this.config.timeout!),
        }
      );

      if (!response.ok) {
        throw new NacosError(
          `Failed to get service instances for ${serviceName}`,
          'SERVICE_DISCOVERY_ERROR',
          response.status
        );
      }

      const data = await response.json();
      const instances: ServiceInstance[] = data.hosts || [];

      // 更新缓存
      this.serviceCache.set(cacheKey, instances);
      this.cacheExpiry.set(cacheKey, now + this.CACHE_TTL);

      return instances.filter(instance => instance.healthy);
    } catch (error) {
      // 如果服务发现失败，尝试使用本地开发配置
      if (process.env.NODE_ENV === 'development') {
        return this.getLocalDevelopmentInstances(serviceName);
      }
      throw error;
    }
  }

  /**
   * 获取本地开发环境的服务实例（降级方案）
   * 所有请求都通过网关
   */
  private getLocalDevelopmentInstances(serviceName: ServiceName): ServiceInstance[] {
    // 所有服务都通过网关访问
    return [{
      instanceId: `${serviceName}-gateway`,
      ip: 'localhost',
      port: 9114, // 网关端口
      healthy: true,
      weight: 1,
      metadata: {},
    }];
  }

  /**
   * 选择服务实例（简单的轮询负载均衡）
   */
  private selectInstance(instances: ServiceInstance[]): ServiceInstance {
    if (instances.length === 0) {
      throw new NacosError(
        'No healthy service instances available',
        'NO_HEALTHY_INSTANCES'
      );
    }

    // 简单的轮询选择
    const index = Math.floor(Math.random() * instances.length);
    return instances[index];
  }

  /**
   * 调用服务API
   */
  async call<T = any>(
    serviceName: ServiceName,
    path: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      // 获取服务实例
      const instances = await this.getServiceInstances(serviceName);
      const instance = this.selectInstance(instances);

      // 构建请求URL
      const url = `http://${instance.ip}:${instance.port}${path}`;

      // 准备请求配置
      const requestConfig: RequestInit = {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        signal: AbortSignal.timeout(config.timeout || this.config.timeout!),
      };

      // 添加请求体
      if (config.body && ['POST', 'PUT', 'PATCH'].includes(requestConfig.method!)) {
        requestConfig.body = typeof config.body === 'string' 
          ? config.body 
          : JSON.stringify(config.body);
      }

      // 添加认证token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        requestConfig.headers = {
          ...requestConfig.headers,
          'Authorization': `Bearer ${token}`,
        };
      }

      // 发送请求
      const response = await fetch(url, requestConfig);

      if (!response.ok) {
        throw new NacosError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR',
          response.status
        );
      }

      const data = await response.json();

      // 检查业务错误
      if (data.code !== undefined && data.code !== 200) {
        throw new NacosError(
          data.message || 'Business error',
          'BUSINESS_ERROR',
          data.code
        );
      }

      return data;
    } catch (error) {
      if (error instanceof NacosError) {
        throw error;
      }

      // 网络错误
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NacosError(
          'Network connection failed',
          'NETWORK_ERROR'
        );
      }

      // 超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NacosError(
          'Request timeout',
          'TIMEOUT_ERROR'
        );
      }

      throw new NacosError(
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(serviceName: ServiceName): Promise<boolean> {
    try {
      await this.call(serviceName, '/actuator/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清除缓存
   */
  clearCache(serviceName?: ServiceName): void {
    if (serviceName) {
      this.serviceCache.delete(serviceName);
      this.cacheExpiry.delete(serviceName);
    } else {
      this.serviceCache.clear();
      this.cacheExpiry.clear();
    }
  }
}

// 创建全局Nacos客户端实例
const nacosClient = new NacosClient({
  serverAddr: process.env.NEXT_PUBLIC_NACOS_SERVER || 'http://localhost:8848',
  namespace: process.env.NEXT_PUBLIC_NACOS_NAMESPACE || 'qing-ai-data',
  group: process.env.NEXT_PUBLIC_NACOS_GROUP || 'DEFAULT_GROUP',
});

export { nacosClient, NacosClient, NacosError };
export type { ServiceInstance, ApiRequestConfig, ApiResponse }; 