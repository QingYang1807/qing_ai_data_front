'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DatasetList from '@/components/dataset/DatasetList';
import DatasetForm from '@/components/dataset/DatasetForm';
import { Dataset } from '@/types';

/**
 * 数据集管理页面
 * 提供数据集的增删改查和文件管理功能
 */
export default function DatasetPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);

  const handleAddDataset = () => {
    setEditingDataset(null);
    setShowCreateModal(true);
  };

  const handleEditDataset = (dataset: Dataset) => {
    setEditingDataset(dataset);
    setShowEditModal(true);
  };

  const handleViewDataset = (dataset: Dataset) => {
    router.push(`/dataset/${dataset.id}`);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingDataset(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingDataset(null);
  };

  const handleSuccess = (dataset: Dataset) => {
    // 成功回调，组件会自动刷新列表
    console.log('Dataset operation successful:', dataset);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 数据集列表 */}
      <DatasetList
        onAddDataset={handleAddDataset}
        onEditDataset={handleEditDataset}
        onViewDataset={handleViewDataset}
      />

      {/* 创建数据集弹窗 */}
      <DatasetForm
        visible={showCreateModal}
        onCancel={handleCloseCreateModal}
        onSuccess={handleSuccess}
      />

      {/* 编辑数据集弹窗 */}
      <DatasetForm
        visible={showEditModal}
        onCancel={handleCloseEditModal}
        onSuccess={handleSuccess}
        editingDataset={editingDataset}
      />
    </div>
  );
} 