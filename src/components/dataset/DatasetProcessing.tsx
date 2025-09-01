'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Settings, 
  FileText, 
  Filter, 
  Download, 
  Eye, 
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Database,
  Brain,
  Bot
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processingApi, ProcessingTaskCreateRequest } from '@/api/processing';
import { Dataset, ProcessingType, ProcessingConfig, OutputFormat } from '@/types';
import { useToast } from '@/hooks/useToast';
import ProcessingTaskForm from '@/components/processing/ProcessingTaskForm';
import ProcessingTaskDetail from '@/components/processing/ProcessingTaskDetail';

interface DatasetProcessingProps {
  dataset: Dataset;
  onBack?: () => void;
}

const DatasetProcessing: React.FC<DatasetProcessingProps> = ({
  dataset,
  onBack
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingTask, setViewingTask] = useState<any>(null);
  const [selectedProcessingType, setSelectedProcessingType] = useState<ProcessingType | null>(null);
  
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  // 获取数据集的处理任务
  const { data: tasksData, isLoading, refetch } = useQuery({
    queryKey: ['datasetProcessingTasks', dataset.id],
    queryFn: () => processingApi.getTasks({ datasetId: dataset.id?.toString() }),
    enabled: !!dataset.id,
  });

  // 获取处理统计
  const { data: statsData } = useQuery({
    queryKey: ['processingStats'],
    queryFn: () => processingApi.getStats(),
  });

  // 启动处理任务
  const startTaskMutation = useMutation({
    mutationFn: (taskId: string) => processingApi.startTask(taskId),
    onSuccess: () => {
      showSuccess('处理任务启动成功');
      queryClient.invalidateQueries(['datasetProcessingTasks', dataset.id]);
      queryClient.invalidateQueries(['processingStats']);
    },
    onError: (error: any) => {
      showError('任务启动失败: ' + (error.message || '未知错误'));
    },
  });

  // 停止处理任务
  const stopTaskMutation = useMutation({
    mutationFn: (taskId: string) => processingApi.stopTask(taskId),
    onSuccess: () => {
      showSuccess('处理任务停止成功');
      queryClient.invalidateQueries(['datasetProcessingTasks', dataset.id]);
      queryClient.invalidateQueries(['processingStats']);
    },
    onError: (error: any) => {
      showError('任务停止失败: ' + (error.message || '未知错误'));
    },
  });

  // 下载处理结果
  const downloadResultMutation = useMutation({
    mutationFn: (taskId: string) => processingApi.downloadResult(taskId),
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

  const handleCreateTask = (processingType?: ProcessingType) => {
    setSelectedProcessingType(processingType || null);
    setShowCreateModal(true);
  };

  const handleViewTask = (task: any) => {
    setViewingTask(task);
  };

  const handleStartTask = (taskId: string) => {
    startTaskMutation.mutate(taskId);
  };

  const handleStopTask = (taskId: string) => {
    stopTaskMutation.mutate(taskId);
  };

  const handleDownloadResult = (taskId: string) => {
    downloadResultMutation.mutate(taskId);
  };

  const handleTaskSuccess = () => {
    setShowCreateModal(false);
    setSelectedProcessingType(null);
    queryClient.invalidateQueries(['datasetProcessingTasks', dataset.id]);
    queryClient.invalidateQueries(['processingStats']);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'RUNNING': return 'text-blue-600 bg-blue-100';
      case 'SUCCESS': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'RUNNING': return <Zap className="w-4 h-4" />;
      case 'SUCCESS': return <CheckCircle className="w-4 h-4" />;
      case 'FAILED': return <XCircle className="w-4 h-4" />;
      case 'CANCELLED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getProcessingTypeIcon = (type: ProcessingType) => {
    switch (type) {
      case ProcessingType.CLEANING: return <Filter className="w-4 h-4" />;
      case ProcessingType.FILTERING: return <Filter className="w-4 h-4" />;
      case ProcessingType.DEDUPLICATION: return <Database className="w-4 h-4" />;
      case ProcessingType.FORMAT_CONVERSION: return <FileText className="w-4 h-4" />;
      case ProcessingType.ENRICHMENT: return <Brain className="w-4 h-4" />;
      case ProcessingType.VALIDATION: return <CheckCircle className="w-4 h-4" />;
      case ProcessingType.TRANSFORMATION: return <Settings className="w-4 h-4" />;
      case ProcessingType.SAMPLING: return <Database className="w-4 h-4" />;
      case ProcessingType.MERGING: return <Database className="w-4 h-4" />;
      case ProcessingType.SPLITTING: return <Database className="w-4 h-4" />;
      case ProcessingType.AGGREGATION: return <Database className="w-4 h-4" />;
      case ProcessingType.FEATURE_EXTRACTION: return <Brain className="w-4 h-4" />;
      case ProcessingType.ANONYMIZATION: return <Bot className="w-4 h-4" />;
      case ProcessingType.ENCRYPTION: return <Bot className="w-4 h-4" />;
      case ProcessingType.COMPRESSION: return <FileText className="w-4 h-4" />;
      case ProcessingType.EXPORT: return <Download className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getProcessingTypeText = (type: ProcessingType) => {
    switch (type) {
      case ProcessingType.CLEANING: return '数据清洗';
      case ProcessingType.FILTERING: return '数据过滤';
      case ProcessingType.DEDUPLICATION: return '数据去重';
      case ProcessingType.FORMAT_CONVERSION: return '格式转换';
      case ProcessingType.ENRICHMENT: return '数据增强';
      case ProcessingType.VALIDATION: return '数据验证';
      case ProcessingType.TRANSFORMATION: return '数据转换';
      case ProcessingType.SAMPLING: return '数据采样';
      case ProcessingType.MERGING: return '数据合并';
      case ProcessingType.SPLITTING: return '数据分割';
      case ProcessingType.AGGREGATION: return '数据聚合';
      case ProcessingType.FEATURE_EXTRACTION: return '特征提取';
      case ProcessingType.ANONYMIZATION: return '数据匿名化';
      case ProcessingType.ENCRYPTION: return '数据加密';
      case ProcessingType.COMPRESSION: return '数据压缩';
      case ProcessingType.EXPORT: return '数据导出';
      default: return type;
    }
  };

  const quickProcessingTypes = [
    ProcessingType.CLEANING,
    ProcessingType.FILTERING,
    ProcessingType.DEDUPLICATION,
    ProcessingType.FORMAT_CONVERSION,
    ProcessingType.ENRICHMENT,
    ProcessingType.VALIDATION,
  ];

  const tasks = tasksData?.data?.records || [];
  const stats = statsData?.data;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 头部 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← 返回
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">数据集处理</h1>
            </div>
            <p className="text-gray-600 mt-1">
              数据集: {dataset.name} - 管理和执行数据处理任务
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </button>
            
            <button
              onClick={() => handleCreateTask()}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建处理任务
            </button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总任务数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTasks || 0}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">运行中</p>
                <p className="text-2xl font-bold text-blue-600">{stats.runningTasks || 0}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedTasks || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">处理记录</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalRecordsProcessed?.toLocaleString() || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* 快速处理 */}
      <div className="glass-card mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">快速处理</h2>
          <p className="text-sm text-gray-600 mt-1">选择常用的处理类型快速创建任务</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickProcessingTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleCreateTask(type)}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors group"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors mb-3">
                  {getProcessingTypeIcon(type)}
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  {getProcessingTypeText(type)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 处理任务列表 */}
      <div className="glass-card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">处理任务</h2>
          <p className="text-sm text-gray-600 mt-1">查看和管理当前数据集的所有处理任务</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  任务信息
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
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">暂无处理任务</p>
                    <p className="text-sm">点击"新建处理任务"开始处理当前数据集</p>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.name}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getProcessingTypeIcon(task.processingType)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getProcessingTypeText(task.processingType)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">
                          {task.status === 'PENDING' && '等待中'}
                          {task.status === 'RUNNING' && '运行中'}
                          {task.status === 'SUCCESS' && '已完成'}
                          {task.status === 'FAILED' && '失败'}
                          {task.status === 'CANCELLED' && '已取消'}
                        </span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{task.progress || 0}%</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(task.createdTime).toLocaleString()}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewTask(task)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {task.status === 'PENDING' && (
                          <button
                            onClick={() => handleStartTask(task.id)}
                            className="text-green-400 hover:text-green-600 transition-colors"
                            title="启动任务"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        {task.status === 'RUNNING' && (
                          <button
                            onClick={() => handleStopTask(task.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="停止任务"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        )}
                        
                        {task.status === 'SUCCESS' && (
                          <button
                            onClick={() => handleDownloadResult(task.id)}
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                            title="下载结果"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 创建任务弹窗 */}
      <ProcessingTaskForm
        visible={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          setSelectedProcessingType(null);
        }}
        onSuccess={handleTaskSuccess}
        dataset={dataset}
        defaultProcessingType={selectedProcessingType}
      />

      {/* 任务详情弹窗 */}
      {viewingTask && (
        <ProcessingTaskDetail
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={() => {
            setViewingTask(null);
            // 可以在这里添加编辑逻辑
          }}
        />
      )}
    </div>
  );
};

export default DatasetProcessing; 