'use client';

import React, { useState, useEffect } from 'react';
import { ProcessingType, ProcessingConfig, OutputFormat, Dataset, KnowledgeBaseFormat, TrainingFormat } from '@/types';
import { processingApi } from '@/api/processing';
import { useToast } from '@/hooks/useToast';

interface ProcessingTaskFormProps {
  selectedDataset?: Dataset;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function ProcessingTaskForm({
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
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (selectedDataset?.id) {
      loadDatasetFields();
    }
  }, [selectedDataset]);

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

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showError('验证失败', '请输入任务名称');
      return;
    }

    if (!selectedDataset?.id) {
      showError('验证失败', '请选择数据集');
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
    } catch (error: any) {
      const errorMessage = error.message || '创建任务失败';
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        {/* 步骤指示器 */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">基本信息</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">处理配置</span>
            </div>
          </div>
        </div>

        {/* 表单内容 */}
        {step === 1 && renderBasicInfo()}
        {step === 2 && renderProcessingConfig()}

        {/* 操作按钮 */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </button>
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                上一步
              </button>
            )}
            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '创建中...' : '创建任务'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 