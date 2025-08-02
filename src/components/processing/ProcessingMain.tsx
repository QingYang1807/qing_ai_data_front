'use client';

import React, { useState, useEffect } from 'react';
import { ProcessingType, ProcessingStatus, OutputFormat, Dataset } from '@/types';
import { processingApi } from '@/api/processing';
import ProcessingTaskList from './ProcessingTaskList';
import ProcessingTaskForm from './ProcessingTaskForm';
import ProcessingTaskDetail from './ProcessingTaskDetail';
import ProcessingStats from './ProcessingStats';
import ProcessingTemplates from './ProcessingTemplates';
import ProcessingHistory from './ProcessingHistory';
import { useToast } from '@/hooks/useToast';

interface ProcessingMainProps {
  selectedDataset?: Dataset;
  onBackToDataset?: () => void;
}

export default function ProcessingMain({ selectedDataset, onBackToDataset }: ProcessingMainProps) {
  const [activeView, setActiveView] = useState<'tasks' | 'create' | 'detail' | 'stats' | 'templates' | 'history'>('tasks');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { showSuccess, showError } = useToast();

  const handleCreateTask = () => {
    // 创建任务现在通过弹窗处理，不需要切换视图
    // 这个函数保留是为了接口兼容性
  };

  const handleViewTask = (taskId: string) => {
    setSelectedTask(taskId);
    setActiveView('detail');
  };

  const handleBackToList = () => {
    setActiveView('tasks');
    setSelectedTask(null);
  };

  const handleTaskSuccess = () => {
    showSuccess('任务操作成功', '数据处理任务已成功执行');
    setRefreshTrigger(prev => prev + 1);
    setActiveView('tasks');
  };

  const handleTaskError = (error: string) => {
    showError('任务操作失败', error);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'tasks':
        return (
          <ProcessingTaskList
            selectedDataset={selectedDataset}
            onCreateTask={handleCreateTask}
            onViewTask={handleViewTask}
            refreshTrigger={refreshTrigger}
            onBackToDataset={onBackToDataset}
          />
        );
      case 'create':
        return (
          <ProcessingTaskForm
            selectedDataset={selectedDataset}
            onCancel={handleBackToList}
            onSuccess={handleTaskSuccess}
            onError={handleTaskError}
          />
        );
      case 'detail':
        return selectedTask ? (
          <ProcessingTaskDetail
            taskId={selectedTask}
            onBack={handleBackToList}
            onSuccess={handleTaskSuccess}
            onError={handleTaskError}
          />
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">未选择任务</p>
          </div>
        );
      case 'stats':
        return (
          <ProcessingStats
            onBack={handleBackToList}
          />
        );
      case 'templates':
        return (
          <ProcessingTemplates
            onBack={handleBackToList}
            onUseTemplate={(template) => {
              setActiveView('create');
              // 这里可以传递模板配置到创建表单
            }}
          />
        );
      case 'history':
        return (
          <ProcessingHistory
            onBack={handleBackToList}
            selectedDataset={selectedDataset}
          />
        );
      default:
        return (
          <ProcessingTaskList
            selectedDataset={selectedDataset}
            onCreateTask={handleCreateTask}
            onViewTask={handleViewTask}
            refreshTrigger={refreshTrigger}
            onBackToDataset={onBackToDataset}
          />
        );
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900 text-shadow">数据处理</h1>
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>服务已连接</span>
            </div>
          </div>
          <p className="text-gray-600 mt-1">管理和执行数据处理任务</p>
        </div>
        <div className="flex items-center space-x-3">
          {activeView === 'tasks' && (
            <button
              onClick={handleCreateTask}
              className="btn-glass-primary flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>创建任务</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="glass-card p-4">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveView('tasks')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'tasks'
                ? 'bg-blue-500/20 text-blue-700 border border-blue-300/30'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            任务列表
          </button>
          <button
            onClick={() => setActiveView('stats')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'stats'
                ? 'bg-blue-500/20 text-blue-700 border border-blue-300/30'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            处理统计
          </button>
          <button
            onClick={() => setActiveView('templates')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'templates'
                ? 'bg-blue-500/20 text-blue-700 border border-blue-300/30'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            处理模板
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'history'
                ? 'bg-blue-500/20 text-blue-700 border border-blue-300/30'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            处理历史
          </button>
        </nav>
      </div>

      {/* 主要内容区域 */}
      {renderActiveView()}
    </div>
  );
} 