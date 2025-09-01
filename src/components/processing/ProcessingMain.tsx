'use client';

import React, { useState, useEffect } from 'react';
import { ProcessingType, ProcessingStatus, OutputFormat, Dataset } from '@/types';
import { processingApi } from '@/api/processing';
import ProcessingTaskList from './ProcessingTaskList';
import ProcessingTaskForm from './ProcessingTaskForm';
import ProcessingTaskDetail from './ProcessingTaskDetail';
import ProcessingResultDetail from './ProcessingResultDetail';
import ProcessingStats from './ProcessingStats';
import ProcessingTemplates from './ProcessingTemplates';
import DatasetVersionManager from '../dataset/DatasetVersionManager';
import AIAssistant from './AIAssistant';
import IntelligentConfigPanel from './IntelligentConfigPanel';
import QualityAssessment from './QualityAssessment';
import { useToast } from '@/hooks/useToast';

interface ProcessingMainProps {
  selectedDataset?: Dataset;
  onBackToDataset?: () => void;
}

export default function ProcessingMain({ selectedDataset, onBackToDataset }: ProcessingMainProps) {
  const [activeView, setActiveView] = useState<'tasks' | 'create' | 'detail' | 'result' | 'stats' | 'templates' | 'history' | 'versions' | 'ai-assistant' | 'intelligent-config' | 'quality-assessment'>('tasks');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [qualityResult, setQualityResult] = useState<any>(null);
  const { showSuccess, showError } = useToast();

  const handleCreateTask = () => {
    setShowCreateModal(true);
  };

  const handleViewTask = (taskId: string) => {
    setSelectedTask(taskId);
    setActiveView('detail');
  };

  const handleViewResult = (taskId: string) => {
    setSelectedTask(taskId);
    setActiveView('result');
  };

  const handleViewVersions = () => {
    setActiveView('versions');
  };

  const handleOpenAIAssistant = () => {
    setShowAIAssistant(true);
  };

  const handleOpenIntelligentConfig = () => {
    setActiveView('intelligent-config');
  };

  const handleOpenQualityAssessment = () => {
    setActiveView('quality-assessment');
  };

  const handleBackToList = () => {
    setActiveView('tasks');
    setSelectedTask(null);
  };

  const handleTaskSuccess = () => {
    showSuccess('任务操作成功', '数据处理任务已成功执行');
    setRefreshTrigger(prev => prev + 1);
    setActiveView('tasks');
    setShowCreateModal(false);
  };

  const handleConfigUpdate = (config: any) => {
    setCurrentConfig(config);
    showSuccess('配置已更新', 'AI助手已根据你的需求更新了处理配置');
  };

  const handleQualityRecommendation = (recommendation: any) => {
    // 应用质量改进建议
    if (recommendation.config) {
      setCurrentConfig(recommendation.config);
      showSuccess('建议已应用', '质量改进建议已应用到配置中');
    }
  };

  const handleTaskError = (error: string) => {
    showError('任务操作失败', error);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'tasks':
        return (
          <ProcessingTaskList
            selectedDataset={selectedDataset}
            onCreateTask={handleCreateTask}
            onViewTask={handleViewTask}
            onViewResult={handleViewResult}
            refreshTrigger={refreshTrigger}
            onBackToDataset={onBackToDataset}
          />
        );
      case 'create':
        return (
          <ProcessingTaskForm
            visible={true}
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
            onViewResult={() => setActiveView('result')}
          />
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">未选择任务</p>
          </div>
        );
      case 'result':
        return selectedTask ? (
          <ProcessingResultDetail
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
      case 'versions':
        return selectedDataset ? (
          <DatasetVersionManager
            dataset={selectedDataset}
            onBack={handleBackToList}
            onVersionSelect={(version) => {
              // 处理版本选择
              console.log('选择版本:', version);
            }}
          />
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">未选择数据集</p>
          </div>
        );
      case 'ai-assistant':
        return (
          <div className="p-6 text-center">
            <p className="text-gray-600">AI助手功能</p>
          </div>
        );
      case 'intelligent-config':
        return (
          <IntelligentConfigPanel
            config={currentConfig || {
              outputFormat: 'JSON',
              cleaning: {},
              aiProcessing: {},
              knowledgeBase: {},
              training: {},
              qualityAssessment: {}
            }}
            onConfigChange={handleConfigUpdate}
            datasetType={selectedDataset?.type}
          />
        );
      case 'quality-assessment':
        return qualityResult ? (
          <QualityAssessment
            result={qualityResult}
            onApplyRecommendation={handleQualityRecommendation}
          />
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">暂无质量评估结果</p>
          </div>
        );
      default:
        return (
          <ProcessingTaskList
            selectedDataset={selectedDataset}
            onCreateTask={handleCreateTask}
            onViewTask={handleViewTask}
            onViewResult={handleViewResult}
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
          <p className="text-gray-600 mt-1">管理和执行数据处理任务，支持版本管理和结果对比</p>
        </div>
        <div className="flex items-center space-x-3">
          {activeView === 'tasks' && (
            <>
              <button
                onClick={handleOpenAIAssistant}
                className="btn-glass-secondary flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI助手</span>
              </button>
              <button
                onClick={handleOpenIntelligentConfig}
                className="btn-glass-secondary flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>智能配置</span>
              </button>
              <button
                onClick={handleViewVersions}
                className="btn-glass-secondary flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>版本管理</span>
              </button>
              <button
                onClick={handleCreateTask}
                className="btn-glass-primary flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>创建任务</span>
              </button>
            </>
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
            onClick={handleOpenQualityAssessment}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'quality-assessment'
                ? 'bg-blue-500/20 text-blue-700 border border-blue-300/30'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            质量评估
          </button>
          {selectedDataset && (
            <button
              onClick={() => setActiveView('versions')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'versions'
                  ? 'bg-blue-500/20 text-blue-700 border border-blue-300/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              版本管理
            </button>
          )}
        </nav>
      </div>

      {/* 主要内容区域 */}
      {renderActiveView()}

      {/* 创建任务弹窗 */}
      <ProcessingTaskForm
        visible={showCreateModal}
        selectedDataset={selectedDataset}
        onCancel={handleCloseCreateModal}
        onSuccess={handleTaskSuccess}
        onError={handleTaskError}
      />

      {/* AI助手弹窗 */}
      <AIAssistant
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onConfigUpdate={handleConfigUpdate}
        currentConfig={currentConfig}
        datasetType={selectedDataset?.type}
      />
    </div>
  );
} 