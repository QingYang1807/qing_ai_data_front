'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Database, 
  Activity, 
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  ChevronLeft,
  ChevronRight,
  TestTube2,
  Zap,
  Shield,
  Server,
  HardDrive
} from 'lucide-react';
import { DataSourceType, DataSource, DataSourceCreateRequest, DataSourceConfig, DataSourceLevel } from '@/types';
import { useDataSourceStore } from '@/stores/useDataSourceStore';

interface DataSourceFormProps {
  visible: boolean;
  onCancel: () => void;
  editingDataSource?: DataSource | null;
}

// 表单步骤枚举
enum FormStep {
  BASIC_INFO = 'basic',
  CONNECTION = 'connection',
  SETTINGS = 'settings',
  REVIEW = 'review'
}

// 通知组件
interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-[60] max-w-md p-3 border rounded-lg shadow-lg animate-slide-in-right ${getStyles()}`}>
      <div className="flex items-start space-x-2">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default function DataSourceForm({ 
  visible, 
  onCancel, 
  editingDataSource 
}: DataSourceFormProps) {
  const { createDataSource, updateDataSource, loading, testConnection } = useDataSourceStore();
  
  // 表单步骤状态
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BASIC_INFO);
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    type: DataSourceType.MYSQL,
    level: DataSourceLevel.INTERNAL,
    host: '',
    port: 3306,
    database: '',
    username: '',
    password: '',
    description: '',
    ssl: false,
    timeout: 30,
  });

  // 表单验证错误
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  
  // 通知状态
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);

  // 测试结果状态
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error' | null;
    message: string;
  }>({ status: null, message: '' });

  // 表单步骤配置
  const steps = [
    { key: FormStep.BASIC_INFO, title: '基本信息', icon: Database, desc: '设置数据源名称和类型' },
    { key: FormStep.CONNECTION, title: '连接配置', icon: Server, desc: '配置连接参数' },
    { key: FormStep.SETTINGS, title: '高级设置', icon: Settings, desc: '配置高级选项' },
    { key: FormStep.REVIEW, title: '预览确认', icon: CheckCircle, desc: '检查配置并保存' }
  ];

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (editingDataSource) {
        const config = editingDataSource.config || {};
        setFormData({
          name: editingDataSource.name || '',
          type: editingDataSource.type || DataSourceType.MYSQL,
          level: editingDataSource.level || DataSourceLevel.INTERNAL,
          host: config.host || editingDataSource.host || '',
          port: config.port || editingDataSource.port || getDefaultPort(editingDataSource.type || DataSourceType.MYSQL),
          database: config.database || editingDataSource.database || '',
          username: config.username || editingDataSource.username || '',
          password: '', // 编辑时不显示密码
          description: editingDataSource.description || '',
          ssl: config.ssl || false,
          timeout: config.timeout || 30,
        });
        setCurrentStep(FormStep.BASIC_INFO);
      } else {
        setFormData({
          name: '',
          type: DataSourceType.MYSQL,
          level: DataSourceLevel.INTERNAL,
          host: '',
          port: 3306,
          database: '',
          username: '',
          password: '',
          description: '',
          ssl: false,
          timeout: 30,
        });
        setCurrentStep(FormStep.BASIC_INFO);
      }
      setErrors({});
      setTestResult({ status: null, message: '' });
      setShowPassword(false);
      setNotification(null);
    }
  }, [visible, editingDataSource]);

  // 获取默认端口
  const getDefaultPort = (type: DataSourceType): number => {
    const portMap: Record<DataSourceType, number> = {
      [DataSourceType.MYSQL]: 3306,
      [DataSourceType.POSTGRESQL]: 5432,
      [DataSourceType.ORACLE]: 1521,
      [DataSourceType.SQLSERVER]: 1433,
      [DataSourceType.SQLITE]: 0,
      [DataSourceType.HIVE]: 10000,
      [DataSourceType.HDFS]: 9000,
      [DataSourceType.CLICKHOUSE]: 9000,
      [DataSourceType.MONGODB]: 27017,
      [DataSourceType.REDIS]: 6379,
      [DataSourceType.CASSANDRA]: 9042,
      [DataSourceType.ELASTICSEARCH]: 9200,
      [DataSourceType.KAFKA]: 9092,
      [DataSourceType.RABBITMQ]: 5672,
      [DataSourceType.ROCKETMQ]: 9876,
      [DataSourceType.PULSAR]: 6650,
      [DataSourceType.FTP]: 21,
      [DataSourceType.SFTP]: 22,
      [DataSourceType.S3]: 443,
      [DataSourceType.OSS]: 443,
      [DataSourceType.MINIO]: 9000,
      [DataSourceType.AMAZON_RDS]: 3306,
      [DataSourceType.ALIYUN_RDS]: 3306,
      [DataSourceType.TENCENT_CDB]: 3306,
      [DataSourceType.REST_API]: 443,
      [DataSourceType.GRAPHQL]: 443,
      [DataSourceType.SOAP]: 443,
      [DataSourceType.CSV]: 0,
      [DataSourceType.EXCEL]: 0,
      [DataSourceType.JSON]: 0,
      [DataSourceType.XML]: 0,
    };
    return portMap[type] || 3306;
  };

  // 判断是否需要数据库名
  const needsDatabase = (type: DataSourceType): boolean => {
    return [
      DataSourceType.MYSQL,
      DataSourceType.POSTGRESQL,
      DataSourceType.ORACLE,
      DataSourceType.HIVE
    ].includes(type);
  };

  // 判断是否需要主机连接信息
  const needsHostInfo = (type: DataSourceType): boolean => {
    return [
      DataSourceType.MYSQL,
      DataSourceType.POSTGRESQL,
      DataSourceType.ORACLE,
      DataSourceType.HIVE,
      DataSourceType.FTP,
      DataSourceType.SFTP,
      DataSourceType.KAFKA,
      DataSourceType.HDFS
    ].includes(type);
  };

  // 显示通知
  const showNotification = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message });
  }, []);

  // 处理输入变化
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // 清除测试结果
    if (testResult.status) {
      setTestResult({ status: null, message: '' });
    }
  };

  // 处理数据源类型变化
  const handleTypeChange = (type: DataSourceType) => {
    setFormData(prev => ({ 
      ...prev, 
      type, 
      port: getDefaultPort(type),
      database: needsDatabase(type) ? prev.database : ''
    }));
    
    // 清除数据库相关错误
    if (!needsDatabase(type) && errors.database) {
      setErrors(prev => ({ ...prev, database: '' }));
    }
  };

  // 验证当前步骤
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case FormStep.BASIC_INFO:
        if (!formData.name.trim()) {
          newErrors.name = '数据源名称不能为空';
        } else if (formData.name.length > 50) {
          newErrors.name = '数据源名称不能超过50个字符';
        }
        if (!formData.type) {
          newErrors.type = '请选择数据源类型';
        }
        break;

      case FormStep.CONNECTION:
        if (needsHostInfo(formData.type)) {
          if (!formData.host.trim()) {
            newErrors.host = '主机地址不能为空';
          } else if (!/^[\w\.-]+$/.test(formData.host)) {
            newErrors.host = '主机地址格式无效';
          }

          if (!formData.port || formData.port < 1 || formData.port > 65535) {
            newErrors.port = '端口号必须在1-65535之间';
          }

          if (!formData.username.trim()) {
            newErrors.username = '用户名不能为空';
          }

          if (!editingDataSource && !formData.password.trim()) {
            newErrors.password = '密码不能为空';
          }

          if (needsDatabase(formData.type) && !formData.database.trim()) {
            newErrors.database = '数据库名不能为空';
          }
        }
        break;

      case FormStep.SETTINGS:
        if (formData.timeout && (formData.timeout < 1 || formData.timeout > 300)) {
          newErrors.timeout = '超时时间必须在1-300秒之间';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 下一步
  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      showNotification('error', '请检查并修正表单中的错误');
      return;
    }

    const stepOrder = [FormStep.BASIC_INFO, FormStep.CONNECTION, FormStep.SETTINGS, FormStep.REVIEW];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  // 上一步
  const handlePrevStep = () => {
    const stepOrder = [FormStep.BASIC_INFO, FormStep.CONNECTION, FormStep.SETTINGS, FormStep.REVIEW];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  // 跳转到指定步骤
  const goToStep = (step: FormStep) => {
    // 验证当前步骤及之前的步骤
    const stepOrder = [FormStep.BASIC_INFO, FormStep.CONNECTION, FormStep.SETTINGS, FormStep.REVIEW];
    const targetIndex = stepOrder.indexOf(step);
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (targetIndex > currentIndex) {
      // 如果要跳转到后面的步骤，需要验证当前步骤
      if (!validateCurrentStep()) {
        showNotification('warning', '请先完成当前步骤的配置');
        return;
      }
    }
    
    setCurrentStep(step);
  };

  // 测试连接
  const handleTestConnection = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!editingDataSource && currentStep !== FormStep.REVIEW) {
      showNotification('info', '请先保存数据源后再测试连接');
      return;
    }

    if (!validateCurrentStep()) {
      showNotification('error', '请完善表单信息后再测试连接');
      return;
    }

    try {
      setTesting(true);
      setTestResult({ status: null, message: '' });
      
      let success = false;
      
      if (editingDataSource?.id) {
        success = await testConnection(String(editingDataSource.id));
      } else {
        // 新建数据源的测试连接逻辑（这里可能需要后端支持）
        showNotification('info', '请先保存数据源后再测试连接');
        return;
      }
      
      setTestResult({
        status: success ? 'success' : 'error',
        message: success 
          ? '连接测试成功！数据源可以正常使用' 
          : '连接测试失败，请检查配置信息'
      });
      
      showNotification(
        success ? 'success' : 'error',
        success ? '连接测试成功！' : '连接测试失败，请检查配置'
      );
    } catch (error: any) {
      const errorMsg = error.message || '连接测试失败，请检查网络连接和配置信息';
      setTestResult({
        status: 'error',
        message: errorMsg
      });
      showNotification('error', errorMsg);
    } finally {
      setTesting(false);
    }
  };

  // 提交表单
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    // 验证所有步骤
    const stepOrder = [FormStep.BASIC_INFO, FormStep.CONNECTION, FormStep.SETTINGS];
    for (const step of stepOrder) {
      const originalStep = currentStep;
      setCurrentStep(step);
      if (!validateCurrentStep()) {
        showNotification('error', `请完善${steps.find(s => s.key === step)?.title}中的配置`);
        return;
      }
      setCurrentStep(originalStep);
    }

    try {
      setTestResult({ status: null, message: '' });
      
      // 构建配置对象
      const config: DataSourceConfig = {};
      
      // 根据数据源类型添加相应配置
      if (needsHostInfo(formData.type)) {
        config.host = formData.host.trim();
        config.port = formData.port;
        
        if (formData.username.trim()) {
          config.username = formData.username.trim();
        }
        
        // 密码处理
        if (formData.password.trim()) {
          config.password = formData.password;
        } else if (!editingDataSource) {
          throw new Error('密码不能为空');
        }
        
        // 数据库名（如果需要）
        if (needsDatabase(formData.type) && formData.database.trim()) {
          config.database = formData.database.trim();
        }
      }

      // 高级设置
      config.ssl = formData.ssl;
      config.timeout = formData.timeout;

      // 构建提交数据
      const submitData: DataSourceCreateRequest = {
        name: formData.name.trim(),
        type: formData.type,
        config: config,
        description: formData.description?.trim() || undefined,
      };

      if (editingDataSource) {
        await updateDataSource(String(editingDataSource.id), submitData);
        showNotification('success', '数据源更新成功！');
      } else {
        await createDataSource(submitData);
        showNotification('success', '数据源创建成功！');
      }
      
      // 延迟关闭模态框
      setTimeout(() => {
        onCancel();
      }, 1500);
    } catch (error: any) {
      const errorMsg = error.message || (editingDataSource ? '更新失败，请重试' : '创建失败，请重试');
      showNotification('error', errorMsg);
    }
  };

  // 重置表单
  const handleReset = () => {
    if (editingDataSource) {
      const config = editingDataSource.config || {};
      setFormData({
        name: editingDataSource.name || '',
        type: editingDataSource.type || DataSourceType.MYSQL,
        level: editingDataSource.level || DataSourceLevel.INTERNAL,
        host: config.host || editingDataSource.host || '',
        port: config.port || editingDataSource.port || getDefaultPort(editingDataSource.type || DataSourceType.MYSQL),
        database: config.database || editingDataSource.database || '',
        username: config.username || editingDataSource.username || '',
        password: '',
        description: editingDataSource.description || '',
        ssl: config.ssl || false,
        timeout: config.timeout || 30,
      });
    } else {
      setFormData({
        name: '',
        type: DataSourceType.MYSQL,
        level: DataSourceLevel.INTERNAL,
        host: '',
        port: 3306,
        database: '',
        username: '',
        password: '',
        description: '',
        ssl: false,
        timeout: 30,
      });
    }
    setErrors({});
    setTestResult({ status: null, message: '' });
    setShowPassword(false);
    setCurrentStep(FormStep.BASIC_INFO);
    showNotification('info', '表单已重置');
  };

  // ESC键关闭
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        onCancel();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [visible, onCancel]);

  if (!visible) return null;

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div 
      className="modal-overlay animate-fade-in"
      onClick={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      {/* 通知组件 */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="w-full max-w-5xl max-h-[95vh] overflow-hidden modal-content">
        {/* Glass Modal Container */}
        <div 
          className="backdrop-blur-xl bg-white/95 border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="h-16 bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-lg px-6 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {editingDataSource ? '编辑数据源' : '新建数据源'}
                </h3>
                <p className="text-sm text-blue-100 mt-0.5">
                  {steps[currentStepIndex]?.desc}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps Navigation */}
          <div className="bg-white/60 border-b border-gray-200/50 px-6 py-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = step.key === currentStep;
                const isCompleted = index < currentStepIndex;
                const isAccessible = index <= currentStepIndex;

                return (
                  <div key={step.key} className="flex items-center">
                    <button
                      onClick={() => isAccessible && goToStep(step.key)}
                      disabled={!isAccessible}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-500 text-white shadow-lg'
                          : isCompleted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : isAccessible
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="font-medium text-sm">{step.title}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="max-h-[calc(95vh-12rem)] overflow-y-auto">
            <div className="p-6">
              {/* Basic Info Step */}
              {currentStep === FormStep.BASIC_INFO && (
                <div className="space-y-6 animate-slide-in-right">
                  <div className="flex items-center space-x-2 mb-4">
                    <Database className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">基本信息</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        数据源名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`input-glass w-full ${errors.name ? 'border-red-300 bg-red-50/50' : ''}`}
                        placeholder="请输入数据源名称"
                        maxLength={50}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        数据源类型 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value as DataSourceType)}
                        className="input-glass w-full"
                      >
                        {Object.values(DataSourceType).map(type => (
                          <option key={type} value={type}>
                            {type.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      描述
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="input-glass w-full h-24 resize-none"
                      placeholder="请输入数据源描述（可选）"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description.length}/200
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      数据源分级 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="level"
                          value={DataSourceLevel.PUBLIC}
                          checked={formData.level === DataSourceLevel.PUBLIC}
                          onChange={(e) => handleInputChange('level', e.target.value as DataSourceLevel)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">公开级</div>
                          <div className="text-sm text-gray-600">所有用户可访问</div>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="level"
                          value={DataSourceLevel.INTERNAL}
                          checked={formData.level === DataSourceLevel.INTERNAL}
                          onChange={(e) => handleInputChange('level', e.target.value as DataSourceLevel)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">内部级</div>
                          <div className="text-sm text-gray-600">内部用户可访问</div>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="level"
                          value={DataSourceLevel.CONFIDENTIAL}
                          checked={formData.level === DataSourceLevel.CONFIDENTIAL}
                          onChange={(e) => handleInputChange('level', e.target.value as DataSourceLevel)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">机密级</div>
                          <div className="text-sm text-gray-600">指定用户可访问</div>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="level"
                          value={DataSourceLevel.SECRET}
                          checked={formData.level === DataSourceLevel.SECRET}
                          onChange={(e) => handleInputChange('level', e.target.value as DataSourceLevel)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">秘密级</div>
                          <div className="text-sm text-gray-600">仅管理员可访问</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Connection Step */}
              {currentStep === FormStep.CONNECTION && (
                <div className="space-y-6 animate-slide-in-right">
                  <div className="flex items-center space-x-2 mb-4">
                    <Server className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">连接配置</h4>
                  </div>

                  {needsHostInfo(formData.type) ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            主机地址 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.host}
                            onChange={(e) => handleInputChange('host', e.target.value)}
                            className={`input-glass w-full ${errors.host ? 'border-red-300 bg-red-50/50' : ''}`}
                            placeholder="例如: localhost 或 192.168.1.100"
                          />
                          {errors.host && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.host}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            端口 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={formData.port || ''}
                            onChange={(e) => handleInputChange('port', parseInt(e.target.value) || '')}
                            className={`input-glass w-full ${errors.port ? 'border-red-300 bg-red-50/50' : ''}`}
                            placeholder="端口"
                            min="1"
                            max="65535"
                          />
                          {errors.port && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.port}
                            </p>
                          )}
                        </div>
                      </div>

                      {needsDatabase(formData.type) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            数据库名 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.database}
                            onChange={(e) => handleInputChange('database', e.target.value)}
                            className={`input-glass w-full ${errors.database ? 'border-red-300 bg-red-50/50' : ''}`}
                            placeholder="请输入数据库名"
                          />
                          {errors.database && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.database}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            用户名 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className={`input-glass w-full ${errors.username ? 'border-red-300 bg-red-50/50' : ''}`}
                            placeholder="请输入用户名"
                            autoComplete="username"
                          />
                          {errors.username && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.username}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            密码 {!editingDataSource && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              className={`input-glass w-full pr-10 ${errors.password ? 'border-red-300 bg-red-50/50' : ''}`}
                              placeholder={editingDataSource ? '留空则不修改密码' : '请输入密码'}
                              autoComplete={editingDataSource ? 'new-password' : 'current-password'}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                              title={showPassword ? '隐藏密码' : '显示密码'}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {errors.password}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">所选数据源类型暂不需要连接配置</p>
                      <p className="text-sm">配置信息将在后续版本中支持</p>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Step */}
              {currentStep === FormStep.SETTINGS && (
                <div className="space-y-6 animate-slide-in-right">
                  <div className="flex items-center space-x-2 mb-4">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">高级设置</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        连接超时（秒）
                      </label>
                      <input
                        type="number"
                        value={formData.timeout || ''}
                        onChange={(e) => handleInputChange('timeout', parseInt(e.target.value) || 30)}
                        className={`input-glass w-full ${errors.timeout ? 'border-red-300 bg-red-50/50' : ''}`}
                        placeholder="连接超时时间"
                        min="1"
                        max="300"
                      />
                      {errors.timeout && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.timeout}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">设置连接超时时间，范围：1-300秒</p>
                    </div>

                    <div className="flex items-center justify-center">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.ssl}
                          onChange={(e) => handleInputChange('ssl', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">启用SSL加密连接</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-900 mb-1">配置建议</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• 生产环境建议启用SSL加密连接以保证数据安全</li>
                          <li>• 连接超时时间建议设置为30-60秒</li>
                          <li>• 如果网络环境较差，可以适当增加超时时间</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === FormStep.REVIEW && (
                <div className="space-y-6 animate-slide-in-right">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">预览确认</h4>
                  </div>

                  <div className="space-y-6">
                    {/* 基本信息预览 */}
                    <div className="glass-card p-4">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Database className="w-4 h-4 mr-2 text-blue-600" />
                        基本信息
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">名称:</span>
                          <span className="ml-2 font-medium">{formData.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">类型:</span>
                          <span className="ml-2 font-medium">{formData.type.toUpperCase()}</span>
                        </div>
                        {formData.description && (
                          <div className="col-span-2">
                            <span className="text-gray-600">描述:</span>
                            <span className="ml-2">{formData.description}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 连接信息预览 */}
                    {needsHostInfo(formData.type) && (
                      <div className="glass-card p-4">
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Server className="w-4 h-4 mr-2 text-green-600" />
                          连接配置
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">主机:</span>
                            <span className="ml-2 font-medium">{formData.host}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">端口:</span>
                            <span className="ml-2 font-medium">{formData.port}</span>
                          </div>
                          {formData.database && (
                            <div>
                              <span className="text-gray-600">数据库:</span>
                              <span className="ml-2 font-medium">{formData.database}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">用户名:</span>
                            <span className="ml-2 font-medium">{formData.username}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 设置预览 */}
                    <div className="glass-card p-4">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Settings className="w-4 h-4 mr-2 text-purple-600" />
                        高级设置
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">连接超时:</span>
                          <span className="ml-2 font-medium">{formData.timeout}秒</span>
                        </div>
                        <div>
                          <span className="text-gray-600">SSL加密:</span>
                          <span className={`ml-2 font-medium ${formData.ssl ? 'text-green-600' : 'text-gray-500'}`}>
                            {formData.ssl ? '已启用' : '未启用'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 测试连接区域 */}
                    {editingDataSource && (
                      <div className="glass-card p-4">
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <TestTube2 className="w-4 h-4 mr-2 text-orange-600" />
                          连接测试
                        </h5>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">测试数据源连接是否正常</p>
                          <button
                            onClick={handleTestConnection}
                            disabled={testing}
                            className="btn-glass flex items-center space-x-2 bg-orange-500/20 hover:bg-orange-500/30 border-orange-300/30 text-orange-700 disabled:opacity-50"
                          >
                            <Activity className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                            <span>{testing ? '测试中...' : '测试连接'}</span>
                          </button>
                        </div>
                        
                        {testResult.status && (
                          <div className={`mt-3 p-3 rounded-lg border ${
                            testResult.status === 'success' 
                              ? 'bg-green-50 border-green-200 text-green-800' 
                              : 'bg-red-50 border-red-200 text-red-800'
                          }`}>
                            <div className="flex items-center space-x-2">
                              {testResult.status === 'success' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="text-sm font-medium">{testResult.message}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200/50 bg-gray-50/50">
            <button
              onClick={handleReset}
              className="btn-glass-secondary flex items-center space-x-2"
              disabled={loading || testing}
              title="重置表单"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重置</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={onCancel}
                className="btn-glass-secondary"
                disabled={loading || testing}
              >
                取消
              </button>
              
              {!isFirstStep && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePrevStep();
                  }}
                  className="btn-glass-secondary flex items-center space-x-2"
                  disabled={loading || testing}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一步</span>
                </button>
              )}

              {!isLastStep ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNextStep();
                  }}
                  className="btn-glass-primary flex items-center space-x-2"
                >
                  <span>下一步</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit();
                  }}
                  disabled={loading || testing}
                  className="btn-glass-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {loading ? '保存中...' : (editingDataSource ? '更新数据源' : '创建数据源')}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 