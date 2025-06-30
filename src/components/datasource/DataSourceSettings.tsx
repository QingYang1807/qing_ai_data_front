'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Power, 
  PowerOff, 
  Settings,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  Database,
  Clock,
  User
} from 'lucide-react';
import { useDataSourceStore } from '@/stores/useDataSourceStore';
import { DataSource } from '@/types';

interface DataSourceSettingsProps {
  dataSource: DataSource | null;
  isOpen: boolean;
  onClose: () => void;
}

const DataSourceSettings: React.FC<DataSourceSettingsProps> = ({ 
  dataSource, 
  isOpen, 
  onClose 
}) => {
  const { testConnection, toggleEnable, loading } = useDataSourceStore();
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error' | null;
    message: string;
  }>({ status: null, message: '' });

  // 添加 ESC 键关闭功能 - 必须在条件渲染之前使用 hooks
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !dataSource) return null;

  const handleTestConnection = async () => {
    if (dataSource.id) {
      setTestResult({ status: null, message: '' });
      const success = await testConnection(dataSource.id.toString());
      
      if (success) {
        setTestResult({ 
          status: 'success', 
          message: '连接测试成功！数据源运行正常。' 
        });
      } else {
        setTestResult({ 
          status: 'error', 
          message: '连接测试失败！请检查数据源配置。' 
        });
      }
    }
  };

  const handleToggleEnable = async () => {
    if (dataSource.id) {
      const currentEnabled = typeof dataSource.enabled === 'boolean' ? 
        dataSource.enabled : Boolean(dataSource.enabled);
      await toggleEnable(dataSource.id.toString(), !currentEnabled);
      // 不自动关闭，让用户手动关闭以查看结果
    }
  };

  const isEnabled = typeof dataSource.enabled === 'boolean' ? 
    dataSource.enabled : Boolean(dataSource.enabled);

  const getStatusIcon = (status: number | string) => {
    const statusCode = typeof status === 'string' ? parseInt(status) : status;
    switch (statusCode) {
      case 1: // ACTIVE
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 0: // INACTIVE
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 2: // ERROR
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: number | string) => {
    const statusCode = typeof status === 'string' ? parseInt(status) : status;
    switch (statusCode) {
      case 1: // ACTIVE
        return '已连接';
      case 0: // INACTIVE
        return '未连接';
      case 2: // ERROR
        return '连接失败';
      default:
        return '未知';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-[85vh] backdrop-blur-xl bg-white/90 border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-16 bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-lg px-6 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">数据源设置 - {dataSource.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid Layout */}
        <div className="p-6 h-[calc(85vh-64px)] grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Data Source Info */}
            <div className="glass-card p-5 h-fit">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100/80 p-3 rounded-xl backdrop-blur-sm">
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{dataSource.name}</h4>
                  <p className="text-gray-600 mb-4">
                    {dataSource.description || '暂无描述信息'}
                  </p>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">类型:</span>
                      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-full shadow-sm">
                        {dataSource.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">连接状态:</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(dataSource.status)}
                        <span className="text-sm font-medium text-gray-800">{getStatusText(dataSource.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Details */}
            <div className="glass-card p-5 flex-1">
              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200/50">连接信息</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50/80 p-4 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-gray-600 block mb-1">主机地址</span>
                  <span className="font-semibold text-gray-900 text-lg">{dataSource.host}</span>
                </div>
                <div className="bg-gray-50/80 p-4 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-gray-600 block mb-1">端口</span>
                  <span className="font-semibold text-gray-900 text-lg">{dataSource.port}</span>
                </div>
                {dataSource.database && (
                  <div className="col-span-2 bg-gray-50/80 p-4 rounded-lg backdrop-blur-sm">
                    <span className="text-sm text-gray-600 block mb-1">数据库</span>
                    <span className="font-semibold text-gray-900 text-lg">{dataSource.database}</span>
                  </div>
                )}
                <div className="bg-gray-50/80 p-4 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-gray-600 block mb-1">用户名</span>
                  <span className="font-semibold text-gray-900 text-lg">{dataSource.username}</span>
                </div>
                <div className="bg-gray-50/80 p-4 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-gray-600 block mb-1">启用状态</span>
                  <span className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-full ${
                    isEnabled 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {isEnabled ? '已启用' : '已禁用'}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="glass-card p-5">
              <h5 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200/50">时间信息</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-50/80 p-3 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">创建时间</span>
                  </div>
                  <span className="font-semibold text-gray-900">{new Date(dataSource.createTime).toLocaleString()}</span>
                </div>
                {dataSource.updateTime && (
                  <div className="flex items-center justify-between bg-gray-50/80 p-3 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">更新时间</span>
                    </div>
                    <span className="font-semibold text-gray-900">{new Date(dataSource.updateTime).toLocaleString()}</span>
                  </div>
                )}
                {dataSource.creator && (
                  <div className="flex items-center justify-between bg-gray-50/80 p-3 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">创建者</span>
                    </div>
                    <span className="font-semibold text-gray-900">{dataSource.creator}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Test Result */}
            {testResult.status && (
              <div className={`glass-card p-5 border-l-4 ${
                testResult.status === 'success' 
                  ? 'border-green-400 bg-green-50/50' 
                  : 'border-red-400 bg-red-50/50'
              }`}>
                <div className="flex items-start space-x-4">
                  {testResult.status === 'success' ? (
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="bg-red-100 p-2 rounded-full">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className={`text-lg font-bold ${
                      testResult.status === 'success' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {testResult.status === 'success' ? '测试成功' : '测试失败'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      testResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="glass-card p-6 flex-1">
              <h5 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200/50">操作管理</h5>
              <div className="space-y-4">
                <button
                  onClick={handleTestConnection}
                  disabled={loading}
                  className="w-full btn-glass flex items-center justify-center space-x-3 bg-blue-500/20 hover:bg-blue-500/30 border-blue-300/30 text-blue-700 py-4 px-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Activity className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? '测试中...' : '测试连接'}</span>
                </button>

                <button
                  onClick={handleToggleEnable}
                  disabled={loading}
                  className={`w-full btn-glass flex items-center justify-center space-x-3 py-4 px-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                    isEnabled
                      ? 'bg-red-500/20 hover:bg-red-500/30 border-red-300/30 text-red-700'
                      : 'bg-green-500/20 hover:bg-green-500/30 border-green-300/30 text-green-700'
                  }`}
                >
                  {isEnabled ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                  <span>{isEnabled ? '禁用数据源' : '启用数据源'}</span>
                </button>

                <div className="pt-4 border-t border-gray-200/50">
                  <button
                    onClick={onClose}
                    className="w-full btn-glass-secondary py-3 px-6 font-semibold"
                  >
                    关闭设置
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceSettings; 