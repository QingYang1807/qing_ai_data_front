'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  Eye,
  File,
  Image,
  Video,
  Music,
  FileText,
  Database,
  Calendar,
  HardDrive,
  Users,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { datasetApi } from '@/api/dataset';
import { Dataset, DatasetFile, DatasetType, DatasetStatus, FileStatus } from '@/types';

/**
 * 数据集详情页面
 */
export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = Number(params.id);

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [files, setFiles] = useState<DatasetFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
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

  // 文件状态配置
  const fileStatusConfig = {
    [FileStatus.UPLOADING]: { label: '上传中', color: 'bg-yellow-100 text-yellow-800' },
    [FileStatus.COMPLETED]: { label: '已完成', color: 'bg-green-100 text-green-800' },
    [FileStatus.PROCESSING]: { label: '处理中', color: 'bg-blue-100 text-blue-800' },
    [FileStatus.ERROR]: { label: '错误', color: 'bg-red-100 text-red-800' },
    [FileStatus.DELETED]: { label: '已删除', color: 'bg-gray-100 text-gray-800' },
  };

  // 加载数据集详情
  const LoadDataset = async () => {
    setLoading(true);
    try {
      const response = await datasetApi.GetDataset(datasetId);
      setDataset(response.data);
    } catch (error) {
      console.error('Failed to load dataset:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载文件列表
  const LoadFiles = async () => {
    setFilesLoading(true);
    try {
      const response = await datasetApi.GetDatasetFiles(datasetId, {
        page: currentPage,
        size: pageSize,
      });
      setFiles(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setFilesLoading(false);
    }
  };

  // 下载文件
  const HandleDownloadFile = async (fileId: number) => {
    try {
      const response = await datasetApi.GetFileDownloadUrl(fileId);
      window.open(response.data.downloadUrl, '_blank');
    } catch (error) {
      console.error('Failed to download file:', error);
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

  // 获取文件图标
  const GetFileIcon = (contentType?: string) => {
    if (!contentType) return File;
    
    if (contentType.startsWith('image/')) return Image;
    if (contentType.startsWith('video/')) return Video;
    if (contentType.startsWith('audio/')) return Music;
    if (contentType.includes('text/') || contentType.includes('json') || contentType.includes('csv')) return FileText;
    
    return File;
  };

  // 页面加载时获取数据
  useEffect(() => {
    if (datasetId) {
      LoadDataset();
      LoadFiles();
    }
  }, [datasetId]);

  // 分页变化时重新加载文件
  useEffect(() => {
    if (datasetId) {
      LoadFiles();
    }
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">数据集不存在</h3>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  const TypeIcon = datasetTypeConfig[dataset.type as DatasetType]?.icon || Database;
  const typeConfig = datasetTypeConfig[dataset.type as DatasetType];
  const statusConfig_ = statusConfig[dataset.status as DatasetStatus];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
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
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                上传文件
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 数据集信息卡片 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Users className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">创建者</p>
                <p className="text-lg font-semibold">{dataset.creator || '未知'}</p>
              </div>
            </div>
          </div>
          
          {dataset.description && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-2">描述</h3>
              <p className="text-gray-700">{dataset.description}</p>
            </div>
          )}

          {dataset.tags && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">标签</h3>
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

        {/* 文件列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">文件列表</h2>
          </div>
          
          {filesLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16">
              <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文件</h3>
              <p className="text-gray-500 mb-6">开始上传文件到这个数据集</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                上传文件
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        文件名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        大小
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        上传时间
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map((file) => {
                      const FileIcon = GetFileIcon(file.contentType);
                      const fileStatusConfig_ = fileStatusConfig[file.status as FileStatus];

                      return (
                        <tr key={file.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FileIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {file.originalName || file.fileName}
                                </div>
                                {file.originalName && file.fileName !== file.originalName && (
                                  <div className="text-xs text-gray-500">{file.fileName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {file.contentType || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {FormatFileSize(file.fileSize || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${fileStatusConfig_?.color || 'bg-gray-100 text-gray-800'}`}>
                              {fileStatusConfig_?.label || '未知'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {FormatTime(file.createTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {file.previewUrl && (
                                <button
                                  onClick={() => window.open(file.previewUrl, '_blank')}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="预览"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => file.id && HandleDownloadFile(file.id)}
                                className="text-green-600 hover:text-green-900"
                                title="下载"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {total > pageSize && (
                <div className="px-6 py-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, total)} 项，共 {total} 项
                    </div>
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
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 文件上传模态框 */}
      {showUploadModal && (
        <FileUploadModal
          visible={showUploadModal}
          onCancel={() => setShowUploadModal(false)}
          dataset={dataset}
          onSuccess={() => {
            LoadFiles();
            LoadDataset();
            setShowUploadModal(false);
          }}
        />
      )}
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
  dataset: Dataset;
  onSuccess: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const HandleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const HandleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const HandleUpload = async () => {
    if (!dataset.id || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        await datasetApi.UploadFile(dataset.id, file);
      }
      onSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const FormatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            上传文件到 &ldquo;{dataset.name}&rdquo;
          </h3>

          {/* 文件选择区域 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              选择文件上传
            </div>
            <p className="text-gray-500 mb-4">
              支持多文件上传，点击选择文件
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
                          {FormatFileSize(file.size)}
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