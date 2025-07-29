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
  Info
} from 'lucide-react';
import { useDataSourceStore } from '@/stores/useDataSourceStore';
import { DataSource, DataSourceType, DataSourceLevel } from '@/types';
import DataSourceSettings from './DataSourceSettings';
import DataSourceForm from './DataSourceForm';
import DataSourceConnections from './DataSourceConnections';
import DataSourceTables from './DataSourceTables';
import ConfirmDialog from '@/components/common/ConfirmDialog';

// 数据源类型映射
const dataSourceTypes = [
  { value: 'all', label: '全部类型' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'redis', label: 'Redis' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'hive', label: 'Hive' },
  { value: 'ftp', label: 'FTP' },
  { value: 'sftp', label: 'SFTP' },
  { value: 'kafka', label: 'Kafka' },
  { value: 'hdfs', label: 'HDFS' },
];

// 数据源分类映射
const dataSourceCategories = [
  { value: 'all', label: '全部分类' },
  { value: 'database', label: '数据库' },
  { value: 'file', label: '文件系统' },
  { value: 'streaming', label: '流处理' },
  { value: 'bigdata', label: '大数据' },
];

// 状态映射
const statusTypes = [
  { value: 'all', label: '全部状态' },
  { value: '1', label: '已连接' },
  { value: '0', label: '未连接' },
  { value: '2', label: '连接失败' },
];

// 启用状态映射
const enabledTypes = [
  { value: 'all', label: '全部' },
  { value: 'true', label: '已启用' },
  { value: 'false', label: '已禁用' },
];

interface DataSourceListProps {
  onAddDataSource?: () => void;
  onEditDataSource?: (dataSource: DataSource) => void;
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

const DataSourceList: React.FC<DataSourceListProps> = ({ 
  onAddDataSource, 
  onEditDataSource 
}) => {
  // 新增状态
  const [showConnections, setShowConnections] = useState(false);
  const [showTables, setShowTables] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  
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
  const { 
    dataSources, 
    loading, 
    error, 
    total,
    currentPage,
    pageSize,
    serverConnected,
    fetchDataSources,
    refreshDataSources,
    checkServerConnection, 
    deleteDataSource, 
    testConnection,
    toggleEnable
  } = useDataSourceStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEnabled, setSelectedEnabled] = useState<string>('all');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [settingsDataSource, setSettingsDataSource] = useState<DataSource | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDataSource, setEditingDataSource] = useState<DataSource | null>(null);

  // 测试连接状态
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set());
  
  // 刷新状态
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 通知状态
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);

  // 详情弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    // 页面加载时先检查服务器连接状态
    const initializeConnection = async () => {
      const connected = await checkServerConnection();
      if (connected) {
        // 如果服务器连接正常，再加载数据源列表
        fetchDataSources();
      }
    };
    
    initializeConnection();
  }, [checkServerConnection, fetchDataSources]);

  // 根据数据源类型获取分类
  const getDataSourceCategory = (type: string): string => {
    const typeUpper = type.toUpperCase();
    if (['MYSQL', 'POSTGRESQL', 'ORACLE', 'HIVE'].includes(typeUpper)) {
      return 'database';
    } else if (['FTP', 'SFTP', 'HDFS'].includes(typeUpper)) {
      return 'file';
    } else if (['KAFKA'].includes(typeUpper)) {
      return 'streaming';
    } else if (['HIVE', 'HDFS'].includes(typeUpper)) {
      return 'bigdata';
    }
    return 'other';
  };

  const filteredDataSources = dataSources.filter(ds => {
    const matchesSearch = ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ds.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || ds.type.toLowerCase() === selectedType.toLowerCase();
    const matchesCategory = selectedCategory === 'all' || getDataSourceCategory(ds.type) === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || ds.status.toString() === selectedStatus;
    const matchesEnabled = selectedEnabled === 'all' || 
      (selectedEnabled === 'true' && (typeof ds.enabled === 'boolean' ? ds.enabled : Boolean(ds.enabled))) ||
      (selectedEnabled === 'false' && (typeof ds.enabled === 'boolean' ? !ds.enabled : !Boolean(ds.enabled)));
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesEnabled;
  });

  const handleDelete = async (id: string | number) => {
    setConfirmDialog({
      visible: true,
      title: '删除数据源',
      message: '确定要删除这个数据源吗？此操作不可恢复。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDataSource(String(id));
          showNotification('success', '数据源删除成功');
        } catch (error: any) {
          showNotification('error', error.message || '删除数据源失败');
        }
        setConfirmDialog(prev => ({ ...prev, visible: false }));
      }
    });
  };

  const handleSettings = (dataSource: DataSource) => {
    setSettingsDataSource(dataSource);
    setShowSettingsModal(true);
  };

  const handleAddDataSource = () => {
    if (onAddDataSource) {
      onAddDataSource();
    } else {
      setShowAddModal(true);
    }
  };

  const handleEditDataSource = (dataSource: DataSource) => {
    if (onEditDataSource) {
      onEditDataSource(dataSource);
    } else {
      setEditingDataSource(dataSource);
      setShowEditModal(true);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    // 移除刷新调用，由 store 自动更新
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingDataSource(null);
    // 移除刷新调用，由 store 自动更新
  };

  const handlePageChange = (page: number) => {
    fetchDataSources({ page });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'mysql': 'bg-blue-500/10 text-blue-700 border-blue-200',
      'postgresql': 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
      'oracle': 'bg-orange-500/10 text-orange-700 border-orange-200',
      'hive': 'bg-amber-500/10 text-amber-700 border-amber-200',
      'ftp': 'bg-green-500/10 text-green-700 border-green-200',
      'sftp': 'bg-teal-500/10 text-teal-700 border-teal-200',
      'kafka': 'bg-purple-500/10 text-purple-700 border-purple-200',
      'hdfs': 'bg-pink-500/10 text-pink-700 border-pink-200',
    };
    return colors[type.toLowerCase() as keyof typeof colors] || 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status: number | string) => {
    const statusCode = typeof status === 'string' ? parseInt(status) : status;
    switch (statusCode) {
      case 1: // ACTIVE
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 0: // INACTIVE
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 2: // ERROR
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: number | string) => {
    const statusCode = typeof status === 'string' ? parseInt(status) : status;
    switch (statusCode) {
      case 1: // ACTIVE
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 0: // INACTIVE
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 2: // ERROR
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
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

  // 获取分级颜色
  const getLevelColor = (level: DataSourceLevel) => {
    switch (level) {
      case DataSourceLevel.PUBLIC:
        return 'bg-green-500/10 text-green-700 border-green-200';
      case DataSourceLevel.INTERNAL:
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case DataSourceLevel.CONFIDENTIAL:
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case DataSourceLevel.SECRET:
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  // 获取分级文本
  const getLevelText = (level: DataSourceLevel) => {
    switch (level) {
      case DataSourceLevel.PUBLIC:
        return '公开级';
      case DataSourceLevel.INTERNAL:
        return '内部级';
      case DataSourceLevel.CONFIDENTIAL:
        return '机密级';
      case DataSourceLevel.SECRET:
        return '秘密级';
      default:
        return '未知';
    }
  };

  // 显示通知
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message });
  };

  // 刷新数据源
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // 先检查服务器连接状态
      const connected = await checkServerConnection();
      if (connected) {
        // 服务器连接正常，刷新数据源列表
        await refreshDataSources();
        showNotification('success', '数据源列表已刷新');
      } else {
        // 服务器连接失败
        showNotification('error', '无法连接到服务器，请检查服务器状态');
      }
    } catch (error: any) {
      showNotification('error', error.message || '刷新数据源失败');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 处理测试连接
  const handleTestConnection = async (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dsId = String(id);
    
    if (testingConnections.has(dsId)) return;
    
    setTestingConnections(prev => new Set(prev).add(dsId));
    
    try {
      const result = await testConnection(dsId);
      if (result) {
        showNotification('success', '连接测试成功！数据源运行正常');
      } else {
        showNotification('error', '连接测试失败！请检查数据源配置');
      }
    } catch (error: any) {
      showNotification('error', error.message || '连接测试失败');
    } finally {
      setTestingConnections(prev => {
        const newSet = new Set(prev);
        newSet.delete(dsId);
        return newSet;
      });
    }
  };

  // 复制配置
  const handleCopyConfig = async (dataSource: DataSource) => {
    try {
      const config = {
        name: dataSource.name,
        type: dataSource.type,
        host: dataSource.host,
        port: dataSource.port,
        database: dataSource.database,
        description: dataSource.description
      };
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      showNotification('success', '数据源配置已复制到剪贴板');
    } catch (error) {
      showNotification('error', '复制配置失败');
    }
  };

  // 查看详情
  const handleViewDetail = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setShowDetailModal(true);
  };

  // 处理连接管理
  const handleConnections = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setShowConnections(true);
  };

  // 处理表管理
  const handleTables = (dataSource: DataSource) => {
    setSelectedDataSource(dataSource);
    setShowTables(true);
  };

  // 分页计算
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 border-red-200 bg-red-50/50 animate-slide-up">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">加载数据源时出错: {error}</p>
        </div>
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
            <h1 className="text-3xl font-bold text-gray-900 text-shadow">数据源管理</h1>
            {/* 服务器连接状态指示器 */}
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              serverConnected 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-orange-100 text-orange-700 border border-orange-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                serverConnected ? 'bg-green-500' : 'bg-orange-500'
              }`}></div>
              <span>{serverConnected ? '服务已连接' : '服务未连接'}</span>
            </div>
          </div>
          <p className="text-gray-600 mt-1">管理和配置您的数据源连接</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-glass-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isRefreshing ? "正在刷新..." : "刷新数据源列表"}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? '刷新中...' : '刷新'}</span>
          </button>
          <button 
            onClick={handleAddDataSource}
            className="btn-glass-primary flex items-center space-x-2"
            disabled={!serverConnected}
            title={!serverConnected ? "请先确保服务器连接正常" : "添加新的数据源"}
          >
            <Plus className="w-4 h-4" />
            <span>添加数据源</span>
          </button>
        </div>
      </div>

{/* Statistics */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总数据源</p>
              <p className="text-2xl font-bold text-gray-900">{dataSources.length}</p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">已连接</p>
              <p className="text-2xl font-bold text-green-900">
                {dataSources.filter(ds => (typeof ds.status === 'string' ? parseInt(ds.status) : ds.status) === 1).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">连接失败</p>
              <p className="text-2xl font-bold text-red-900">
                {dataSources.filter(ds => (typeof ds.status === 'string' ? parseInt(ds.status) : ds.status) === 2).length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">已启用</p>
              <p className="text-2xl font-bold text-blue-900">
                {dataSources.filter(ds => (typeof ds.enabled === 'boolean' ? ds.enabled : Boolean(ds.enabled))).length}
              </p>
            </div>
            <Power className="w-8 h-8 text-blue-500" />
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
                placeholder="搜索数据源名称或描述..."
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
                {dataSourceTypes.map((type) => (
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

            {/* Enabled Filter */}
            <div className="sm:w-48">
              <select
                value={selectedEnabled}
                onChange={(e) => setSelectedEnabled(e.target.value)}
                className="input-glass w-full py-2 px-3 text-sm"
              >
                {enabledTypes.map((enabled) => (
                  <option key={enabled.value} value={enabled.value}>
                    {enabled.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources Table */}
      <div className="glass-card overflow-hidden">
        {filteredDataSources.length === 0 ? (
          <div className="p-12 text-center">
            {!serverConnected ? (
              // 服务器未连接的提示
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">无法连接到服务器</h3>
                <p className="text-gray-500 mb-4">
                  数据源服务暂时不可用，请检查：<br/>
                  • 后台服务是否已启动<br/>
                  • 网络连接是否正常<br/>
                  • 服务地址配置是否正确
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="btn-glass-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isRefreshing ? "正在重试..." : "重试连接"}
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? '重试中...' : '重试连接'}</span>
                  </button>
                  <button 
                    onClick={handleAddDataSource}
                    className="btn-glass-primary flex items-center space-x-2"
                    disabled
                    title="服务器连接后可添加数据源"
                  >
                    <Plus className="w-4 h-4" />
                    <span>添加数据源</span>
                  </button>
                </div>
              </>
            ) : (
              // 正常的空列表提示
              <>
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无数据源</h3>
                <p className="text-gray-500 mb-4">开始添加您的第一个数据源连接</p>
                <button 
                  onClick={handleAddDataSource}
                  className="btn-glass-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加数据源
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-glass-200 bg-glass-100">
                    <th className="text-left py-4 px-6 font-medium text-gray-700">名称</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">类型</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">分级</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">状态</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">启用状态</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">最后连接</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">创建时间</th>
                    <th className="text-center py-4 px-6 font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDataSources.map((ds, index) => (
                    <tr 
                      key={ds.id} 
                      className="border-b border-glass-100 hover:bg-glass-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <h4 className="font-medium text-gray-900">{ds.name}</h4>
                          {ds.description && (
                            <p className="text-sm text-gray-500 mt-1">{ds.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(ds.type)}`}>
                          {ds.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(ds.level || DataSourceLevel.INTERNAL)}`}>
                          {getLevelText(ds.level || DataSourceLevel.INTERNAL)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(ds.status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ds.status)}`}>
                            {getStatusText(ds.status)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          (typeof ds.enabled === 'boolean' ? ds.enabled : Boolean(ds.enabled))
                            ? 'bg-green-500/10 text-green-700 border-green-200'
                            : 'bg-gray-500/10 text-gray-700 border-gray-200'
                        }`}>
                          {(typeof ds.enabled === 'boolean' ? ds.enabled : Boolean(ds.enabled)) ? '已启用' : '已禁用'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {ds.updateTime ? new Date(ds.updateTime).toLocaleString() : '-'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(ds.createTime).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={(e) => handleViewDetail(ds)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleConnections(ds)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                            title="连接管理"
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleTables(ds)}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                            title="表管理"
                          >
                            <Database className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleTestConnection(e, ds.id)}
                            disabled={testingConnections.has(String(ds.id))}
                            className={`p-2 rounded-lg transition-colors ${
                              testingConnections.has(String(ds.id))
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title="测试连接"
                          >
                            <Activity className={`w-4 h-4 ${testingConnections.has(String(ds.id)) ? 'animate-spin' : ''}`} />
                          </button>
                          <button 
                            onClick={(e) => handleEditDataSource(ds)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleCopyConfig(ds)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                            title="复制配置"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(ds.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {/* Settings Modal */}
      <DataSourceSettings
        dataSource={settingsDataSource}
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          setSettingsDataSource(null);
        }}
      />

      {/* Add DataSource Modal */}
      <DataSourceForm
        visible={showAddModal}
        onCancel={handleCloseAddModal}
      />

      {/* Edit DataSource Modal */}
      <DataSourceForm
        visible={showEditModal}
        onCancel={handleCloseEditModal}
        editingDataSource={editingDataSource}
      />

      {/* 数据源详情弹窗 */}
      {showDetailModal && selectedDataSource && (
        <div 
          className="modal-overlay animate-fade-in"
          onClick={(e) => {
            e.preventDefault();
            setShowDetailModal(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setShowDetailModal(false);
            }
          }}
          tabIndex={-1}
        >
          <div 
            className="glass-card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Database className="w-6 h-6 text-blue-600" />
                <span>数据源详情</span>
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
                    <label className="text-sm font-medium text-gray-600">数据源名称</label>
                    <p className="text-gray-900 mt-1">{selectedDataSource.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">数据源类型</label>
                    <p className="text-gray-900 mt-1">{selectedDataSource.type.toUpperCase()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">数据源分级</label>
                    <p className="text-gray-900 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(selectedDataSource.level || DataSourceLevel.INTERNAL)}`}>
                        {getLevelText(selectedDataSource.level || DataSourceLevel.INTERNAL)}
                      </span>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">描述</label>
                    <p className="text-gray-900 mt-1">{selectedDataSource.description || '暂无描述'}</p>
                  </div>
                </div>
              </div>

              {/* 连接信息 */}
              {selectedDataSource.host && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">连接信息</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">主机地址</label>
                      <p className="text-gray-900 mt-1">{selectedDataSource.host}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">端口</label>
                      <p className="text-gray-900 mt-1">{selectedDataSource.port}</p>
                    </div>
                    {selectedDataSource.database && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">数据库名</label>
                        <p className="text-gray-900 mt-1">{selectedDataSource.database}</p>
                      </div>
                    )}
                    {selectedDataSource.username && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">用户名</label>
                        <p className="text-gray-900 mt-1">{selectedDataSource.username}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 状态信息 */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">状态信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">连接状态</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedDataSource.status)}
                      <span>{getStatusText(selectedDataSource.status)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">启用状态</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {(typeof selectedDataSource.enabled === 'boolean' ? selectedDataSource.enabled : Boolean(selectedDataSource.enabled)) ? (
                        <>
                          <Power className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">已启用</span>
                        </>
                      ) : (
                        <>
                          <PowerOff className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">已禁用</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">创建时间</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedDataSource.createTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">最后连接</label>
                    <p className="text-gray-900 mt-1">
                      {selectedDataSource.updateTime 
                        ? new Date(selectedDataSource.updateTime).toLocaleString() 
                        : '从未连接'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => handleTestConnection(e, selectedDataSource.id)}
                  disabled={testingConnections.has(String(selectedDataSource.id))}
                  className="btn-glass flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 border-green-300/30 text-green-700 disabled:opacity-50"
                >
                  <Activity className={`w-4 h-4 ${testingConnections.has(String(selectedDataSource.id)) ? 'animate-spin' : ''}`} />
                  <span>{testingConnections.has(String(selectedDataSource.id)) ? '测试中...' : '测试连接'}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDetailModal(false);
                    onEditDataSource?.(selectedDataSource);
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

      {/* 连接管理模态框 */}
      {selectedDataSource && (
        <DataSourceConnections
          dataSourceId={Number(selectedDataSource.id)}
          visible={showConnections}
          onClose={() => {
            setShowConnections(false);
            setSelectedDataSource(null);
          }}
        />
      )}

      {/* 表管理模态框 */}
      {selectedDataSource && (
        <DataSourceTables
          dataSourceId={Number(selectedDataSource.id)}
          visible={showTables}
          onClose={() => {
            setShowTables(false);
            setSelectedDataSource(null);
          }}
        />
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

export default DataSourceList; 