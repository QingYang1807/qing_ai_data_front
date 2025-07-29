'use client';

import React, { useState } from 'react';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DatasetForm from '@/components/dataset/DatasetForm';
import DataSourceForm from '@/components/datasource/DataSourceForm';
import DataSourceSettings from '@/components/datasource/DataSourceSettings';
import DataSourceConnections from '@/components/datasource/DataSourceConnections';
import DataSourceTables from '@/components/datasource/DataSourceTables';
import { Dataset, DataSource, DataSourceLevel, DataSourceType, DatasetType, DatasetPermission } from '@/types';

export default function TestEscModals() {
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

  const [showDatasetForm, setShowDatasetForm] = useState(false);
  const [showDataSourceForm, setShowDataSourceForm] = useState(false);
  const [showDataSourceSettings, setShowDataSourceSettings] = useState(false);
  const [showDataSourceConnections, setShowDataSourceConnections] = useState(false);
  const [showDataSourceTables, setShowDataSourceTables] = useState(false);

  // 模拟数据
  const mockDataset: Dataset = {
    id: 1,
    name: '测试数据集',
    type: DatasetType.TEXT,
    description: '这是一个测试数据集',
    format: 'JSON',
    permission: DatasetPermission.PRIVATE,
    isPublic: false,
    tags: '测试,文本',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  };

  const mockDataSource: DataSource = {
    id: 1,
    name: '测试数据源',
    type: DataSourceType.MYSQL,
    description: '这是一个测试数据源',
    config: {
      host: 'localhost',
      port: 3306,
      database: 'test_db',
      username: 'test_user',
      password: 'test_pass'
    },
    host: 'localhost',
    port: 3306,
    database: 'test_db',
    username: 'test_user',
    password: 'test_pass',
    level: DataSourceLevel.INTERNAL,
    status: 1,
    enabled: true,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  };

  const showConfirmDialog = (type: 'danger' | 'warning' | 'info' | 'success', title: string, message: string) => {
    setConfirmDialog({
      visible: true,
      title,
      message,
      type,
      onConfirm: () => {
        console.log(`${type} 操作已确认`);
        setConfirmDialog(prev => ({ ...prev, visible: false }));
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ESC键关闭弹窗测试
          </h1>
          <p className="text-gray-600">
            测试所有弹窗的ESC键关闭功能，按ESC键可以逐层关闭弹窗
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 确认对话框测试 */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">确认对话框</h3>
            <div className="space-y-3">
              <button
                onClick={() => showConfirmDialog('danger', '删除确认', '确定要删除这个项目吗？')}
                className="w-full btn-glass-primary"
              >
                测试危险确认对话框
              </button>
              <button
                onClick={() => showConfirmDialog('warning', '警告确认', '此操作可能会影响系统性能')}
                className="w-full btn-glass-secondary"
              >
                测试警告确认对话框
              </button>
              <button
                onClick={() => showConfirmDialog('info', '信息确认', '是否要查看详细信息？')}
                className="w-full btn-glass"
              >
                测试信息确认对话框
              </button>
            </div>
          </div>

          {/* 数据集表单测试 */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">数据集表单</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowDatasetForm(true)}
                className="w-full btn-glass-primary"
              >
                测试创建数据集弹窗
              </button>
            </div>
          </div>

          {/* 数据源表单测试 */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">数据源表单</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowDataSourceForm(true)}
                className="w-full btn-glass-primary"
              >
                测试创建数据源弹窗
              </button>
            </div>
          </div>

          {/* 数据源设置测试 */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">数据源设置</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowDataSourceSettings(true)}
                className="w-full btn-glass-primary"
              >
                测试数据源设置弹窗
              </button>
            </div>
          </div>

          {/* 数据源连接管理测试 */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">连接管理</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowDataSourceConnections(true)}
                className="w-full btn-glass-primary"
              >
                测试连接管理弹窗
              </button>
            </div>
          </div>

          {/* 数据源表管理测试 */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">表管理</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowDataSourceTables(true)}
                className="w-full btn-glass-primary"
              >
                测试表管理弹窗
              </button>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 点击任意按钮打开对应的弹窗</p>
            <p>• 按 ESC 键可以关闭当前弹窗</p>
            <p>• 可以同时打开多个弹窗，ESC键会逐层关闭</p>
            <p>• 点击弹窗外部区域也可以关闭弹窗</p>
            <p>• 所有弹窗都支持键盘导航和无障碍访问</p>
          </div>
        </div>
      </div>

      {/* 确认对话框 */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
      />

      {/* 数据集表单 */}
      <DatasetForm
        visible={showDatasetForm}
        onCancel={() => setShowDatasetForm(false)}
        onSuccess={(dataset) => {
          console.log('数据集创建成功:', dataset);
          setShowDatasetForm(false);
        }}
      />

      {/* 数据源表单 */}
      <DataSourceForm
        visible={showDataSourceForm}
        onCancel={() => setShowDataSourceForm(false)}
      />

      {/* 数据源设置 */}
      <DataSourceSettings
        dataSource={mockDataSource}
        isOpen={showDataSourceSettings}
        onClose={() => setShowDataSourceSettings(false)}
      />

      {/* 数据源连接管理 */}
      <DataSourceConnections
        dataSourceId={1}
        visible={showDataSourceConnections}
        onClose={() => setShowDataSourceConnections(false)}
      />

      {/* 数据源表管理 */}
      <DataSourceTables
        dataSourceId={1}
        visible={showDataSourceTables}
        onClose={() => setShowDataSourceTables(false)}
      />
    </div>
  );
} 