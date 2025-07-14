'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Search,
  Filter,
  X
} from 'lucide-react';
import { DataSourceConnection, DataSourcePermission, ConnectionHistory } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface DataSourceConnectionsProps {
  dataSourceId: number;
  visible: boolean;
  onClose: () => void;
}

// 权限配置
const permissionOptions = [
  { 
    value: DataSourcePermission.READ, 
    label: '只读权限', 
    description: '只能查看数据，不能修改',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    value: DataSourcePermission.WRITE, 
    label: '读写权限', 
    description: '可以查看和修改数据',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    value: DataSourcePermission.ADMIN, 
    label: '管理权限', 
    description: '可以管理数据源和用户权限',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
];

// 模拟数据
const mockConnections: DataSourceConnection[] = [
  {
    id: 1,
    dataSourceId: 1,
    userId: 1,
    username: 'admin',
    permission: DataSourcePermission.ADMIN,
    isActive: true,
    lastConnectTime: '2024-01-15 10:30:00',
    connectCount: 156,
    createTime: '2024-01-01 09:00:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    dataSourceId: 1,
    userId: 2,
    username: 'zhangsan',
    permission: DataSourcePermission.WRITE,
    isActive: true,
    lastConnectTime: '2024-01-15 09:15:00',
    connectCount: 89,
    createTime: '2024-01-05 14:20:00',
    updateTime: '2024-01-15 09:15:00'
  },
  {
    id: 3,
    dataSourceId: 1,
    userId: 3,
    username: 'lisi',
    permission: DataSourcePermission.READ,
    isActive: false,
    lastConnectTime: '2024-01-14 16:45:00',
    connectCount: 23,
    createTime: '2024-01-10 11:30:00',
    updateTime: '2024-01-14 16:45:00'
  }
];

const mockConnectionHistory: ConnectionHistory[] = [
  {
    id: 1,
    dataSourceId: 1,
    userId: 1,
    username: 'admin',
    action: 'CONNECT',
    status: 'SUCCESS',
    message: '连接成功',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    dataSourceId: 1,
    userId: 2,
    username: 'zhangsan',
    action: 'QUERY',
    status: 'SUCCESS',
    message: '查询用户表',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createTime: '2024-01-15 09:15:00'
  },
  {
    id: 3,
    dataSourceId: 1,
    userId: 3,
    username: 'lisi',
    action: 'ERROR',
    status: 'FAILED',
    message: '权限不足',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createTime: '2024-01-14 16:45:00'
  }
];

export default function DataSourceConnections({ 
  dataSourceId, 
  visible, 
  onClose 
}: DataSourceConnectionsProps) {
  const [activeTab, setActiveTab] = useState<'connections' | 'history'>('connections');
  const [connections, setConnections] = useState<DataSourceConnection[]>(mockConnections);
  const [connectionHistory, setConnectionHistory] = useState<ConnectionHistory[]>(mockConnectionHistory);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DataSourceConnection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPermission, setFilterPermission] = useState<DataSourcePermission | ''>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
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

  // 新增用户表单
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    permission: DataSourcePermission.READ,
    description: ''
  });

  // 过滤后的连接列表
  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPermission = !filterPermission || connection.permission === filterPermission;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && connection.isActive) ||
      (filterStatus === 'inactive' && !connection.isActive);
    
    return matchesSearch && matchesPermission && matchesStatus;
  });

  // 处理添加用户
  const handleAddUser = () => {
    if (!newUserForm.username.trim()) return;

    const newConnection: DataSourceConnection = {
      id: Date.now(),
      dataSourceId,
      userId: Date.now(),
      username: newUserForm.username.trim(),
      permission: newUserForm.permission,
      isActive: true,
      connectCount: 0,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    };

    setConnections(prev => [newConnection, ...prev]);
    setShowAddUser(false);
    setNewUserForm({
      username: '',
      permission: DataSourcePermission.READ,
      description: ''
    });
  };

  // 处理编辑用户
  const handleEditUser = (connection: DataSourceConnection) => {
    setEditingConnection(connection);
  };

  // 处理更新用户权限
  const handleUpdateUser = (connectionId: number, permission: DataSourcePermission) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, permission, updateTime: new Date().toISOString() }
          : conn
      )
    );
    setEditingConnection(null);
  };

  // 处理删除用户
  const handleDeleteUser = (connectionId: number) => {
    setConfirmDialog({
      visible: true,
      title: '删除用户连接',
      message: '确定要删除此用户的连接权限吗？',
      type: 'danger',
      onConfirm: () => {
        setConnections(prev => prev.filter(conn => conn.id !== connectionId));
        setConfirmDialog(prev => ({ ...prev, visible: false }));
      }
    });
  };

  // 处理切换用户状态
  const handleToggleStatus = (connectionId: number) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, isActive: !conn.isActive, updateTime: new Date().toISOString() }
          : conn
      )
    );
  };

  // 获取权限标签样式
  const getPermissionStyle = (permission: DataSourcePermission) => {
    const option = permissionOptions.find(opt => opt.value === permission);
    return option || permissionOptions[0];
  };

  // 获取状态图标
  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-400" />
    );
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div 
        className="glass-card max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">数据源连接管理</h2>
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
            onClick={() => setActiveTab('connections')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'connections'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            用户连接
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            连接历史
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'connections' && (
            <div className="space-y-6">
              {/* 操作栏 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索用户..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterPermission}
                    onChange={(e) => setFilterPermission(e.target.value as DataSourcePermission | '')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">所有权限</option>
                    {permissionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">所有状态</option>
                    <option value="active">活跃</option>
                    <option value="inactive">非活跃</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="btn-glass-primary flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>添加用户</span>
                </button>
              </div>

              {/* 用户连接列表 */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          权限
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          连接次数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          最后连接
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredConnections.map((connection) => {
                        const permissionStyle = getPermissionStyle(connection.permission);
                        return (
                          <tr key={connection.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      {connection.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {connection.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${permissionStyle.bgColor} ${permissionStyle.color}`}>
                                {permissionStyle.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(connection.isActive)}
                                <span className={`ml-2 text-sm ${connection.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                                  {connection.isActive ? '活跃' : '非活跃'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {connection.connectCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {connection.lastConnectTime ? new Date(connection.lastConnectTime).toLocaleString() : '从未连接'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditUser(connection)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(connection.id!)}
                                  className={`${connection.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                                >
                                  {connection.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(connection.id!)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* 连接历史列表 */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          消息
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP地址
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          时间
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {connectionHistory.map((history) => (
                        <tr key={history.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {history.username}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              history.action === 'CONNECT' ? 'bg-blue-100 text-blue-800' :
                              history.action === 'DISCONNECT' ? 'bg-gray-100 text-gray-800' :
                              history.action === 'QUERY' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {history.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {history.status === 'SUCCESS' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className={`ml-2 text-sm ${history.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                                {history.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {history.message}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {history.ipAddress}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(history.createTime).toLocaleString()}
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

        {/* 添加用户弹窗 */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-medium text-gray-900 mb-4">添加用户连接</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="请输入用户名"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    权限级别
                  </label>
                  <select
                    value={newUserForm.permission}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, permission: e.target.value as DataSourcePermission }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {permissionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={newUserForm.description}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="可选：添加描述信息"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 编辑用户权限弹窗 */}
        {editingConnection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-medium text-gray-900 mb-4">编辑用户权限</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户名
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900">
                    {editingConnection.username}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    权限级别
                  </label>
                  <select
                    value={editingConnection.permission}
                    onChange={(e) => handleUpdateUser(editingConnection.id!, e.target.value as DataSourcePermission)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {permissionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingConnection(null)}
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