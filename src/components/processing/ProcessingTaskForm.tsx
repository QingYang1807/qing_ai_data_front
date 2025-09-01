'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Database, FileText, Filter, Brain, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { processingApi, ProcessingTaskCreateRequest } from '@/api/processing';
import { Dataset, ProcessingType, ProcessingConfig, OutputFormat } from '@/types';
import { useToast } from '@/hooks/useToast';

interface ProcessingTaskFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  dataset?: Dataset;
  defaultProcessingType?: ProcessingType | null;
}

const ProcessingTaskForm: React.FC<ProcessingTaskFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  dataset,
  defaultProcessingType
}) => {
  const [formData, setFormData] = useState<ProcessingTaskCreateRequest>({
    name: '',
    description: '',
    datasetId: '',
    processingType: ProcessingType.CLEANING,
    config: {
      outputFormat: OutputFormat.JSON,
      cleaning: {
        removeNulls: true,
        removeDuplicates: true,
        trimWhitespace: true,
      }
    },
    outputFormat: OutputFormat.JSON
  });

  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  // 重置表单数据
  useEffect(() => {
    if (visible && dataset) {
      setFormData({
        name: `${dataset.name}_处理任务`,
        description: `对数据集 ${dataset.name} 进行处理`,
        datasetId: dataset.id?.toString() || '',
        processingType: defaultProcessingType || ProcessingType.CLEANING,
        config: {
          outputFormat: OutputFormat.JSON,
          cleaning: {
            removeNulls: true,
            removeDuplicates: true,
            trimWhitespace: true,
          }
        },
        outputFormat: OutputFormat.JSON
      });
    }
  }, [visible, dataset, defaultProcessingType]);

  // 创建任务
  const createTaskMutation = useMutation({
    mutationFn: (data: ProcessingTaskCreateRequest) => processingApi.createTask(data),
    onSuccess: () => {
      showSuccess('数据处理任务创建成功');
      onSuccess();
    },
    onError: (error: any) => {
      showError('创建失败: ' + (error.message || '未知错误'));
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      showError('请输入任务名称');
      return;
    }

    if (!formData.datasetId) {
      showError('请选择数据集');
      return;
    }

    createTaskMutation.mutate(formData);
  };

  const getProcessingTypeIcon = (type: ProcessingType) => {
    switch (type) {
      case ProcessingType.CLEANING: return <Filter className="w-4 h-4" />;
      case ProcessingType.FILTERING: return <Filter className="w-4 h-4" />;
      case ProcessingType.DEDUPLICATION: return <Database className="w-4 h-4" />;
      case ProcessingType.FORMAT_CONVERSION: return <FileText className="w-4 h-4" />;
      case ProcessingType.ENRICHMENT: return <Brain className="w-4 h-4" />;
      case ProcessingType.VALIDATION: return <CheckCircle className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getProcessingTypeText = (type: ProcessingType) => {
    switch (type) {
      case ProcessingType.CLEANING: return '数据清洗';
      case ProcessingType.FILTERING: return '数据过滤';
      case ProcessingType.DEDUPLICATION: return '数据去重';
      case ProcessingType.FORMAT_CONVERSION: return '格式转换';
      case ProcessingType.ENRICHMENT: return '数据增强';
      case ProcessingType.VALIDATION: return '数据验证';
      default: return type;
    }
  };

  const processingTypes = [
    ProcessingType.CLEANING,
    ProcessingType.FILTERING,
    ProcessingType.DEDUPLICATION,
    ProcessingType.FORMAT_CONVERSION,
    ProcessingType.ENRICHMENT,
    ProcessingType.VALIDATION,
  ];

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">新建数据处理任务</h2>
            <p className="text-sm text-gray-600 mt-1">配置数据处理任务的基本信息和参数</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* 基本信息 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    任务名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="请输入任务名称"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    任务描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="请输入任务描述"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    数据集 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dataset?.name || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* 处理类型 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">处理类型</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {processingTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      value={type}
                      checked={formData.processingType === type}
                      onChange={(e) => handleInputChange('processingType', e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      {getProcessingTypeIcon(type)}
                      <span className="ml-2 text-sm">{getProcessingTypeText(type)}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 输出格式 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">输出格式</h3>
              <select
                value={formData.outputFormat}
                onChange={(e) => handleInputChange('outputFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={OutputFormat.JSON}>JSON</option>
                <option value={OutputFormat.CSV}>CSV</option>
                <option value={OutputFormat.EXCEL}>Excel</option>
                <option value={OutputFormat.JSONL}>JSONL</option>
                <option value={OutputFormat.PARQUET}>Parquet</option>
              </select>
            </div>

            {/* 处理配置 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">处理配置</h3>
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="removeNulls"
                    checked={formData.config.cleaning?.removeNulls || false}
                    onChange={(e) => handleConfigChange('cleaning', {
                      ...formData.config.cleaning,
                      removeNulls: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="removeNulls" className="text-sm">移除空值</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="removeDuplicates"
                    checked={formData.config.cleaning?.removeDuplicates || false}
                    onChange={(e) => handleConfigChange('cleaning', {
                      ...formData.config.cleaning,
                      removeDuplicates: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="removeDuplicates" className="text-sm">移除重复数据</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trimWhitespace"
                    checked={formData.config.cleaning?.trimWhitespace || false}
                    onChange={(e) => handleConfigChange('cleaning', {
                      ...formData.config.cleaning,
                      trimWhitespace: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="trimWhitespace" className="text-sm">去除首尾空格</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
                          disabled={createTaskMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
                          {createTaskMutation.isPending ? '创建中...' : '创建任务'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessingTaskForm; 