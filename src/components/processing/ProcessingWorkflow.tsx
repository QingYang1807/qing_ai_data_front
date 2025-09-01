'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Settings,
  Eye,
  Download,
  GitBranch,
  BarChart3,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { 
  ProcessingType, 
  ProcessingStatus, 
  ProcessingConfig, 
  Dataset,
  ProcessingWorkflow as ProcessingWorkflowType
} from '@/types';
import { processingApi } from '@/api/processing';
import { useToast } from '@/hooks/useToast';

interface ProcessingWorkflowProps {
  dataset: Dataset;
  onBack?: () => void;
  onSuccess?: () => void;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: ProcessingType;
  description: string;
  config: ProcessingConfig;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  estimatedTime: number;
  actualTime?: number;
  result?: any;
  error?: string;
}

export default function ProcessingWorkflow({
  dataset,
  onBack,
  onSuccess
}: ProcessingWorkflowProps) {
  const [workflow, setWorkflow] = useState<ProcessingWorkflowType | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    initializeWorkflow();
  }, [dataset]);

  const initializeWorkflow = () => {
    // 创建默认工作流
    const defaultSteps: WorkflowStep[] = [
      {
        id: '1',
        name: '数据质量检查',
        type: ProcessingType.VALIDATION,
        description: '检查数据完整性、准确性和一致性',
        config: {
          outputFormat: 'JSON',
          validation: {
            rules: [
              { field: '*', rule: 'not_null', message: '字段不能为空' },
              { field: '*', rule: 'format_check', message: '格式检查' }
            ],
            strictMode: false
          }
        },
        status: 'pending',
        progress: 0,
        estimatedTime: 30
      },
      {
        id: '2',
        name: '数据清洗',
        type: ProcessingType.CLEANING,
        description: '移除空值、重复数据，修正格式错误',
        config: {
          outputFormat: 'JSON',
          cleaning: {
            removeNulls: true,
            removeDuplicates: true,
            trimWhitespace: true,
            normalizeCase: true
          }
        },
        status: 'pending',
        progress: 0,
        estimatedTime: 60
      },
      {
        id: '3',
        name: '数据标准化',
        type: ProcessingType.NORMALIZATION,
        description: '将数据标准化为统一格式',
        config: {
          outputFormat: 'JSON',
          normalization: {
            textNormalization: true,
            numberNormalization: true,
            dateNormalization: true
          }
        },
        status: 'pending',
        progress: 0,
        estimatedTime: 45
      },
      {
        id: '4',
        name: '数据增强',
        type: ProcessingType.ENRICHMENT,
        description: '添加计算字段和补充信息',
        config: {
          outputFormat: 'JSON',
          enrichment: {
            addFields: {},
            calculateFields: []
          }
        },
        status: 'pending',
        progress: 0,
        estimatedTime: 90
      },
      {
        id: '5',
        name: '结果导出',
        type: ProcessingType.EXPORT,
        description: '导出处理后的数据',
        config: {
          outputFormat: 'JSON',
          transformation: {
            selectFields: ['*'],
            sortBy: []
          }
        },
        status: 'pending',
        progress: 0,
        estimatedTime: 30
      }
    ];

    setSteps(defaultSteps);
    setWorkflowName(`${dataset.name} 数据处理工作流`);
    setWorkflowDescription(`对 ${dataset.name} 进行完整的数据处理流程`);
  };

  const handleStartWorkflow = async () => {
    if (!workflowName.trim()) {
      showError('启动失败', '请输入工作流名称');
      return;
    }

    setIsRunning(true);
    setCurrentStep(0);
    
    // 重置所有步骤状态
    setSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending' as const,
      progress: 0
    })));

    // 逐个执行步骤
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      // 更新当前步骤状态为运行中
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'running' as const } : step
      ));

      try {
        // 模拟步骤执行
        await executeStep(steps[i], i);
        
        // 更新步骤状态为完成
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'completed' as const, progress: 100 } : step
        ));
      } catch (error) {
        // 更新步骤状态为失败
        setSteps(prev => prev.map((step, index) => 
          index === i ? { 
            ...step, 
            status: 'failed' as const, 
            error: error instanceof Error ? error.message : '执行失败'
          } : step
        ));
        
        setIsRunning(false);
        showError('工作流执行失败', `步骤 "${steps[i].name}" 执行失败`);
        return;
      }
    }

    setIsRunning(false);
    showSuccess('工作流执行完成', '所有步骤已成功完成');
    onSuccess?.();
  };

  const executeStep = async (step: WorkflowStep, stepIndex: number) => {
    // 模拟步骤执行过程
    const startTime = Date.now();
    
    // 模拟进度更新
    for (let progress = 0; progress <= 100; progress += 10) {
      setSteps(prev => prev.map((s, index) => 
        index === stepIndex ? { ...s, progress } : s
      ));
      
      await new Promise(resolve => setTimeout(resolve, step.estimatedTime * 10));
    }
    
    const actualTime = (Date.now() - startTime) / 1000;
    
    // 更新实际执行时间
    setSteps(prev => prev.map((s, index) => 
      index === stepIndex ? { ...s, actualTime } : s
    ));
  };

  const handlePauseWorkflow = () => {
    setIsRunning(false);
    showSuccess('工作流已暂停', '可以稍后继续执行');
  };

  const handleEditStep = (step: WorkflowStep) => {
    setSelectedStep(step);
    setShowConfigModal(true);
  };

  const handleSaveStepConfig = (updatedConfig: ProcessingConfig) => {
    if (selectedStep) {
      setSteps(prev => prev.map(step => 
        step.id === selectedStep.id 
          ? { ...step, config: updatedConfig }
          : step
      ));
      setShowConfigModal(false);
      setSelectedStep(null);
      showSuccess('配置已保存', '步骤配置已更新');
    }
  };

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'skipped':
        return <ArrowRight className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'skipped':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    return `${Math.floor(seconds / 60)}分${Math.floor(seconds % 60)}秒`;
  };

  const totalEstimatedTime = steps.reduce((sum, step) => sum + step.estimatedTime, 0);
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalProgress = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据处理工作流</h1>
            <p className="text-sm text-gray-500">可视化数据处理流程，支持步骤配置和监控</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!isRunning ? (
            <button
              onClick={handleStartWorkflow}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="h-4 w-4 mr-2" />
              开始执行
            </button>
          ) : (
            <button
              onClick={handlePauseWorkflow}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Pause className="h-4 w-4 mr-2" />
              暂停执行
            </button>
          )}
        </div>
      </div>

      {/* 工作流信息 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{steps.length}</div>
            <div className="text-sm text-gray-600">总步骤数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedSteps}</div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatTime(totalEstimatedTime)}</div>
            <div className="text-sm text-gray-600">预计时间</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalProgress.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">总进度</div>
          </div>
        </div>
      </div>

      {/* 工作流步骤 */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`border rounded-lg p-6 transition-all duration-300 ${getStepStatusColor(step.status)} ${
              index === currentStep && isRunning ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {/* 步骤序号 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.status === 'completed' ? 'bg-green-500 text-white' :
                  step.status === 'running' ? 'bg-blue-500 text-white' :
                  step.status === 'failed' ? 'bg-red-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>

                {/* 步骤信息 */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
                    {getStepStatusIcon(step.status)}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      step.status === 'completed' ? 'bg-green-100 text-green-700' :
                      step.status === 'running' ? 'bg-blue-100 text-blue-700' :
                      step.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {step.status === 'completed' ? '已完成' :
                       step.status === 'running' ? '执行中' :
                       step.status === 'failed' ? '失败' :
                       step.status === 'skipped' ? '已跳过' : '等待中'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  
                  {/* 进度条 */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">进度</span>
                      <span className="text-sm font-medium text-gray-900">{step.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'running' ? 'bg-blue-500' :
                          step.status === 'failed' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${step.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 时间信息 */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>预计: {formatTime(step.estimatedTime)}</span>
                    {step.actualTime && (
                      <span>实际: {formatTime(step.actualTime)}</span>
                    )}
                  </div>

                  {/* 错误信息 */}
                  {step.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{step.error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleEditStep(step)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="编辑配置"
                >
                  <Settings className="w-4 h-4" />
                </button>
                
                {step.status === 'completed' && (
                  <>
                    <button
                      className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="查看结果"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="下载结果"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 工作流统计 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">工作流统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {steps.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-sm text-blue-700">成功步骤</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {steps.filter(s => s.status === 'failed').length}
            </div>
            <div className="text-sm text-red-700">失败步骤</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatTime(steps.reduce((sum, s) => sum + (s.actualTime || 0), 0))}
            </div>
            <div className="text-sm text-green-700">总执行时间</div>
          </div>
        </div>
      </div>

      {/* 配置弹窗 */}
      {showConfigModal && selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                配置步骤: {selectedStep.name}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">步骤名称</label>
                  <input
                    type="text"
                    value={selectedStep.name}
                    onChange={(e) => setSelectedStep(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                  <textarea
                    value={selectedStep.description}
                    onChange={(e) => setSelectedStep(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">预计时间 (秒)</label>
                  <input
                    type="number"
                    value={selectedStep.estimatedTime}
                    onChange={(e) => setSelectedStep(prev => prev ? { ...prev, estimatedTime: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">配置 (JSON)</label>
                  <textarea
                    value={JSON.stringify(selectedStep.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        setSelectedStep(prev => prev ? { ...prev, config } : null);
                      } catch (error) {
                        // 忽略JSON解析错误
                      }
                    }}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (selectedStep) {
                      handleSaveStepConfig(selectedStep.config);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存配置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 