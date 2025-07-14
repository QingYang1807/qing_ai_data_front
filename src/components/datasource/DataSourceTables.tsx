'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  RefreshCw, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Database,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Activity,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { DatabaseTable, TableColumn, DataSourceLevel, TableManagement } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface DataSourceTablesProps {
  dataSourceId: number;
  visible: boolean;
  onClose: () => void;
}

// 模拟数据库表数据
const mockTables: DatabaseTable[] = [
  {
    id: 1,
    dataSourceId: 1,
    tableName: 'users',
    tableComment: '用户信息表',
    tableType: 'TABLE',
    rowCount: 1250,
    size: 2048576,
    columns: [
      {
        columnName: 'id',
        dataType: 'int',
        columnComment: '用户ID',
        isNullable: false,
        isPrimaryKey: true,
        columnSize: 11
      },
      {
        columnName: 'username',
        dataType: 'varchar',
        columnComment: '用户名',
        isNullable: false,
        isPrimaryKey: false,
        columnSize: 50
      },
      {
        columnName: 'email',
        dataType: 'varchar',
        columnComment: '邮箱',
        isNullable: true,
        isPrimaryKey: false,
        columnSize: 100
      },
      {
        columnName: 'created_at',
        dataType: 'datetime',
        columnComment: '创建时间',
        isNullable: false,
        isPrimaryKey: false
      }
    ],
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    dataSourceId: 1,
    tableName: 'orders',
    tableComment: '订单信息表',
    tableType: 'TABLE',
    rowCount: 5678,
    size: 8192000,
    columns: [
      {
        columnName: 'id',
        dataType: 'int',
        columnComment: '订单ID',
        isNullable: false,
        isPrimaryKey: true,
        columnSize: 11
      },
      {
        columnName: 'user_id',
        dataType: 'int',
        columnComment: '用户ID',
        isNullable: false,
        isPrimaryKey: false,
        columnSize: 11
      },
      {
        columnName: 'amount',
        dataType: 'decimal',
        columnComment: '订单金额',
        isNullable: false,
        isPrimaryKey: false,
        precision: 10,
        scale: 2
      },
      {
        columnName: 'status',
        dataType: 'varchar',
        columnComment: '订单状态',
        isNullable: false,
        isPrimaryKey: false,
        columnSize: 20
      }
    ],
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 3,
    dataSourceId: 1,
    tableName: 'user_stats',
    tableComment: '用户统计视图',
    tableType: 'VIEW',
    rowCount: 1250,
    size: 0,
    columns: [
      {
        columnName: 'user_id',
        dataType: 'int',
        columnComment: '用户ID',
        isNullable: false,
        isPrimaryKey: false,
        columnSize: 11
      },
      {
        columnName: 'order_count',
        dataType: 'int',
        columnComment: '订单数量',
        isNullable: true,
        isPrimaryKey: false,
        columnSize: 11
      },
      {
        columnName: 'total_amount',
        dataType: 'decimal',
        columnComment: '总金额',
        isNullable: true,
        isPrimaryKey: false,
        precision: 10,
        scale: 2
      }
    ],
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 10:30:00'
  }
];

// 模拟表管理数据
const mockTableManagement: TableManagement[] = [
  {
    id: 1,
    dataSourceId: 1,
    tableName: 'users',
    isEnabled: true,
    syncEnabled: true,
    lastSyncTime: '2024-01-15 10:30:00',
    syncInterval: 60,
    description: '用户基础信息表',
    tags: '用户,基础数据',
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    dataSourceId: 1,
    tableName: 'orders',
    isEnabled: true,
    syncEnabled: false,
    lastSyncTime: '2024-01-14 16:45:00',
    syncInterval: 30,
    description: '订单交易数据表',
    tags: '订单,交易',
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 3,
    dataSourceId: 1,
    tableName: 'user_stats',
    isEnabled: false,
    syncEnabled: false,
    lastSyncTime: undefined,
    syncInterval: 120,
    description: '用户统计视图',
    tags: '统计,视图',
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 10:30:00'
  }
];

export default function DataSourceTables({ 
  dataSourceId, 
  visible, 
  onClose 
}: DataSourceTablesProps) {
  const [activeTab, setActiveTab] = useState<'tables' | 'management'>('tables');
  const [tables, setTables] = useState<DatabaseTable[]>(mockTables);
  const [tableManagement, setTableManagement] = useState<TableManagement[]>(mockTableManagement);
  const [expandedTables, setExpandedTables] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'TABLE' | 'VIEW' | 'MATERIALIZED_VIEW'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [showAddTable, setShowAddTable] = useState(false);
  const [editingTable, setEditingTable] = useState<TableManagement | null>(null);
  const [syncing, setSyncing] = useState<number | null>(null);
  
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

  // 新增表表单
  const [newTableForm, setNewTableForm] = useState({
    tableName: '',
    description: '',
    tags: '',
    isEnabled: true,
    syncEnabled: false,
    syncInterval: 60
  });

  // 过滤后的表列表
  const filteredTables = tables.filter(table => {
    const matchesSearch = table.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (table.tableComment && table.tableComment.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || table.tableType === filterType;
    
    return matchesSearch && matchesType;
  });

  // 过滤后的管理列表
  const filteredManagement = tableManagement.filter(management => {
    const matchesSearch = management.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (management.description && management.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'enabled' && management.isEnabled) ||
      (filterStatus === 'disabled' && !management.isEnabled);
    
    return matchesSearch && matchesStatus;
  });

  // 切换表展开状态
  const toggleTableExpansion = (tableId: number) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableId)) {
      newExpanded.delete(tableId);
    } else {
      newExpanded.add(tableId);
    }
    setExpandedTables(newExpanded);
  };

  // 处理添加表
  const handleAddTable = () => {
    if (!newTableForm.tableName.trim()) return;

    const newManagement: TableManagement = {
      id: Date.now(),
      dataSourceId,
      tableName: newTableForm.tableName.trim(),
      isEnabled: newTableForm.isEnabled,
      syncEnabled: newTableForm.syncEnabled,
      syncInterval: newTableForm.syncInterval,
      description: newTableForm.description.trim() || undefined,
      tags: newTableForm.tags.trim() || undefined,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    };

    setTableManagement(prev => [newManagement, ...prev]);
    setShowAddTable(false);
    setNewTableForm({
      tableName: '',
      description: '',
      tags: '',
      isEnabled: true,
      syncEnabled: false,
      syncInterval: 60
    });
  };

  // 处理编辑表
  const handleEditTable = (management: TableManagement) => {
    setEditingTable(management);
  };

  // 处理更新表管理
  const handleUpdateTable = (managementId: number, updates: Partial<TableManagement>) => {
    setTableManagement(prev => 
      prev.map(management => 
        management.id === managementId 
          ? { ...management, ...updates, updateTime: new Date().toISOString() }
          : management
      )
    );
    setEditingTable(null);
  };

  // 处理删除表管理
  const handleDeleteTable = (managementId: number) => {
    setConfirmDialog({
      visible: true,
      title: '删除表登记',
      message: '确定要删除此表的登记信息吗？',
      type: 'danger',
      onConfirm: () => {
        setTableManagement(prev => prev.filter(management => management.id !== managementId));
        setConfirmDialog(prev => ({ ...prev, visible: false }));
      }
    });
  };

  // 处理同步表
  const handleSyncTable = async (managementId: number) => {
    setSyncing(managementId);
    
    // 模拟同步过程
    setTimeout(() => {
      setTableManagement(prev => 
        prev.map(management => 
          management.id === managementId 
            ? { 
                ...management, 
                lastSyncTime: new Date().toISOString(),
                updateTime: new Date().toISOString()
              }
            : management
        )
      );
      setSyncing(null);
    }, 2000);
  };

  // 获取表类型图标
  const getTableTypeIcon = (tableType: string) => {
    switch (tableType) {
      case 'TABLE':
        return <Table className="w-4 h-4 text-blue-600" />;
      case 'VIEW':
        return <Eye className="w-4 h-4 text-green-600" />;
      case 'MATERIALIZED_VIEW':
        return <Database className="w-4 h-4 text-purple-600" />;
      default:
        return <Table className="w-4 h-4 text-gray-600" />;
    }
  };

  // 获取表类型标签样式
  const getTableTypeStyle = (tableType: string) => {
    switch (tableType) {
      case 'TABLE':
        return 'bg-blue-100 text-blue-800';
      case 'VIEW':
        return 'bg-green-100 text-green-800';
      case 'MATERIALIZED_VIEW':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div 
        className="glass-card max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">数据库表管理</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tables'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            表结构
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'management'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            表管理
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'tables' && (
            <div className="space-y-6">
              {/* 操作栏 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索表名或注释..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'all' | 'TABLE' | 'VIEW' | 'MATERIALIZED_VIEW')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">所有类型</option>
                    <option value="TABLE">表</option>
                    <option value="VIEW">视图</option>
                    <option value="MATERIALIZED_VIEW">物化视图</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowAddTable(true)}
                  className="btn-glass-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>登记表</span>
                </button>
              </div>

              {/* 表列表 */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          表名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          类型
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          注释
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          行数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          大小
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTables.map((table) => {
                        const isExpanded = expandedTables.has(table.id!);
                        return (
                          <React.Fragment key={table.id}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <button
                                    onClick={() => toggleTableExpansion(table.id!)}
                                    className="mr-2 text-gray-400 hover:text-gray-600"
                                  >
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </button>
                                  <div className="flex items-center">
                                    {getTableTypeIcon(table.tableType)}
                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                      {table.tableName}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTableTypeStyle(table.tableType)}`}>
                                  {table.tableType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {table.tableComment || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {table.rowCount?.toLocaleString() || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {table.size ? formatFileSize(table.size) : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="text-green-600 hover:text-green-900">
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {/* 展开的字段信息 */}
                            {isExpanded && table.columns && (
                              <tr>
                                <td colSpan={6} className="px-6 py-4 bg-gray-50">
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-gray-900">字段信息</h4>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">字段名</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">注释</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">可空</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">主键</th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {table.columns.map((column, index) => (
                                            <tr key={index}>
                                              <td className="px-3 py-2 text-sm text-gray-900">{column.columnName}</td>
                                              <td className="px-3 py-2 text-sm text-gray-900">
                                                {column.dataType}
                                                {column.columnSize && `(${column.columnSize})`}
                                                {column.precision && column.scale && `(${column.precision},${column.scale})`}
                                              </td>
                                              <td className="px-3 py-2 text-sm text-gray-900">{column.columnComment || '-'}</td>
                                              <td className="px-3 py-2 text-sm text-gray-900">
                                                {column.isNullable ? '是' : '否'}
                                              </td>
                                              <td className="px-3 py-2 text-sm text-gray-900">
                                                {column.isPrimaryKey ? '是' : '否'}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'management' && (
            <div className="space-y-6">
              {/* 操作栏 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索表名或描述..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'enabled' | 'disabled')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">所有状态</option>
                    <option value="enabled">已启用</option>
                    <option value="disabled">已禁用</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowAddTable(true)}
                  className="btn-glass-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>登记表</span>
                </button>
              </div>

              {/* 表管理列表 */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          表名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          同步
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          最后同步
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          描述
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredManagement.map((management) => (
                        <tr key={management.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {management.tableName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {management.isEnabled ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={`ml-2 text-sm ${management.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                                {management.isEnabled ? '已启用' : '已禁用'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {management.syncEnabled ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={`ml-2 text-sm ${management.syncEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                                {management.syncEnabled ? '已启用' : '已禁用'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {management.lastSyncTime ? new Date(management.lastSyncTime).toLocaleString() : '从未同步'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {management.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleSyncTable(management.id!)}
                                disabled={syncing === management.id}
                                className={`${syncing === management.id ? 'text-gray-400' : 'text-blue-600 hover:text-blue-900'}`}
                              >
                                {syncing === management.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleEditTable(management)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTable(management.id!)}
                                className="text-red-600 hover:text-red-900"
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
              </div>
            </div>
          )}
        </div>

        {/* 添加表弹窗 */}
        {showAddTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-medium text-gray-900 mb-4">登记数据库表</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    表名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTableForm.tableName}
                    onChange={(e) => setNewTableForm(prev => ({ ...prev, tableName: e.target.value }))}
                    placeholder="请输入表名"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={newTableForm.description}
                    onChange={(e) => setNewTableForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="表的用途和说明"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标签
                  </label>
                  <input
                    type="text"
                    value={newTableForm.tags}
                    onChange={(e) => setNewTableForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="用逗号分隔，如：用户,基础数据"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTableForm.isEnabled}
                      onChange={(e) => setNewTableForm(prev => ({ ...prev, isEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">启用表</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newTableForm.syncEnabled}
                      onChange={(e) => setNewTableForm(prev => ({ ...prev, syncEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">启用同步</span>
                  </label>
                </div>
                {newTableForm.syncEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      同步间隔（分钟）
                    </label>
                    <input
                      type="number"
                      value={newTableForm.syncInterval}
                      onChange={(e) => setNewTableForm(prev => ({ ...prev, syncInterval: parseInt(e.target.value) || 60 }))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddTable(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  onClick={handleAddTable}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  登记
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 编辑表弹窗 */}
        {editingTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-medium text-gray-900 mb-4">编辑表管理</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    表名
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900">
                    {editingTable.tableName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={editingTable.description || ''}
                    onChange={(e) => handleUpdateTable(editingTable.id!, { description: e.target.value })}
                    placeholder="表的用途和说明"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    标签
                  </label>
                  <input
                    type="text"
                    value={editingTable.tags || ''}
                    onChange={(e) => handleUpdateTable(editingTable.id!, { tags: e.target.value })}
                    placeholder="用逗号分隔，如：用户,基础数据"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingTable.isEnabled}
                      onChange={(e) => handleUpdateTable(editingTable.id!, { isEnabled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">启用表</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingTable.syncEnabled}
                      onChange={(e) => handleUpdateTable(editingTable.id!, { syncEnabled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">启用同步</span>
                  </label>
                </div>
                {editingTable.syncEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      同步间隔（分钟）
                    </label>
                    <input
                      type="number"
                      value={editingTable.syncInterval || 60}
                      onChange={(e) => handleUpdateTable(editingTable.id!, { syncInterval: parseInt(e.target.value) || 60 })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingTable(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  关闭
                </button>
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
    </div>
  );
} 