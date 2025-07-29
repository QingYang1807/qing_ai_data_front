'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDatasetStore } from '@/stores/useDatasetStore';
import DatasetDetailView from '@/components/dataset/DatasetDetailView';

/**
 * 数据集详情页面（独立页面版本）
 */
export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = Number(params.id);

  // 从store获取状态
  const { 
    currentDataset, 
    loading, 
    error,
    getDataset,
    setCurrentDataset,
    setError
  } = useDatasetStore();

  // 本地状态管理
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  // 加载数据集详情
  const LoadDataset = async () => {
    if (!datasetId) {
      setLocalError('无效的数据集ID');
      setLocalLoading(false);
      return;
    }

    try {
      setLocalLoading(true);
      setLocalError(null);
      await getDataset(datasetId);
    } catch (error: any) {
      console.error('Failed to load dataset:', error);
      setLocalError(error.message || '获取数据集详情失败');
    } finally {
      setLocalLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    LoadDataset();
  }, [datasetId]);

  // 处理返回
  const handleBack = () => {
    router.back();
  };

  // 处理编辑（这里可以跳转到编辑页面或显示编辑弹窗）
  const handleEdit = (dataset: any) => {
    // 可以跳转到编辑页面或触发其他编辑逻辑
    console.log('Edit dataset:', dataset);
    // 示例：跳转到编辑页面
    // router.push(`/dataset/${dataset.id}/edit`);
  };

  // 加载状态
  if (localLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载数据集详情...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (localError || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-4">{localError || error}</p>
          <div className="space-x-3">
            <button
              onClick={LoadDataset}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 数据集不存在
  if (!currentDataset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-gray-400 text-6xl mb-4">📂</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">数据集不存在</h3>
          <p className="text-gray-600 mb-4">请检查数据集ID是否正确，或者数据集可能已被删除。</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  // 正常显示数据集详情
  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      <div className="p-6 max-w-7xl mx-auto">
        <DatasetDetailView 
          dataset={currentDataset}
          onBack={handleBack}
          onEdit={handleEdit}
          showBackButton={true}
        />
      </div>
    </div>
  );
} 