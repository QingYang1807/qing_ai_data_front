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
  Filter,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileCode,
  FileSpreadsheet,
  FileText as FileWord,
  Presentation
} from 'lucide-react';
import { useDatasetStore } from '@/stores/useDatasetStore';
import { Dataset, DatasetFile, FileStatus } from '@/types';
import { ToastContainer } from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
// 导入文件处理库
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-docker';

// 代码文件扩展名映射 - 共享配置
const CODE_FILE_EXTENSIONS = {
  'js': 'javascript',
  'ts': 'typescript',
  'jsx': 'javascript',
  'tsx': 'typescript',
  'py': 'python',
  'java': 'java',
  'c': 'c',
  'cpp': 'cpp',
  'cs': 'csharp',
  'php': 'php',
  'rb': 'ruby',
  'go': 'go',
  'rs': 'rust',
  'sql': 'sql',
  'html': 'markup',
  'css': 'css',
  'scss': 'css',
  'less': 'css',
  'xml': 'markup',
  'yaml': 'yaml',
  'yml': 'yaml',
  'md': 'markdown',
  'sh': 'bash',
  'dockerfile': 'docker',
  'json': 'json'
} as const;

interface DatasetFilesProps {
  dataset: Dataset;
}

/**
 * 数据集文件列表组件
 */
export default function DatasetFiles({ dataset }: DatasetFilesProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<DatasetFile | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'text' | 'html' | 'image' | 'pdf' | 'office' | 'code' | 'excel' | 'powerpoint'>('text');
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { toasts, showError, removeToast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  
  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {}
  });

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

  // 获取代码语言
  const getCodeLanguage = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    return CODE_FILE_EXTENSIONS[extension as keyof typeof CODE_FILE_EXTENSIONS] || 'text';
  };

  // 预览文件
  const HandlePreviewFile = async (file: DatasetFile, fileIndex?: number) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
    setPreviewLoading(true);
    setPreviewContent(null);
    setPreviewType('text');
    
    if (fileIndex !== undefined) {
      setCurrentFileIndex(fileIndex);
    }

    try {
      // 获取文件下载URL
      const downloadUrl = await getFileDownloadUrl(file.id!);
      
      // 根据文件类型处理预览
      const fileName = file.originalName || file.fileName || '';
      const fileExtension = fileName.toLowerCase().split('.').pop() || '';
      const contentType = file.contentType || '';

      // 代码文件
      if (Object.keys(CODE_FILE_EXTENSIONS).includes(fileExtension)) {
        const response = await fetch(downloadUrl);
        const text = await response.text();
        setPreviewContent(text);
        setPreviewType('code');
      }
      // HTML文件
      else if (fileExtension === 'html' || fileExtension === 'htm' || fileExtension === 'mhtml') {
        const response = await fetch(downloadUrl);
        const html = await response.text();
        setPreviewContent(html);
        setPreviewType('html');
      }
      // PowerPoint文件
      else if (['ppt', 'pptx'].includes(fileExtension)) {
        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        // 将ArrayBuffer转换为base64字符串
        const bytes = new Uint8Array(arrayBuffer);
        const base64 = btoa(String.fromCharCode(...bytes));
        setPreviewContent(base64);
        setPreviewType('powerpoint');
      }
      // Excel文件
      else if (['xls', 'xlsx'].includes(fileExtension)) {
        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // 获取所有工作表信息
        const sheets = workbook.SheetNames.map(name => ({
          name,
          data: XLSX.utils.sheet_to_html(workbook.Sheets[name])
        }));
        
        setPreviewContent(JSON.stringify(sheets));
        setPreviewType('excel');
      }
      // Word文档
      else if (['doc', 'docx'].includes(fileExtension)) {
        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setPreviewContent(result.value);
        setPreviewType('html');
      }
      // 文本类文件
      else if (contentType.startsWith('text/') || 
               ['md', 'markdown', 'txt', 'log', 'csv', 'tsv'].includes(fileExtension)) {
        const response = await fetch(downloadUrl);
        const text = await response.text();
        setPreviewContent(text);
        setPreviewType('text');
      }
      // JSON文件
      else if (contentType.includes('json') || fileExtension === 'json' || fileExtension === 'jsonl') {
        const response = await fetch(downloadUrl);
        const text = await response.text();
        setPreviewContent(text);
        setPreviewType('text');
      }
      // 图片文件
      else if (contentType.startsWith('image/') || 
               ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension)) {
        setPreviewContent(downloadUrl);
        setPreviewType('image');
      }
      // PDF文件
      else if (contentType.includes('pdf') || fileExtension === 'pdf') {
        setPreviewContent(downloadUrl);
        setPreviewType('pdf');
      }
      // 其他文件类型
      else {
        setPreviewContent(null);
        setPreviewType('text');
      }
    } catch (error) {
      console.error('Failed to preview file:', error);
      showError('预览失败', '无法预览此文件，请尝试下载后查看');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 切换到上一个文件
  const HandlePreviousFile = () => {
    if (currentFileIndex > 0) {
      const prevFile = files[currentFileIndex - 1];
      HandlePreviewFile(prevFile, currentFileIndex - 1);
    }
  };

  // 切换到下一个文件
  const HandleNextFile = () => {
    if (currentFileIndex < files.length - 1) {
      const nextFile = files[currentFileIndex + 1];
      HandlePreviewFile(nextFile, currentFileIndex + 1);
    }
  };

  // 关闭预览弹窗
  const HandleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewFile(null);
    setPreviewContent(null);
    setPreviewType('text');
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
    setConfirmDialog({
      visible: true,
      title: '删除文件',
      message: '确定要删除这个文件吗？此操作不可撤销。',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteFile(fileId);
          LoadFiles();
          setConfirmDialog(prev => ({ ...prev, visible: false }));
        } catch (error) {
          console.error('Failed to delete file:', error);
          showError('删除失败', '文件删除失败，请重试');
        }
      }
    });
  };

  // 批量删除文件
  const HandleBatchDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    setConfirmDialog({
      visible: true,
      title: '批量删除文件',
      message: `确定要删除选中的 ${selectedFiles.length} 个文件吗？此操作不可撤销。`,
      type: 'danger',
      onConfirm: async () => {
        try {
          for (const fileId of selectedFiles) {
            await deleteFile(fileId);
          }
          setSelectedFiles([]);
          LoadFiles();
          setConfirmDialog(prev => ({ ...prev, visible: false }));
        } catch (error) {
          console.error('Failed to batch delete files:', error);
          showError('删除失败', '批量删除文件失败，请重试');
        }
      }
    });
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
  const GetFileIcon = (contentType?: string, fileName?: string) => {
    if (!contentType && !fileName) return File;
    
    const fileExtension = fileName?.toLowerCase().split('.').pop() || '';
    
    // 代码文件
    if (Object.keys(CODE_FILE_EXTENSIONS).includes(fileExtension)) {
      return FileCode;
    }
    
    // Office文档
    if (['doc', 'docx'].includes(fileExtension)) return FileWord;
    if (['xls', 'xlsx'].includes(fileExtension)) return FileSpreadsheet;
    if (['ppt', 'pptx'].includes(fileExtension)) return Presentation;
    
    // 其他文件类型
    if (contentType?.startsWith('image/')) return Image;
    if (contentType?.startsWith('video/')) return Video;
    if (contentType?.startsWith('audio/')) return Music;
    if (contentType?.includes('text/') || contentType?.includes('json') || contentType?.includes('csv')) return FileText;
    
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
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
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
                  {filteredFiles.map((file, index) => {
                    const FileIcon = GetFileIcon(file.contentType, file.originalName || file.fileName);
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
                            <button
                              onClick={() => HandlePreviewFile(file, index)}
                              className="text-blue-600 hover:text-blue-900"
                              title="预览"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
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

      {/* 文件预览弹窗 */}
      {showPreviewModal && previewFile && (
        <PreviewModal
          visible={showPreviewModal}
          onCancel={HandleClosePreview}
          file={previewFile}
          content={previewContent}
          loading={previewLoading}
          previewType={previewType}
          onDownload={() => previewFile.id && HandleDownloadFile(previewFile.id)}
          onPrevious={HandlePreviousFile}
          onNext={HandleNextFile}
        />
      )}

      {/* 确认对话框 */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
      />
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
  const [dragActive, setDragActive] = useState(false);
  const { showError } = useToast();

  const HandleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const HandleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const HandleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const HandleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
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
      showError('上传失败', '文件上传失败，请重试');
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
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={HandleDrag}
            onDragLeave={HandleDrag}
            onDragOver={HandleDrag}
            onDrop={HandleDrop}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
              dragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <div className="text-lg font-medium text-gray-900 mb-2">
              {dragActive ? '释放文件以上传' : '拖拽文件到此处或点击选择'}
            </div>
            <p className="text-gray-500 mb-4">
              支持多文件上传，支持拖拽多个文件
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

// 文件预览内容组件
function FilePreviewContent({ 
  file, 
  content, 
  previewType 
}: { 
  file: DatasetFile; 
  content: string; 
  previewType: 'text' | 'html' | 'image' | 'pdf' | 'office' | 'code' | 'excel' | 'powerpoint';
}) {
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [sheets, setSheets] = useState<Array<{name: string, data: string}>>([]);
  const fileName = file.originalName || file.fileName || '';
  const fileExtension = fileName.toLowerCase().split('.').pop() || '';
  const contentType = file.contentType || '';

  // 处理Excel数据
  useEffect(() => {
    if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      try {
        const sheetsData = JSON.parse(content);
        setSheets(sheetsData);
        setCurrentSheetIndex(0);
      } catch (error) {
        console.error('Failed to parse Excel data:', error);
      }
    }
  }, [content, fileExtension]);

  // 获取代码语言
  const getCodeLanguage = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    return CODE_FILE_EXTENSIONS[extension as keyof typeof CODE_FILE_EXTENSIONS] || 'text';
  };

  // Markdown渲染函数
  const renderMarkdown = (content: string) => {
    return content
      // 处理标题
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      // 处理粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // 处理斜体
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // 处理代码块
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto my-3"><code>$1</code></pre>')
      // 处理行内代码
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      // 处理链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // 处理列表
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      // 处理换行
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>')
      // 包装段落
      .replace(/^(.*)$/gm, '<p class="mb-3">$1</p>')
      // 清理空段落
      .replace(/<p class="mb-3"><\/p>/g, '')
      .replace(/<p class="mb-3"><br><\/p>/g, '');
  };

  // JSON格式化函数
  const formatJSON = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  };

  // CSV转表格函数
  const csvToTable = (content: string) => {
    const lines = content.trim().split('\n');
    if (lines.length === 0) return content;

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-900">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 代码高亮函数
  const highlightCode = (code: string, language: string) => {
    try {
      const highlighted = Prism.highlight(code, Prism.languages[language] || Prism.languages.text, language);
      return highlighted;
    } catch {
      return code;
    }
  };

  // 根据预览类型渲染内容
  if (previewType === 'image') {
    return (
      <div className="flex justify-center">
        <img 
          src={content} 
          alt={fileName} 
          className="max-w-full h-auto rounded-lg shadow-lg"
          style={{ maxHeight: '70vh' }}
        />
      </div>
    );
  }

  if (previewType === 'pdf') {
    return (
      <div className="w-full h-full">
        <iframe
          src={content}
          className="w-full h-full min-h-[600px] border-0 rounded-lg"
          title={fileName}
        />
      </div>
    );
  }

  if (previewType === 'powerpoint') {
    try {
      // 将base64转换回ArrayBuffer
      const binaryString = atob(content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // 创建blob URL用于预览
      const blob = new Blob([bytes], { 
        type: fileExtension === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/vnd.ms-powerpoint' 
      });
      const blobUrl = URL.createObjectURL(blob);
      
      return (
        <div className="bg-white rounded-lg">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
            <div className="flex items-center space-x-2">
              <Presentation className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                PowerPoint 预览 - {fileName}
              </span>
            </div>
          </div>
          
          <div className="w-full h-full min-h-[600px]">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(blobUrl)}`}
              className="w-full h-full border-0 rounded-lg"
              title={fileName}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-center py-16">
          <Presentation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            PowerPoint 文件预览失败
          </h3>
          <p className="text-gray-500 mb-6">
            无法预览此 PowerPoint 文件，请尝试下载后查看。
          </p>
        </div>
      );
    }
  }

  if (previewType === 'html' && (fileExtension === 'doc' || fileExtension === 'docx')) {
    return (
      <div className="prose max-w-none">
        <div 
          className="word-content text-gray-700 leading-relaxed bg-white p-6 rounded-lg border"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  if (previewType === 'excel') {
    if (sheets.length === 0) {
      return (
        <div className="text-center py-16">
          <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            加载Excel文件失败
          </h3>
          <p className="text-gray-500">无法解析Excel文件内容</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg">
        {/* Sheet页切换 */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">工作表:</span>
            <div className="flex space-x-1">
              {sheets.map((sheet, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSheetIndex(index)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentSheetIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* 表格内容 */}
        <div className="overflow-x-auto">
          <div 
            dangerouslySetInnerHTML={{ __html: sheets[currentSheetIndex]?.data || '' }} 
            className="min-w-full"
          />
        </div>
      </div>
    );
  }

  if (previewType === 'html' && ['html', 'htm', 'mhtml'].includes(fileExtension)) {
    return (
      <div className="bg-white rounded-lg border">
        <iframe
          srcDoc={content}
          className="w-full h-full min-h-[600px] border-0 rounded-lg"
          title={fileName}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    );
  }

  if (previewType === 'code') {
    const language = getCodeLanguage(fileName);
    const highlightedCode = highlightCode(content, language);
    
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <FileCode className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">{fileName}</span>
            <span className="text-xs text-gray-500">({language})</span>
          </div>
        </div>
        <pre className="p-4 m-0 overflow-x-auto">
          <code 
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    );
  }

  if (previewType === 'text' && (fileExtension === 'md' || fileExtension === 'markdown')) {
    return (
      <div className="prose max-w-none">
        <div 
          className="markdown-content text-gray-700 leading-relaxed bg-white p-6 rounded-lg border"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      </div>
    );
  }

  if (previewType === 'text' && (fileExtension === 'json' || fileExtension === 'jsonl')) {
    const formattedContent = fileExtension === 'json' ? formatJSON(content) : content;
    const highlightedCode = highlightCode(formattedContent, 'json');
    
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <FileCode className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">{fileName}</span>
            <span className="text-xs text-gray-500">(json)</span>
          </div>
        </div>
        <pre className="p-4 m-0 overflow-x-auto">
          <code 
            className="language-json"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    );
  }

  if (previewType === 'text' && (fileExtension === 'csv' || fileExtension === 'tsv')) {
    return (
      <div className="bg-white rounded-lg">
        {csvToTable(content)}
      </div>
    );
  }

  if (previewType === 'text' && (contentType.startsWith('text/') || ['txt', 'log'].includes(fileExtension))) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  }

  // 默认文本显示
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
}

// 文件预览弹窗组件
function PreviewModal({
  visible,
  onCancel,
  file,
  content,
  loading,
  previewType,
  onDownload,
  onPrevious,
  onNext,
}: {
  visible: boolean;
  onCancel: () => void;
  file: DatasetFile;
  content: string | null;
  loading: boolean;
  previewType: 'text' | 'html' | 'image' | 'pdf' | 'office' | 'code' | 'excel' | 'powerpoint';
  onDownload: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
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
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-full flex flex-col">
        <div className="p-6 flex justify-between items-center border-b">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              预览文件: {file.originalName || file.fileName}
            </h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <span>类型: {file.contentType || '未知'}</span>
              <span>大小: {FormatFileSize(file.fileSize || 0)}</span>
              <span>上传时间: {FormatTime(file.createTime)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* 文件切换按钮 */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onPrevious}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="上一个文件"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={onNext}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="下一个文件"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={onDownload}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              下载
            </button>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
          ) : content ? (
            <FilePreviewContent file={file} content={content} previewType={previewType} />
          ) : (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                无法预览此文件
              </h3>
              <p className="text-gray-500 mb-6">
                此文件类型不支持直接预览，请尝试下载后查看。
              </p>
                             <button
                 onClick={onDownload}
                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 <Download className="h-4 w-4 mr-2" />
                 下载文件
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 