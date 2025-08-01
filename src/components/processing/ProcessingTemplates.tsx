'use client';

import React, { useState, useEffect } from 'react';
import { ProcessingTemplate, ProcessingType } from '@/types';
import { processingApi } from '@/api/processing';
import { useToast } from '@/hooks/useToast';

interface ProcessingTemplatesProps {
  onBack: () => void;
  onUseTemplate: (template: ProcessingTemplate) => void;
}

export default function ProcessingTemplates({ onBack, onUseTemplate }: ProcessingTemplatesProps) {
  const [templates, setTemplates] = useState<ProcessingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    processingType: '' as ProcessingType | '',
    isPublic: false
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadTemplates();
  }, [filter]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter.processingType) {
        params.processingType = filter.processingType;
      }
      if (filter.isPublic !== undefined) {
        params.isPublic = filter.isPublic;
      }
      const response = await processingApi.getTemplates(params);
      setTemplates(response.data.records || []);
    } catch (error) {
      console.error('加载模板失败:', error);
      showError('加载失败', '无法加载处理模板');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('确定要删除这个模板吗？此操作不可撤销。')) {
      return;
    }

    try {
      await processingApi.deleteTemplate(templateId);
      showSuccess('删除成功', '处理模板已删除');
      loadTemplates();
    } catch (error) {
      showError('删除失败', '无法删除处理模板');
    }
  };

  const getProcessingTypeLabel = (type: ProcessingType) => {
    const typeLabels: Record<ProcessingType, string> = {
      [ProcessingType.CLEANING]: '数据清洗',
      [ProcessingType.FILTERING]: '数据过滤',
      [ProcessingType.DEDUPLICATION]: '数据去重',
      [ProcessingType.PRIVACY_REMOVAL]: '隐私移除',
      [ProcessingType.FORMAT_CONVERSION]: '格式转换',
      [ProcessingType.NORMALIZATION]: '数据标准化',
      [ProcessingType.ENRICHMENT]: '数据增强',
      [ProcessingType.VALIDATION]: '数据验证',
      [ProcessingType.TRANSFORMATION]: '数据转换',
      [ProcessingType.SAMPLING]: '数据采样',
      [ProcessingType.MERGING]: '数据合并',
      [ProcessingType.SPLITTING]: '数据分割',
      [ProcessingType.AGGREGATION]: '数据聚合',
      [ProcessingType.FEATURE_EXTRACTION]: '特征提取',
      [ProcessingType.ANONYMIZATION]: '数据匿名化',
      [ProcessingType.ENCRYPTION]: '数据加密',
      [ProcessingType.COMPRESSION]: '数据压缩',
      [ProcessingType.EXPORT]: '数据导出'
    };
    return typeLabels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">处理模板</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            返回
          </button>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">处理类型</label>
            <select
              value={filter.processingType}
              onChange={(e) => setFilter(prev => ({ ...prev, processingType: e.target.value as ProcessingType || '' }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全部类型</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">可见性</label>
            <select
              value={filter.isPublic ? 'public' : 'private'}
              onChange={(e) => setFilter(prev => ({ ...prev, isPublic: e.target.value === 'public' }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="private">私有模板</option>
              <option value="public">公开模板</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadTemplates}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              刷新
            </button>
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无模板</h3>
            <p className="mt-1 text-sm text-gray-500">开始创建您的第一个处理模板</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    模板名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    处理类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    可见性
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    使用次数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-gray-500">{template.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getProcessingTypeLabel(template.processingType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        template.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.isPublic ? '公开' : '私有'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.usageCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(template.createdTime).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onUseTemplate(template)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          使用
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 