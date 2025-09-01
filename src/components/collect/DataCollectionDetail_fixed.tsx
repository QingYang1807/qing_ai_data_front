'use client';

import React, { useState } from 'react';
import { 
  X, 
  Edit, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Database,
  Calendar,
  Zap,
  FileText,
  Activity,
  Settings,
  Play,
  Square,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataCollectionApi, DataCollectionTask } from '@/api/collect';
import { datasourceApi } from '@/api/datasource';
import { useToast } from '@/hooks/useToast';

interface DataCollectionDetailProps {
  task: DataCollectionTask;
  onClose: () => void;
  onEdit: (task: DataCollectionTask) => void;
}

const DataCollectionDetail: React.FC<DataCollectionDetailProps> = ({
  task,
  onClose,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  // 获取任务详情
  const { data: taskDetail, isLoading } = useQuery({
    queryKey: ['dataCollectionTask', task.id],
    queryFn: () => dataCollectionApi.getTask(task.id),
    enabled: !!task.id,
  });

  // 获取任务日志
  const { data: logsData } = useQuery({
    queryKey: ['dataCollectionLogs', task.id],
    queryFn: () => dataCollectionApi.getLogs(task.id),
    enabled: !!task.id,
  });

  // 获取数据源详情
  const { data: dataSourceDetail } = useQuery({
    queryKey: ['dataSource', task.dataSourceId],
    queryFn: () => datasourceApi.getById(task.dataSourceId),
    enabled: !!task.dataSourceId,
  });

  // 启动任务
  const startTaskMutation = useMutation({
    mutationFn: (taskId: string) => dataCollectionApi.startTask(taskId),
    onSuccess: () => {
      showSuccess('任务启动成功');
      queryClient.invalidateQueries({ queryKey: ['dataCollectionTask', task.id] });
    },
    onError: (error: any) => {
      showError('任务启动失败: ' + (error.message || '未知错误'));
    },
  });

  // 停止任务
  const stopTaskMutation = useMutation({
    mutationFn: (taskId: string) => dataCollectionApi.stopTask(taskId),
    onSuccess: () => {
      showSuccess('任务停止成功');
      queryClient.invalidateQueries({ queryKey: ['dataCollectionTask', task.id] });
    },
    onError: (error: any) => {
      showError('任务停止失败: ' + (error.message || '未知错误'));
    },
  });

  // 下载结果
  const downloadResultMutation = useMutation({
    mutationFn: (taskId: string) => dataCollectionApi.downloadResult(taskId),
    onSuccess: (data) => {
      if (data.data?.downloadUrl) {
        window.open(data.data.downloadUrl, '_blank');
        showSuccess('下载链接已生成');
      }
    },
    onError: (error: any) => {
      showError('下载失败: ' + (error.message || '未知错误'));
    },
  });

  const handleStartTask = () => {
    startTaskMutation.mutate(task.id);
  };

  const handleStopTask = () => {
    stopTaskMutation.mutate(task.id);
  };

  const handleDownloadResult = () => {
    downloadResultMutation.mutate(task.id);
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'running':
        return '运行中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'running':
        return 'text-blue-700 bg-blue-100';
      case 'completed':
        return 'text-green-700 bg-green-100';
      case 'failed':
        return 'text-red-700 bg-red-100';
      case 'cancelled':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const currentTask = taskDetail?.data || task;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentTask.name}</h2>
              <p className="text-sm text-gray-500">数据采集任务详情</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentTask.status === 'pending' && (
              <button
                onClick={handleStartTask}
                disabled={startTaskMutation.isPending}
                className="flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                启动
              </button>
            )}
            
            {currentTask.status === 'running' && (
              <button
                onClick={handleStopTask}
                disabled={stopTaskMutation.isPending}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
              >
                <Square className="w-4 h-4 mr-2" />
                停止
              </button>
            )}
            
            {currentTask.status === 'completed' && currentTask.result && (
              <button
                onClick={handleDownloadResult}
                disabled={downloadResultMutation.isPending}
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                下载结果
              </button>
            )}
            
            <button
              onClick={() => onEdit(currentTask)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              编辑
            </button>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* 左侧详情 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* 标签页 */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  概览
                </button>
                <button
                  onClick={() => setActiveTab('config')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'config'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  配置
                </button>
                <button
                  onClick={() => setActiveTab('result')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'result'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  结果
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'logs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  日志
                </button>
              </nav>
            </div>

            {/* 概览标签页 */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 状态信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      {getStatusIcon(currentTask.status)}
                      <span className="ml-2 text-sm font-medium text-gray-700">状态</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{getStatusText(currentTask.status)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="ml-2 text-sm font-medium text-gray-700">创建时间</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(currentTask.createdTime).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <span className="ml-2 text-sm font-medium text-gray-700">更新时间</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">
                      {currentTask.updatedTime ? new Date(currentTask.updatedTime).toLocaleString() : '无'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-purple-500" />
                      <span className="ml-2 text-sm font-medium text-gray-700">采集类型</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{currentTask.collectionType}</p>
                  </div>
                </div>

                {/* 任务描述 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">任务描述</h3>
                  <p className="text-gray-700">{currentTask.description || '暂无描述'}</p>
                </div>

                {/* 数据源信息 */}
                {currentTask.dataSourceId && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">数据源信息</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">数据源名称:</span>
                        <p className="text-sm text-gray-900">{dataSourceDetail?.name || currentTask.dataSourceName || '未知数据源'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">数据源类型:</span>
                        <p className="text-sm text-gray-900">{dataSourceDetail?.type || '未知类型'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">数据源ID:</span>
                        <p className="text-sm text-gray-900">{currentTask.dataSourceId}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">连接状态:</span>
                        <p className="text-sm text-gray-900">{dataSourceDetail?.status === 'active' ? '已连接' : '未连接'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 配置标签页 */}
            {activeTab === 'config' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">采集配置</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 overflow-x-auto">
                    {JSON.stringify(currentTask.config, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* 结果标签页 */}
            {activeTab === 'result' && (
              <div className="space-y-6">
                {currentTask.result ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">采集结果</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <span className="ml-2 text-sm font-medium text-gray-700">输出格式</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-900">{currentTask.result.outputFormat}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Database className="w-5 h-5 text-green-500" />
                          <span className="ml-2 text-sm font-medium text-gray-700">记录数量</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-900">{currentTask.result.recordCount || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Settings className="w-5 h-5 text-purple-500" />
                          <span className="ml-2 text-sm font-medium text-gray-700">文件大小</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-900">{currentTask.result.fileSize || '未知'}</p>
                      </div>
                    </div>
                    {currentTask.result.downloadUrl && (
                      <button
                        onClick={handleDownloadResult}
                        disabled={downloadResultMutation.isPending}
                        className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载结果文件
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无结果数据</p>
                  </div>
                )}
              </div>
            )}

            {/* 日志标签页 */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">执行日志</h3>
                  {logsData?.data && logsData.data.length > 0 ? (
                    <div className="space-y-2">
                      {logsData.data.map((log: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <Clock className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                                log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {log.level}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{log.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">暂无日志记录</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右侧操作面板 */}
          <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
            
            <div className="space-y-4">
              {/* 状态操作 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">任务控制</h4>
                <div className="space-y-2">
                  {currentTask.status === 'pending' && (
                    <button
                      onClick={handleStartTask}
                      disabled={startTaskMutation.isPending}
                      className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      启动任务
                    </button>
                  )}
                  
                  {currentTask.status === 'running' && (
                    <button
                      onClick={handleStopTask}
                      disabled={stopTaskMutation.isPending}
                      className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      停止任务
                    </button>
                  )}
                  
                  <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['dataCollectionTask', task.id] })}
                    className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新状态
                  </button>
                </div>
              </div>

              {/* 结果操作 */}
              {currentTask.status === 'completed' && currentTask.result && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">结果操作</h4>
                  <div className="space-y-2">
                    <button
                      onClick={handleDownloadResult}
                      disabled={downloadResultMutation.isPending}
                      className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载结果
                    </button>
                  </div>
                </div>
              )}

              {/* 任务信息 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">任务信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">任务ID:</span>
                    <span className="text-gray-900 font-mono">{currentTask.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">创建时间:</span>
                    <span className="text-gray-900">{new Date(currentTask.createdTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">更新时间:</span>
                    <span className="text-gray-900">
                      {currentTask.updatedTime ? new Date(currentTask.updatedTime).toLocaleDateString() : '无'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 错误信息 */}
              {currentTask.errorMessage && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-3">错误信息</h4>
                  <p className="text-sm text-red-700">{currentTask.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCollectionDetail;
