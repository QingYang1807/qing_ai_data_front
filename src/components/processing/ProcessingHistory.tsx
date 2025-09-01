'use client';

import React, { useState, useEffect } from 'react';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { Dataset, ProcessingHistory as ProcessingHistoryType, ProcessingStatus } from '@/types';
import { processingApi } from '@/api/processing';
import { useToast } from '@/hooks/useToast';

interface ProcessingHistoryProps {
  onBack: () => void;
  selectedDataset?: Dataset;
}

export default function ProcessingHistory({ onBack, selectedDataset }: ProcessingHistoryProps) {
  const [history, setHistory] = useState<ProcessingHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    processingType: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const { showError } = useToast();

  useEffect(() => {
    loadHistory();
  }, [selectedDataset, filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedDataset?.id) {
        params.datasetId = selectedDataset.id;
      }
      if (filter.processingType) {
        params.processingType = filter.processingType;
      }
      if (filter.status) {
        params.status = filter.status;
      }
      if (filter.startDate) {
        params.startDate = filter.startDate;
      }
      if (filter.endDate) {
        params.endDate = filter.endDate;
      }

      const response = await processingApi.getTasks(params);
      const historyData = (response.data.records || []).map(task => ({
        id: task.id,
        taskId: task.id,
        taskName: task.name,
        description: task.description,
        datasetId: task.datasetId,
        datasetName: task.datasetName || '未知数据集',
        processingType: task.processingType,
        status: task.status,
        progress: task.progress || 0,
        startTime: task.startTime || task.createdTime,
        endTime: task.endTime,
        completedTime: task.endTime,
        duration: task.processingTime,
        processingTime: task.processingTime,
        fileSize: task.fileSize,
        recordCount: task.recordCount,
        createdBy: task.createdBy,
        outputPath: task.outputPath,
        errorMessage: task.errorMessage
      }));
      setHistory(historyData);
    } catch (error) {
      console.error('加载处理历史失败:', error);
      showError('加载失败', '无法加载处理历史记录');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResult = async (taskId: string) => {
    try {
      const response = await processingApi.downloadResult(taskId);
      if (response.data?.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      showError('下载失败', '无法下载处理结果');
    }
  };

  const getStatusColor = (status: ProcessingStatus) => {
    switch (status) {
      case ProcessingStatus.SUCCESS:
        return 'text-green-600 bg-green-100';
      case ProcessingStatus.FAILED:
        return 'text-red-600 bg-red-100';
      case ProcessingStatus.RUNNING:
        return 'text-blue-600 bg-blue-100';
      case ProcessingStatus.CANCELLED:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: ProcessingStatus) => {
    switch (status) {
      case ProcessingStatus.SUCCESS:
        return <CheckCircle className="w-4 h-4" />;
      case ProcessingStatus.FAILED:
        return <XCircle className="w-4 h-4" />;
      case ProcessingStatus.RUNNING:
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
  };

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">处理历史</h2>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            返回
          </button>
        </div>
      </div>

      {/* 数据集信息 */}
      {selectedDataset && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>数据集:</strong> {selectedDataset.name}
          </p>
          {selectedDataset.description && (
            <p className="text-sm text-blue-600 mt-1">{selectedDataset.description}</p>
          )}
        </div>
      )}

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">处理类型</label>
            <select
              value={filter.processingType}
              onChange={(e) => setFilter(prev => ({ ...prev, processingType: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全部类型</option>
              <option value="CLEANING">数据清洗</option>
              <option value="FILTERING">数据过滤</option>
              <option value="DEDUPLICATION">数据去重</option>
              <option value="EXPORT">数据导出</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全部状态</option>
              <option value="SUCCESS">成功</option>
              <option value="FAILED">失败</option>
              <option value="RUNNING">运行中</option>
              <option value="CANCELLED">已取消</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadHistory}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              查询
            </button>
          </div>
        </div>
      </div>

      {/* 历史记录列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无处理历史记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    任务名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    处理类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    处理时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    记录数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    完成时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.taskName}</div>
                      {record.description && (
                        <div className="text-sm text-gray-500">{record.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.processingType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1">{record.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.processingTime ? formatDuration(record.processingTime) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.recordCount?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.completedTime ? new Date(record.completedTime).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {record.status === ProcessingStatus.SUCCESS && (
                          <button
                            onClick={() => handleDownloadResult(record.taskId)}
                            className="text-blue-600 hover:text-blue-900"
                            title="下载结果"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            // 查看详情功能
                            window.open(`/processing/task/${record.taskId}`, '_blank');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 