'use client';

import React, { useState } from 'react';
import DataSourceList from '@/components/datasource/DataSourceList';
import DataSourceForm from '@/components/datasource/DataSourceForm';
import { DataSource } from '@/types';

export default function DataSourcePage() {
  const [showForm, setShowForm] = useState(false);
  const [editingDataSource, setEditingDataSource] = useState<DataSource | null>(null);

  const handleAddDataSource = () => {
    setEditingDataSource(null);
    setShowForm(true);
  };

  const handleEditDataSource = (dataSource: DataSource) => {
    setEditingDataSource(dataSource);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDataSource(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 数据源列表 */}
      <DataSourceList
        onAddDataSource={handleAddDataSource}
        onEditDataSource={handleEditDataSource}
      />

      {/* 数据源表单弹窗 */}
      <DataSourceForm
        visible={showForm}
        onCancel={handleCloseForm}
        editingDataSource={editingDataSource}
      />
    </div>
  );
} 