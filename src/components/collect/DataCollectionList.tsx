'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play, 
  Stop, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  MoreVertical,
  RefreshCw,
  Calendar,
  Database,
  FileText,
  Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataCollectionApi, DataCollectionTask, DataCollectionTaskQueryRequest } from '@/api/collect';
import { useDataSourceStore } from '@/stores/useDataSourceStore';
import { useToast } from '@/hooks/useToast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataCollectionForm from './DataCollectionForm';
import DataCollectionDetail from './DataCollectionDetail';

// 采集类型映射
const collectionTypes = [
  { value: 'all', label: '全部类型' },
  { value: 'manual', label: '手动采集' },
  { value: 'scheduled', label: '定时采集' },
  { value: 'real_time', label: '实时采集' },
];

// 状态映射
const statusTypes = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '等待中' },
  { value: 'running', label: '运行中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
  { value: 'cancelled', label: '已取消' },
];

interface DataCollectionListProps {
  onAddTask?: () => void;
  onEditTask?: (task: DataCollectionTask) => void;
}

const DataCollectionList: React.FC<DataCollectionListProps> = ({ 
  onAddTask, 
  onEditTask 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DataCollectionTask | null>(null);
  const [viewingTask, setViewingTask] = useState<DataCollectionTask | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTask, setDeletingTask] = useState<DataCollectionTask | null>(null);
  
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const { dataSources } = useDataSourceStore();

  // 构建查询参数
  const queryParams: DataCollectionTaskQueryRequest = {
    page: currentPage,
    size: pageSize,
  };

  if (searchTerm) {
    queryParams.name = searchTerm;
  }

  if (selectedType !== 'all') {
    queryParams.collectionType = selectedType as any;
  }

  if (selectedStatus !== 'all') {
    queryParams.status = selectedStatus as any;
  }

  // 获取数据采集任务列表
  const { data: tasksData, isLoading, refetch } = useQuery({
    queryKey: ['dataCollectionTasks', queryParams],
    queryFn: () => dataCollectionApi.getTasks(queryParams),
    keepPreviousData: true,
  });

  // 获取统计信息
  const { data: statsData } = useQuery({
    queryKey: ['dataCollectionStats'],
    queryFn: () => dataCollectionApi.getStats(),
  });

  // 启动任务
  const startTaskMutation = useMutation({
    mutationFn: (taskId: string) => dataCollectionApi.startTask(taskId),
    onSuccess: () => {
      showSuccess('任务启动成功');
      queryClient.invalidateQueries(['dataCollectionTasks']);
      queryClient.invalidateQueries(['dataCollectionStats']);
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
      queryClient.invalidateQueries(['dataCollectionTasks']);
      queryClient.invalidateQueries(['dataCollectionStats']);
    },
    onError: (error: any) => {
      showError('任务停止失败: ' + (error.message || '未知错误'));
    },
  });

  // 删除任务
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => dataCollectionApi.deleteTask(taskId),
    onSuccess: () => {
      showSuccess('任务删除成功');
      setShowDeleteDialog(false);
      setDeletingTask(null);
      queryClient.invalidateQueries(['dataCollectionTasks']);
      queryClient.invalidateQueries(['dataCollectionStats']);
    },
    onError: (error: any) => {
      showError('任务删除失败: ' + (error.message || '未知错误'));
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

  const handleAddTask = () => {
    setEditingTask(null);
    setShowCreateModal(true);
  };

  const handleEditTask = (task: DataCollectionTask) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleViewTask = (task: DataCollectionTask) => {
    setViewingTask(task);
  };

  const handleDeleteTask = (task: DataCollectionTask) => {
    setDeletingTask(task);
    setShowDeleteDialog(true);
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

  const handleConfirmDelete = () => {
    if (deletingTask) {
      deleteTaskMutation.mutate(deletingTask.id);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingTask(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
  };

  const handleTaskSuccess = () => {
    handleCloseCreateModal();
    handleCloseEditModal();
    queryClient.invalidateQueries(['dataCollectionTasks']);
    queryClient.invalidateQueries(['dataCollectionStats']);
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
      case 'running': return <Zap className="w-4 h-4" />;
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

  const tasks = tasksData?.data?.records || [];
  const total = tasksData?.data?.total || 0;
  const stats = statsData?.data;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总任务数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">运行中</p>
                <p className="text-2xl font-bold text-blue-600">{stats.runningTasks}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">采集记录</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalRecordsCollected.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <div className="glass-card">
        {/* 头部操作栏 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">数据采集任务</h2>
              <p className="text-sm text-gray-600 mt-1">管理和监控数据采集任务</p>
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
                onClick={handleAddTask}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                新建任务
              </button>
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索任务名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {collectionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusTypes.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 任务列表 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  任务信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  数据源
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
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
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">暂无数据采集任务</p>
                    <p className="text-sm">点击"新建任务"开始创建您的第一个数据采集任务</p>
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
                      <div className="text-sm text-gray-900">{task.dataSourceName || '未知数据源'}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getTypeIcon(task.collectionType)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getTypeText(task.collectionType)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">
                          {task.status === 'pending' && '等待中'}
                          {task.status === 'running' && '运行中'}
                          {task.status === 'completed' && '已完成'}
                          {task.status === 'failed' && '失败'}
                          {task.status === 'cancelled' && '已取消'}
                        </span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{task.progress}%</span>
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
                        
                        {task.status === 'pending' && (
                          <button
                            onClick={() => handleStartTask(task.id)}
                            className="text-green-400 hover:text-green-600 transition-colors"
                            title="启动任务"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        {task.status === 'running' && (
                          <button
                            onClick={() => handleStopTask(task.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="停止任务"
                          >
                            <Stop className="w-4 h-4" />
                          </button>
                        )}
                        
                        {task.status === 'completed' && task.result && (
                          <button
                            onClick={() => handleDownloadResult(task.id)}
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                            title="下载结果"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleEditTask(task)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="编辑任务"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="删除任务"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                显示第 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, total)} 条，共 {total} 条
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                <span className="px-3 py-1 text-sm text-gray-700">
                  {currentPage} / {Math.ceil(total / pageSize)}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(total / pageSize), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(total / pageSize)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建任务弹窗 */}
      <DataCollectionForm
        visible={showCreateModal}
        onCancel={handleCloseCreateModal}
        onSuccess={handleTaskSuccess}
      />

      {/* 编辑任务弹窗 */}
      <DataCollectionForm
        visible={showEditModal}
        onCancel={handleCloseEditModal}
        onSuccess={handleTaskSuccess}
        editingTask={editingTask}
      />

      {/* 任务详情弹窗 */}
      {viewingTask && (
        <DataCollectionDetail
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={handleEditTask}
        />
      )}

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title="确认删除"
        message={`确定要删除任务"${deletingTask?.name}"吗？此操作不可恢复。`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeletingTask(null);
        }}
        confirmText="删除"
        cancelText="取消"
        confirmType="danger"
      />
    </div>
  );
};

export default DataCollectionList; 