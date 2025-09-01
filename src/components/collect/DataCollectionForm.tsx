'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Calendar, 
  Zap, 
  Settings, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  Search
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataCollectionApi, DataCollectionTask, DataCollectionTaskCreateRequest, DataCollectionTaskUpdateRequest } from '@/api/collect';
import { useDataSourceStore } from '@/stores/useDataSourceStore';
import { useToast } from '@/hooks/useToast';

interface DataCollectionFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingTask?: DataCollectionTask | null;
}

const DataCollectionForm: React.FC<DataCollectionFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  editingTask
}) => {
  const [formData, setFormData] = useState<DataCollectionTaskCreateRequest>({
    name: '',
    description: '',
    dataSourceId: '',
    collectionType: 'manual',
    config: {
      query: '',
      filters: {},
      limit: 1000,
      offset: 0,
      fields: [],
      sortBy: '',
      sortOrder: 'asc'
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const { dataSources } = useDataSourceStore();

  // 重置表单数据
  useEffect(() => {
    if (visible) {
      if (editingTask) {
        setFormData({
          name: editingTask.name,
          description: editingTask.description || '',
          dataSourceId: editingTask.dataSourceId,
          collectionType: editingTask.collectionType,
          schedule: editingTask.schedule,
          config: { ...editingTask.config }
        });
        setSelectedFields(editingTask.config.fields || []);
      } else {
        setFormData({
          name: '',
          description: '',
          dataSourceId: '',
          collectionType: 'manual',
          config: {
            query: '',
            filters: {},
            limit: 1000,
            offset: 0,
            fields: [],
            sortBy: '',
            sortOrder: 'asc'
          }
        });
        setSelectedFields([]);
      }
      setShowAdvanced(false);
      setPreviewData(null);
    }
  }, [visible, editingTask]);

  // 创建任务
  const createTaskMutation = useMutation({
    mutationFn: (data: DataCollectionTaskCreateRequest) => dataCollectionApi.createTask(data),
    onSuccess: () => {
      showSuccess('数据采集任务创建成功');
      onSuccess();
    },
    onError: (error: any) => {
      showError('创建失败: ' + (error.message || '未知错误'));
    },
  });

  // 更新任务
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DataCollectionTaskUpdateRequest }) => 
      dataCollectionApi.updateTask(id, data),
    onSuccess: () => {
      showSuccess('数据采集任务更新成功');
      onSuccess();
    },
    onError: (error: any) => {
      showError('更新失败: ' + (error.message || '未知错误'));
    },
  });

  // 获取预览数据
  const getPreviewMutation = useMutation({
    mutationFn: ({ dataSourceId, config }: { dataSourceId: string; config: any }) =>
      dataCollectionApi.getPreview(dataSourceId, config),
    onSuccess: (data) => {
      setPreviewData(data.data);
      setAvailableFields(data.data.availableFields || []);
    },
    onError: (error: any) => {
      showError('获取预览失败: ' + (error.message || '未知错误'));
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

  const handleDataSourceChange = (dataSourceId: string) => {
    handleInputChange('dataSourceId', dataSourceId);
    setSelectedFields([]);
    setPreviewData(null);
    
    // 自动获取预览数据
    if (dataSourceId) {
      setIsPreviewLoading(true);
      getPreviewMutation.mutate({
        dataSourceId,
        config: formData.config
      }, {
        onSettled: () => setIsPreviewLoading(false)
      });
    }
  };

  const handleFieldToggle = (field: string) => {
    const newFields = selectedFields.includes(field)
      ? selectedFields.filter(f => f !== field)
      : [...selectedFields, field];
    
    setSelectedFields(newFields);
    handleConfigChange('fields', newFields);
  };

  const handlePreview = () => {
    if (formData.dataSourceId) {
      setIsPreviewLoading(true);
      getPreviewMutation.mutate({
        dataSourceId: formData.dataSourceId,
        config: {
          ...formData.config,
          fields: selectedFields
        }
      }, {
        onSettled: () => setIsPreviewLoading(false)
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      showError('请输入任务名称');
      return;
    }

    if (!formData.dataSourceId) {
      showError('请选择数据源');
      return;
    }

    const submitData = {
      ...formData,
      config: {
        ...formData.config,
        fields: selectedFields
      }
    };

    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        data: submitData
      });
    } else {
      createTaskMutation.mutate(submitData);
    }
  };

  const selectedDataSource = dataSources.find(ds => ds.id === formData.dataSourceId);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingTask ? '编辑数据采集任务' : '新建数据采集任务'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editingTask ? '修改任务配置和参数' : '配置数据采集任务的基本信息和参数'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* 左侧表单 */}
          <div className="flex-1 p-6 overflow-y-auto">
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
                      数据源 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.dataSourceId}
                      onChange={(e) => handleDataSourceChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">请选择数据源</option>
                      {dataSources.map(ds => (
                        <option key={ds.id} value={ds.id}>
                          {ds.name} ({ds.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      采集类型
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          value="manual"
                          checked={formData.collectionType === 'manual'}
                          onChange={(e) => handleInputChange('collectionType', e.target.value)}
                          className="mr-2"
                        />
                        <div className="flex items-center">
                          <Database className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="text-sm">手动采集</span>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          value="scheduled"
                          checked={formData.collectionType === 'scheduled'}
                          onChange={(e) => handleInputChange('collectionType', e.target.value)}
                          className="mr-2"
                        />
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-green-500" />
                          <span className="text-sm">定时采集</span>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          value="real_time"
                          checked={formData.collectionType === 'real_time'}
                          onChange={(e) => handleInputChange('collectionType', e.target.value)}
                          className="mr-2"
                        />
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-purple-500" />
                          <span className="text-sm">实时采集</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.collectionType === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        定时表达式 (Cron)
                      </label>
                      <input
                        type="text"
                        value={formData.schedule || ''}
                        onChange={(e) => handleInputChange('schedule', e.target.value)}
                        placeholder="0 0 * * * (每天凌晨执行)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        示例: 0 0 * * * (每天凌晨), 0 */6 * * * (每6小时), 0 0 * * 1 (每周一凌晨)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 高级配置 */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  高级配置
                  {showAdvanced ? <EyeOff className="w-4 h-4 ml-2" /> : <Eye className="w-4 h-4 ml-2" />}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SQL查询语句
                      </label>
                      <textarea
                        value={formData.config.query || ''}
                        onChange={(e) => handleConfigChange('query', e.target.value)}
                        placeholder="SELECT * FROM table_name WHERE condition"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          限制条数
                        </label>
                        <input
                          type="number"
                          value={formData.config.limit || 1000}
                          onChange={(e) => handleConfigChange('limit', parseInt(e.target.value))}
                          min="1"
                          max="100000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          偏移量
                        </label>
                        <input
                          type="number"
                          value={formData.config.offset || 0}
                          onChange={(e) => handleConfigChange('offset', parseInt(e.target.value))}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          排序字段
                        </label>
                        <input
                          type="text"
                          value={formData.config.sortBy || ''}
                          onChange={(e) => handleConfigChange('sortBy', e.target.value)}
                          placeholder="字段名"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          排序方式
                        </label>
                        <select
                          value={formData.config.sortOrder || 'asc'}
                          onChange={(e) => handleConfigChange('sortOrder', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="asc">升序 (ASC)</option>
                          <option value="desc">降序 (DESC)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 字段选择 */}
              {availableFields.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">字段选择</h3>
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-300 rounded-lg">
                    {availableFields.map(field => (
                      <label key={field} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field)}
                          onChange={() => handleFieldToggle(field)}
                          className="mr-2"
                        />
                        <span className="text-sm">{field}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    已选择 {selectedFields.length} 个字段，不选择则采集所有字段
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧预览 */}
          <div className="w-1/2 border-l border-gray-200 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">数据预览</h3>
              <button
                onClick={handlePreview}
                disabled={!formData.dataSourceId || isPreviewLoading}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4 mr-1" />
                {isPreviewLoading ? '加载中...' : '刷新预览'}
              </button>
            </div>

            {!formData.dataSourceId ? (
              <div className="text-center text-gray-500 py-8">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>请先选择数据源</p>
              </div>
            ) : isPreviewLoading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>正在加载预览数据...</p>
              </div>
            ) : previewData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-700">预估记录数</div>
                    <div className="text-lg font-bold text-blue-600">{previewData.estimatedRecords?.toLocaleString() || '未知'}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-700">预估大小</div>
                    <div className="text-lg font-bold text-green-600">
                      {previewData.estimatedSize ? `${(previewData.estimatedSize / 1024 / 1024).toFixed(2)} MB` : '未知'}
                    </div>
                  </div>
                </div>

                {previewData.sampleData && previewData.sampleData.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">样本数据</h4>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(previewData.sampleData.slice(0, 3), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {previewData.fieldInfo && previewData.fieldInfo.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">字段信息</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {previewData.fieldInfo.map((field: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                          <span className="font-medium">{field.name}</span>
                          <span className="text-gray-500">{field.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>点击"刷新预览"查看数据</p>
              </div>
            )}
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
                          disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
                          {createTaskMutation.isPending || updateTaskMutation.isPending ? '保存中...' : (editingTask ? '更新' : '创建')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataCollectionForm; 