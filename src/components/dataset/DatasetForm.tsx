'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Database,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { Dataset, DatasetType, DatasetPermission } from '@/types';
import { datasetApi } from '@/api/dataset';

interface DatasetFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: (dataset: Dataset) => void;
  editingDataset?: Dataset | null;
}

// 数据集类型配置
const datasetTypeOptions = [
  { 
    value: DatasetType.TEXT, 
    label: '文本数据', 
    icon: FileText, 
    description: '自然语言处理、文本分析等文本类数据',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-500'
  },
  { 
    value: DatasetType.IMAGE, 
    label: '图像数据', 
    icon: Image, 
    description: '计算机视觉、图像识别等图像类数据',
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-500'
  },
  { 
    value: DatasetType.VIDEO, 
    label: '视频数据', 
    icon: Video, 
    description: '视频分析、行为识别等视频类数据',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100 border-purple-500'
  },
  { 
    value: DatasetType.AUDIO, 
    label: '音频数据', 
    icon: Music, 
    description: '语音识别、音频分析等音频类数据',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100 border-orange-500'
  },
  { 
    value: DatasetType.STRUCTURED, 
    label: '结构化数据', 
    icon: Database, 
    description: '表格数据、数据库导出等结构化数据',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-500'
  },
];

// 权限类型配置
const permissionOptions = [
  { 
    value: DatasetPermission.PRIVATE, 
    label: '私有', 
    description: '仅您可以访问和编辑此数据集'
  },
  { 
    value: DatasetPermission.TEAM, 
    label: '团队', 
    description: '您的团队成员可以访问此数据集'
  },
  { 
    value: DatasetPermission.PUBLIC, 
    label: '公开', 
    description: '所有用户都可以查看此数据集'
  },
];

// 常见数据格式配置
const formatOptions = {
  [DatasetType.TEXT]: ['TXT', 'JSON', 'CSV', 'XML', 'JSONL'],
  [DatasetType.IMAGE]: ['JPG', 'PNG', 'BMP', 'TIFF', 'WEBP'],
  [DatasetType.VIDEO]: ['MP4', 'AVI', 'MOV', 'MKV', 'WEBM'],
  [DatasetType.AUDIO]: ['MP3', 'WAV', 'FLAC', 'OGG', 'M4A'],
  [DatasetType.STRUCTURED]: ['CSV', 'JSON', 'XML', 'XLSX', 'PARQUET'],
};

const DatasetForm: React.FC<DatasetFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  editingDataset
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: DatasetType.TEXT,
    description: '',
    format: '',
    permission: DatasetPermission.PRIVATE,
    isPublic: false,
    tags: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<DatasetType>(DatasetType.TEXT);

  const isEditing = !!editingDataset;

  useEffect(() => {
    if (editingDataset) {
      setFormData({
        name: editingDataset.name || '',
        type: editingDataset.type || DatasetType.TEXT,
        description: editingDataset.description || '',
        format: editingDataset.format || '',
        permission: editingDataset.permission || DatasetPermission.PRIVATE,
        isPublic: editingDataset.isPublic || false,
        tags: editingDataset.tags || '',
      });
      setSelectedType(editingDataset.type || DatasetType.TEXT);
    } else {
      // 重置表单
      setFormData({
        name: '',
        type: DatasetType.TEXT,
        description: '',
        format: '',
        permission: DatasetPermission.PRIVATE,
        isPublic: false,
        tags: '',
      });
      setSelectedType(DatasetType.TEXT);
    }
    setErrors({});
  }, [editingDataset, visible]);

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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = '数据集名称不能为空';
    } else if (formData.name.length < 2) {
      newErrors.name = '数据集名称至少需要2个字符';
    } else if (formData.name.length > 50) {
      newErrors.name = '数据集名称不能超过50个字符';
    }

    if (!formData.type) {
      newErrors.type = '请选择数据集类型';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = '描述不能超过500个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const datasetData: Partial<Dataset> = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || undefined,
        format: formData.format || undefined,
        permission: formData.permission,
        isPublic: formData.isPublic,
        tags: formData.tags.trim() || undefined,
      };

      let result: any;
      if (isEditing) {
        console.log('Updating dataset:', editingDataset!.id, datasetData);
        result = await datasetApi.UpdateDataset(editingDataset!.id!, datasetData);
      } else {
        // 创建数据集时，确保必需字段都有值
        const createData = {
          name: formData.name.trim(),
          type: formData.type,
          description: formData.description.trim() || undefined,
          format: formData.format || undefined,
          permission: formData.permission,
          isPublic: formData.isPublic,
          tags: formData.tags.trim() || undefined,
        };
        console.log('Creating dataset:', createData);
        result = await datasetApi.CreateDataset(createData);
      }

      console.log('API result:', result);
      console.log('Calling onSuccess with:', result.data);
      onSuccess?.(result.data);
      onCancel();
    } catch (error: any) {
      console.error('Dataset operation failed:', error);
      setErrors({ 
        submit: error.message || `${isEditing ? '更新' : '创建'}数据集失败` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: DatasetType) => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      type,
      format: '' // 清空格式，让用户重新选择
    }));
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

  if (!visible) {
    // 兼容部分浏览器或父容器影响，强制渲染但隐藏
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
            {isEditing ? '编辑数据集' : '创建数据集'}
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

            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
              
              {/* 数据集名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数据集名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="请输入数据集名称"
                  className={`input-glass w-full ${
                    errors.name ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  maxLength={50}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* 数据集描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数据集描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="请描述数据集的用途、来源、特点等信息"
                  rows={3}
                  className={`input-glass w-full resize-none ${
                    errors.description ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.description.length}/500
                  </p>
                </div>
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="用逗号分隔，如：机器学习,图像识别,深度学习"
                  className="input-glass w-full"
                />
                <p className="mt-1 text-sm text-gray-500">
                  使用逗号分隔多个标签，便于搜索和分类
                </p>
              </div>
            </div>

            {/* 数据集类型选择 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                数据集类型 <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {datasetTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedType === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleTypeSelect(option.value)}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                        isSelected 
                          ? `${option.bgColor}` 
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? option.color : 'text-gray-400'}`} />
                        <span className={`font-medium ${isSelected ? option.color : 'text-gray-900'}`}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-current ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </button>
                  );
                })}
              </div>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            {/* 数据格式 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">数据格式</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预设格式
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    className="input-glass w-full"
                  >
                    <option value="">请选择格式</option>
                    {formatOptions[selectedType]?.map((format) => (
                      <option key={format} value={format}>
                        {format}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自定义格式
                  </label>
                  <input
                    type="text"
                    value={formData.format}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    placeholder="如：JSONL, COCO, VOC等"
                    className="input-glass w-full"
                  />
                </div>
              </div>
            </div>

            {/* 权限设置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">权限设置</h3>
              <div className="space-y-3">
                {permissionOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.permission === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="permission"
                      value={option.value}
                      checked={formData.permission === option.value}
                      onChange={(e) => handleInputChange('permission', e.target.value as DatasetPermission)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* 公开设置 */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  允许在公共数据集目录中展示
                </label>
              </div>
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
                  <span>{isEditing ? '更新中...' : '创建中...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{isEditing ? '更新数据集' : '创建数据集'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetForm; 