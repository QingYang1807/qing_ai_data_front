'use client';

import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  GitCompare, 
  Download, 
  Eye, 
  Settings, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  FileText,
  HardDrive,
  Tag,
  User,
  Clock,
  Star,
  History,
  RotateCcw
} from 'lucide-react';
import { Dataset, DatasetVersion, VersionComparison } from '@/types';
import { datasetApi } from '@/api/dataset';
import { useToast } from '@/hooks/useToast';

interface DatasetVersionManagerProps {
  dataset: Dataset;
  onBack?: () => void;
  onVersionSelect?: (version: DatasetVersion) => void;
}

export default function DatasetVersionManager({
  dataset,
  onBack,
  onVersionSelect
}: DatasetVersionManagerProps) {
  const [versions, setVersions] = useState<DatasetVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<DatasetVersion | null>(null);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareVersion1, setCompareVersion1] = useState<string>('');
  const [compareVersion2, setCompareVersion2] = useState<string>('');
  const [newVersion, setNewVersion] = useState({
    version: '',
    versionName: '',
    description: '',
    changeLog: '',
    isStable: false,
    tags: [] as string[]
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadVersions();
  }, [dataset.id]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const response = await datasetApi.GetDatasetVersions(Number(dataset.id));
      setVersions(response.data || []);
      
      // 设置最新版本为默认选中
      const latestVersion = response.data?.find(v => v.isLatest);
      if (latestVersion) {
        setSelectedVersion(latestVersion);
      }
    } catch (error) {
      console.error('加载版本列表失败:', error);
      showError('加载失败', '无法加载数据集版本列表');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    try {
      if (!newVersion.version || !newVersion.versionName) {
        showError('创建失败', '版本号和版本名称不能为空');
        return;
      }

      const response = await datasetApi.CreateDatasetVersion(Number(dataset.id), {
        ...newVersion,
        tags: newVersion.tags.filter(tag => tag.trim())
      });

      showSuccess('创建成功', '数据集版本已创建');
      setShowCreateModal(false);
      setNewVersion({
        version: '',
        versionName: '',
        description: '',
        changeLog: '',
        isStable: false,
        tags: []
      });
      loadVersions();
    } catch (error: any) {
      showError('创建失败', error.message || '无法创建数据集版本');
    }
  };

  const handleSetLatest = async (versionId: string) => {
    try {
      await datasetApi.SetLatestVersion(Number(dataset.id), versionId);
      showSuccess('设置成功', '已设置为最新版本');
      loadVersions();
    } catch (error: any) {
      showError('设置失败', error.message || '无法设置最新版本');
    }
  };

  const handleSetStable = async (versionId: string) => {
    try {
      await datasetApi.SetStableVersion(Number(dataset.id), versionId);
      showSuccess('设置成功', '已设置为稳定版本');
      loadVersions();
    } catch (error: any) {
      showError('设置失败', error.message || '无法设置稳定版本');
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm('确定要删除这个版本吗？此操作不可撤销。')) {
      return;
    }

    try {
      await datasetApi.DeleteDatasetVersion(Number(dataset.id), versionId);
      showSuccess('删除成功', '数据集版本已删除');
      loadVersions();
    } catch (error: any) {
      showError('删除失败', error.message || '无法删除数据集版本');
    }
  };

  const handleCompareVersions = async () => {
    if (!compareVersion1 || !compareVersion2) {
      showError('比较失败', '请选择两个版本进行比较');
      return;
    }

    try {
      const response = await datasetApi.CompareVersions(
        Number(dataset.id), 
        compareVersion1, 
        compareVersion2
      );
      setComparison(response.data);
      setShowCompareModal(true);
    } catch (error: any) {
      showError('比较失败', error.message || '无法比较版本');
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm('确定要回滚到这个版本吗？当前版本将被覆盖。')) {
      return;
    }

    try {
      await datasetApi.RollbackToVersion(Number(dataset.id), versionId);
      showSuccess('回滚成功', '已回滚到指定版本');
      loadVersions();
    } catch (error: any) {
      showError('回滚失败', error.message || '无法回滚版本');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('zh-CN');
  };

  const getVersionStatus = (version: DatasetVersion) => {
    if (version.isLatest && version.isStable) {
      return { icon: Star, color: 'text-yellow-600', label: '最新稳定版' };
    } else if (version.isLatest) {
      return { icon: GitCommit, color: 'text-blue-600', label: '最新版本' };
    } else if (version.isStable) {
      return { icon: CheckCircle, color: 'text-green-600', label: '稳定版本' };
    } else {
      return { icon: GitBranch, color: 'text-gray-600', label: '普通版本' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">加载版本管理中...</p>
        </div>
      </div>
    );
  }

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
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">版本管理</h1>
            <p className="text-sm text-gray-500">管理数据集版本和变更历史</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            创建版本
          </button>
          <button
            onClick={() => setShowCompareModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <GitCompare className="h-4 w-4 mr-2" />
            版本比较
          </button>
        </div>
      </div>

      {/* 版本统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总版本数</p>
              <p className="text-2xl font-bold text-gray-900">{versions.length}</p>
            </div>
            <GitBranch className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">最新版本</p>
              <p className="text-2xl font-bold text-blue-900">
                {versions.find(v => v.isLatest)?.version || 'v1.0.0'}
              </p>
            </div>
            <GitCommit className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">稳定版本</p>
              <p className="text-2xl font-bold text-green-900">
                {versions.find(v => v.isStable)?.version || '无'}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">最新更新</p>
              <p className="text-2xl font-bold text-purple-900">
                {versions.length > 0 ? formatTime(versions[0].createdTime).split(' ')[0] : '无'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 版本列表 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">版本历史</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {versions.map((version) => {
            const status = getVersionStatus(version);
            const StatusIcon = status.icon;
            
            return (
              <div key={version.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {version.versionName} ({version.version})
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color} bg-opacity-10`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {status.label}
                      </span>
                      {version.processingType && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                          {version.processingType}
                        </span>
                      )}
                    </div>
                    
                    {version.description && (
                      <p className="text-gray-600 mb-3">{version.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {version.fileCount} 个文件
                      </span>
                      <span className="flex items-center">
                        <HardDrive className="w-4 h-4 mr-1" />
                        {formatFileSize(version.totalSize)}
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {version.createdBy}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatTime(version.createdTime)}
                      </span>
                    </div>
                    
                    {version.tags && version.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {version.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {version.changeLog && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">变更日志</h4>
                        <p className="text-sm text-gray-600">{version.changeLog}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    {!version.isLatest && (
                      <button
                        onClick={() => handleSetLatest(version.id)}
                        className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                        title="设为最新版本"
                      >
                        <GitCommit className="w-4 h-4 mr-1" />
                        设为最新
                      </button>
                    )}
                    
                    {!version.isStable && (
                      <button
                        onClick={() => handleSetStable(version.id)}
                        className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        title="设为稳定版本"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        设为稳定
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRollback(version.id)}
                      className="inline-flex items-center px-3 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                      title="回滚到此版本"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      回滚
                    </button>
                    
                    <button
                      onClick={() => onVersionSelect?.(version)}
                      className="inline-flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                      title="查看此版本"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      查看
                    </button>
                    
                    <button
                      onClick={() => handleDeleteVersion(version.id)}
                      className="inline-flex items-center px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      title="删除此版本"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 创建版本弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">创建新版本</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">版本号</label>
                  <input
                    type="text"
                    value={newVersion.version}
                    onChange={(e) => setNewVersion(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="如: v1.1.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">版本名称</label>
                  <input
                    type="text"
                    value={newVersion.versionName}
                    onChange={(e) => setNewVersion(prev => ({ ...prev, versionName: e.target.value }))}
                    placeholder="如: 数据清洗优化版"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">版本描述</label>
                <textarea
                  value={newVersion.description}
                  onChange={(e) => setNewVersion(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="描述此版本的主要特性..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">变更日志</label>
                <textarea
                  value={newVersion.changeLog}
                  onChange={(e) => setNewVersion(prev => ({ ...prev, changeLog: e.target.value }))}
                  placeholder="详细记录此版本的变更内容..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                <input
                  type="text"
                  value={newVersion.tags.join(', ')}
                  onChange={(e) => setNewVersion(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  }))}
                  placeholder="用逗号分隔多个标签，如: 优化, 稳定, 生产环境"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isStable"
                  checked={newVersion.isStable}
                  onChange={(e) => setNewVersion(prev => ({ ...prev, isStable: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isStable" className="ml-2 block text-sm text-gray-900">
                  标记为稳定版本
                </label>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateVersion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  创建版本
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 版本比较弹窗 */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">版本比较</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择版本 1</label>
                  <select
                    value={compareVersion1}
                    onChange={(e) => setCompareVersion1(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择版本</option>
                    {versions.map(version => (
                      <option key={version.id} value={version.id}>
                        {version.versionName} ({version.version})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择版本 2</label>
                  <select
                    value={compareVersion2}
                    onChange={(e) => setCompareVersion2(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择版本</option>
                    {versions.map(version => (
                      <option key={version.id} value={version.id}>
                        {version.versionName} ({version.version})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleCompareVersions}
                  disabled={!compareVersion1 || !compareVersion2}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GitCompare className="w-5 h-5 mr-2 inline" />
                  开始比较
                </button>
              </div>
              
              {comparison && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">比较结果</h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-3">{comparison.version1.versionName}</h5>
                      <div className="space-y-2 text-sm">
                        <div>文件数: {comparison.version1.fileCount}</div>
                        <div>大小: {formatFileSize(comparison.version1.totalSize)}</div>
                        <div>创建时间: {formatTime(comparison.version1.createdTime)}</div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-medium text-green-900 mb-3">{comparison.version2.versionName}</h5>
                      <div className="space-y-2 text-sm">
                        <div>文件数: {comparison.version2.fileCount}</div>
                        <div>大小: {formatFileSize(comparison.version2.totalSize)}</div>
                        <div>创建时间: {formatTime(comparison.version2.createdTime)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">差异统计</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">文件数变化:</span>
                        <span className={`ml-2 font-medium ${comparison.differences.fileCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {comparison.differences.fileCount > 0 ? '+' : ''}{comparison.differences.fileCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">大小变化:</span>
                        <span className={`ml-2 font-medium ${comparison.differences.sizeDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {comparison.differences.sizeDifference > 0 ? '+' : ''}{formatFileSize(comparison.differences.sizeDifference)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">新增文件:</span>
                        <span className="ml-2 font-medium text-green-600">{comparison.differences.newFiles.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowCompareModal(false);
                    setComparison(null);
                    setCompareVersion1('');
                    setCompareVersion2('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 