'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit, 
  Eye,
  Upload,
  File,
  Image,
  Video,
  Music,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import { datasetApi } from '@/api/dataset';
import { Dataset, DatasetType, DatasetStatus, DatasetPermission } from '@/types';

/**
 * 数据集管理页面
 * 提供数据集的增删改查和文件管理功能
 */
export default function DatasetPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);

  // 数据集类型配置
  const datasetTypeConfig = {
    [DatasetType.TEXT]: { icon: FileText, name: '文本数据', color: 'text-blue-600' },
    [DatasetType.IMAGE]: { icon: Image, name: '图像数据', color: 'text-green-600' },
    [DatasetType.VIDEO]: { icon: Video, name: '视频数据', color: 'text-purple-600' },
    [DatasetType.AUDIO]: { icon: Music, name: '音频数据', color: 'text-orange-600' },
    [DatasetType.STRUCTURED]: { icon: Database, name: '结构化数据', color: 'text-indigo-600' },
  };

  // 状态配置
  const statusConfig = {
    [DatasetStatus.CREATING]: { label: '创建中', color: 'bg-yellow-100 text-yellow-800' },
    [DatasetStatus.READY]: { label: '就绪', color: 'bg-green-100 text-green-800' },
    [DatasetStatus.PROCESSING]: { label: '处理中', color: 'bg-blue-100 text-blue-800' },
    [DatasetStatus.ERROR]: { label: '错误', color: 'bg-red-100 text-red-800' },
  };

  // 加载数据集列表
  const LoadDatasets = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        size: pageSize,
      };

      if (searchKeyword.trim()) {
        params.keyword = searchKeyword.trim();
      }
      if (selectedType !== 'all') {
        params.type = selectedType;
      }
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const response = await datasetApi.GetDatasets(params);
      setDatasets(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建数据集
  const HandleCreateDataset = async (datasetData: Omit<Dataset, 'id' | 'createTime' | 'updateTime'>) => {
    try {
      await datasetApi.CreateDataset(datasetData);
      setShowCreateModal(false);
      LoadDatasets();
    } catch (error) {
      console.error('Failed to create dataset:', error);
    }
  };

  // 删除数据集
  const HandleDeleteDataset = async (id: number) => {
    if (!confirm('确定要删除这个数据集吗？此操作不可恢复。')) {
      return;
    }

    try {
      await datasetApi.DeleteDataset(id);
      LoadDatasets();
    } catch (error) {
      console.error('Failed to delete dataset:', error);
    }
  };

  // 格式化文件大小
  const FormatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const FormatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleString('zh-CN');
  };

  // 页面加载时获取数据
  useEffect(() => {
    LoadDatasets();
  }, [currentPage, selectedType, selectedStatus]);

  // 搜索处理
  const HandleSearch = () => {
    setCurrentPage(1);
    LoadDatasets();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">数据集管理</h1>
                <p className="text-sm text-gray-500">管理和组织您的AI训练数据集</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                批量上传
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                创建数据集
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选和搜索区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索数据集名称或描述..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && HandleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 类型筛选 */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">所有类型</option>
              {Object.entries(datasetTypeConfig).map(([type, config]) => (
                <option key={type} value={type}>{config.name}</option>
              ))}
            </select>

            {/* 状态筛选 */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">所有状态</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>{config.label}</option>
              ))}
            </select>

            {/* 搜索按钮 */}
            <button
              onClick={HandleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              搜索
            </button>
          </div>
        </div>

        {/* 数据集网格 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-16">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无数据集</h3>
            <p className="text-gray-500 mb-6">开始创建您的第一个数据集</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              创建数据集
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {datasets.map((dataset) => {
              const TypeIcon = datasetTypeConfig[dataset.type as DatasetType]?.icon || File;
              const typeConfig = datasetTypeConfig[dataset.type as DatasetType];
              const statusConfig_ = statusConfig[dataset.status as DatasetStatus];

              return (
                <div key={dataset.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  {/* 数据集头部 */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <TypeIcon className={`h-5 w-5 mr-2 ${typeConfig?.color || 'text-gray-600'}`} />
                        <span className="text-sm text-gray-500">{typeConfig?.name || '未知类型'}</span>
                      </div>
                      <div className="relative">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate" title={dataset.name}>
                      {dataset.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2" title={dataset.description}>
                      {dataset.description || '暂无描述'}
                    </p>
                  </div>

                  {/* 数据集信息 */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">状态</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${statusConfig_?.color || 'bg-gray-100 text-gray-800'}`}>
                        {statusConfig_?.label || '未知'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">文件数量</span>
                      <span className="text-sm font-medium">{dataset.fileCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">数据大小</span>
                      <span className="text-sm font-medium">{FormatFileSize(dataset.size || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">创建时间</span>
                      <span className="text-sm text-gray-700">{FormatTime(dataset.createTime)}</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="p-4 border-t bg-gray-50 flex justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDataset(dataset);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDataset(dataset);
                          setShowCreateModal(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => dataset.id && HandleDeleteDataset(dataset.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 分页 */}
        {total > pageSize && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              
              <span className="text-sm text-gray-700">
                第 {currentPage} 页，共 {Math.ceil(total / pageSize)} 页
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(Math.ceil(total / pageSize), currentPage + 1))}
                disabled={currentPage >= Math.ceil(total / pageSize)}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 创建/编辑数据集模态框 */}
      {showCreateModal && (
        <CreateDatasetModal
          visible={showCreateModal}
          onCancel={() => {
            setShowCreateModal(false);
            setSelectedDataset(null);
          }}
          onSubmit={HandleCreateDataset}
          editingDataset={selectedDataset}
        />
      )}

      {/* 文件上传模态框 */}
      {showUploadModal && (
        <FileUploadModal
          visible={showUploadModal}
          onCancel={() => {
            setShowUploadModal(false);
            setSelectedDataset(null);
          }}
          dataset={selectedDataset}
          onSuccess={() => {
            LoadDatasets();
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );
}

// 创建数据集模态框组件
function CreateDatasetModal({ 
  visible, 
  onCancel, 
  onSubmit, 
  editingDataset 
}: {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: Omit<Dataset, 'id' | 'createTime' | 'updateTime'>) => void;
  editingDataset?: Dataset | null;
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: DatasetType.TEXT,
    description: '',
    format: '',
    permission: DatasetPermission.PRIVATE,
    isPublic: false,
    tags: '',
  });

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
    } else {
      setFormData({
        name: '',
        type: DatasetType.TEXT,
        description: '',
        format: '',
        permission: DatasetPermission.PRIVATE,
        isPublic: false,
        tags: '',
      });
    }
  }, [editingDataset]);

  const HandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingDataset ? '编辑数据集' : '创建数据集'}
          </h3>
          
          <form onSubmit={HandleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数据集名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入数据集名称"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数据类型 *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DatasetType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={DatasetType.TEXT}>文本数据</option>
                <option value={DatasetType.IMAGE}>图像数据</option>
                <option value={DatasetType.VIDEO}>视频数据</option>
                <option value={DatasetType.AUDIO}>音频数据</option>
                <option value={DatasetType.STRUCTURED}>结构化数据</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入数据集描述"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数据格式
              </label>
              <input
                type="text"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="如：JSON、CSV、JPG等"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="用逗号分隔多个标签"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                公开数据集
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingDataset ? '更新' : '创建'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// 文件上传模态框组件
function FileUploadModal({
  visible,
  onCancel,
  dataset,
  onSuccess,
}: {
  visible: boolean;
  onCancel: () => void;
  dataset?: Dataset | null;
  onSuccess: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const HandleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const HandleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const HandleUpload = async () => {
    if (!dataset?.id || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        await datasetApi.UploadFile(dataset.id, file);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }
      onSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            上传文件到 &ldquo;{dataset?.name}&rdquo;
          </h3>

          {/* 文件选择区域 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              选择文件上传
            </div>
            <p className="text-gray-500 mb-4">
              支持多文件上传，拖拽文件到此区域或点击选择
            </p>
            <input
              type="file"
              multiple
              onChange={HandleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              选择文件
            </label>
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="max-h-64 overflow-y-auto mb-4">
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <File className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => HandleRemoveFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={HandleUpload}
              disabled={files.length === 0 || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {uploading ? '上传中...' : `上传 ${files.length} 个文件`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 