'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft,
  FileText,
  Folder,
  Database,
  Image,
  Video,
  Music,
  File,
  Tag,
  Calendar,
  User,
  HardDrive,
  Eye,
  Download,
  Share2,
  Settings,
  X,
  Loader2,
  Edit3,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Users,
  Globe,
  Lock
} from 'lucide-react';
import { Dataset, DatasetType, DatasetPermission } from '@/types';
import DatasetFiles from '@/components/dataset/DatasetFiles';
import DatasetForm from '@/components/dataset/DatasetForm';
import { datasetApi } from '@/api/dataset';
import { ToastContainer } from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';

interface DatasetDetailViewProps {
  dataset: Dataset;
  onBack?: () => void;
  onEdit?: (dataset: Dataset) => void;
  showBackButton?: boolean;
}

const DatasetDetailView: React.FC<DatasetDetailViewProps> = ({ 
  dataset, 
  onBack, 
  onEdit,
  showBackButton = true 
}) => {
  const [activeTab, setActiveTab] = useState('readme');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [currentDataset, setCurrentDataset] = useState<Dataset>(dataset);
  const [copySuccess, setCopySuccess] = useState(false);
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // 数据集类型配置
  const datasetTypeConfig = {
    [DatasetType.TEXT]: { icon: FileText, name: '文本数据', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    [DatasetType.IMAGE]: { icon: Image, name: '图像数据', color: 'text-green-600', bgColor: 'bg-green-100' },
    [DatasetType.VIDEO]: { icon: Video, name: '视频数据', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    [DatasetType.AUDIO]: { icon: Music, name: '音频数据', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    [DatasetType.STRUCTURED]: { icon: Database, name: '结构化数据', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  };

  // Tab配置
  const tabs = [
    { id: 'readme', name: '数据集详情README', icon: FileText },
    { id: 'files', name: '数据集文件列表', icon: Folder },
  ];

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

  const TypeIcon = datasetTypeConfig[currentDataset.type as DatasetType]?.icon || Database;
  const typeConfig = datasetTypeConfig[currentDataset.type as DatasetType];

  // 预览数据集功能
  const handlePreviewDataset = async () => {
    setPreviewLoading(true);
    try {
      // 调用预览API获取数据
      const response = await datasetApi.GetDatasetPreview(Number(currentDataset.id));
      setPreviewData(response.data);
      setShowPreviewModal(true);
      
      console.log('预览数据集:', currentDataset.name);
    } catch (error: any) {
      console.error('预览数据集失败:', error);
      // 如果API失败，仍然显示预览弹窗，但使用模拟数据
      setPreviewData(null);
      setShowPreviewModal(true);
      console.warn('使用模拟预览数据');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 下载数据集功能
  const handleDownloadDataset = async () => {
    setDownloadLoading(true);
    try {
      console.log('开始下载数据集:', currentDataset.name, 'ID:', currentDataset.id);
      
      // 调用下载API
      const blob = await datasetApi.DownloadDataset(Number(currentDataset.id));
      
      console.log('下载响应blob:', blob, 'size:', blob.size, 'type:', blob.type);
      
      // 检查blob是否有效
      if (!blob || blob.size === 0) {
        throw new Error('下载的文件为空或无效');
      }
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // 生成文件名，确保安全的文件名
      const safeFileName = `${(currentDataset.name || 'dataset').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_${currentDataset.id}.zip`;
      link.download = safeFileName;
      
      // 添加到DOM并触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理资源
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      
      console.log('数据集下载成功:', currentDataset.name, '文件名:', safeFileName);
      
      // 显示成功提示
      showSuccess('下载成功', `数据集"${currentDataset.name}"下载成功！\n文件名: ${safeFileName}`);
    } catch (error: any) {
      console.error('下载数据集失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = '下载失败，请稍后重试';
      
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 404:
            errorMessage = '数据集不存在或已被删除';
            break;
          case 403:
            errorMessage = '没有权限下载此数据集';
            break;
          case 500:
            errorMessage = '服务器错误，请联系管理员';
            break;
          default:
            errorMessage = `服务器返回错误 (${status}): ${error.response.data?.message || error.message}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError('下载失败', errorMessage);
    } finally {
      setDownloadLoading(false);
    }
  };

  // 编辑数据集功能
  const handleEditDataset = () => {
    setShowEditModal(true);
  };

  // 编辑成功回调
  const handleEditSuccess = (updatedDataset: Dataset) => {
    setCurrentDataset(updatedDataset);
    setShowEditModal(false);
    showSuccess('编辑成功', '数据集信息已更新');
    if (onEdit) {
      onEdit(updatedDataset);
    }
  };

  // 分享数据集功能
  const handleShareDataset = () => {
    setShowShareModal(true);
  };

  // 复制分享链接
  const handleCopyShareLink = async () => {
    const shareUrl = `${window.location.origin}/dataset/${currentDataset.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      showSuccess('复制成功', '分享链接已复制到剪贴板');
    } catch (error) {
      showError('复制失败', '无法复制到剪贴板，请手动复制');
    }
  };

  // 数据集设置功能
  const handleDatasetSettings = () => {
    setShowSettingsModal(true);
  };

  // 更新权限设置
  const handleUpdatePermission = async (permission: DatasetPermission) => {
    try {
      const response = await datasetApi.UpdateDataset(Number(currentDataset.id), { permission });
      setCurrentDataset({ ...currentDataset, permission });
      showSuccess('设置更新', '数据集权限设置已更新');
    } catch (error: any) {
      showError('更新失败', error.message || '权限设置更新失败');
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据集详情</h1>
            <p className="text-sm text-gray-500">查看和管理数据集信息</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleEditDataset}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            编辑
          </button>
          <button 
            onClick={handleShareDataset}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            分享
          </button>
          <button 
            onClick={handleDatasetSettings}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 数据集概览卡片 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start space-x-6">
          {/* 数据集图片/图标 */}
          <div className={`flex-shrink-0 w-32 h-32 ${typeConfig?.bgColor || 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
            <TypeIcon className={`w-16 h-16 ${typeConfig?.color || 'text-gray-600'}`} />
          </div>
          
          {/* 数据集信息 */}
          <div className="flex-1 min-w-0">
            {/* 数据集名称 */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentDataset.name}</h1>
            
            {/* 数据集标签 */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeConfig?.bgColor || 'bg-gray-100'} ${typeConfig?.color || 'text-gray-600'}`}>
                  {typeConfig?.name || currentDataset.type}
                </span>
                {currentDataset.tags && currentDataset.tags.split(',').map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
            
            {/* 数据集描述 */}
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              {currentDataset.description || '暂无描述'}
            </p>

            {/* 统计信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">数据大小</p>
                  <p className="font-semibold">{FormatFileSize(currentDataset.size || 0)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <File className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">文件数量</p>
                  <p className="font-semibold">{currentDataset.fileCount || 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">创建时间</p>
                  <p className="font-semibold">{FormatTime(currentDataset.createTime)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">创建者</p>
                  <p className="font-semibold">{currentDataset.creator || '未知'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab导航和内容 */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tab导航 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab内容 */}
        <div className="p-6">
          {activeTab === 'readme' && (
            <div className="space-y-6">
              {/* README内容 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">数据集详情</h2>
                {currentDataset.description ? (
                  <div className="prose max-w-none">
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-6 rounded-lg">
                      {currentDataset.description}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无详情</h3>
                    <p className="text-gray-500">该数据集还没有添加详细描述</p>
                  </div>
                )}
              </div>

              {/* 元数据 */}
              {currentDataset.metadata && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">元数据</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
                      {JSON.stringify(JSON.parse(currentDataset.metadata), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* 版本信息 */}
              {currentDataset.version && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">版本信息</h2>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">版本号</span>
                      <span className="text-sm font-medium">{currentDataset.version}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">最后更新</span>
                      <span className="text-sm font-medium">{FormatTime(currentDataset.updateTime)}</span>
                    </div>
                    {currentDataset.updater && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">更新者</span>
                        <span className="text-sm font-medium">{currentDataset.updater}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 存储信息 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">存储信息</h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {currentDataset.storagePath && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">存储路径</span>
                      <span className="text-sm font-medium font-mono">{currentDataset.storagePath}</span>
                    </div>
                  )}
                  {currentDataset.bucketName && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">存储桶</span>
                      <span className="text-sm font-medium">{currentDataset.bucketName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">权限设置</span>
                    <span className="text-sm font-medium">
                      {currentDataset.permission === 'PUBLIC' ? '公开' : 
                       currentDataset.permission === 'PRIVATE' ? '私有' : 
                       currentDataset.permission === 'TEAM' ? '团队' : '未知'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">操作</h2>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handlePreviewDataset}
                    disabled={previewLoading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {previewLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {previewLoading ? '预览中...' : '预览数据集'}
                  </button>
                  <button 
                    onClick={handleDownloadDataset}
                    disabled={downloadLoading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {downloadLoading ? '下载中...' : '下载数据集'}
                  </button>
                  <button
                    onClick={handleEditDataset}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    编辑数据集
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'files' && (
            <DatasetFiles dataset={currentDataset} />
          )}
        </div>
      </div>

      {/* 编辑弹窗 */}
      <DatasetForm
        visible={showEditModal}
        onCancel={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        editingDataset={currentDataset}
      />

      {/* 分享弹窗 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">分享数据集</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分享链接
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/dataset/${currentDataset.id}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyShareLink}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {copySuccess ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前权限设置
                </label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  {currentDataset.permission === 'PUBLIC' ? (
                    <>
                      <Globe className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">公开 - 任何人都可以访问</span>
                    </>
                  ) : currentDataset.permission === 'TEAM' ? (
                    <>
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600">团队 - 仅团队成员可访问</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-600">私有 - 仅您可以访问</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>• 复制链接后可以分享给其他用户</p>
                <p>• 访问权限受数据集权限设置控制</p>
                <p>• 可在设置中修改权限</p>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setShowSettingsModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  权限设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 设置弹窗 */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">数据集设置</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">基本信息</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">数据集ID</span>
                    <span className="text-sm font-medium">{currentDataset.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">创建时间</span>
                    <span className="text-sm font-medium">{FormatTime(currentDataset.createTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">最后更新</span>
                    <span className="text-sm font-medium">{FormatTime(currentDataset.updateTime)}</span>
                  </div>
                </div>
              </div>

              {/* 权限设置 */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">权限设置</h4>
                <div className="space-y-3">
                  {[
                    { 
                      value: DatasetPermission.PRIVATE, 
                      label: '私有', 
                      description: '仅您可以访问和编辑此数据集',
                      icon: Lock,
                      color: 'text-orange-600 bg-orange-50 border-orange-200'
                    },
                    { 
                      value: DatasetPermission.TEAM, 
                      label: '团队', 
                      description: '您的团队成员可以访问此数据集',
                      icon: Users,
                      color: 'text-blue-600 bg-blue-50 border-blue-200'
                    },
                    { 
                      value: DatasetPermission.PUBLIC, 
                      label: '公开', 
                      description: '所有用户都可以查看此数据集',
                      icon: Globe,
                      color: 'text-green-600 bg-green-50 border-green-200'
                    },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentDataset.permission === option.value;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleUpdatePermission(option.value)}
                        className={`w-full text-left p-4 border rounded-lg transition-colors ${
                          isSelected
                            ? option.color
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-current' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-current" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 高级设置 */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">高级设置</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">下载权限</div>
                      <div className="text-sm text-gray-600">是否允许用户下载数据集</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">评论权限</div>
                      <div className="text-sm text-gray-600">是否允许用户评论数据集</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  编辑数据集
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 预览弹窗 */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                数据集预览 - {currentDataset.name}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* 数据集信息概览 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">基本信息</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">类型:</span>
                      <span className="ml-2 font-medium">{typeConfig?.name || currentDataset.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">文件数:</span>
                      <span className="ml-2 font-medium">{currentDataset.fileCount || 0} 个</span>
                    </div>
                    <div>
                      <span className="text-gray-500">大小:</span>
                      <span className="ml-2 font-medium">{FormatFileSize(currentDataset.size || 0)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">格式:</span>
                      <span className="ml-2 font-medium">{currentDataset.format || '未指定'}</span>
                    </div>
                  </div>
                </div>

                {/* 数据样本预览 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">数据样本</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    {currentDataset.type === 'TEXT' && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">文本数据样本:</div>
                        <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                          这是一个文本数据集的示例内容...<br/>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit.<br/>
                          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </div>
                      </div>
                    )}
                    
                    {currentDataset.type === 'IMAGE' && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">图像数据样本:</div>
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="bg-gray-200 h-24 rounded flex items-center justify-center">
                              <span className="text-gray-500 text-xs">示例图片 {i}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {currentDataset.type === 'STRUCTURED' && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">结构化数据样本:</div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="p-2 text-left">ID</th>
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Value</th>
                                <th className="p-2 text-left">Category</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-t">
                                <td className="p-2">001</td>
                                <td className="p-2">Sample Data 1</td>
                                <td className="p-2">123.45</td>
                                <td className="p-2">Type A</td>
                              </tr>
                              <tr className="border-t">
                                <td className="p-2">002</td>
                                <td className="p-2">Sample Data 2</td>
                                <td className="p-2">678.90</td>
                                <td className="p-2">Type B</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {(currentDataset.type === 'VIDEO' || currentDataset.type === 'AUDIO') && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">{currentDataset.type === 'VIDEO' ? '视频' : '音频'}数据样本:</div>
                        <div className="bg-gray-100 p-8 rounded text-center">
                          <div className="text-gray-500">
                            {currentDataset.type === 'VIDEO' ? '🎬' : '🎵'} 媒体文件预览
                          </div>
                          <div className="text-sm text-gray-400 mt-2">
                            点击下载查看完整内容
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 统计信息 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">统计信息</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{currentDataset.fileCount || 0}</div>
                      <div className="text-sm text-blue-600">总文件数</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{FormatFileSize(currentDataset.size || 0)}</div>
                      <div className="text-sm text-green-600">总大小</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleDownloadDataset();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  下载数据集
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetDetailView; 