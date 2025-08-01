'use client';

import React, { useState, useEffect } from 'react';
import { DataProcessingTask, ProcessingType, ProcessingStatus, Dataset } from '@/types';
import { processingApi } from '@/api/processing';
import { useToast } from '@/hooks/useToast';

interface ProcessingTaskListProps {
  selectedDataset?: Dataset;
  onCreateTask: () => void;
  onViewTask: (taskId: string) => void;
  refreshTrigger: number;
  onBackToDataset?: () => void;
}

export default function ProcessingTaskList({
  selectedDataset,
  onCreateTask,
  onViewTask,
  refreshTrigger,
  onBackToDataset
}: ProcessingTaskListProps) {
  const [tasks, setTasks] = useState<DataProcessingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    processingType: '',
    search: ''
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger, filter, selectedDataset]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        size: 50
      };
      
      if (selectedDataset?.id) {
        params.datasetId = selectedDataset.id;
      }
      
      if (filter.status) {
        params.status = filter.status;
      }
      
      if (filter.processingType) {
        params.processingType = filter.processingType;
      }

      const response = await processingApi.getTasks(params);
      setTasks(response.data.records || []);
    } catch (error) {
      console.error('加载任务列表失败:', error);
      showError('加载失败', '无法加载数据处理任务列表');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      await processingApi.startTask(taskId);
      showSuccess('任务启动成功', '数据处理任务已开始执行');
      loadTasks();
    } catch (error) {
      showError('启动失败', '无法启动数据处理任务');
    }
  };

  const handleStopTask = async (taskId: string) => {
    try {
      await processingApi.stopTask(taskId);
      showSuccess('任务停止成功', '数据处理任务已停止');
      loadTasks();
    } catch (error) {
      showError('停止失败', '无法停止数据处理任务');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？此操作不可撤销。')) {
      return;
    }

    try {
      await processingApi.deleteTask(taskId);
      showSuccess('删除成功', '数据处理任务已删除');
      loadTasks();
    } catch (error) {
      showError('删除失败', '无法删除数据处理任务');
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

  const getProcessingTypeLabel = (type: ProcessingType) => {
    const typeLabels: Record<ProcessingType, string> = {
      [ProcessingType.CLEANING]: '数据清洗',
      [ProcessingType.FILTERING]: '数据过滤',
      [ProcessingType.DEDUPLICATION]: '数据去重',
      [ProcessingType.PRIVACY_REMOVAL]: '隐私移除',
      [ProcessingType.FORMAT_CONVERSION]: '格式转换',
      [ProcessingType.NORMALIZATION]: '数据标准化',
      [ProcessingType.ENRICHMENT]: '数据增强',
      [ProcessingType.VALIDATION]: '数据验证',
      [ProcessingType.TRANSFORMATION]: '数据转换',
      [ProcessingType.SAMPLING]: '数据采样',
      [ProcessingType.MERGING]: '数据合并',
      [ProcessingType.SPLITTING]: '数据分割',
      [ProcessingType.AGGREGATION]: '数据聚合',
      [ProcessingType.FEATURE_EXTRACTION]: '特征提取',
      [ProcessingType.ANONYMIZATION]: '数据匿名化',
      [ProcessingType.ENCRYPTION]: '数据加密',
      [ProcessingType.COMPRESSION]: '数据压缩',
      [ProcessingType.EXPORT]: '数据导出'
    };
    return typeLabels[type] || type;
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

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">数据处理任务</h2>
            {selectedDataset && (
              <p className="text-sm text-gray-600 mt-1">
                当前数据集: {selectedDataset.name}
                {onBackToDataset && (
                  <button
                    onClick={onBackToDataset}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    返回数据集
                  </button>
                )}
              </p>
            )}
          </div>
          <button
            onClick={onCreateTask}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            创建任务
          </button>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全部状态</option>
              <option value={ProcessingStatus.PENDING}>等待中</option>
              <option value={ProcessingStatus.RUNNING}>运行中</option>
              <option value={ProcessingStatus.SUCCESS}>成功</option>
              <option value={ProcessingStatus.FAILED}>失败</option>
              <option value={ProcessingStatus.CANCELLED}>已取消</option>
              <option value={ProcessingStatus.PAUSED}>已暂停</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">处理类型</label>
            <select
              value={filter.processingType}
              onChange={(e) => setFilter(prev => ({ ...prev, processingType: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全部类型</option>
              <option value={ProcessingType.CLEANING}>数据清洗</option>
              <option value={ProcessingType.FILTERING}>数据过滤</option>
              <option value={ProcessingType.DEDUPLICATION}>数据去重</option>
              <option value={ProcessingType.PRIVACY_REMOVAL}>隐私移除</option>
              <option value={ProcessingType.FORMAT_CONVERSION}>格式转换</option>
              <option value={ProcessingType.NORMALIZATION}>数据标准化</option>
              <option value={ProcessingType.ENRICHMENT}>数据增强</option>
              <option value={ProcessingType.VALIDATION}>数据验证</option>
              <option value={ProcessingType.TRANSFORMATION}>数据转换</option>
              <option value={ProcessingType.SAMPLING}>数据采样</option>
              <option value={ProcessingType.MERGING}>数据合并</option>
              <option value={ProcessingType.SPLITTING}>数据分割</option>
              <option value={ProcessingType.AGGREGATION}>数据聚合</option>
              <option value={ProcessingType.FEATURE_EXTRACTION}>特征提取</option>
              <option value={ProcessingType.ANONYMIZATION}>数据匿名化</option>
              <option value={ProcessingType.ENCRYPTION}>数据加密</option>
              <option value={ProcessingType.COMPRESSION}>数据压缩</option>
              <option value={ProcessingType.EXPORT}>数据导出</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input
              type="text"
              placeholder="搜索任务名称..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadTasks}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              刷新
            </button>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无任务</h3>
            <p className="mt-1 text-sm text-gray-500">开始创建您的第一个数据处理任务</p>
            <div className="mt-6">
              <button
                onClick={onCreateTask}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                创建任务
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    任务名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    处理类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    进度
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    文件大小
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => onViewTask(task.id)}>
                            {task.name}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500">{task.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getProcessingTypeLabel(task.processingType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status === ProcessingStatus.PENDING && '等待中'}
                        {task.status === ProcessingStatus.RUNNING && '运行中'}
                        {task.status === ProcessingStatus.SUCCESS && '成功'}
                        {task.status === ProcessingStatus.FAILED && '失败'}
                        {task.status === ProcessingStatus.CANCELLED && '已取消'}
                        {task.status === ProcessingStatus.PAUSED && '已暂停'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.fileSize ? formatFileSize(task.fileSize) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(task.createdTime).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewTask(task.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          查看
                        </button>
                        {task.status === ProcessingStatus.PENDING && (
                          <button
                            onClick={() => handleStartTask(task.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            启动
                          </button>
                        )}
                        {task.status === ProcessingStatus.RUNNING && (
                          <button
                            onClick={() => handleStopTask(task.id)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            停止
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 