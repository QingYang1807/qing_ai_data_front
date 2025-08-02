'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader, Settings, AlertCircle } from 'lucide-react';
import { ProcessingType, ProcessingConfig, OutputFormat, Dataset, KnowledgeBaseFormat, TrainingFormat } from '@/types';
import { processingApi } from '@/api/processing';
import { useToast } from '@/hooks/useToast';

interface ProcessingTaskFormProps {
  visible: boolean;
  selectedDataset?: Dataset;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function ProcessingTaskForm({
  visible,
  selectedDataset,
  onCancel,
  onSuccess,
  onError
}: ProcessingTaskFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    processingType: ProcessingType.CLEANING,
    outputFormat: OutputFormat.JSON,
    config: {} as ProcessingConfig
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [datasetFields, setDatasetFields] = useState<Array<{
    name: string;
    type: string;
    nullCount: number;
    uniqueCount: number;
    sampleValues: any[];
  }>>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (visible) {
      resetForm();
      if (selectedDataset?.id) {
        loadDatasetFields();
      }
    }
  }, [visible, selectedDataset]);

  // ESC键关闭功能
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        onCancel();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [visible, onCancel]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      processingType: ProcessingType.CLEANING,
      outputFormat: OutputFormat.JSON,
      config: {} as ProcessingConfig
    });
    setStep(1);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = '任务名称不能为空';
    } else if (formData.name.length < 2) {
      newErrors.name = '任务名称至少需要2个字符';
    } else if (formData.name.length > 50) {
      newErrors.name = '任务名称不能超过50个字符';
    }

    if (!selectedDataset?.id) {
      newErrors.dataset = '请选择数据集';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadDatasetFields = async () => {
    if (!selectedDataset?.id) return;
    
    try {
      const fields = await processingApi.getDatasetFields(selectedDataset.id.toString());
      setDatasetFields(fields.data || []);
    } catch (error) {
      console.error('加载数据集字段失败:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleConfigChange = (config: Partial<ProcessingConfig>) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        ...config
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const taskData = {
        name: formData.name,
        description: formData.description,
        datasetId: selectedDataset.id.toString(),
        processingType: formData.processingType,
        config: {
          ...formData.config,
          outputFormat: formData.outputFormat
        }
      };

      await processingApi.createTask(taskData);
      showSuccess('创建成功', '数据处理任务已创建');
      onSuccess();
      onCancel();
    } catch (error: any) {
      const errorMessage = error.message || '创建任务失败';
      setErrors({ submit: errorMessage });
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入任务名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入任务描述"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              处理类型 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.processingType}
              onChange={(e) => handleInputChange('processingType', e.target.value as ProcessingType)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={ProcessingType.CLEANING}>数据清洗</option>
              <option value={ProcessingType.FILTERING}>数据过滤</option>
              <option value={ProcessingType.DEDUPLICATION}>数据去重</option>
              <option value={ProcessingType.PRIVACY_REMOVAL}>隐私移除</option>
              <option value={ProcessingType.FORMAT_CONVERSION}>格式转换</option>
              <option value={ProcessingType.NORMALIZATION}>数据标准化</option>
              <option value={ProcessingType.ENRICHMENT}>数据增强</option>
              <option value={ProcessingType.VALIDATION}>数据验证</option>
              <option value={ProcessingType.TRANSFORMATION}>数据转换</option>
              <option value={ProcessingType.SAMPLING}>数据采样</option>
              <option value={ProcessingType.MERGING}>数据合并</option>
              <option value={ProcessingType.SPLITTING}>数据分割</option>
              <option value={ProcessingType.AGGREGATION}>数据聚合</option>
              <option value={ProcessingType.FEATURE_EXTRACTION}>特征提取</option>
              <option value={ProcessingType.ANONYMIZATION}>数据匿名化</option>
              <option value={ProcessingType.ENCRYPTION}>数据加密</option>
              <option value={ProcessingType.COMPRESSION}>数据压缩</option>
              <option value={ProcessingType.EXPORT}>数据导出</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输出格式 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.outputFormat}
              onChange={(e) => handleInputChange('outputFormat', e.target.value as OutputFormat)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={OutputFormat.JSON}>JSON</option>
              <option value={OutputFormat.JSONL}>JSONL</option>
              <option value={OutputFormat.CSV}>CSV</option>
              <option value={OutputFormat.EXCEL}>Excel</option>
              <option value={OutputFormat.PARQUET}>Parquet</option>
              <option value={OutputFormat.XML}>XML</option>
              <option value={OutputFormat.YAML}>YAML</option>
              <option value={OutputFormat.TXT}>TXT</option>
              <option value={OutputFormat.MARKDOWN}>Markdown</option>
              <option value={OutputFormat.HTML}>HTML</option>
              <option value={OutputFormat.PDF}>PDF</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProcessingConfig = () => {
    switch (formData.processingType) {
      case ProcessingType.CLEANING:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">数据清洗配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.config.cleaning?.removeNulls || false}
                    onChange={(e) => handleConfigChange({
                      cleaning: {
                        ...formData.config.cleaning,
                        removeNulls: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">移除空值</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.config.cleaning?.removeDuplicates || false}
                    onChange={(e) => handleConfigChange({
                      cleaning: {
                        ...formData.config.cleaning,
                        removeDuplicates: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">移除重复数据</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.config.cleaning?.trimWhitespace || false}
                    onChange={(e) => handleConfigChange({
                      cleaning: {
                        ...formData.config.cleaning,
                        trimWhitespace: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">去除首尾空格</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.config.cleaning?.normalizeCase || false}
                    onChange={(e) => handleConfigChange({
                      cleaning: {
                        ...formData.config.cleaning,
                        normalizeCase: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">标准化大小写</span>
                </label>
              </div>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.config.cleaning?.fixEncoding || false}
                    onChange={(e) => handleConfigChange({
                      cleaning: {
                        ...formData.config.cleaning,
                        fixEncoding: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">修复编码问题</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.config.cleaning?.removeSpecialChars || false}
                    onChange={(e) => handleConfigChange({
                      cleaning: {
                        ...formData.config.cleaning,
                        removeSpecialChars: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">移除特殊字符</span>
                </label>
              </div>
            </div>
          </div>
        );

      case ProcessingType.FILTERING:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">数据过滤配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">过滤字段</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">选择字段</option>
                  {datasetFields.map(field => (
                    <option key={field.name} value={field.name}>{field.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">过滤条件</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="equals">等于</option>
                  <option value="not_equals">不等于</option>
                  <option value="contains">包含</option>
                  <option value="not_contains">不包含</option>
                  <option value="greater_than">大于</option>
                  <option value="less_than">小于</option>
                  <option value="between">介于</option>
                  <option value="is_null">为空</option>
                  <option value="is_not_null">不为空</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">过滤值</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入过滤值"
                />
              </div>
            </div>
          </div>
        );

      case ProcessingType.DEDUPLICATION:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">数据去重配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">去重字段</label>
                <div className="space-y-2">
                  {datasetFields.map(field => (
                    <label key={field.name} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{field.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">保留第一条记录</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">区分大小写</span>
                </label>
              </div>
            </div>
          </div>
        );

      case ProcessingType.PRIVACY_REMOVAL:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">隐私移除配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">隐私字段</label>
                <div className="space-y-2">
                  {datasetFields.map(field => (
                    <label key={field.name} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{field.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">处理方式</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="mask">掩码处理</option>
                  <option value="hash">哈希处理</option>
                  <option value="anonymize">匿名化</option>
                  <option value="remove">完全移除</option>
                </select>
              </div>
            </div>
          </div>
        );

      case ProcessingType.EXPORT:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">数据导出配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">导出用途</label>
                <select
                  onChange={(e) => {
                    if (e.target.value === 'knowledge') {
                      handleConfigChange({
                        knowledgeBase: {
                          format: KnowledgeBaseFormat.QA_PAIR,
                          chunkSize: 1000,
                          overlap: 200
                        }
                      });
                    } else if (e.target.value === 'training') {
                      handleConfigChange({
                        training: {
                          format: TrainingFormat.INSTRUCTION,
                          instructionTemplate: '请根据以下内容回答问题：{content}'
                        }
                      });
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">选择导出用途</option>
                  <option value="knowledge">知识库问答</option>
                  <option value="training">模型训练</option>
                  <option value="analysis">数据分析</option>
                  <option value="backup">数据备份</option>
                </select>
              </div>
              {formData.config.knowledgeBase && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">知识库配置</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">知识库格式</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value={KnowledgeBaseFormat.QA_PAIR}>问答对格式</option>
                        <option value={KnowledgeBaseFormat.DOCUMENT}>文档格式</option>
                        <option value={KnowledgeBaseFormat.CHUNK}>分块格式</option>
                        <option value={KnowledgeBaseFormat.EMBEDDING}>向量格式</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">分块大小</label>
                      <input
                        type="number"
                        defaultValue={1000}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}
              {formData.config.training && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">训练配置</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">训练格式</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value={TrainingFormat.INSTRUCTION}>指令微调</option>
                        <option value={TrainingFormat.CONVERSATION}>对话格式</option>
                        <option value={TrainingFormat.COMPLETION}>补全格式</option>
                        <option value={TrainingFormat.CLASSIFICATION}>分类格式</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">指令模板</label>
                      <input
                        type="text"
                        defaultValue="请根据以下内容回答问题：{content}"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">处理配置</h3>
            <p className="text-gray-600">该处理类型的详细配置功能正在开发中...</p>
          </div>
        );
    }
  };

  if (!visible) {
    return <div style={{ display: 'none' }} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            创建数据处理任务
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 错误提示 */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-800">{errors.submit}</span>
              </div>
            )}

            {/* 当前数据集信息 */}
            {selectedDataset && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">当前数据集</h3>
                <p className="text-sm text-blue-800">{selectedDataset.name}</p>
                <p className="text-xs text-blue-600 mt-1">{selectedDataset.description || '暂无描述'}</p>
              </div>
            )}

            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
              
              {/* 任务名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  任务名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="请输入任务名称"
                  className={`input-glass w-full ${
                    errors.name ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  maxLength={50}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* 任务描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  任务描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="请描述任务的目的、处理要求等信息"
                  rows={3}
                  className="input-glass w-full resize-none"
                  maxLength={500}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formData.description.length}/500
                </p>
              </div>

              {/* 处理类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  处理类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.processingType}
                  onChange={(e) => handleInputChange('processingType', e.target.value as ProcessingType)}
                  className="input-glass w-full"
                >
                  <option value={ProcessingType.CLEANING}>数据清洗</option>
                  <option value={ProcessingType.FILTERING}>数据过滤</option>
                  <option value={ProcessingType.DEDUPLICATION}>数据去重</option>
                  <option value={ProcessingType.PRIVACY_REMOVAL}>隐私移除</option>
                  <option value={ProcessingType.FORMAT_CONVERSION}>格式转换</option>
                  <option value={ProcessingType.NORMALIZATION}>数据标准化</option>
                  <option value={ProcessingType.ENRICHMENT}>数据增强</option>
                  <option value={ProcessingType.VALIDATION}>数据验证</option>
                  <option value={ProcessingType.TRANSFORMATION}>数据转换</option>
                  <option value={ProcessingType.SAMPLING}>数据采样</option>
                  <option value={ProcessingType.MERGING}>数据合并</option>
                  <option value={ProcessingType.SPLITTING}>数据分割</option>
                  <option value={ProcessingType.AGGREGATION}>数据聚合</option>
                  <option value={ProcessingType.FEATURE_EXTRACTION}>特征提取</option>
                  <option value={ProcessingType.ANONYMIZATION}>数据匿名化</option>
                  <option value={ProcessingType.ENCRYPTION}>数据加密</option>
                  <option value={ProcessingType.COMPRESSION}>数据压缩</option>
                  <option value={ProcessingType.EXPORT}>数据导出</option>
                </select>
              </div>

              {/* 输出格式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输出格式 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.outputFormat}
                  onChange={(e) => handleInputChange('outputFormat', e.target.value as OutputFormat)}
                  className="input-glass w-full"
                >
                  <option value={OutputFormat.JSON}>JSON</option>
                  <option value={OutputFormat.JSONL}>JSONL</option>
                  <option value={OutputFormat.CSV}>CSV</option>
                  <option value={OutputFormat.EXCEL}>Excel</option>
                  <option value={OutputFormat.PARQUET}>Parquet</option>
                  <option value={OutputFormat.XML}>XML</option>
                  <option value={OutputFormat.YAML}>YAML</option>
                  <option value={OutputFormat.TXT}>TXT</option>
                  <option value={OutputFormat.MARKDOWN}>Markdown</option>
                  <option value={OutputFormat.HTML}>HTML</option>
                  <option value={OutputFormat.PDF}>PDF</option>
                </select>
              </div>
            </div>

            {/* 处理配置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                处理配置
              </h3>
              {renderProcessingConfig()}
            </div>
          </form>
        </div>

        {/* 弹窗底部 */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>创建中...</span>
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  <span>创建任务</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 