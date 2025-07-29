'use client';

import React from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Tag, 
  Database,
  HardDrive,
  File,
  Eye,
  Download,
  Share2
} from 'lucide-react';
import { Dataset, DatasetType, DatasetStatus } from '@/types';

interface DatasetDetailProps {
  dataset: Dataset;
}

/**
 * 数据集详情组件
 */
export default function DatasetDetail({ dataset }: DatasetDetailProps) {
  // 数据集类型配置
  const datasetTypeConfig = {
    [DatasetType.TEXT]: { icon: FileText, name: '文本数据', color: 'text-blue-600' },
    [DatasetType.IMAGE]: { icon: FileText, name: '图像数据', color: 'text-green-600' },
    [DatasetType.VIDEO]: { icon: FileText, name: '视频数据', color: 'text-purple-600' },
    [DatasetType.AUDIO]: { icon: FileText, name: '音频数据', color: 'text-orange-600' },
    [DatasetType.STRUCTURED]: { icon: Database, name: '结构化数据', color: 'text-indigo-600' },
  };

  // 状态配置
  const statusConfig = {
    [DatasetStatus.CREATING]: { label: '创建中', color: 'bg-yellow-100 text-yellow-800' },
    [DatasetStatus.READY]: { label: '就绪', color: 'bg-green-100 text-green-800' },
    [DatasetStatus.PROCESSING]: { label: '处理中', color: 'bg-blue-100 text-blue-800' },
    [DatasetStatus.ERROR]: { label: '错误', color: 'bg-red-100 text-red-800' },
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

  const TypeIcon = datasetTypeConfig[dataset.type as DatasetType]?.icon || Database;
  const typeConfig = datasetTypeConfig[dataset.type as DatasetType];
  const statusConfig_ = statusConfig[dataset.status as DatasetStatus];

  return (
    <div className="space-y-6">
      {/* 数据集基本信息 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <TypeIcon className={`h-8 w-8 mr-3 ${typeConfig?.color || 'text-gray-600'}`} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{dataset.name}</h1>
              <p className="text-sm text-gray-500">{typeConfig?.name || '未知类型'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm ${statusConfig_?.color || 'bg-gray-100 text-gray-800'}`}>
              {statusConfig_?.label || '未知状态'}
            </span>
            <button className="flex items-center px-3 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="h-4 w-4 mr-1" />
              分享
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="flex items-center">
            <HardDrive className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">数据大小</p>
              <p className="text-lg font-semibold">{FormatFileSize(dataset.size || 0)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <File className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">文件数量</p>
              <p className="text-lg font-semibold">{dataset.fileCount || 0}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">创建时间</p>
              <p className="text-lg font-semibold">{FormatTime(dataset.createTime)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">创建者</p>
              <p className="text-lg font-semibold">{dataset.creator || '未知'}</p>
            </div>
          </div>
        </div>

        {/* 标签 */}
        {dataset.tags && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              标签
            </h3>
            <div className="flex flex-wrap gap-2">
              {dataset.tags.split(',').map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 数据集描述 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          数据集详情
        </h2>
        
        {dataset.description ? (
          <div className="prose max-w-none">
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {dataset.description}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无详情</h3>
            <p className="text-gray-500">该数据集还没有添加详细描述</p>
          </div>
        )}
      </div>

      {/* 数据集元数据 */}
      {dataset.metadata && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">元数据</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(JSON.parse(dataset.metadata), null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* 数据集版本信息 */}
      {dataset.version && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">版本信息</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">版本号</span>
              <span className="text-sm font-medium">{dataset.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">最后更新</span>
              <span className="text-sm font-medium">{FormatTime(dataset.updateTime)}</span>
            </div>
            {dataset.updater && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">更新者</span>
                <span className="text-sm font-medium">{dataset.updater}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 存储信息 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">存储信息</h2>
        <div className="space-y-3">
          {dataset.storagePath && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">存储路径</span>
              <span className="text-sm font-medium font-mono">{dataset.storagePath}</span>
            </div>
          )}
          {dataset.bucketName && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">存储桶</span>
              <span className="text-sm font-medium">{dataset.bucketName}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">权限设置</span>
            <span className="text-sm font-medium">
              {dataset.permission === 'PUBLIC' ? '公开' : 
               dataset.permission === 'PRIVATE' ? '私有' : 
               dataset.permission === 'TEAM' ? '团队' : '未知'}
            </span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">操作</h2>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Eye className="h-4 w-4 mr-2" />
            预览数据集
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            下载数据集
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="h-4 w-4 mr-2" />
            分享数据集
          </button>
        </div>
      </div>
    </div>
  );
} 