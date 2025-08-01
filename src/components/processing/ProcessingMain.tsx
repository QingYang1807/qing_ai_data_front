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
    setActiveView('create');
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
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">数据处理</h1>
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveView('tasks')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'tasks'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  任务列表
                </button>
                <button
                  onClick={() => setActiveView('stats')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'stats'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  处理统计
                </button>
                <button
                  onClick={() => setActiveView('templates')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'templates'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  处理模板
                </button>
                <button
                  onClick={() => setActiveView('history')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'history'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  处理历史
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {activeView === 'tasks' && (
                <button
                  onClick={handleCreateTask}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  创建任务
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderActiveView()}
      </div>
    </div>
  );
} 