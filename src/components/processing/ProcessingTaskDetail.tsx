'use client';

import React, { useState, useEffect } from 'react';
import { DataProcessingTask, ProcessingType, ProcessingStatus, OutputFormat } from '@/types';
import { processingApi } from '@/api/processing';
import { useToast } from '@/hooks/useToast';

interface ProcessingTaskDetailProps {
  taskId: string;
  onBack: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
  onViewResult?: () => void;
}

export default function ProcessingTaskDetail({
  taskId,
  onBack,
  onSuccess,
  onError,
  onViewResult
}: ProcessingTaskDetailProps) {
  const [task, setTask] = useState<DataProcessingTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'user' | 'technical'>('user');
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadTask();
    loadLogs();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const response = await processingApi.getTask(taskId);
      setTask(response.data);
    } catch (error) {
      console.error('加载任务详情失败:', error);
      onError('无法加载任务详情');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await processingApi.getTaskLogs(taskId);
      setLogs(response.data.records || []);
    } catch (error) {
      console.error('加载日志失败:', error);
    }
  };

  const handleStartTask = async () => {
    try {
      await processingApi.startTask(taskId);
      showSuccess('任务启动成功', '数据处理任务已开始执行');
      loadTask();
    } catch (error) {
      showError('启动失败', '无法启动数据处理任务');
    }
  };

  const handleStopTask = async () => {
    try {
      await processingApi.stopTask(taskId);
      showSuccess('任务停止成功', '数据处理任务已停止');
      loadTask();
    } catch (error) {
      showError('停止失败', '无法停止数据处理任务');
    }
  };

  const handleDownloadResult = async () => {
    try {
      const response = await processingApi.downloadResult(taskId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${task?.name || 'task'}_result.${task?.outputFormat?.toLowerCase() || 'json'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('下载成功', '处理结果已下载');
    } catch (error) {
      showError('下载失败', '无法下载处理结果');
    }
  };

  const getStatusInfo = (status: ProcessingStatus) => {
    switch (status) {
      case ProcessingStatus.PENDING:
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: '⏳',
          text: '等待中',
          description: '任务已创建，等待开始执行'
        };
      case ProcessingStatus.RUNNING:
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: '🔄',
          text: '运行中',
          description: '任务正在执行中，请稍候'
        };
      case ProcessingStatus.SUCCESS:
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: '✅',
          text: '成功',
          description: '任务已成功完成'
        };
      case ProcessingStatus.FAILED:
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: '❌',
          text: '失败',
          description: '任务执行失败，请检查错误信息'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: '❓',
          text: '未知',
          description: '任务状态未知'
        };
    }
  };

  const getProcessingTypeInfo = (type: ProcessingType) => {
    const typeInfo: Record<ProcessingType, { icon: string; description: string; steps: string[] }> = {
      [ProcessingType.CLEANING]: {
        icon: '🧹',
        description: '清理数据中的错误、重复和不一致的内容',
        steps: ['移除空值', '修正格式错误', '标准化数据']
      },
      [ProcessingType.FILTERING]: {
        icon: '🔍',
        description: '根据条件筛选出符合要求的数据',
        steps: ['应用过滤条件', '移除不符合条件的数据', '保留有效数据']
      },
      [ProcessingType.DEDUPLICATION]: {
        icon: '🔄',
        description: '识别并移除重复的数据记录',
        steps: ['识别重复记录', '选择保留策略', '移除重复项']
      },
      [ProcessingType.FORMAT_CONVERSION]: {
        icon: '📄',
        description: '将数据从一种格式转换为另一种格式',
        steps: ['读取源格式', '解析数据结构', '转换为目标格式']
      },
      [ProcessingType.NORMALIZATION]: {
        icon: '📊',
        description: '将数据标准化为统一的格式和范围',
        steps: ['计算统计指标', '应用标准化公式', '生成标准化数据']
      },
      [ProcessingType.ENRICHMENT]: {
        icon: '✨',
        description: '为数据添加额外的信息和特征',
        steps: ['获取补充数据', '匹配相关信息', '合并数据']
      },
      [ProcessingType.VALIDATION]: {
        icon: '✅',
        description: '验证数据的完整性和准确性',
        steps: ['检查数据完整性', '验证数据格式', '生成验证报告']
      },
      [ProcessingType.TRANSFORMATION]: {
        icon: '🔄',
        description: '对数据进行结构转换和重组',
        steps: ['分析数据结构', '设计转换规则', '执行数据转换']
      },
      [ProcessingType.SAMPLING]: {
        icon: '📋',
        description: '从大数据集中抽取代表性样本',
        steps: ['确定采样策略', '执行采样算法', '生成样本数据']
      },
      [ProcessingType.MERGING]: {
        icon: '🔗',
        description: '将多个数据集合并为一个',
        steps: ['识别合并键', '匹配相关记录', '合并数据字段']
      },
      [ProcessingType.SPLITTING]: {
        icon: '✂️',
        description: '将数据集分割为多个子集',
        steps: ['确定分割条件', '应用分割规则', '生成子数据集']
      },
      [ProcessingType.AGGREGATION]: {
        icon: '📈',
        description: '对数据进行汇总和统计',
        steps: ['选择聚合字段', '应用聚合函数', '生成汇总结果']
      },
      [ProcessingType.FEATURE_EXTRACTION]: {
        icon: '🔧',
        description: '从原始数据中提取有用的特征',
        steps: ['分析数据特征', '设计提取规则', '生成特征数据']
      },
      [ProcessingType.ANONYMIZATION]: {
        icon: '🕵️',
        description: '移除或替换敏感信息以保护隐私',
        steps: ['识别敏感字段', '应用匿名化算法', '生成匿名数据']
      },
      [ProcessingType.ENCRYPTION]: {
        icon: '🔐',
        description: '对数据进行加密以保护安全',
        steps: ['选择加密算法', '生成加密密钥', '执行数据加密']
      },
      [ProcessingType.COMPRESSION]: {
        icon: '🗜️',
        description: '压缩数据以减少存储空间',
        steps: ['分析数据特征', '选择压缩算法', '执行数据压缩']
      },
      [ProcessingType.PRIVACY_REMOVAL]: {
        icon: '👤',
        description: '移除个人隐私相关信息',
        steps: ['识别隐私字段', '应用移除规则', '生成脱敏数据']
      },
      [ProcessingType.EXPORT]: {
        icon: '📤',
        description: '将处理后的数据导出为指定格式',
        steps: ['选择导出格式', '配置导出参数', '生成导出文件']
      }
    };
    return typeInfo[type] || { icon: '📋', description: '数据处理', steps: ['处理数据'] };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
  };

  const formatConfig = (config: any) => {
    if (!config) return '无特殊配置';
    
    const configItems = [];
    
    if (config.outputFormat) {
      configItems.push(`输出格式: ${config.outputFormat}`);
    }
    
    if (config.cleaning) {
      const cleaning = config.cleaning;
      if (cleaning.removeNulls) configItems.push('移除空值');
      if (cleaning.removeDuplicates) configItems.push('移除重复');
      if (cleaning.trimWhitespace) configItems.push('去除空格');
    }
    
    if (config.filtering) {
      const filtering = config.filtering;
      if (filtering.conditions) configItems.push(`过滤条件: ${filtering.conditions.length}个`);
    }
    
    if (config.normalization) {
      configItems.push('数据标准化');
    }
    
    return configItems.length > 0 ? configItems.join(', ') : '使用默认配置';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">加载任务详情中...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">任务不存在</h3>
          <p className="text-gray-500 mb-8">无法找到指定的任务，可能已被删除或移动</p>
          <button 
            onClick={onBack}
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(task.status);
  const typeInfo = getProcessingTypeInfo(task.processingType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('user')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === 'user'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  👤 用户视图
                </button>
                <button
                  onClick={() => setViewMode('technical')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    viewMode === 'technical'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  ⚙️ 技术视图
                </button>
              </div>
            </div>

            {/* 操作按钮组 */}
            <div className="flex items-center space-x-3">
              {task.status === ProcessingStatus.PENDING && (
                <button
                  onClick={handleStartTask}
                  className="inline-flex items-center px-6 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  启动任务
                </button>
              )}
              
              {task.status === ProcessingStatus.RUNNING && (
                <button
                  onClick={handleStopTask}
                  className="inline-flex items-center px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  停止任务
                </button>
              )}
              
              {task.status === ProcessingStatus.SUCCESS && (
                <>
                  <button
                    onClick={onViewResult}
                    className="inline-flex items-center px-6 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    查看结果
                  </button>
                  <button
                    onClick={handleDownloadResult}
                    className="inline-flex items-center px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    下载结果
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 任务概览卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{task.name}</h1>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                    <span className="mr-2 text-lg">{statusInfo.icon}</span>
                    {statusInfo.text}
                  </span>
                </div>
                
                {task.description && (
                  <p className="text-gray-600 text-lg mb-4">{task.description}</p>
                )}
                
                <p className="text-gray-500">{statusInfo.description}</p>
              </div>
              
              <div className="text-center ml-8">
                <div className="text-4xl mb-2">{typeInfo.icon}</div>
                <div className="text-sm text-gray-600 max-w-32">{typeInfo.description}</div>
              </div>
            </div>

            {/* 进度条 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-medium text-gray-700">处理进度</span>
                <span className="text-lg font-semibold text-gray-900">{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    task.status === ProcessingStatus.SUCCESS ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    task.status === ProcessingStatus.FAILED ? 'bg-gradient-to-r from-red-400 to-red-600' :
                    task.status === ProcessingStatus.RUNNING ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                    'bg-gradient-to-r from-gray-400 to-gray-600'
                  }`}
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>

            {/* 关键指标 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">{task.recordCount || 0}</div>
                <div className="text-sm text-blue-700 font-medium">处理记录数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600 mb-1">{formatFileSize(task.fileSize || 0)}</div>
                <div className="text-sm text-green-700 font-medium">文件大小</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {task.processingTime ? formatDuration(task.processingTime) : '-'}
                </div>
                <div className="text-sm text-purple-700 font-medium">处理时间</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600 mb-1">{task.outputFormat || 'JSON'}</div>
                <div className="text-sm text-orange-700 font-medium">输出格式</div>
              </div>
            </div>
          </div>
        </div>

        {/* 用户视图 */}
        {viewMode === 'user' && (
          <div className="space-y-8">
            {/* 处理步骤 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3 text-3xl">{typeInfo.icon}</span>
                  处理步骤
                </h2>
                <div className="space-y-4">
                  {typeInfo.steps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 text-lg">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 配置信息 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3 text-3xl">⚙️</span>
                  处理配置
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <p className="text-gray-700 text-lg leading-relaxed">{formatConfig(task.config)}</p>
                </div>
              </div>
            </div>

            {/* 时间信息 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3 text-3xl">🕒</span>
                  时间信息
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">创建时间</div>
                    <div className="text-gray-900 font-medium">{new Date(task.createdTime).toLocaleString('zh-CN')}</div>
                  </div>
                  {task.startTime && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1">开始时间</div>
                      <div className="text-gray-900 font-medium">{new Date(task.startTime).toLocaleString('zh-CN')}</div>
                    </div>
                  )}
                  {task.endTime && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1">完成时间</div>
                      <div className="text-gray-900 font-medium">{new Date(task.endTime).toLocaleString('zh-CN')}</div>
                    </div>
                  )}
                  {task.updatedTime && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm text-gray-600 mb-1">更新时间</div>
                      <div className="text-gray-900 font-medium">{new Date(task.updatedTime).toLocaleString('zh-CN')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 错误信息 */}
            {task.errorMessage && (
              <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center">
                    <span className="mr-3 text-3xl">⚠️</span>
                    错误信息
                  </h2>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p className="text-red-700 text-lg leading-relaxed">{task.errorMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 技术视图 */}
        {viewMode === 'technical' && (
          <div className="space-y-8">
            {/* 原始配置 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">原始配置</h2>
                <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
                  <pre className="text-green-400 text-sm leading-relaxed">{JSON.stringify(task.config, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* 任务日志 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">执行日志</h2>
                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    {showLogs ? '隐藏日志' : '显示日志'}
                  </button>
                </div>
                
                {showLogs && (
                  <div className="bg-gray-900 rounded-xl p-6 max-h-96 overflow-y-auto">
                    {logs.length > 0 ? (
                      logs.map((log, index) => (
                        <div key={index} className="mb-3 font-mono text-sm">
                          <span className="text-gray-500">[{log.timestamp}]</span>
                          <span className={`ml-3 ${
                            log.level === 'ERROR' ? 'text-red-400' :
                            log.level === 'WARN' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            [{log.level}]
                          </span>
                          <span className="ml-3 text-gray-300">{log.message}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">暂无日志</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 完整任务信息 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">完整任务信息</h2>
                <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
                  <pre className="text-green-400 text-sm leading-relaxed">{JSON.stringify(task, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 