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
  Settings,
  Filter,
  MoreVertical
} from 'lucide-react';
import { useDataSourceStore } from '@/stores/useDataSourceStore';
import { DataSource } from '@/types';

// 数据源类型映射
const dataSourceTypes = [
  { value: 'all', label: '全部类型' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'redis', label: 'Redis' },
  { value: 'elasticsearch', label: 'Elasticsearch' },
  { value: 'kafka', label: 'Kafka' },
];

// 状态映射
const statusTypes = [
  { value: 'all', label: '全部状态' },
  { value: 'ACTIVE', label: '已连接' },
  { value: 'INACTIVE', label: '未连接' },
  { value: 'ERROR', label: '连接失败' },
];

const DataSourceList: React.FC = () => {
  const { dataSources, loading, error, fetchDataSources, deleteDataSource } = useDataSourceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showActions, setShowActions] = useState<string | null>(null);

  useEffect(() => {
    fetchDataSources();
  }, [fetchDataSources]);

  const filteredDataSources = dataSources.filter(ds => {
    const matchesSearch = ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ds.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || ds.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || ds.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个数据源吗？')) {
      await deleteDataSource(id);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'mysql': 'bg-blue-500/10 text-blue-700 border-blue-200',
      'postgresql': 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
      'mongodb': 'bg-green-500/10 text-green-700 border-green-200',
      'redis': 'bg-red-500/10 text-red-700 border-red-200',
      'elasticsearch': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
      'kafka': 'bg-purple-500/10 text-purple-700 border-purple-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'INACTIVE':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'ERROR':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'INACTIVE':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '已连接';
      case 'INACTIVE':
        return '未连接';
      case 'ERROR':
        return '连接失败';
      default:
        return '未知';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-shadow">数据源管理</h1>
          <p className="text-gray-600 mt-1">管理和配置您的数据源连接</p>
        </div>
        <button className="btn-glass-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>添加数据源</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索数据源名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-glass w-full pl-10 pr-4 py-2 text-sm"
              />
            </div>
          </div>

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
        </div>
      </div>

      {/* Data Sources Table */}
      <div className="glass-card overflow-hidden">
        {filteredDataSources.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无数据源</h3>
            <p className="text-gray-500 mb-4">开始添加您的第一个数据源连接</p>
            <button className="btn-glass-primary">
              <Plus className="w-4 h-4 mr-2" />
              添加数据源
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-200 bg-glass-100">
                  <th className="text-left py-4 px-6 font-medium text-gray-700">名称</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">类型</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">状态</th>
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
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(ds.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ds.status)}`}>
                          {getStatusText(ds.status)}
                        </span>
                      </div>
                    </td>
                                         <td className="py-4 px-6 text-sm text-gray-600">
                       {ds.updatedTime ? new Date(ds.updatedTime).toLocaleString() : '-'}
                     </td>
                     <td className="py-4 px-6 text-sm text-gray-600">
                       {new Date(ds.createdTime).toLocaleString()}
                     </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(ds.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
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
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                 {dataSources.filter(ds => ds.status === 'ACTIVE').length}
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
                 {dataSources.filter(ds => ds.status === 'ERROR').length}
               </p>
             </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceList; 