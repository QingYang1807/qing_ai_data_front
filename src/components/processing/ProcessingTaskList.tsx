'use client';

import React, { useState, useEffect } from 'react';
import { DataProcessingTask, ProcessingType, ProcessingStatus, Dataset } from '@/types';
import { processingApi } from '@/api/processing';
import { useToast } from '@/hooks/useToast';
import ProcessingTaskForm from './ProcessingTaskForm';

interface ProcessingTaskListProps {
  selectedDataset?: Dataset;
  onCreateTask: () => void;
  onViewTask: (taskId: string) => void;
  onViewResult: (taskId: string) => void;
  refreshTrigger: number;
  onBackToDataset?: () => void;
}

export default function ProcessingTaskList({
  selectedDataset,
  onCreateTask,
  onViewTask,
  onViewResult,
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
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const handleTaskSuccess = () => {
    showSuccess('任务创建成功', '数据处理任务已成功创建');
    loadTasks();
  };

  const handleTaskError = (error: string) => {
    showError('任务创建失败', error);
  };

  const handleCreateTask = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const getStatusColor = (status: ProcessingStatus) => {
    switch (status) {
      case ProcessingStatus.PENDING:
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case ProcessingStatus.RUNNING:
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case ProcessingStatus.SUCCESS:
        return 'bg-green-500/10 text-green-700 border-green-200';
      case ProcessingStatus.FAILED:
        return 'bg-red-500/10 text-red-700 border-red-200';
      case ProcessingStatus.CANCELLED:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      case ProcessingStatus.PAUSED:
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
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
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总任务数</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">运行中</p>
              <p className="text-2xl font-bold text-blue-900">
                {tasks.filter(task => task.status === ProcessingStatus.RUNNING).length}
              </p>
            </div>
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-green-900">
                {tasks.filter(task => task.status === ProcessingStatus.SUCCESS).length}
              </p>
            </div>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">失败任务</p>
              <p className="text-2xl font-bold text-red-900">
                {tasks.filter(task => task.status === ProcessingStatus.FAILED).length}
              </p>
            </div>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="glass-card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* 搜索 */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索任务名称或描述..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="input-glass w-full pl-10 pr-4 py-2"
              />
            </div>
          </div>

          {/* 快速筛选 */}
          <div className="flex flex-wrap gap-2 lg:gap-4">
            {/* 状态筛选 */}
            <div className="sm:w-48">
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="input-glass w-full py-2 px-3 text-sm"
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

            {/* 处理类型筛选 */}
            <div className="sm:w-48">
              <select
                value={filter.processingType}
                onChange={(e) => setFilter(prev => ({ ...prev, processingType: e.target.value }))}
                className="input-glass w-full py-2 px-3 text-sm"
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

            {/* 刷新按钮 */}
            <div>
              <button
                onClick={loadTasks}
                className="btn-glass-secondary w-full"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">加载任务列表中...</p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无任务</h3>
            <p className="text-gray-500 mb-6">开始创建您的第一个数据处理任务</p>
            <button
              onClick={onCreateTask}
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              创建任务
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="p-8">
                  {/* 任务头部 */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 
                          className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => onViewTask(task.id)}
                        >
                          {task.name}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                          {task.status === ProcessingStatus.PENDING && '⏳ 等待中'}
                          {task.status === ProcessingStatus.RUNNING && '🔄 运行中'}
                          {task.status === ProcessingStatus.SUCCESS && '✅ 成功'}
                          {task.status === ProcessingStatus.FAILED && '❌ 失败'}
                          {task.status === ProcessingStatus.CANCELLED && '🚫 已取消'}
                          {task.status === ProcessingStatus.PAUSED && '⏸️ 已暂停'}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-4">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-2">📊</span>
                          {getProcessingTypeLabel(task.processingType)}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-2">📅</span>
                          {new Date(task.createdTime).toLocaleDateString('zh-CN')}
                        </span>
                        {task.recordCount && (
                          <span className="flex items-center">
                            <span className="mr-2">📝</span>
                            {task.recordCount.toLocaleString()} 条记录
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* 操作按钮组 */}
                    <div className="flex items-center space-x-2 ml-6">
                      {task.status === ProcessingStatus.PENDING && (
                        <button
                          onClick={() => handleStartTask(task.id)}
                          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all duration-200 shadow-sm"
                          title="启动任务"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          启动
                        </button>
                      )}
                      
                      {task.status === ProcessingStatus.RUNNING && (
                        <button
                          onClick={() => handleStopTask(task.id)}
                          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-all duration-200 shadow-sm"
                          title="停止任务"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                          </svg>
                          停止
                        </button>
                      )}
                      
                      <button
                        onClick={() => onViewTask(task.id)}
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all duration-200 shadow-sm"
                        title="查看详情"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        详情
                      </button>
                      
                      {task.status === ProcessingStatus.SUCCESS && (
                        <button
                          onClick={() => onViewResult(task.id)}
                          className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all duration-200 shadow-sm"
                          title="查看结果"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          结果
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all duration-200 shadow-sm"
                        title="删除任务"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        删除
                      </button>
                    </div>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">处理进度</span>
                      <span className="text-sm font-semibold text-gray-900">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          task.status === ProcessingStatus.SUCCESS ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          task.status === ProcessingStatus.FAILED ? 'bg-gradient-to-r from-red-400 to-red-600' :
                          task.status === ProcessingStatus.RUNNING ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                          'bg-gradient-to-r from-gray-400 to-gray-600'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* 任务统计 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <div className="text-lg font-bold text-blue-600">{formatFileSize(task.fileSize || 0)}</div>
                      <div className="text-xs text-blue-700 font-medium">文件大小</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <div className="text-lg font-bold text-green-600">
                        {task.processingTime ? formatDuration(task.processingTime) : '-'}
                      </div>
                      <div className="text-xs text-green-700 font-medium">处理时间</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <div className="text-lg font-bold text-purple-600">{task.outputFormat || 'JSON'}</div>
                      <div className="text-xs text-purple-700 font-medium">输出格式</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-xl">
                      <div className="text-lg font-bold text-orange-600">{task.createdBy || '系统'}</div>
                      <div className="text-xs text-orange-700 font-medium">创建者</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 创建任务弹窗 */}
      <ProcessingTaskForm
        visible={showCreateModal}
        selectedDataset={selectedDataset}
        onCancel={handleCloseCreateModal}
        onSuccess={handleTaskSuccess}
        onError={handleTaskError}
      />
    </div>
  );
} 