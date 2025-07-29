'use client';

import React, { useState } from 'react';
import { Download, Eye, FileText, Loader2 } from 'lucide-react';
import { datasetApi } from '@/api/dataset';
import { ToastContainer } from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';

export default function TestDatasetDownload() {
  const [datasetId, setDatasetId] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();

  // 测试下载功能
  const handleTestDownload = async () => {
    if (!datasetId) {
      showWarning('输入错误', '请输入数据集ID');
      return;
    }

    setLoading(true);
    try {
      console.log('开始下载数据集:', datasetId);
      
      // 调用下载API
      const blob = await datasetApi.DownloadDataset(Number(datasetId));
      
      console.log('下载响应blob:', blob, 'size:', blob.size, 'type:', blob.type);
      
      // 检查blob是否有效
      if (!blob || blob.size === 0) {
        throw new Error('下载的文件为空或无效');
      }
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dataset_${datasetId}.zip`;
      document.body.appendChild(link);
      link.click();
      
      // 清理资源
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      
      console.log('数据集下载成功');
      showSuccess('下载成功', '数据集下载成功！请检查下载目录。');
    } catch (error: any) {
      console.error('下载数据集失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      let errorMessage = '下载失败，请稍后重试';
      
      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;
        
        switch (status) {
          case 404:
            errorMessage = '数据集不存在或已被删除';
            break;
          case 403:
            errorMessage = '没有权限下载此数据集';
            break;
          case 500:
            errorMessage = '服务器内部错误';
            if (responseData && typeof responseData === 'string') {
              errorMessage += `\n${responseData}`;
            }
            break;
          default:
            errorMessage = `HTTP ${status} 错误`;
            if (responseData && responseData.message) {
              errorMessage += `\n${responseData.message}`;
            }
        }
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = '无法连接到服务器，请确保后端服务已启动';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError('下载失败', `${errorMessage}\n\n请查看浏览器控制台获取详细错误信息。`, 6000);
    } finally {
      setLoading(false);
    }
  };

  // 测试预览功能
  const handleTestPreview = async () => {
    if (!datasetId) {
      showWarning('输入错误', '请输入数据集ID');
      return;
    }

    setPreviewLoading(true);
    try {
      console.log('获取数据集预览:', datasetId);
      
      const response = await datasetApi.GetDatasetPreview(Number(datasetId));
      setPreviewData(response.data);
      
      console.log('预览数据:', response.data);
      showSuccess('预览成功', '预览数据获取成功，请查看下方显示内容');
    } catch (error: any) {
      console.error('获取预览数据失败:', error);
      showError('预览失败', error.message || error.response?.data?.message || '请稍后重试');
      setPreviewData(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            数据集下载功能测试
          </h1>

          {/* 测试输入区域 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              数据集ID
            </label>
            <input
              type="text"
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入要测试的数据集ID"
            />
          </div>

          {/* 测试按钮区域 */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={handleTestDownload}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {loading ? '下载中...' : '测试下载'}
            </button>

            <button
              onClick={handleTestPreview}
              disabled={previewLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {previewLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {previewLoading ? '获取中...' : '测试预览'}
            </button>
          </div>

          {/* 预览数据显示区域 */}
          {previewData && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                预览数据
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 说明文档 */}
          <div className="border-t pt-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              功能说明
            </h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>下载功能：</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>将数据集的所有文件打包成ZIP格式</li>
                <li>包含一个README.md文件，记录数据集的详细信息</li>
                <li>所有数据文件存放在data/目录下</li>
                <li>支持断点续传和大文件下载</li>
              </ul>
              
              <p className="mt-4"><strong>预览功能：</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>获取数据集的基本信息和统计数据</li>
                <li>展示前10个文件的列表</li>
                <li>包含标签和元数据信息</li>
                <li>无需下载即可了解数据集内容</li>
              </ul>
            </div>
          </div>

          {/* API接口说明 */}
          <div className="border-t pt-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              API接口说明
            </h2>
            <div className="text-gray-700 space-y-4">
              <div>
                <p><strong>下载接口：</strong></p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  GET /api/v1/datasets/{'{id}'}/download
                </code>
                <p className="text-sm mt-1">返回ZIP文件流，Content-Type: application/zip</p>
              </div>
              
              <div>
                <p><strong>预览接口：</strong></p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  GET /api/v1/datasets/{'{id}'}/preview
                </code>
                <p className="text-sm mt-1">返回JSON格式的预览数据</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 