'use client';

import React from 'react';
import { 
  BarChart3, 
  Database, 
  FileText, 
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: '数据源总数',
      value: '15',
      change: '+2',
      trend: 'up',
      icon: Database,
      color: 'blue'
    },
    {
      title: '数据集数量',
      value: '238',
      change: '+12',
      trend: 'up',
      icon: FileText,
      color: 'green'
    },
    {
      title: '处理任务',
      value: '86',
      change: '+5',
      trend: 'up',
      icon: Activity,
      color: 'purple'
    },
    {
      title: '活跃用户',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: Users,
      color: 'orange'
    }
  ];

  const recentTasks = [
    {
      id: '1',
      name: '用户行为数据清洗',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-15 09:30',
      duration: '25分钟'
    },
    {
      id: '2',
      name: '产品评论情感分析',
      status: 'running',
      progress: 65,
      startTime: '2024-01-15 10:15',
      duration: '运行中'
    },
    {
      id: '3',
      name: '销售数据质量检查',
      status: 'pending',
      progress: 0,
      startTime: '-',
      duration: '待执行'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'running': return '运行中';
      case 'pending': return '待执行';
      default: return '未知';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 text-shadow mb-2">数据概览</h1>
        <p className="text-gray-600">欢迎回到青AI数据平台，查看您的数据处理概况</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="glass-card p-6 hover:shadow-glass-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">较上周</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">最近任务</h3>
            <button className="btn-glass-primary text-sm">查看全部</button>
          </div>
          
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-glass-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{task.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </div>
                  
                  {task.status === 'running' && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>进度</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-glass-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      开始: {task.startTime}
                    </span>
                    <span>用时: {task.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">系统状态</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">正常运行</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-glass-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">数据处理服务</span>
              </div>
              <span className="text-sm text-green-600 font-medium">正常</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-glass-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">数据库连接</span>
              </div>
              <span className="text-sm text-green-600 font-medium">正常</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-glass-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-gray-900">消息队列</span>
              </div>
              <span className="text-sm text-yellow-600 font-medium">待检查</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-glass-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">API 服务</span>
              </div>
              <span className="text-sm text-green-600 font-medium">正常</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-glass-primary flex items-center justify-center space-x-2 py-3">
            <Database className="w-5 h-5" />
            <span>添加数据源</span>
          </button>
          <button className="btn-glass flex items-center justify-center space-x-2 py-3">
            <FileText className="w-5 h-5" />
            <span>创建数据集</span>
          </button>
          <button className="btn-glass flex items-center justify-center space-x-2 py-3">
            <Activity className="w-5 h-5" />
            <span>启动处理任务</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 