'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import DataSourceList from '@/components/datasource/DataSourceList';
import DatasetList from '@/components/dataset/DatasetList';
import DatasetForm from '@/components/dataset/DatasetForm';
import DatasetDetailView from '@/components/dataset/DatasetDetailView';
import { Dataset } from '@/types';

// 模拟用户数据
const mockUser = {
  id: '1',
  name: '张三',
  email: 'zhangsan@example.com',
  role: 'Admin',
  team: 'Data Team',
  avatar: undefined
};



// 模拟通知数据
const mockNotifications = [
  {
    id: '1',
    title: '数据处理完成',
    message: '用户行为数据清洗任务已完成',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    type: 'success' as const
  },
  {
    id: '2',
    title: '系统更新',
    message: '系统将于今晚进行例行维护',
    timestamp: '2024-01-15T09:00:00Z',
    read: true,
    type: 'info' as const
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // 数据集管理状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 刷新触发器
  const [viewingDataset, setViewingDataset] = useState<Dataset | null>(null); // 当前查看的数据集

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleUserMenuClick = () => {
    console.log('User menu clicked');
  };

  const handleMenuClick = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 数据集管理回调函数
  const handleAddDataset = () => {
    setEditingDataset(null);
    setShowCreateModal(true);
  };

  const handleEditDataset = (dataset: Dataset) => {
    setEditingDataset(dataset);
    setShowEditModal(true);
  };

  const handleViewDataset = (dataset: Dataset) => {
    // 在框架内显示数据集详情
    setViewingDataset(dataset);
    setActiveTab('dataset-detail');
  };

  const handleBackToDatasetList = () => {
    // 返回数据集列表
    setViewingDataset(null);
    setActiveTab('dataset');
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingDataset(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingDataset(null);
  };



  const handleDatasetSuccess = (dataset: Dataset) => {
    // 成功回调，触发列表刷新
    console.log('Dataset operation successful:', dataset);
    console.log('Triggering refresh, current refreshTrigger:', refreshTrigger);
    setRefreshTrigger(prev => {
      const newValue = prev + 1;
      console.log('New refreshTrigger value:', newValue);
      return newValue;
    });
    
    // 显示成功通知
    alert(`数据集操作成功！\n名称: ${dataset.name}\n类型: ${dataset.type}\n正在刷新列表...`);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'datasource':
        return <DataSourceList />;
      case 'dataset':
        return (
          <div className="min-h-screen bg-gray-50">
            {/* 数据集列表 */}
            <DatasetList
              key={refreshTrigger} // 使用refreshTrigger作为key，强制重新渲染
              onAddDataset={handleAddDataset}
              onEditDataset={handleEditDataset}
              onViewDataset={handleViewDataset}
            />

            {/* 创建数据集弹窗 */}
            <DatasetForm
              visible={showCreateModal}
              onCancel={handleCloseCreateModal}
              onSuccess={handleDatasetSuccess}
            />

            {/* 编辑数据集弹窗 */}
            <DatasetForm
              visible={showEditModal}
              onCancel={handleCloseEditModal}
              onSuccess={handleDatasetSuccess}
              editingDataset={editingDataset}
            />


          </div>
        );
      case 'dataset-detail':
        return viewingDataset ? (
          <div className="p-6 max-w-7xl mx-auto">
            <DatasetDetailView 
              dataset={viewingDataset} 
              onBack={handleBackToDatasetList}
              onEdit={handleEditDataset}
            />
          </div>
        ) : (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="glass-card p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">数据集详情</h2>
              <p className="text-gray-600">请选择一个数据集查看详情</p>
            </div>
          </div>
        );
      case 'processing':
        return (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="glass-card p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">数据处理</h2>
              <p className="text-gray-600">数据处理功能正在开发中...</p>
            </div>
          </div>
        );
      case 'quality':
        return (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="glass-card p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">数据质量</h2>
              <p className="text-gray-600">数据质量功能正在开发中...</p>
            </div>
          </div>
        );
      case 'workflow':
        return (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="glass-card p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">工作流配置</h2>
              <p className="text-gray-600">工作流配置功能正在开发中...</p>
            </div>
          </div>
        );
      case 'knowledge':
        return (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="glass-card p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">知识抽取</h2>
              <p className="text-gray-600">知识抽取功能正在开发中...</p>
            </div>
          </div>
        );
      case 'automation':
        return (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="glass-card p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">自动化处理</h2>
              <p className="text-gray-600">自动化处理功能正在开发中...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="glass-card p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">系统设置</h2>
              <p className="text-gray-600">系统设置功能正在开发中...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col fixed inset-0">
      {/* Header - Fixed at top */}
      <Header
        user={mockUser}
        notifications={mockNotifications}
        onNotificationClick={handleNotificationClick}
        onUserMenuClick={handleUserMenuClick}
        onMenuClick={handleMenuClick}
      />

      {/* Main Content - Fill remaining height */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Fixed left, full height */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={sidebarCollapsed}
        />

        {/* Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderActiveTab()}
        </main>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-6 w-96 glass-card p-4 z-50 animate-slide-up max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">通知</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              ×
            </button>
          </div>
          
          {mockNotifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无通知</p>
          ) : (
            <div className="space-y-3">
              {mockNotifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors duration-200 ${
                    notification.read 
                      ? 'bg-glass-50 border-glass-200' 
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
} 