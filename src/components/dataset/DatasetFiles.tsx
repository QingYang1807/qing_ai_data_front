'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload,
  Download,
  Trash2,
  Eye,
  File,
  Image,
  Video,
  Music,
  FileText,
  MoreHorizontal,
  Search,
  Filter
} from 'lucide-react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import { Dataset, DatasetFile, FileStatus } from '@/types';

interface DatasetFilesProps {
  dataset: Dataset;
}

/**
 * 数据集文件列表组件
 */
export default function DatasetFiles({ dataset }: DatasetFilesProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

  // 从store获取文件状态
  const {
    currentDatasetFiles: files,
    filesLoading: loading,
    filesTotal: total,
    filesCurrentPage: currentPage,
    filesPageSize: pageSize,
    fetchDatasetFiles,
    deleteFile,
    uploadFiles,
    getFileDownloadUrl
  } = useDatasetStore();

  // 文件状态配置
  const fileStatusConfig = {
    [FileStatus.UPLOADING]: { label: '上传中', color: 'bg-yellow-100 text-yellow-800' },
    [FileStatus.COMPLETED]: { label: '已完成', color: 'bg-green-100 text-green-800' },
    [FileStatus.PROCESSING]: { label: '处理中', color: 'bg-blue-100 text-blue-800' },
    [FileStatus.ERROR]: { label: '错误', color: 'bg-red-100 text-red-800' },
    [FileStatus.DELETED]: { label: '已删除', color: 'bg-gray-100 text-gray-800' },
  };

  // 加载文件列表
  const LoadFiles = async () => {
    try {
      await fetchDatasetFiles(dataset.id!);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  // 下载文件
  const HandleDownloadFile = async (fileId: number) => {
    try {
      const downloadUrl = await getFileDownloadUrl(fileId);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  // 删除文件
  const HandleDeleteFile = async (fileId: number) => {
    if (!confirm('确定要删除这个文件吗？')) return;

    try {
      await deleteFile(fileId);
      LoadFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  // 批量删除文件
  const HandleBatchDelete = async () => {
    if (selectedFiles.length === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedFiles.length} 个文件吗？`)) return;

    try {
      for (const fileId of selectedFiles) {
        await deleteFile(fileId);
      }
      setSelectedFiles([]);
      LoadFiles();
    } catch (error) {
      console.error('Failed to batch delete files:', error);
    }
  };

  // 选择/取消选择文件
  const HandleSelectFile = (fileId: number) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // 全选/取消全选
  const HandleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id!));
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

  // 页面加载时获取文件
  useEffect(() => {
    LoadFiles();
  }, [dataset.id, currentPage]);

  // 过滤文件
  const filteredFiles = files.filter(file => 
    !searchKeyword || 
    file.originalName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    file.fileName?.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">文件管理</h2>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            上传文件
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文件..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </button>
        </div>

        {/* 批量操作 */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                已选择 {selectedFiles.length} 个文件
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={HandleBatchDelete}
                  className="flex items-center px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  批量删除
                </button>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  取消选择
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 文件列表 */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-16">
            <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchKeyword ? '没有找到匹配的文件' : '暂无文件'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchKeyword ? '尝试调整搜索关键词' : '开始上传文件到这个数据集'}
            </p>
            {!searchKeyword && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                上传文件
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedFiles.length === files.length && files.length > 0}
                        onChange={HandleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
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
                  {filteredFiles.map((file) => {
                    const FileIcon = GetFileIcon(file.contentType);
                    const fileStatusConfig_ = fileStatusConfig[file.status as FileStatus];
                    const isSelected = selectedFiles.includes(file.id!);

                    return (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => HandleSelectFile(file.id!)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
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
                            <button
                              onClick={() => file.id && HandleDeleteFile(file.id)}
                              className="text-red-600 hover:text-red-900"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
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
                      onClick={() => fetchDatasetFiles(dataset.id!, { page: Math.max(1, currentPage - 1) })}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      上一页
                    </button>
                    
                    <span className="text-sm text-gray-700">
                      第 {currentPage} 页，共 {Math.ceil(total / pageSize)} 页
                    </span>
                    
                    <button
                      onClick={() => fetchDatasetFiles(dataset.id!, { page: Math.min(Math.ceil(total / pageSize), currentPage + 1) })}
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

      {/* 文件上传模态框 */}
      {showUploadModal && (
        <FileUploadModal
          visible={showUploadModal}
          onCancel={() => setShowUploadModal(false)}
          dataset={dataset}
          onSuccess={() => {
            LoadFiles();
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
      // 使用store中的uploadFiles方法
      const { uploadFiles } = useDatasetStore.getState();
      await uploadFiles(dataset.id, files);
      onSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('文件上传失败，请重试');
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