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
  Stop,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataCollectionApi, DataCollectionTask } from '@/api/collect';
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

  // 启动任务
  const startTaskMutation = useMutation({
    mutationFn: (taskId: string) => dataCollectionApi.startTask(taskId),
    onSuccess: () => {
      showSuccess('任务启动成功');
      queryClient.invalidateQueries(['dataCollectionTask', task.id]);
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
      queryClient.invalidateQueries(['dataCollectionTask', task.id]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'running': return <Activity className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'manual': return <Database className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'real_time': return <Zap className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'manual': return '手动采集';
      case 'scheduled': return '定时采集';
      case 'real_time': return '实时采集';
      default: return type;
    }
  };

  const currentTask = taskDetail?.data || task;
  const logs = logsData?.data || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{currentTask.name}</h2>
            <p className="text-sm text-gray-600 mt-1">数据采集任务详情</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 操作按钮 */}
            {currentTask.status === 'pending' && (
              <button
                onClick={handleStartTask}
                disabled={startTaskMutation.isLoading}
                className="flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-2" />
                启动
              </button>
            )}
            
            {currentTask.status === 'running' && (
              <button
                onClick={handleStopTask}
                disabled={stopTaskMutation.isLoading}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
              >
                <Stop className="w-4 h-4 mr-2" />
                停止
              </button>
            )}
            
            {currentTask.status === 'completed' && currentTask.result && (
              <button
                onClick={handleDownloadResult}
                disabled={downloadResultMutation.isLoading}
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(currentTask.status)}`}>
                      {currentTask.status === 'pending' && '等待中'}
                      {currentTask.status === 'running' && '运行中'}
                      {currentTask.status === 'completed' && '已完成'}
                      {currentTask.status === 'failed' && '失败'}
                      {currentTask.status === 'cancelled' && '已取消'}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      {getTypeIcon(currentTask.collectionType)}
                      <span className="ml-2 text-sm font-medium text-gray-700">类型</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {getTypeText(currentTask.collectionType)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="ml-2 text-sm font-medium text-gray-700">进度</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${currentTask.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{currentTask.progress}%</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="ml-2 text-sm font-medium text-gray-700">创建时间</span>
                    </div>
                    <p className="text-sm text-gray-900 mt-2">
                      {new Date(currentTask.createdTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* 基本信息 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">任务名称</label>
                      <p className="mt-1 text-sm text-gray-900">{currentTask.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">数据源</label>
                      <p className="mt-1 text-sm text-gray-900">{currentTask.dataSourceName || '未知数据源'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">任务描述</label>
                      <p className="mt-1 text-sm text-gray-900">{currentTask.description || '无描述'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">创建者</label>
                      <p className="mt-1 text-sm text-gray-900">{currentTask.createdBy}</p>
                    </div>
                  </div>
                </div>

                {/* 时间信息 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">时间信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">开始时间</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {currentTask.startTime ? new Date(currentTask.startTime).toLocaleString() : '未开始'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">结束时间</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {currentTask.endTime ? new Date(currentTask.endTime).toLocaleString() : '未结束'}
                      </p>
                    </div>
                    
                    {currentTask.schedule && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">定时表达式</label>
                        <p className="mt-1 text-sm text-gray-900">{currentTask.schedule}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 配置标签页 */}
            {activeTab === 'config' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">采集配置</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">查询语句</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                        <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                          {currentTask.config.query || '未设置查询语句'}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">限制条数</label>
                        <p className="mt-1 text-sm text-gray-900">{currentTask.config.limit || '无限制'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">偏移量</label>
                        <p className="mt-1 text-sm text-gray-900">{currentTask.config.offset || 0}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">排序字段</label>
                        <p className="mt-1 text-sm text-gray-900">{currentTask.config.sortBy || '无排序'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">排序方式</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {currentTask.config.sortOrder === 'asc' ? '升序' : '降序'}
                        </p>
                      </div>
                    </div>
                    
                    {currentTask.config.fields && currentTask.config.fields.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">选择字段</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {currentTask.config.fields.map((field: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 结果标签页 */}
            {activeTab === 'result' && (
              <div className="space-y-6">
                {currentTask.result ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">采集结果</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">记录数量</label>
                        <p className="mt-1 text-lg font-semibold text-blue-600">
                          {currentTask.result.recordCount?.toLocaleString() || 0}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">文件大小</label>
                        <p className="mt-1 text-lg font-semibold text-green-600">
                          {currentTask.result.fileSize ? `${(currentTask.result.fileSize / 1024 / 1024).toFixed(2)} MB` : '未知'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">输出格式</label>
                        <p className="mt-1 text-sm text-gray-900">{currentTask.result.outputFormat}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">输出路径</label>
                        <p className="mt-1 text-sm text-gray-900">{currentTask.result.outputPath}</p>
                      </div>
                    </div>
                    
                    {currentTask.result.downloadUrl && (
                      <div className="mt-4">
                        <button
                          onClick={handleDownloadResult}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          下载结果文件
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">暂无采集结果</p>
                    <p className="text-sm">任务完成后将显示采集结果</p>
                  </div>
                )}
              </div>
            )}

            {/* 日志标签页 */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">执行日志</h3>
                  {logs.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {logs.map((log: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            log.level === 'ERROR' ? 'bg-red-500' :
                            log.level === 'WARN' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{log.level}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{log.message}</p>
                            {log.details && (
                              <pre className="text-xs text-gray-600 mt-2 bg-white p-2 rounded border">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>暂无执行日志</p>
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
                      disabled={startTaskMutation.isLoading}
                      className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      启动任务
                    </button>
                  )}
                  
                  {currentTask.status === 'running' && (
                    <button
                      onClick={handleStopTask}
                      disabled={stopTaskMutation.isLoading}
                      className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                      <Stop className="w-4 h-4 mr-2" />
                      停止任务
                    </button>
                  )}
                  
                  <button
                    onClick={() => queryClient.invalidateQueries(['dataCollectionTask', task.id])}
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
                      disabled={downloadResultMutation.isLoading}
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