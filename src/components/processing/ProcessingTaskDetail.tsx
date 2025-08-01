'use client';

import React, { useState, useEffect } from 'react';
import { DataProcessingTask, ProcessingStatus, ProcessingResult } from '@/types';
import { processingApi } from '@/api/processing';
import { useToast } from '@/hooks/useToast';

interface ProcessingTaskDetailProps {
  taskId: string;
  onBack: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function ProcessingTaskDetail({
  taskId,
  onBack,
  onSuccess,
  onError
}: ProcessingTaskDetailProps) {
  const [task, setTask] = useState<DataProcessingTask | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Array<{
    timestamp: string;
    level: string;
    message: string;
    details?: any;
  }>>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'logs' | 'result'>('overview');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadTaskDetail();
    const interval = setInterval(loadTaskDetail, 5000); // 每5秒刷新一次
    return () => clearInterval(interval);
  }, [taskId]);

  const loadTaskDetail = async () => {
    try {
      const [taskResponse, resultResponse, logsResponse] = await Promise.all([
        processingApi.getTask(taskId),
        processingApi.getTaskResult(taskId).catch(() => null),
        processingApi.getTaskLogs(taskId, { size: 100 }).catch(() => ({ data: { records: [] } }))
      ]);

      setTask(taskResponse.data);
      setResult(resultResponse?.data || null);
      setLogs(logsResponse.data.records || []);
    } catch (error) {
      console.error('加载任务详情失败:', error);
      showError('加载失败', '无法加载任务详情');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    try {
      await processingApi.startTask(taskId);
      showSuccess('任务启动成功', '数据处理任务已开始执行');
      loadTaskDetail();
    } catch (error) {
      showError('启动失败', '无法启动数据处理任务');
    }
  };

  const handleStopTask = async () => {
    try {
      await processingApi.stopTask(taskId);
      showSuccess('任务停止成功', '数据处理任务已停止');
      loadTaskDetail();
    } catch (error) {
      showError('停止失败', '无法停止数据处理任务');
    }
  };

  const handleDownloadResult = async () => {
    try {
      const response = await processingApi.downloadResult(taskId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${task?.name || 'result'}.${task?.outputFormat?.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showError('下载失败', '无法下载处理结果');
    }
  };

  const getStatusColor = (status: ProcessingStatus) => {
    switch (status) {
      case ProcessingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ProcessingStatus.RUNNING:
        return 'bg-blue-100 text-blue-800';
      case ProcessingStatus.SUCCESS:
        return 'bg-green-100 text-green-800';
      case ProcessingStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case ProcessingStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      case ProcessingStatus.PAUSED:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">任务不存在或已被删除</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{task.name}</h2>
            {task.description && (
              <p className="text-gray-600 mt-1">{task.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              返回列表
            </button>
            {task.status === ProcessingStatus.PENDING && (
              <button
                onClick={handleStartTask}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                启动任务
              </button>
            )}
            {task.status === ProcessingStatus.RUNNING && (
              <button
                onClick={handleStopTask}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                停止任务
              </button>
            )}
            {task.status === ProcessingStatus.SUCCESS && result && (
              <button
                onClick={handleDownloadResult}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                下载结果
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 状态概览 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">状态</h3>
            <p className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                {task.status === ProcessingStatus.PENDING && '等待中'}
                {task.status === ProcessingStatus.RUNNING && '运行中'}
                {task.status === ProcessingStatus.SUCCESS && '成功'}
                {task.status === ProcessingStatus.FAILED && '失败'}
                {task.status === ProcessingStatus.CANCELLED && '已取消'}
                {task.status === ProcessingStatus.PAUSED && '已暂停'}
              </span>
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">进度</h3>
            <div className="mt-1 flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-900">{task.progress}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">文件大小</h3>
            <p className="mt-1 text-sm text-gray-900">
              {task.fileSize ? formatFileSize(task.fileSize) : '-'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">处理时间</h3>
            <p className="mt-1 text-sm text-gray-900">
              {task.processingTime ? formatDuration(task.processingTime) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              概览
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'config'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              配置
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              日志
            </button>
            <button
              onClick={() => setActiveTab('result')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'result'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              结果
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">基本信息</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">任务ID</dt>
                      <dd className="text-sm text-gray-900">{task.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">处理类型</dt>
                      <dd className="text-sm text-gray-900">{task.processingType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">输出格式</dt>
                      <dd className="text-sm text-gray-900">{task.outputFormat}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">创建时间</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(task.createdTime).toLocaleString('zh-CN')}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">处理信息</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">开始时间</dt>
                      <dd className="text-sm text-gray-900">
                        {task.startTime ? new Date(task.startTime).toLocaleString('zh-CN') : '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">结束时间</dt>
                      <dd className="text-sm text-gray-900">
                        {task.endTime ? new Date(task.endTime).toLocaleString('zh-CN') : '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">记录数</dt>
                      <dd className="text-sm text-gray-900">{task.recordCount || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">创建者</dt>
                      <dd className="text-sm text-gray-900">{task.createdBy}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              {task.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">错误信息</h4>
                  <p className="text-sm text-red-700">{task.errorMessage}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-4">处理配置</h4>
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(task.config, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-4">处理日志</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('zh-CN')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                      log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-sm text-gray-900 flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'result' && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-4">处理结果</h4>
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h5 className="text-sm font-medium text-gray-700">输出路径</h5>
                      <p className="text-sm text-gray-900 mt-1">{result.outputPath}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h5 className="text-sm font-medium text-gray-700">记录数</h5>
                      <p className="text-sm text-gray-900 mt-1">{result.recordCount}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h5 className="text-sm font-medium text-gray-700">文件大小</h5>
                      <p className="text-sm text-gray-900 mt-1">{formatFileSize(result.fileSize)}</p>
                    </div>
                  </div>
                  {result.qualityReport && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">质量报告</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <span className="text-xs text-blue-600">完整性</span>
                          <p className="text-sm font-medium text-blue-900">{(result.qualityReport.completeness * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-xs text-blue-600">准确性</span>
                          <p className="text-sm font-medium text-blue-900">{(result.qualityReport.accuracy * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-xs text-blue-600">一致性</span>
                          <p className="text-sm font-medium text-blue-900">{(result.qualityReport.consistency * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-xs text-blue-600">时效性</span>
                          <p className="text-sm font-medium text-blue-900">{(result.qualityReport.timeliness * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-xs text-blue-600">有效性</span>
                          <p className="text-sm font-medium text-blue-900">{(result.qualityReport.validity * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">暂无处理结果</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 