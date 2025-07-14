'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Filter, 
  MoreVertical,
  Power, 
  PowerOff, 
  TestTube2, 
  Copy, 
  RefreshCw,
  Eye,
  Settings,
  Activity,
  Zap,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  File,
  Image,
  Video,
  Music,
  FileText,
  HardDrive,
  Upload,
  Download,
  FolderOpen
} from 'lucide-react';
import { Dataset, DatasetType, DatasetStatus, DatasetPermission } from '@/types';
import { datasetApi } from '@/api/dataset';
import ConfirmDialog from '@/components/common/ConfirmDialog';

// 数据集类型配置
const datasetTypes = [
  { value: 'all', label: '全部类型' },
  { value: 'TEXT', label: '文本数据' },
  { value: 'IMAGE', label: '图像数据' },
  { value: 'VIDEO', label: '视频数据' },
  { value: 'AUDIO', label: '音频数据' },
  { value: 'STRUCTURED', label: '结构化数据' },
];

// 数据集状态配置
const statusTypes = [
  { value: 'all', label: '全部状态' },
  { value: 'CREATING', label: '创建中' },
  { value: 'READY', label: '就绪' },
  { value: 'PROCESSING', label: '处理中' },
  { value: 'ERROR', label: '错误' },
];

// 权限类型配置
const permissionTypes = [
  { value: 'all', label: '全部权限' },
  { value: 'PRIVATE', label: '私有' },
  { value: 'PUBLIC', label: '公开' },
  { value: 'TEAM', label: '团队' },
];

interface DatasetListProps {
  onAddDataset?: () => void;
  onEditDataset?: (dataset: Dataset) => void;
  onViewDataset?: (dataset: Dataset) => void;
}

// 通知组件
interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          borderLeft: 'border-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200', 
          text: 'text-red-800',
          borderLeft: 'border-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          borderLeft: 'border-yellow-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          borderLeft: 'border-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          borderLeft: 'border-gray-500'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const styles = getStyles();

  return (
    <div 
      className={`fixed top-4 right-4 transition-all duration-500 ${
        isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'
      }`}
      style={{ 
        zIndex: 99999,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      <div className={`glass-card p-4 border-l-4 ${styles.borderLeft} shadow-2xl max-w-sm min-w-[320px] backdrop-blur-md`}
           style={{ 
             background: 'rgba(255, 255, 255, 0.95)',
             backdropFilter: 'blur(12px)',
             WebkitBackdropFilter: 'blur(12px)',
           }}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${styles.text}`}>
              {message}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DatasetList: React.FC<DatasetListProps> = ({ 
  onAddDataset, 
  onEditDataset,
  onViewDataset
}) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {}
  });
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPermission, setSelectedPermission] = useState<string>('all');
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);

  // 数据集详情弹窗状态
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 数据集类型图标配置
  const datasetTypeConfig = {
    [DatasetType.TEXT]: { icon: FileText, name: '文本数据', color: 'text-blue-600' },
    [DatasetType.IMAGE]: { icon: Image, name: '图像数据', color: 'text-green-600' },
    [DatasetType.VIDEO]: { icon: Video, name: '视频数据', color: 'text-purple-600' },
    [DatasetType.AUDIO]: { icon: Music, name: '音频数据', color: 'text-orange-600' },
    [DatasetType.STRUCTURED]: { icon: Database, name: '结构化数据', color: 'text-indigo-600' },
  };

  useEffect(() => {
    fetchDatasets();
  }, [currentPage, searchTerm, selectedType, selectedStatus, selectedPermission]);

  const fetchDatasets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        size: pageSize,
      };

      if (searchTerm.trim()) {
        params.keyword = searchTerm.trim();
      }
      if (selectedType !== 'all') {
        params.type = selectedType;
      }
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      if (selectedPermission !== 'all') {
        params.permission = selectedPermission;
      }

      const response = await datasetApi.GetDatasets(params);
      setDatasets(response.data || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      setError(error.message || '获取数据集列表失败');
      showNotification('error', error.message || '获取数据集列表失败');
    } finally {
      setLoading(false);
    }
  };

  const refreshDatasets = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await fetchDatasets();
      showNotification('success', '数据集列表已刷新');
    } catch (error: any) {
      showNotification('error', error.message || '刷新数据集列表失败');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    setConfirmDialog({
      visible: true,
      title: '删除数据集',
      message: '确定要删除这个数据集吗？此操作不可恢复。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await datasetApi.DeleteDataset(Number(id));
          showNotification('success', '数据集删除成功');
          await fetchDatasets();
        } catch (error: any) {
          showNotification('error', error.message || '删除数据集失败');
        }
        setConfirmDialog(prev => ({ ...prev, visible: false }));
      }
    });
  };

  const handleViewDetail = (dataset: Dataset) => {
    if (onViewDataset) {
      onViewDataset(dataset);
    } else {
      setSelectedDataset(dataset);
      setShowDetailModal(true);
    }
  };

  const handleEditDataset = (dataset: Dataset) => {
    if (onEditDataset) {
      onEditDataset(dataset);
    }
  };

  const handleAddDataset = () => {
    if (onAddDataset) {
      onAddDataset();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 显示通知
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'TEXT': 'bg-blue-500/10 text-blue-700 border-blue-200',
      'IMAGE': 'bg-green-500/10 text-green-700 border-green-200',
      'VIDEO': 'bg-purple-500/10 text-purple-700 border-purple-200',
      'AUDIO': 'bg-orange-500/10 text-orange-700 border-orange-200',
      'STRUCTURED': 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'CREATING': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
      'READY': 'bg-green-500/10 text-green-700 border-green-200',
      'PROCESSING': 'bg-blue-500/10 text-blue-700 border-blue-200',
      'ERROR': 'bg-red-500/10 text-red-700 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'CREATING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'PROCESSING':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      'CREATING': '创建中',
      'READY': '就绪',
      'PROCESSING': '处理中',
      'ERROR': '错误',
    };
    return statusMap[status as keyof typeof statusMap] || '未知';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 分页计算
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  if (loading && datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto space-y-6 animate-fade-in">
      {/* 通知组件 */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900 text-shadow">数据集管理</h1>
          </div>
          <p className="text-gray-600 mt-1">管理和组织您的AI训练数据集</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshDatasets}
            disabled={isRefreshing}
            className="btn-glass-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isRefreshing ? "正在刷新..." : "刷新数据集列表"}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? '刷新中...' : '刷新'}</span>
          </button>
          <button 
            onClick={handleAddDataset}
            className="btn-glass-primary flex items-center space-x-2"
            title="创建新的数据集"
          >
            <Plus className="w-4 h-4" />
            <span>创建数据集</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总数据集</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">就绪</p>
              <p className="text-2xl font-bold text-green-900">
                {datasets.filter(ds => ds.status === 'READY').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">处理中</p>
              <p className="text-2xl font-bold text-blue-900">
                {datasets.filter(ds => ds.status === 'PROCESSING' || ds.status === 'CREATING').length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总大小</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatFileSize(datasets.reduce((sum, ds) => sum + (ds.size || 0), 0))}
              </p>
            </div>
            <HardDrive className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索数据集名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-glass w-full pl-10 pr-4 py-2"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 lg:gap-4">
            {/* Type Filter */}
            <div className="sm:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-glass w-full py-2 px-3 text-sm"
              >
                {datasetTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-glass w-full py-2 px-3 text-sm"
              >
                {statusTypes.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Permission Filter */}
            <div className="sm:w-48">
              <select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value)}
                className="input-glass w-full py-2 px-3 text-sm"
              >
                {permissionTypes.map((permission) => (
                  <option key={permission.value} value={permission.value}>
                    {permission.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Datasets Grid */}
      <div className="glass-card overflow-hidden">
        {datasets.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无数据集</h3>
            <p className="text-gray-500 mb-4">开始创建您的第一个数据集</p>
            <button 
              onClick={handleAddDataset}
              className="btn-glass-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建数据集
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {datasets.map((dataset) => {
                const TypeIcon = datasetTypeConfig[dataset.type as DatasetType]?.icon || Database;
                const typeConfig = datasetTypeConfig[dataset.type as DatasetType];
                
                return (
                  <div
                    key={dataset.id}
                    className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => handleViewDetail(dataset)}
                  >
                    <div className="p-6">
                      {/* Dataset Type Icon */}
                      <div className="flex items-center justify-between mb-4">
                        <TypeIcon className={`w-8 h-8 ${typeConfig?.color || 'text-gray-600'}`} />
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(dataset.status || 'CREATING')}
                        </div>
                      </div>

                      {/* Dataset Info */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {dataset.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {dataset.description || '暂无描述'}
                        </p>
                        
                        {/* Type and Status Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(dataset.type)}`}>
                            {typeConfig?.name || dataset.type}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(dataset.status || 'CREATING')}`}>
                            {getStatusText(dataset.status || 'CREATING')}
                          </span>
                        </div>
                      </div>

                      {/* Dataset Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div>
                          <span className="block font-medium">文件数</span>
                          <span>{dataset.fileCount || 0} 个</span>
                        </div>
                        <div>
                          <span className="block font-medium">大小</span>
                          <span>{formatFileSize(dataset.size || 0)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          {dataset.createTime ? new Date(dataset.createTime).toLocaleDateString() : ''}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(dataset);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDataset(dataset);
                            }}
                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(dataset.id!);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-glass-200 bg-glass-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示 {startItem} 到 {endItem} 条，共 {total} 条记录
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                              currentPage === pageNum
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 数据集详情弹窗 */}
      {showDetailModal && selectedDataset && (
        <div 
          className="modal-overlay animate-fade-in"
          onClick={(e) => {
            e.preventDefault();
            setShowDetailModal(false);
          }}
        >
          <div 
            className="glass-card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Database className="w-6 h-6 text-blue-600" />
                <span>数据集详情</span>
              </h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDetailModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">基本信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">数据集名称</label>
                    <p className="text-gray-900 mt-1">{selectedDataset.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">数据集类型</label>
                    <p className="text-gray-900 mt-1">{datasetTypeConfig[selectedDataset.type as DatasetType]?.name || selectedDataset.type}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">描述</label>
                    <p className="text-gray-900 mt-1">{selectedDataset.description || '暂无描述'}</p>
                  </div>
                </div>
              </div>

              {/* 统计信息 */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">统计信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">文件数量</label>
                    <p className="text-gray-900 mt-1">{selectedDataset.fileCount || 0} 个</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">数据大小</label>
                    <p className="text-gray-900 mt-1">{formatFileSize(selectedDataset.size || 0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">格式</label>
                    <p className="text-gray-900 mt-1">{selectedDataset.format || '未指定'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">版本</label>
                    <p className="text-gray-900 mt-1">{selectedDataset.version || 'v1.0'}</p>
                  </div>
                </div>
              </div>

              {/* 状态信息 */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">状态信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">当前状态</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedDataset.status || 'CREATING')}
                      <span>{getStatusText(selectedDataset.status || 'CREATING')}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">权限类型</label>
                    <p className="text-gray-900 mt-1">
                      {selectedDataset.permission === 'PRIVATE' ? '私有' : 
                       selectedDataset.permission === 'PUBLIC' ? '公开' : '团队'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">创建时间</label>
                    <p className="text-gray-900 mt-1">
                      {selectedDataset.createTime 
                        ? new Date(selectedDataset.createTime).toLocaleString() 
                        : '未知'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">更新时间</label>
                    <p className="text-gray-900 mt-1">
                      {selectedDataset.updateTime 
                        ? new Date(selectedDataset.updateTime).toLocaleString() 
                        : '未知'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDetailModal(false);
                    window.open(`/dataset/${selectedDataset.id}`, '_blank');
                  }}
                  className="btn-glass flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 border-green-300/30 text-green-700"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>打开数据集</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDetailModal(false);
                    onEditDataset?.(selectedDataset);
                  }}
                  className="btn-glass-primary flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>编辑</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDetailModal(false);
                  }}
                  className="btn-glass-secondary"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 确认对话框 */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
};

export default DatasetList; 